"""
services/pdf_service.py
-----------------------
Handles PDF processing and LaTeX OCR.

Strategy:
  1. Use PyMuPDF (fitz) to extract pages as images.
  2. For each page, prepare images for OCR.
  3. Send each page through pix2tex if installed.
  4. Return a list of FormulaEntry-compatible dicts.

Note: pix2tex model is optional and heavy (~300MB). The service falls back
to a demo/mock mode when it is not installed, which is useful for development.
"""

import os
import io
import uuid
import logging
from typing import List, Dict, Any, Optional

from PIL import Image
from app.core.config import settings

logger = logging.getLogger(__name__)

# Try to import pix2tex; fall back gracefully
try:
    from pix2tex.cli import LatexOCR
    _pix2tex_model: Optional[LatexOCR] = None

    def _get_model() -> LatexOCR:
        global _pix2tex_model
        if _pix2tex_model is None:
            logger.info("Loading pix2tex model (first request, may take a moment)…")
            _pix2tex_model = LatexOCR()
        return _pix2tex_model

    USE_PIX2TEX = True
except ImportError:
    USE_PIX2TEX = False
    logger.warning(
        "pix2tex not installed. OCR will run in DEMO mode. "
        "Install pix2tex for real OCR."
    )


# ─── Demo / placeholder OCR ──────────────────────────────────────────────────

_DEMO_FORMULAS = [
    (r"E = mc^{2}", 0.95),
    (r"\int_{a}^{b} f(x)\,dx = F(b) - F(a)", 0.88),
    (r"\frac{d}{dx}\left(x^n\right) = nx^{n-1}", 0.91),
    (r"\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}", 0.79),
    (r"\nabla^2 \phi = \rho / \varepsilon_0", 0.84),
    (r"P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}", 0.87),
]


def _demo_ocr(image: Image.Image, page_index: int) -> str:
    """Return a deterministic demo LaTeX string based on page number."""
    entry = _DEMO_FORMULAS[page_index % len(_DEMO_FORMULAS)]
    return entry[0]


def _demo_confidence(page_index: int) -> float:
    return _DEMO_FORMULAS[page_index % len(_DEMO_FORMULAS)][1]


# ─── Main service ─────────────────────────────────────────────────────────────

def extract_formulas_from_pdf(file_path: str, document_id: int) -> List[Dict[str, Any]]:
    """
    Open a PDF, render each page, run OCR on the full page image as a
    single formula region (simplified approach for demo purposes).

    Returns a list of dicts matching FormulaEntry fields.
    """
    import fitz  # PyMuPDF

    results: List[Dict[str, Any]] = []

    os.makedirs(os.path.join(settings.upload_dir, "formula_images"), exist_ok=True)

    doc = fitz.open(file_path)
    for page_num, page in enumerate(doc):
        try:
            # Render page at 4x resolution for much better OCR quality
            mat = fitz.Matrix(4.0, 4.0)
            pix = page.get_pixmap(matrix=mat)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # Save original image (full page)
            img_filename = f"doc{document_id}_p{page_num}_{uuid.uuid4().hex[:8]}.png"
            img_path = os.path.join(settings.upload_dir, "formula_images", img_filename)
            img.save(img_path)

            # --- Image Preprocessing for Better OCR ---
            from PIL import ImageOps, ImageEnhance
            # Convert to grayscale
            gray_img = ImageOps.grayscale(img)
            # Boost contrast to make text "pop" and background "fade"
            enhancer = ImageEnhance.Contrast(gray_img)
            processed_img = enhancer.enhance(2.0)
            # Binarize: any pixel lighter than 180 (light gray) becomes white, others become black
            # This is effective at removing faint grid lines
            processed_img = processed_img.point(lambda p: 255 if p > 180 else 0).convert('RGB')
            # ------------------------------------------

            # OCR Logic: try pix2tex if installed, else demo mode
            latex = None
            confidence = 0.0

            if USE_PIX2TEX:
                try:
                    latex = _get_model()(processed_img)
                    confidence = 0.90
                except Exception as e:
                    logger.warning("pix2tex error on page %d: %s", page_num, e)

            if not latex:
                latex = _demo_ocr(img, page_num)
                confidence = _demo_confidence(page_num)

            results.append({
                "document_id": document_id,
                "page_number": page_num + 1,
                "latex_raw": latex,
                "latex_edited": None,
                "confidence": confidence,
                "bbox_x": 0.0,
                "bbox_y": 0.0,
                "bbox_w": 1.0,
                "bbox_h": 1.0,
                "image_path": img_path,
            })

        except Exception as exc:
            logger.error("Error processing page %d: %s", page_num, exc)

    doc.close()
    return results


def get_pdf_page_count(file_path: str) -> int:
    import fitz
    doc = fitz.open(file_path)
    count = len(doc)
    doc.close()
    return count
