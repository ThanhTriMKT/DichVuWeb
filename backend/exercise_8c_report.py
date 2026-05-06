import os
import sys
from sqlalchemy import func

# Thêm đường dẫn để import được app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import User, Document

def print_user_report():
    db = SessionLocal()
    try:
        print("--- BÁO CÁO THỐNG KÊ NGƯỜI DÙNG ---")
        # Truy vấn danh sách User và số lượng tài liệu tương ứng
        results = (
            db.query(User.username, func.count(Document.id).label("doc_count"))
            .outerjoin(Document, User.id == Document.owner_id)
            .group_by(User.id)
            .all()
        )

        for username, count in results:
            print(f"Người dùng: {username:20} | Số tài liệu: {count}")
    finally:
        db.close()

if __name__ == "__main__":
    print_user_report()
