from pathlib import Path
import pandas as pd


# ============================================================
# 1. ĐƯỜNG DẪN DATASET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DUONG_DAN = (
    BASE_DIR
    / "data"
    / "raw"
    / "du_lieu_gpa_tot_nghiep.csv"
)


# ============================================================
# 2. CÁC CỘT YÊU CẦU
# ============================================================

CAC_COT_YEU_CAU = [
    "gpa_ky_gan_nhat",
    "gpa_trung_binh_lich_su",
    "xu_huong_gpa",
    "so_hoc_ky_da_hoc",
    "ty_le_tin_chi_da_tich_luy",
    "muc_do_co_gang",
    "gpa_tot_nghiep",
]


# ============================================================
# 3. ĐỌC DATASET
# ============================================================

print("=" * 60)
print("KHÁM PHÁ DATASET GPA TỐT NGHIỆP")
print("=" * 60)


try:

    df = pd.read_csv(DUONG_DAN)

except FileNotFoundError:

    print("\nKhông tìm thấy dataset:")
    print(DUONG_DAN)

    raise SystemExit(1)

except Exception as error:

    print("\nLỗi đọc dataset:")
    print(error)

    raise SystemExit(1)


# ============================================================
# 4. KÍCH THƯỚC
# ============================================================

print("\n" + "-" * 60)
print("KÍCH THƯỚC DATASET")
print("-" * 60)

print(
    "Số dòng :",
    df.shape[0]
)

print(
    "Số cột  :",
    df.shape[1]
)


# ============================================================
# 5. DANH SÁCH CỘT
# ============================================================

print("\n" + "-" * 60)
print("DANH SÁCH CỘT")
print("-" * 60)

for index, column in enumerate(
    df.columns,
    start=1
):

    print(
        f"{index}. {column}"
    )


# ============================================================
# 6. KIỂM TRA CẤU TRÚC CỘT
# ============================================================

print("\n" + "-" * 60)
print("KIỂM TRA CẤU TRÚC CỘT")
print("-" * 60)

if list(df.columns) == CAC_COT_YEU_CAU:

    print(
        "Cấu trúc cột: OK"
    )

else:

    print(
        "Cấu trúc cột: SAI"
    )

    print(
        "\nĐang có:"
    )

    print(
        list(df.columns)
    )

    print(
        "\nCần có:"
    )

    print(
        CAC_COT_YEU_CAU
    )


# ============================================================
# 7. 5 DÒNG ĐẦU
# ============================================================

print("\n" + "-" * 60)
print("5 DÒNG ĐẦU")
print("-" * 60)

print(
    df.head().to_string(
        index=False
    )
)


# ============================================================
# 8. KIỂU DỮ LIỆU
# ============================================================

print("\n" + "-" * 60)
print("KIỂU DỮ LIỆU")
print("-" * 60)

print(
    df.dtypes
)


# ============================================================
# 9. GIÁ TRỊ THIẾU
# ============================================================

print("\n" + "-" * 60)
print("GIÁ TRỊ THIẾU")
print("-" * 60)

thieu = df.isnull().sum()

print(
    thieu
)

if thieu.sum() == 0:

    print(
        "\nKhông có giá trị thiếu."
    )

else:

    print(
        f"\nTổng số ô thiếu: {thieu.sum()}"
    )


# ============================================================
# 10. DÒNG TRÙNG
# ============================================================

print("\n" + "-" * 60)
print("DÒNG TRÙNG")
print("-" * 60)

so_dong_trung = (
    df.duplicated().sum()
)

print(
    "Số dòng trùng:",
    so_dong_trung
)


# ============================================================
# 11. THỐNG KÊ MÔ TẢ
# ============================================================

print("\n" + "-" * 60)
print("THỐNG KÊ MÔ TẢ")
print("-" * 60)

print(
    df.describe().round(4).to_string()
)


# ============================================================
# 12. KIỂM TRA GPA
# ============================================================

print("\n" + "-" * 60)
print("KIỂM TRA CÁC CỘT GPA")
print("-" * 60)

CAC_COT_GPA = [
    "gpa_ky_gan_nhat",
    "gpa_trung_binh_lich_su",
    "gpa_tot_nghiep",
]


for column in CAC_COT_GPA:

    gia_tri_min = df[column].min()

    gia_tri_max = df[column].max()

    print(
        f"{column}: "
        f"min={gia_tri_min:.4f}, "
        f"max={gia_tri_max:.4f}"
    )

    if (
        gia_tri_min < 0
        or
        gia_tri_max > 4
    ):

        print(
            "  -> CẢNH BÁO: GPA ngoài khoảng 0–4"
        )


