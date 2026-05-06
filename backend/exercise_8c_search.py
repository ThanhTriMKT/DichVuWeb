import os
import sys
from sqlalchemy import or_

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import FormulaEntry

def search_formulas(keyword: str):
    db = SessionLocal()
    try:
        print(f"--- KẾT QUẢ TÌM KIẾM TỪ KHÓA: '{keyword}' ---")
        
        # Tìm kiếm trong cả latex_raw và latex_edited
        results = db.query(FormulaEntry).filter(
            or_(
                FormulaEntry.latex_raw.ilike(f"%{keyword}%"),
                FormulaEntry.latex_edited.ilike(f"%{keyword}%")
            )
        ).all()

        if not results:
            print("Không tìm thấy công thức nào.")
        else:
            for f in results:
                print(f"ID: {f.id} | Trang: {f.page_number} | LaTeX: {f.latex_edited or f.latex_raw}")
    finally:
        db.close()

if __name__ == "__main__":
    # Ví dụ tìm kiếm từ khóa "sqrt" hoặc "frac"
    import sys
    search_term = sys.argv[1] if len(sys.argv) > 1 else "frac"
    search_formulas(search_term)
