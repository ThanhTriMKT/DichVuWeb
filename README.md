# 📖 Ebook2LaTeX

Hệ thống chuyển đổi PDF / eBook sang LaTeX, cho phép trích xuất và chỉnh sửa công thức toán học trực tiếp trên trình duyệt.

**Công nghệ:**

| Thành phần     | Công nghệ                  |
| -------------- | -------------------------- |
| Backend API    | Python · FastAPI · Uvicorn |
| Database ORM   | SQLAlchemy + Alembic       |
| Database       | PostgreSQL 15              |
| PDF Processing | PyMuPDF (fitz)             |
| Math OCR       | pix2tex (local)            |
| Frontend       | React 18 + Vite            |
| Math Editor    | MathLive                   |
| CSS            | Tailwind CSS               |
| Container      | Docker + Docker Compose    |

---

## 🗂 Cấu trúc thư mục

```
Ebook2LaTeX/
├── .gitignore
├── .env.example              ← Sao chép thành .env rồi điền thông tin
├── docker-compose.yml        ← Khởi chạy toàn bộ hệ thống
├── backend/
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── alembic/              ← Quản lý migration database
│   │   └── versions/
│   │       └── 0001_initial.py
│   ├── seed.py               ← Nạp dữ liệu mẫu
│   ├── requirements.txt
│   ├── uploads/              ← File PDF người dùng tải lên
│   └── app/
│       ├── main.py           ← Điểm khởi đầu FastAPI
│       ├── api/
│       │   └── routes.py     ← Tất cả REST endpoints
│       ├── core/
│       │   ├── config.py     ← Cấu hình (Settings)
│       │   └── database.py   ← Kết nối SQLAlchemy
│       ├── models/
│       │   └── models.py     ← Bảng: Users, Documents, FormulaEntries, Logs
│       ├── schemas/
│       │   └── schemas.py    ← Pydantic validation models
│       └── services/
│           └── pdf_service.py ← Logic xử lý PDF & OCR
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx            ← Layout chính
        ├── index.css
        ├── components/
        │   ├── MathLiveEditor.jsx  ← Soạn thảo LaTeX hai chiều
        │   ├── PDFUploader.jsx     ← Upload & trigger OCR
        │   ├── DocumentList.jsx    ← Danh sách tài liệu
        │   └── FormulaPanel.jsx    ← Hiển thị & chỉnh sửa công thức
        └── services/
            └── api.js         ← Axios calls tới Backend
```

---

## 🚀 Hướng dẫn chạy dự án

### Bắt đầu từ file ZIP dự án

1. Giải nén file ZIP vào một thư mục trên máy:

```bash
unzip Ebook2LaTeX.zip -d ~/Downloads/Ebook2LaTeX
cd ~/Downloads/Ebook2LaTeX
```

2. Kiểm tra cấu trúc thư mục nếu cần:

```bash
ls
```

3. Sau khi đã vào đúng thư mục chứa `docker-compose.yml`, chọn cách chạy dưới đây.

### Cách 1: Docker Compose (khuyến nghị)

**Yêu cầu:** Docker Desktop đã cài và đang chạy.

```bash
# 1. Clone hoặc giải nén dự án
cd Ebook2LaTeX

# 2. Tạo file .env từ mẫu
cp .env.example .env

# 3. Khởi động tất cả services
docker compose up --build

# Lần sau không cần --build nếu code không đổi:
docker compose up
```

Sau khi khởi động:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **PostgreSQL:** localhost:5432

Để dừng:

```bash
docker compose down
```

---

### Cách 2: Chạy thủ công (không có Docker)

#### Yêu cầu chuẩn bị
- Python 3.11+
- Node.js 20+
- PostgreSQL 15 đang chạy ở localhost:5432

#### 1. Cài đặt lần đầu tiên

**Backend:**
```bash
cd backend
# Tạo môi trường ảo
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Cài thư viện và thiết lập Database
pip install -r requirements.txt
cp ../.env.example .env         # Mở ra và chỉnh sửa cấu hình nếu cần
alembic upgrade head
python seed.py
```

**Frontend:**
```bash
cd frontend
npm install
```

#### 2. Khởi chạy ứng dụng (Cho những lần sau)

Để chạy dự án, hãy mở 2 cửa sổ Terminal (hoặc tab) độc lập.

**Terminal 1: Khởi động Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
*Truy cập API Docs (Swagger): http://localhost:8000/docs*

