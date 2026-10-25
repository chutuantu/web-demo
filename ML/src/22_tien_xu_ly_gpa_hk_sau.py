from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


# ============================================================
# 1. ĐƯỜNG DẪN
# ============================================================

DUONG_DAN = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "raw"
    / "du_lieu_gpa_hoc_ky_tiep_theo.csv"
)


# ============================================================
# 2. ĐỌC DATASET
# ============================================================

df = pd.read_csv(DUONG_DAN)


# ============================================================
# 3. CÁC CỘT ĐẦU VÀO
# ============================================================

COT_DAU_VAO = [
    "gpa_ky_gan_nhat",
    "gpa_trung_binh_lich_su",
    "xu_huong_gpa",
    "so_hoc_ky_da_hoc",
    "tong_tin_chi_ky_toi",
    "gio_tu_hoc_tuan",
    "ty_le_chuyen_can",
    "gio_lam_them_tuan",
]


# ============================================================
# 4. CỘT MỤC TIÊU
# ============================================================

COT_MUC_TIEU = "gpa_hoc_ky_tiep_theo"


# ============================================================
# 5. KIỂM TRA CỘT
# ============================================================

cacCotCanThiet = COT_DAU_VAO + [COT_MUC_TIEU]

cotThieu = [
    cot
    for cot in cacCotCanThiet
    if cot not in df.columns
]

if cotThieu:
    raise ValueError(
        "Thiếu cột: "
        + ", ".join(cotThieu)
    )


# ============================================================
# 6. KIỂM TRA GIÁ TRỊ THIẾU
# ============================================================

if df[cacCotCanThiet].isnull().any().any():
    raise ValueError(
        "Dataset đang có giá trị thiếu."
    )


# ============================================================
# 7. TẠO X VÀ y
# ============================================================

X = df[COT_DAU_VAO].copy()

y = df[COT_MUC_TIEU].copy()


# ============================================================
# 8. CHIA TRAIN / TEST
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)


# ============================================================
# 9. HIỂN THỊ KẾT QUẢ
# ============================================================

print("=" * 60)
print(
    "TIỀN XỬ LÝ DATASET GPA HỌC KỲ TIẾP THEO"
)
print("=" * 60)

print()

print(
    "Tổng số dòng:",
    len(df)
)

print(
    "Số biến đầu vào:",
    len(COT_DAU_VAO)
)

print(
    "Biến mục tiêu:",
    COT_MUC_TIEU
)

print()

print(
    "Số mẫu train:",
    len(X_train)
)

print(
    "Số mẫu test :",
    len(X_test)
)

print()

print(
    "Tỷ lệ:"
)

print(
    "Train:",
    round(
        len(X_train) / len(df) * 100,
        1
    ),
    "%"
)

print(
    "Test :",
    round(
        len(X_test) / len(df) * 100,
        1
    ),
    "%"
)

print()

print(
    "Các biến đầu vào:"
)

for cot in COT_DAU_VAO:
    print(
        "-",
        cot
    )

print()

print("=" * 60)
print(
    "TIỀN XỬ LÝ HOÀN TẤT"
)
print("=" * 60)