import pandas as pd
from pathlib import Path

from sklearn.model_selection import KFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LinearRegression


# ============================================================
# 1. ĐƯỜNG DẪN
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

FILE_CSV = BASE_DIR / "data" / "raw" / "du_lieu_hoc_phan.csv"


# ============================================================
# 2. ĐỌC DATASET
# ============================================================

df = pd.read_csv(FILE_CSV)


# ============================================================
# 3. INPUT / OUTPUT
# ============================================================

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


# ============================================================
# 4. CÁC CỘT
# ============================================================

cot_categorical = [
    "ma_hoc_phan"
]

cot_numeric = [
    "so_tin_chi",
    "diem_chuyen_can",
    "diem_thuong_xuyen",
    "ty_le_hoan_thanh_bai_tap",
    "so_buoi_nghi"
]


# ============================================================
# 5. TIỀN XỬ LÝ
# ============================================================

bo_tien_xu_ly = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            cot_categorical
        ),
        (
            "numeric",
            "passthrough",
            cot_numeric
        )
    ]
)


# ============================================================
# 6. MODEL
# ============================================================

model = Pipeline(
    steps=[
        (
            "tien_xu_ly",
            bo_tien_xu_ly
        ),
        (
            "mo_hinh",
            LinearRegression()
        )
    ]
)


# ============================================================
# 7. 5-FOLD CROSS VALIDATION
# ============================================================

kfold = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


ket_qua = cross_validate(
    model,
    X,
    y,
    cv=kfold,
    scoring={
        "MAE": "neg_mean_absolute_error",
        "RMSE": "neg_root_mean_squared_error",
        "R2": "r2"
    }
)


# ============================================================
# 8. KẾT QUẢ
# ============================================================

mae = -ket_qua["test_MAE"]
rmse = -ket_qua["test_RMSE"]
r2 = ket_qua["test_R2"]


print("=" * 60)
print("ĐÁNH GIÁ 5-FOLD CROSS-VALIDATION")
print("=" * 60)


for i in range(5):

    print(f"\nFold {i + 1}")

    print("MAE :", round(mae[i], 4))
    print("RMSE:", round(rmse[i], 4))
    print("R²  :", round(r2[i], 4))


print("\n")
print("=" * 60)
print("KẾT QUẢ TRUNG BÌNH")
print("=" * 60)

print("MAE trung bình :", round(mae.mean(), 4))
print("RMSE trung bình:", round(rmse.mean(), 4))
print("R² trung bình  :", round(r2.mean(), 4))


print("\n")
print("=" * 60)
print("ĐỘ LỆCH CHUẨN")
print("=" * 60)

print("MAE :", round(mae.std(), 4))
print("RMSE:", round(rmse.std(), 4))
print("R²  :", round(r2.std(), 4))