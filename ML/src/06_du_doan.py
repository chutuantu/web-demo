import pandas as pd
from pathlib import Path
import joblib


# ============================================================
# 1. ĐƯỜNG DẪN
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_FILE = (
    BASE_DIR
    / "models"
    / "mo_hinh_du_doan_diem_hoc_phan.pkl"
)


# ============================================================
# 2. DANH MỤC HỌC PHẦN
# ============================================================

danh_muc_hoc_phan = {
    "INT2201": {
        "ten": "Học phần INT2201",
        "so_tin_chi": 3
    },
    "INT2202": {
        "ten": "Học phần INT2202",
        "so_tin_chi": 3
    },
    "INT2203": {
        "ten": "Học phần INT2203",
        "so_tin_chi": 3
    },
    "INT2204": {
        "ten": "Học phần INT2204",
        "so_tin_chi": 3
    },
    "INT2205": {
        "ten": "Học phần INT2205",
        "so_tin_chi": 3
    },
    "INT2206": {
        "ten": "Học phần INT2206",
        "so_tin_chi": 3
    },
    "INT2207": {
        "ten": "Học phần INT2207",
        "so_tin_chi": 4
    },
    "INT2208": {
        "ten": "Học phần INT2208",
        "so_tin_chi": 3
    }
}


# ============================================================
# 3. KIỂM TRA MODEL
# ============================================================

if not MODEL_FILE.exists():
    print("Không tìm thấy mô hình!")
    print("Hãy chạy 03_huan_luyen.py trước.")
    exit()


# ============================================================
# 4. LOAD MODEL
# ============================================================

model = joblib.load(MODEL_FILE)


# ============================================================
# 5. HIỂN THỊ
# ============================================================

print("=" * 60)
print("DỰ ĐOÁN ĐIỂM HỌC PHẦN")
print("=" * 60)

print("\nDanh sách học phần:")

for ma, thong_tin in danh_muc_hoc_phan.items():
    print(
        f"{ma} - "
        f"{thong_tin['ten']} - "
        f"{thong_tin['so_tin_chi']} tín chỉ"
    )


# ============================================================
# 6. CHỌN HỌC PHẦN
# ============================================================

ma_hoc_phan = input(
    "\nNhập mã học phần: "
).strip().upper()


if ma_hoc_phan not in danh_muc_hoc_phan:

    print("Không tìm thấy học phần!")

    exit()


# Lấy thông tin tự động

thong_tin_hoc_phan = (
    danh_muc_hoc_phan[ma_hoc_phan]
)

so_tin_chi = (
    thong_tin_hoc_phan["so_tin_chi"]
)


print("\nHọc phần đã chọn:")
print(
    "Tên:",
    thong_tin_hoc_phan["ten"]
)

print(
    "Mã:",
    ma_hoc_phan
)

print(
    "Số tín chỉ:",
    so_tin_chi
)


# ============================================================
# 7. NHẬP CÁC THÔNG TIN DỰ ĐOÁN
# ============================================================

diem_chuyen_can = float(
    input("\nĐiểm chuyên cần (0-10): ")
)

diem_thuong_xuyen = float(
    input("Điểm thường xuyên (0-10): ")
)

ty_le_hoan_thanh_bai_tap = float(
    input("Tỷ lệ hoàn thành bài tập (%): ")
)

so_buoi_nghi = int(
    input("Số buổi nghỉ: ")
)


# ============================================================
# 8. TẠO DỮ LIỆU INPUT CHO MODEL
# ============================================================

du_lieu = pd.DataFrame([
    {
        "ma_hoc_phan": ma_hoc_phan,
        "so_tin_chi": so_tin_chi,
        "diem_chuyen_can": diem_chuyen_can,
        "diem_thuong_xuyen": diem_thuong_xuyen,
        "ty_le_hoan_thanh_bai_tap":
            ty_le_hoan_thanh_bai_tap,
        "so_buoi_nghi": so_buoi_nghi
    }
])


# ============================================================
# 9. DỰ ĐOÁN
# ============================================================

diem_du_doan = model.predict(
    du_lieu
)[0]


# ============================================================
# 10. GIỚI HẠN ĐIỂM
# ============================================================

diem_du_doan = max(
    0,
    min(10, diem_du_doan)
)


# ============================================================
# 11. KẾT QUẢ
# ============================================================

print("\n")
print("=" * 60)
print("KẾT QUẢ DỰ ĐOÁN")
print("=" * 60)

print(
    f"Điểm học phần dự đoán: "
    f"{diem_du_doan:.2f}"
)


# ============================================================
# 12. XẾP LOẠI
# ============================================================

if diem_du_doan >= 8.5:
    xep_loai = "Xuất sắc"

elif diem_du_doan >= 8.0:
    xep_loai = "Giỏi"

elif diem_du_doan >= 6.5:
    xep_loai = "Khá"

elif diem_du_doan >= 5.0:
    xep_loai = "Trung bình"

else:
    xep_loai = "Yếu"


print("Mức đánh giá:", xep_loai)