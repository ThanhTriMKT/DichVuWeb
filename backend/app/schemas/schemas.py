from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ─── Document ────────────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: int
    title: str
    original_filename: str
    file_size: Optional[int]
    page_count: int
    status: str
    owner_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentList(BaseModel):
    total: int
    items: List[DocumentOut]


# ─── Formula ─────────────────────────────────────────────────────────────────

class FormulaOut(BaseModel):
    id: int
    document_id: int
    page_number: int
    latex_raw: str
    latex_edited: Optional[str]
    confidence: Optional[float]
    image_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FormulaUpdate(BaseModel):
    latex_edited: str


# ─── Processing ──────────────────────────────────────────────────────────────

class ProcessResponse(BaseModel):
    document_id: int
    status: str
    formulas_found: int
    message: str



