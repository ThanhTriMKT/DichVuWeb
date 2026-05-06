import os
import sys
import random
from faker import Faker

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import User, Document

fake = Faker()

def seed_with_faker():
    db = SessionLocal()
    try:
        print("Đang gieo dữ liệu bằng Faker (50 Users)...")
        for _ in range(50):
            # Tạo User
            user = User(
                username=fake.user_name(),
                email=fake.unique.email(),
                hashed_password="hashed_placeholder"
            )
            db.add(user)
            db.flush() # Để lấy user.id
            
            # Tạo từ 2-5 tài liệu cho mỗi User
            num_docs = random.randint(2, 5)
            for i in range(num_docs):
                doc = Document(
                    title=f"Tài liệu {fake.word().capitalize()}",
                    original_filename=f"{fake.file_name(extension='pdf')}",
                    stored_filename=f"fake_{fake.uuid4()}.pdf",
                    file_path=f"uploads/fake_{i}.pdf",
                    file_size=random.randint(100000, 5000000),
                    page_count=random.randint(5, 100),
                    status="done",
                    owner_id=user.id
                )
                db.add(doc)
        
        db.commit()
        print("✅ Gieo dữ liệu Faker thành công!")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_with_faker()
