import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import Document, FormulaEntry

def seed_from_json():
    db = SessionLocal()
    try:
        # Đọc file JSON
        with open("data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        print(f"Đang nạp {len(data)} công thức từ data.json...")

        # Tạo một tài liệu cha để chứa các công thức này
        doc = Document(
            title="Tài liệu nạp từ JSON",
            original_filename="manual_seed.pdf",
            stored_filename="manual_seed.pdf",
            file_path="uploads/manual_seed.pdf",
            status="done"
        )
        db.add(doc)
        db.flush()

        for item in data:
            formula = FormulaEntry(
                document_id=doc.id,
                page_number=1,
                latex_raw=item["latex"],
                order_index=item["order_index"]
            )
            db.add(formula)
        
        db.commit()
        print("✅ Nạp dữ liệu từ JSON thành công!")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_from_json()
