# web nckh — Hệ thống dự đoán kết quả học tập sinh viên

Ứng dụng dự đoán **điểm học phần**, **GPA học kỳ kế tiếp** và **GPA tốt nghiệp** từ dữ liệu học tập (CSDL) kết hợp mô hình Machine Learning, phân quyền theo vai trò **Sinh viên** và **Giảng viên**.

Bản triển khai: <https://nckh.alk.xx.kg>

---

## 1. Tính năng

**Sinh viên**
- Đăng nhập, xem hồ sơ (ảnh đại diện, thông tin lớp/khoa)
- Dự đoán điểm học phần (theo điểm chuyên cần / thường xuyên, tỉ lệ hoàn thành bài tập, số buổi nghỉ)
- Dự đoán GPA học kỳ kế tiếp — tự lấy dữ liệu từ `KET_QUA_HOC_PHAN` khi không nhập điểm thi
- Dự đoán GPA tốt nghiệp theo kỳ vọng + xem lịch sử dự đoán
- Hỗ trợ học tập: tài liệu, video bài giảng, website tham khảo

**Giảng viên**
- Danh sách sinh viên (tìm kiếm, lọc theo lớp/khoa)
- Báo cáo dự đoán học kỳ, biểu đồ tổng hợp
- Cảnh báo nguy cơ học tập
- Quản lý tài nguyên học tập (tài liệu, video, website, đặt nổi bật)

**Giao diện**
- Multi-page HTML/CSS/JS thuần, responsive desktop / tablet / mobile (breakpoint `≤1024px`)
- Menu mobile dạng accordion, bảng cuộn ngang, biểu đồ tự vẽ trên canvas

---

## 2. Công nghệ

| Thành phần | Công nghệ |
| :--- | :--- |
| Backend | Node.js 22 · Express 5 · `mssql` · JWT (`jsonwebtoken`) · `bcrypt` · `multer` · `exceljs` · `pdfkit` |
| Frontend | HTML5 + CSS3 + JavaScript thuần (không framework), nhiều trang |
| ML | Python · Flask · scikit-learn · pandas · joblib (3 model `.pkl`) |
| CSDL | SQL Server / Azure SQL Edge (arm64) — 18 bảng |
| Reverse proxy | nginx (phục vụ static + proxy `/api`, `/uploads`) |

---

## 3. Cấu trúc thư mục

```
.
├── Backend/                 # API Node/Express
│   ├── .env.example         # mẫu biến môi trường (KHÔNG commit .env thật)
│   ├── package.json
│   └── src/
│       ├── server.js        # khởi động server (port 3000)
│       ├── app.js           # khai báo route, static uploads, CORS
│       ├── config/          # kết nối SQL Server (pool)
│       ├── middleware/      # xác thực JWT, phân quyền, upload
│       ├── routes/          # 18 route file theo nghiệp vụ
│       └── uploads/         # file người dùng tải lên (KHÔNG commit)
├── Fontend/                 # giao diện (giữ nguyên tên "Fontend")
│   ├── index.html           # trang đăng nhập
│   ├── Assets/Css/          # + mobile.css (responsive ≤1024px)
│   ├── Assets/JavaScript/   # + menu-mobile.js
│   ├── Assets/Images/       # banner, icon, avatar mặc định
│   └── Pages/
│       ├── Sinh-vien/       # Home, Ho-tro-hoc-tap, Du_doan_ket_qua/*
│       └── Giang-vien/      # Home, bao_cao, canh-bao-nguy-co, danh-sach-sinh-vien, tai-lieu
└── ML/                      # dịch vụ dự đoán
    ├── app.py               # Flask API (port 5000)
    ├── requirements.txt     # ⚠ lưu ý encoding UTF-16LE (xem §5.2)
    ├── data/raw/            # dữ liệu CSV để huấn luyện
    ├── models/              # 3 model .pkl dùng lúc chạy
    └── src/                 # pipeline khám phá → tiền xử lý → huấn luyện → đánh giá
```

> Repo chỉ chứa **source ứng dụng**. Cấu hình triển khai (`compose.yml`, `docker/`, `scripts/`) được quản lý riêng ở máy chủ, không nằm trong repo này.

---

## 4. Yêu cầu môi trường

