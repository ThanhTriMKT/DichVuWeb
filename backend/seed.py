"""
seed.py
-------
Nạp dữ liệu mẫu vào database (chạy 1 lần sau migration).
Nếu dữ liệu đã tồn tại, sẽ bỏ qua để tránh duplicate.
"""

import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from app.core.database import SessionLocal
from app.models.models import Document, FormulaEntry


DEMO_TITLE = "Giáo trình Toán Cao Cấp (Demo)"

DEMO_FORMULAS = [
    (r"E = mc^{2}", 0.95),
    (r"\int_{a}^{b} f(x)\,dx = F(b) - F(a)", 0.88),
    (r"\frac{d}{dx}\left(x^n\right) = nx^{n-1}", 0.91),
    (r"\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}", 0.79),
    (r"\nabla^2 \phi = \rho / \varepsilon_0", 0.84),
    (r"P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}", 0.87),
]


def wait_for_db(retries=15, delay=2):
    """Chờ database sẵn sàng trước khi seed."""
    for i in range(retries):
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
            db.close()
            print("[seed] ✅ Database sẵn sàng.")
            return True
        except OperationalError:
            print(f"[seed] ⏳ Chờ database... ({i+1}/{retries})")
            time.sleep(delay)
    print("[seed] ❌ Không thể kết nối database.")
    return False


def seed():
    if not wait_for_db():
        sys.exit(1)

    db = SessionLocal()
    try:
        # Kiểm tra đã có dữ liệu mẫu chưa — nếu rồi thì bỏ qua
        existing = db.query(Document).filter(Document.title == DEMO_TITLE).first()
        if existing:
            print(f"[seed] ⚠️  Dữ liệu mẫu đã tồn tại (id={existing.id}), bỏ qua.")
            return

        # Tạo thư mục uploads
        os.makedirs("uploads", exist_ok=True)

        # Tạo document mẫu
        doc = Document(
            title=DEMO_TITLE,
            original_filename="giao_trinh_toan.pdf",
            stored_filename="demo_doc.pdf",
            file_path="uploads/demo_doc.pdf",
            file_size=1024 * 512,
            page_count=len(DEMO_FORMULAS),
            status="done",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        print(f"[seed] 📄 Document '{doc.title}' đã tạo (id={doc.id}).")

        # Tạo các công thức mẫu
        for i, (latex, conf) in enumerate(DEMO_FORMULAS):
            entry = FormulaEntry(
                document_id=doc.id,
                page_number=i + 1,
                latex_raw=latex,
                latex_edited=None,
                confidence=conf,
                bbox_x=0.05, bbox_y=0.4, bbox_w=0.9, bbox_h=0.15,
            )
            db.add(entry)
        db.commit()
        print(f"[seed] 📐 {len(DEMO_FORMULAS)} công thức mẫu đã tạo.")
        print("[seed] ✅ Seed thành công!")

    except Exception as e:
        print(f"[seed] ❌ Lỗi: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
