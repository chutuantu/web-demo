from pathlib import Path
import pandas as pd

DUONG_DAN = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "raw"
    / "du_lieu_gpa_hoc_ky_tiep_theo.csv"
)

df = pd.read_csv(DUONG_DAN)


print("=" * 60)
print("KHÁM PHÁ DATASET GPA HỌC KỲ TIẾP THEO")
print("=" * 60)


# ============================================================
# 1. KÍCH THƯỚC
# ============================================================

print("\nKích thước dataset:")
print("Số dòng:", df.shape[0])
print("Số cột :", df.shape[1])


# ============================================================
# 2. DANH SÁCH CỘT
# ============================================================

print("\nDanh sách cột:")

for cot in df.columns:
    print("-", cot)


# ============================================================
# 3. 5 DÒNG ĐẦU
# ============================================================

print("\n5 dòng đầu:")
print(df.head())


# ============================================================
# 4. 5 DÒNG CUỐI
# ============================================================

print("\n5 dòng cuối:")
print(df.tail())


# ============================================================
# 5. KIỂU DỮ LIỆU
# ============================================================

print("\nKiểu dữ liệu:")
print(df.dtypes)


# ============================================================
# 6. GIÁ TRỊ THIẾU
# ============================================================

print("\nGiá trị thiếu:")

thieu = df.isnull().sum()

print(thieu)


# ============================================================
# 7. KIỂM TRA GIÁ TRỊ TRÙNG
# ============================================================

print("\nSố dòng trùng:")
print(df.duplicated().sum())


# ============================================================
# 8. THỐNG KÊ CƠ BẢN
# ============================================================

print("\nThống kê mô tả:")
print(df.describe())


# ============================================================
# 9. KIỂM TRA KHOẢNG GPA
# ============================================================

print("\nKiểm tra GPA kỳ gần nhất:")

print(
    "Min:",
    df["gpa_ky_gan_nhat"].min()
)

print(
    "Max:",
    df["gpa_ky_gan_nhat"].max()
)


print("\nKiểm tra GPA trung bình lịch sử:")

print(
    "Min:",
    df["gpa_trung_binh_lich_su"].min()
)

print(
    "Max:",
    df["gpa_trung_binh_lich_su"].max()
)


print("\nKiểm tra GPA mục tiêu:")

print(
    "Min:",
    df["gpa_hoc_ky_tiep_theo"].min()
)

print(
    "Max:",
    df["gpa_hoc_ky_tiep_theo"].max()
)


# ============================================================
# 10. KIỂM TRA CÁC CỘT BẮT BUỘC
# ============================================================

cot_bat_buoc = [
    "gpa_ky_gan_nhat",
    "gpa_trung_binh_lich_su",
    "xu_huong_gpa",
    "so_hoc_ky_da_hoc",
    "tong_tin_chi_ky_toi",
    "gio_tu_hoc_tuan",
    "ty_le_chuyen_can",
    "gio_lam_them_tuan",
    "gpa_hoc_ky_tiep_theo",
]


print("\nKiểm tra cột bắt buộc:")

for cot in cot_bat_buoc:

    if cot in df.columns:
        print(f"{cot}: OK")

    else:
        print(f"{cot}: THIẾU")


# ============================================================
# 11. KIỂM TRA GIỚI HẠN DỮ LIỆU
# ============================================================

print("\nKiểm tra giới hạn dữ liệu:")


# GPA phải 0 - 4

if (
    df["gpa_ky_gan_nhat"].between(0, 4).all()
):
    print(
        "gpa_ky_gan_nhat: OK"
    )
else:
    print(
        "gpa_ky_gan_nhat: CÓ GIÁ TRỊ SAI"
    )


if (
    df["gpa_trung_binh_lich_su"].between(0, 4).all()
):
    print(
        "gpa_trung_binh_lich_su: OK"
    )
else:
    print(
        "gpa_trung_binh_lich_su: CÓ GIÁ TRỊ SAI"
    )


if (
    df["gpa_hoc_ky_tiep_theo"].between(0, 4).all()
):
    print(
        "gpa_hoc_ky_tiep_theo: OK"
    )
else:
    print(
        "gpa_hoc_ky_tiep_theo: CÓ GIÁ TRỊ SAI"
    )


# Tín chỉ 1 - 30

if (
    df["tong_tin_chi_ky_toi"]
    .between(1, 30)
    .all()
):
    print(
        "tong_tin_chi_ky_toi: OK"
    )
else:
    print(
        "tong_tin_chi_ky_toi: CÓ GIÁ TRỊ SAI"
    )


# Giờ tự học 0 - 168

if (
    df["gio_tu_hoc_tuan"]
    .between(0, 168)
    .all()
):
    print(
        "gio_tu_hoc_tuan: OK"
    )
else:
    print(
        "gio_tu_hoc_tuan: CÓ GIÁ TRỊ SAI"
    )


# Chuyên cần 0 - 100

if (
    df["ty_le_chuyen_can"]
    .between(0, 100)
    .all()
):
    print(
        "ty_le_chuyen_can: OK"
    )
else:
    print(
        "ty_le_chuyen_can: CÓ GIÁ TRỊ SAI"
    )


# Giờ làm thêm 0 - 168

if (
    df["gio_lam_them_tuan"]
    .between(0, 168)
    .all()
):
    print(
        "gio_lam_them_tuan: OK"
    )
else:
    print(
        "gio_lam_them_tuan: CÓ GIÁ TRỊ SAI"
    )


# ============================================================
# HOÀN TẤT
# ============================================================

print("\n" + "=" * 60)
print("KHÁM PHÁ DATASET HOÀN TẤT")
print("=" * 60)