| Thành phần | Phiên bản |
| :--- | :--- |
| Node.js | ≥ 22 (kèm `npm`) |
| Python | 3.13 / 3.14 (`pip`, `venv`) |
| SQL Server | SQL Server 2019+ hoặc Azure SQL Edge (bản arm64 chạy native) |
| Web server | nginx hoặc bất kỳ static server + reverse proxy |

---

## 5. Cài đặt & chạy

### 5.1 Cơ sở dữ liệu

1. Dựng SQL Server và tạo database, ví dụ `DU_DOAN_SINH_VIEN`.
2. Tạo user ứng dụng và cấp quyền trên database:
   ```sql
   CREATE LOGIN [backend_web] WITH PASSWORD = '<mật khẩu mạnh>', CHECK_POLICY = ON;
   USE [DU_DOAN_SINH_VIEN];
   CREATE USER [backend_web] FOR LOGIN [backend_web];
   ALTER ROLE db_datareader ADD MEMBER [backend_web];
   ALTER ROLE db_datawriter ADD MEMBER [backend_web];
   ALTER ROLE db_ddladmin   ADD MEMBER [backend_web];
   ```
3. Tạo 18 bảng theo danh sách ở §7.

> Schema/DDL không được commit trong repo này. Ở môi trường triển khai, DDL được sinh tự động từ catalog (`INFORMATION_SCHEMA`, `sys.columns`, `sys.foreign_keys`) bởi script dump DB → dump gồm `CREATE TABLE` + `INSERT` + `ALTER TABLE ADD CONSTRAINT FK`.

### 5.2 Backend (API)

```bash
cd Backend
npm ci                     # cài đúng version trong package-lock.json
cp .env.example .env       # sửa giá trị cho đúng môi trường
npm start                  # hoặc: npm run dev  (nodemon)
```

Server chạy ở `http://localhost:3000`. Kiểm tra: `GET /` → `{"message":"Backend dự đoán kết quả sinh viên đang hoạt động"}`.

### 5.3 ML (dịch vụ dự đoán)

