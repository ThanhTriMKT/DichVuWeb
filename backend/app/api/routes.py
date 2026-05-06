"""
api/routes.py
-------------
RESTful API endpoints for Ebook2LaTeX.

Endpoints:
  GET  /                          Health check
  POST /documents/upload          Upload a PDF
  POST /documents/{id}/process    Run OCR on uploaded PDF
  GET  /documents                 List all documents
  GET  /documents/{id}            Get document details
  GET  /documents/{id}/formulas   Get all formulas for a document
  PUT  /formulas/{id}             Update (edit) a formula's LaTeX
"""

import os
import uuid
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Document, FormulaEntry
from app.schemas.schemas import (
    DocumentOut, DocumentList, FormulaOut, FormulaUpdate,
    ProcessResponse,
)
from app.services.pdf_service import extract_formulas_from_pdf, get_pdf_page_count

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_MIME = {"application/pdf"}
MAX_BYTES = settings.max_upload_size_mb * 1024 * 1024


# ─── Helpers ─────────────────────────────────────────────────────────────────

# ─── Health ───────────────────────────────────────────────────────────────────

@router.get("/", tags=["health"])
def health():
    return {"status": "ok", "service": "Ebook2LaTeX API"}


# ─── Documents ────────────────────────────────────────────────────────────────

@router.get("/documents", response_model=DocumentList, tags=["documents"])
def list_documents(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    total = db.query(Document).count()
    items = db.query(Document).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


@router.get("/documents/{doc_id}", response_model=DocumentOut, tags=["documents"])
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc


@router.post("/documents/upload", response_model=DocumentOut, tags=["documents"])
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a PDF file. Returns a Document object ready for processing."""
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"File too large (max {settings.max_upload_size_mb} MB).")

    os.makedirs(settings.upload_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.upload_dir, stored_name)

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        page_count = get_pdf_page_count(file_path)
    except Exception:
        page_count = 0

    doc = Document(
        title=file.filename.rsplit(".", 1)[0],
        original_filename=file.filename,
        stored_filename=stored_name,
        file_path=file_path,
        file_size=len(content),
        page_count=page_count,
        status="uploaded",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc


@router.post("/documents/{doc_id}/process", response_model=ProcessResponse, tags=["documents"])
def process_document(
    doc_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Trigger OCR processing on an uploaded document.
    Runs synchronously for simplicity (use BackgroundTasks for large files in production).
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.status == "processing":
        raise HTTPException(status_code=409, detail="Document is already being processed.")

    doc.status = "processing"
    db.commit()

    try:
        formulas = extract_formulas_from_pdf(doc.file_path, doc.id)

        # Remove old formula entries (allow re-processing)
        db.query(FormulaEntry).filter(FormulaEntry.document_id == doc_id).delete()
        db.commit()

        for f_data in formulas:
            entry = FormulaEntry(**f_data)
            db.add(entry)

        doc.status = "done"
        db.commit()

        return {
            "document_id": doc_id,
            "status": "done",
            "formulas_found": len(formulas),
            "message": f"Successfully extracted {len(formulas)} formula(s).",
        }

    except Exception as exc:
        logger.error("Processing failed for doc %d: %s", doc_id, exc)
        doc.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")


@router.delete("/documents/{doc_id}", tags=["documents"])
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    # Remove file
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    db.delete(doc)
    db.commit()
    return {"message": f"Document {doc_id} deleted."}


# ─── Formulas ────────────────────────────────────────────────────────────────

@router.get("/documents/{doc_id}/formulas", response_model=List[FormulaOut], tags=["formulas"])
def get_formulas(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    formulas = (
        db.query(FormulaEntry)
        .filter(FormulaEntry.document_id == doc_id)
        .order_by(FormulaEntry.page_number, FormulaEntry.id)
        .all()
    )
    return formulas


@router.put("/formulas/{formula_id}", response_model=FormulaOut, tags=["formulas"])
def update_formula(
    formula_id: int,
    payload: FormulaUpdate,
    db: Session = Depends(get_db),
):
    """Save user-edited LaTeX for a formula."""
    formula = db.query(FormulaEntry).filter(FormulaEntry.id == formula_id).first()
    if not formula:
        raise HTTPException(status_code=404, detail="Formula not found.")
    formula.latex_edited = payload.latex_edited
    db.commit()
    db.refresh(formula)
    return formula


@router.post("/formulas/{formula_id}/like", tags=["formulas"])
def like_formula(formula_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Add a formula to user's favorites (mocking user_id=1)."""
    from app.models.models import UserFavorite
    fav = db.query(UserFavorite).filter_by(user_id=user_id, formula_id=formula_id).first()
    if not fav:
        fav = UserFavorite(user_id=user_id, formula_id=formula_id)
        db.add(fav)
        db.commit()
    return {"status": "liked"}


@router.delete("/formulas/{formula_id}/like", tags=["formulas"])
def unlike_formula(formula_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    """Remove a formula from user's favorites (mocking user_id=1)."""
    from app.models.models import UserFavorite
    db.query(UserFavorite).filter_by(user_id=user_id, formula_id=formula_id).delete()
    db.commit()
    return {"status": "unliked"}