**Terminal 2: Khởi động Frontend**
```bash
cd frontend
npm run dev
```
*Truy cập Giao diện Web: http://localhost:5173*

---

## 📋 API Endpoints

| Method | URL                            | Mô tả              |
| ------ | ------------------------------ | ------------------ |
| GET    | `/api/`                        | Health check       |
| GET    | `/api/documents`               | Danh sách tài liệu |
| POST   | `/api/documents/upload`        | Upload PDF         |
| POST   | `/api/documents/{id}/process`  | Chạy OCR           |
| GET    | `/api/documents/{id}/formulas` | Lấy công thức      |
| PUT    | `/api/formulas/{id}`           | Cập nhật LaTeX     |
| DELETE | `/api/documents/{id}`          | Xoá tài liệu       |

Xem chi tiết tại: http://localhost:8000/docs

---

## 🧪 Dữ liệu mẫu (Demo mode)

Khi không cài `pix2tex`, hệ thống sẽ tự động dùng **demo mode**: trả về các công thức toán học mẫu như:

- `E = mc^{2}`
- `\int_{a}^{b} f(x)\,dx = F(b) - F(a)`
- `\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`

Điều này giúp bạn kiểm thử giao diện mà không cần cài model AI nặng.

---

## 🔧 Cài OCR thực sự (tùy chọn)

### Option A: pix2tex (chạy offline, ~300MB)

```bash
pip install pix2tex
```

Sau khi cài, backend sẽ tự động dùng pix2tex thay cho demo mode.

---

## 🗃 Database

Bảng dữ liệu:

- **documents** — Tài liệu PDF đã tải lên
- **formula_entries** — Công thức trích xuất từ mỗi tài liệu

## 💡 Hướng dẫn sử dụng web

### Mở ứng dụng

Mở trình duyệt và truy cập vào địa chỉ: [http://localhost:5173](http://localhost:5173).

### Giao diện chính

- Phần trên cùng có tiêu đề `Ebook2LaTeX`.
- Bên trái là danh sách tài liệu đã tải lên.
- Bên phải là khu vực xem và chỉnh sửa công thức.
- Nút `+ Tải lên PDF` chuyển sang màn hình chọn file.

### Tải lên PDF và xử lý

1. Nhấn `+ Tải lên PDF` hoặc kéo thả file PDF vào vùng upload.
2. Chỉ chấp nhận file có định dạng `application/pdf`.
3. Sau khi upload xong, hệ thống tự động chạy OCR và trích xuất công thức.
4. Khi hoàn tất, tài liệu mới sẽ xuất hiện trong danh sách với trạng thái `done`.

### Xem danh sách tài liệu

- Mỗi tài liệu hiển thị tên, số trang và kích thước file.
- Trạng thái hiển thị bằng nhãn màu:
  - `uploaded` — đã tải lên
  - `processing` — đang xử lý
  - `done` — hoàn tất
  - `error` — có lỗi
- Nhấn vào một tài liệu để tải danh sách công thức tương ứng.

### Xem và chỉnh sửa công thức

1. Chọn một tài liệu từ danh sách.
2. Bên phải sẽ hiển thị các công thức đã trích xuất.
3. Chọn một mục công thức để mở trình soạn thảo.
4. Sử dụng:
   - ô `Mã LaTeX` để sửa trực tiếp mã thô,
   - `MathLive` để xem kết quả ngay lập tức.
5. Nhấn `Lưu` để cập nhật LaTeX đã chỉnh sửa.

### Xóa tài liệu

- Nhấn biểu tượng `🗑` bên phải mỗi tài liệu trong danh sách.
- Hệ thống sẽ xóa tài liệu và file PDF đã lưu.

### Lưu ý

- Ở chế độ mặc định chưa cài `pix2tex`, hệ thống sẽ dùng dữ liệu demo cho công thức.
- Để có OCR thực tế, cài `pix2tex` trong môi trường Python.

---

## 📦 Commands hữu ích

```bash
# Tạo migration mới sau khi sửa models
alembic revision --autogenerate -m "mô tả thay đổi"
alembic upgrade head

# Xem logs của container
docker compose logs backend -f
docker compose logs frontend -f

# Rebuild khi sửa code
docker compose up --build

# Reset database (xoá toàn bộ data)
docker compose down -v
docker compose up --build
```