```bash
cd ML
python3 -m venv .venv && source .venv/bin/activate

# requirements.txt lưu ở dạng UTF-16LE → chuyển sang UTF-8 trước khi cài
iconv -f UTF-16 -t UTF-8 requirements.txt > requirements.utf8.txt
pip install -r requirements.utf8.txt
pip install gunicorn==23.0.0        # bắt buộc cho production

python app.py                       # dev
# production:
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

Kiểm tra: `GET /` → JSON báo trạng thái 3 model (`model_diem_hoc_phan`, `model_gpa_hoc_ky_tiep_theo`, `model_gpa_tot_nghiep`).

Huấn luyện lại model (tuỳ chọn): chạy tuần tự các script trong `ML/src/` (`01_kham_pha_du_lieu.py` → `06_du_doan.py`, `21_*` → `24_*`, `31_*` → `33_*`), kết quả ghi ra `ML/models/*.pkl`.

### 5.4 Frontend + reverse proxy

Frontend là **static site** nằm trong `Fontend/`. Các file JS gọi API theo **cùng origin** (`API_BASE_URL = ""` → `/api/...`), nên cần một reverse proxy:

```nginx
server {
    listen 80;
    server_name nckh.local;
    root /var/www/web-nckh/Fontend;
    index index.html;

    client_max_body_size 50M;          # cho phép upload tài liệu/video

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

Trỏ `ML_API_URL` của Backend về dịch vụ ML (mặc định `http://127.0.0.1:5000`).

---

## 6. Biến môi trường

`Backend/.env` (xem `Backend/.env.example`):

| Biến | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `DB_SERVER` | tên host SQL Server | `nckh-mssql` / `127.0.0.1` |
| `DB_DATABASE` | tên database | `DU_DOAN_SINH_VIEN` |
| `DB_USER` | user ứng dụng | `backend_web` |
| `DB_PASSWORD` | mật khẩu user DB | *(không commit)* |
| `DB_PORT` | cổng SQL Server | `1433` |
| `JWT_SECRET` | khóa ký token đăng nhập | *(không commit)* |
| `ML_API_URL` | địa chỉ dịch vụ ML (tuỳ chọn) | `http://127.0.0.1:5000` |

---

## 7. API chính

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| POST | `/api/dang-nhap` | đăng nhập (`maDangNhap`, `matKhau`) → trả `token` |
| POST | `/api/dang-xuat` | đăng xuất (ghi `PHIEN_DANG_NHAP`) |
| GET | `/api/home/du-lieu` | dữ liệu trang chủ theo vai trò |
| GET | `/api/hoc-phan` | danh mục học phần |
| GET | `/api/sinh-vien/ho-so` | hồ sơ sinh viên (cần token) |
| GET | `/api/sinh-vien/gpa` | GPA + lịch sử học kỳ |
| POST | `/api/du-doan/diem-hoc-phan` | dự đoán điểm học phần |
| POST | `/api/du-doan/gpa-hoc-ky` | dự đoán GPA học kỳ |
| POST | `/api/du-doan/gpa-hoc-ky-tiep-theo` | dự đoán GPA học kỳ kế tiếp |
| POST | `/api/du-doan/gpa-tot-nghiep` | dự đoán GPA tốt nghiệp |
| GET | `/api/du-doan/gpa-lich-su` | lịch sử dự đoán |
| GET | `/api/bao-cao/du-doan-hoc-ky/:id` | báo cáo dự đoán (giảng viên) |
| GET | `/api/giang-vien/danh-sach-sinh-vien` | danh sách sinh viên (giảng viên) |
| GET/POST/PUT/DELETE | `/api/tai-nguyen/*` | quản lý tài nguyên học tập |

**Dịch vụ ML** (`http://…:5000`): `GET /`, `POST /du-doan`, `POST /du-doan-gpa-hoc-ky-tiep-theo`, `POST /du-doan-gpa-tot-nghiep`.

Endpoint có xác thực trả **401** khi thiếu/sai token — đúng thiết kế.

---

## 8. Cơ sở dữ liệu (18 bảng)

| Nhóm | Bảng |
| :--- | :--- |
| Tài khoản & phiên | `TAI_KHOAN`, `PHIEN_DANG_NHAP`, `LICH_SU_TRUY_CAP` |
| Người dùng | `SINH_VIEN`, `GIANG_VIEN` |
| Đào tạo | `HOC_PHAN`, `KET_QUA_HOC_KY`, `KET_QUA_HOC_PHAN` |
| Dự đoán | `DU_DOAN_DIEM_HOC_PHAN`, `DU_DOAN_HOC_KY`, `DU_DOAN_GPA_HOC_KY_TIEP_THEO`, `DU_DOAN_GPA_TOT_NGHIEP`, `CHI_TIET_DU_DOAN_HOC_KY` |
| Tài nguyên | `TAI_LIEU`, `VIDEO_BAI_GIANG`, `WEBSITE_THAM_KHAO`, `TAI_NGUYEN_HOC_TAP`, `TAI_NGUYEN_NOI_BAT` |

Quy ước dữ liệu quan trọng:
- `NAM_HOC` lưu dạng `2024-2025` (**không** có khoảng trắng quanh dấu `-`).
- Mật khẩu trong `TAI_KHOAN.MAT_KHAU` là **bcrypt**, không lưu plaintext.

---

## 9. Bảo mật

- `.env` **không** được commit (đã có `.gitignore` + `Backend/.env.example`); file upload người dùng cũng không commit.
- Đổi `JWT_SECRET` khi cần vô hiệu hoá toàn bộ phiên đăng nhập (mọi token cũ hết hiệu lực).
- Mật khẩu DB phải đủ phức tạp (SQL Server bật `CHECK_POLICY`).
- `Backend/src/app.js` đang bật `cors()` không giới hạn → nếu triển khai public, nên siết lại thành danh sách domain cụ thể.
- Endpoint upload dùng `multer` — cần giới hạn kích thước file và kiểm tra định dạng trước khi phục vụ.

---

## 10. Quy ước trong repo

- Tên thư mục `Fontend` được giữ nguyên (không đổi thành `Frontend`) vì toàn bộ đường dẫn tài nguyên đã deploy trỏ theo tên này.
- File CSS/JS gắn query cache-bust (`?v=YYYYMMDD-N`) — **mỗi khi sửa CSS/JS/ảnh phải bump `?v=`** để trình duyệt tải bản mới.
- `.gitattributes` ép line ending `LF` (`* text=auto eol=lf`) — hãy lưu file với LF để diff gọn.
- Ảnh mặc định của sinh viên: `Fontend/Assets/Images/Avatars/sv-mac-dinh.jpg`.