# ============================================================
# 13. KIỂM TRA XU HƯỚNG GPA
# ============================================================

print("\n" + "-" * 60)
print("KIỂM TRA XU HƯỚNG GPA")
print("-" * 60)

print(
    "Min:",
    round(
        df["xu_huong_gpa"].min(),
        4
    )
)

print(
    "Max:",
    round(
        df["xu_huong_gpa"].max(),
        4
    )
)

print(
    "Trung bình:",
    round(
        df["xu_huong_gpa"].mean(),
        4
    )
)


# ============================================================
# 14. KIỂM TRA SỐ HỌC KỲ
# ============================================================

print("\n" + "-" * 60)
print("KIỂM TRA SỐ HỌC KỲ")
print("-" * 60)

print(
    "Các giá trị:",
    sorted(
        df[
            "so_hoc_ky_da_hoc"
        ].unique()
    )
)

if (
    df[
        "so_hoc_ky_da_hoc"
    ].min() < 1
    or
    df[
        "so_hoc_ky_da_hoc"
    ].max() > 8
):

    print(
        "CẢNH BÁO: số học kỳ phải từ 1 đến 8."
    )


# ============================================================
# 15. KIỂM TRA TỶ LỆ TÍN CHỈ
# ============================================================

print("\n" + "-" * 60)
print("KIỂM TRA TỶ LỆ TÍN CHỈ")
print("-" * 60)

ty_le_min = (
    df[
        "ty_le_tin_chi_da_tich_luy"
    ].min()
)

ty_le_max = (
    df[
        "ty_le_tin_chi_da_tich_luy"
    ].max()
)

print(
    "Min:",
    round(
        ty_le_min,
        4
    )
)

print(
    "Max:",
    round(
        ty_le_max,
        4
    )
)

if (
    ty_le_min < 0
    or
    ty_le_max > 1
):

    print(
        "CẢNH BÁO: tỷ lệ phải nằm trong khoảng 0–1."
    )


# ============================================================
# 16. KIỂM TRA MỨC ĐỘ CỐ GẮNG
# ============================================================

print("\n" + "-" * 60)
print("KIỂM TRA MỨC ĐỘ CỐ GẮNG")
print("-" * 60)

print(
    df[
        "muc_do_co_gang"
    ]
    .value_counts()
    .sort_index()
)

cac_gia_tri_co_gang = set(
    df[
        "muc_do_co_gang"
    ].unique()
)

if not cac_gia_tri_co_gang.issubset(
    {0, 1, 2}
):

    print(
        "CẢNH BÁO: mức độ cố gắng chỉ được 0, 1, 2."
    )


# ============================================================
# 17. KIỂM TRA TARGET
# ============================================================

print("\n" + "-" * 60)
print("BIẾN MỤC TIÊU")
print("-" * 60)

print(
    "Target:",
    "gpa_tot_nghiep"
)

print(
    "Trung bình:",
    round(
        df[
            "gpa_tot_nghiep"
        ].mean(),
        4
    )
)

print(
    "Min:",
    round(
        df[
            "gpa_tot_nghiep"
        ].min(),
        4
    )
)

print(
    "Max:",
    round(
        df[
            "gpa_tot_nghiep"
        ].max(),
        4
    )
)


# ============================================================
# 18. KẾT LUẬN
# ============================================================

print("\n" + "=" * 60)
print("KẾT LUẬN")
print("=" * 60)

dataset_ok = (
    df.shape[0] == 300
    and
    df.shape[1] == 7
    and
    thieu.sum() == 0
    and
    so_dong_trung == 0
    and
    list(df.columns) == CAC_COT_YEU_CAU
    and
    df["gpa_ky_gan_nhat"].between(0, 4).all()
    and
    df["gpa_trung_binh_lich_su"].between(0, 4).all()
    and
    df["gpa_tot_nghiep"].between(0, 4).all()
    and
    df["so_hoc_ky_da_hoc"].between(1, 8).all()
    and
    df["ty_le_tin_chi_da_tich_luy"].between(0, 1).all()
    and
    df["muc_do_co_gang"].isin([0, 1, 2]).all()
)

if dataset_ok:

    print(
        "DATASET ĐẠT KIỂM TRA CƠ BẢN."
    )

else:

    print(
        "DATASET CẦN KIỂM TRA LẠI."
    )