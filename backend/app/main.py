"""
Ebook2LaTeX - Backend (FastAPI)
================================
Entry point. Mounts the REST API and configures CORS for the React frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title="Ebook2LaTeX API",
    description=(
        "Chuyển đổi PDF / ebook thành LaTeX. "
        "Upload PDF → OCR công thức toán học → chỉnh sửa LaTeX trực tiếp."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static files for formula images ─────────────────────────────────────────
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(router, prefix="/api")


@app.get("/", tags=["root"])
def read_root():
    return {
        "message": "Ebook2LaTeX API đang chạy 🚀",
        "docs": "/docs",
        "health": "/api/",
    }
