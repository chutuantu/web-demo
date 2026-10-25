import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split


# ==============================
# 1. XÁC ĐỊNH ĐƯỜNG DẪN
# ==============================

BASE_DIR = Path(__file__).resolve().parent.parent

FILE_CSV = BASE_DIR / "data" / "raw" / "du_lieu_hoc_phan.csv"


# ==============================
# 2. ĐỌC DATASET
# ==============================

df = pd.read_csv(FILE_CSV)

print("Đã đọc dataset.")
print("Số dòng:", len(df))
print("Số cột:", len(df.columns))


# ==============================
# 3. XÁC ĐỊNH INPUT VÀ OUTPUT
# ==============================

cac_cot_input = [
    "ma_hoc_phan",
    "so_tin_chi",
    "diem_chuyen_can",
    "diem_thuong_xuyen",
    "ty_le_hoan_thanh_bai_tap",
    "so_buoi_nghi"
    
]

cot_output = "diem_hoc_phan_thuc_te"


X = df[cac_cot_input]
y = df[cot_output]


# ==============================
# 4. KIỂM TRA DỮ LIỆU
# ==============================

print("\nCác biến đầu vào:")
print(X.columns.tolist())

print("\nBiến đầu ra:")
print(y.name)

print("\nSố lượng dữ liệu thiếu:")
print(X.isnull().sum())

print("\nDữ liệu đầu ra:")
print(y)


# ==============================
# 5. CHIA TRAIN / TEST
# ==============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# ==============================
# 6. HIỂN THỊ KẾT QUẢ
# ==============================

print("\n==============================")
print("CHIA DỮ LIỆU")
print("==============================")

print("X_train:", X_train.shape)
print("X_test :", X_test.shape)
print("y_train:", y_train.shape)
print("y_test :", y_test.shape)