import pandas as pd
from pathlib import Path

from sklearn.model_selection import KFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor


# ============================================================
# 1. ĐƯỜNG DẪN
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

FILE_CSV = BASE_DIR / "data" / "raw" / "du_lieu_hoc_phan.csv"


# ============================================================
# 2. ĐỌC DỮ LIỆU
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
# 4. CÁC LOẠI CỘT
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
# 6. CÁC MÔ HÌNH
# ============================================================

cac_mo_hinh = {

    "Linear Regression": LinearRegression(),

    "Random Forest": RandomForestRegressor(
        n_estimators=200,
        max_depth=8,
        random_state=42
    ),

    "Gradient Boosting": GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        random_state=42
    )
}


# ============================================================
# 7. 5-FOLD CROSS VALIDATION
# ============================================================

kfold = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


ket_qua = []


# ============================================================
# 8. CHẠY TỪNG MÔ HÌNH
# ============================================================

for ten_mo_hinh, mo_hinh in cac_mo_hinh.items():

    print("\n" + "=" * 60)
    print("ĐANG ĐÁNH GIÁ:", ten_mo_hinh)
    print("=" * 60)

    pipeline = Pipeline(
        steps=[
            (
                "tien_xu_ly",
                bo_tien_xu_ly
            ),
            (
                "mo_hinh",
                mo_hinh
            )
        ]
    )

    ket_qua_cv = cross_validate(
        pipeline,
        X,
        y,
        cv=kfold,
        scoring={
            "MAE": "neg_mean_absolute_error",
            "RMSE": "neg_root_mean_squared_error",
            "R2": "r2"
        }
    )

    mae = -ket_qua_cv["test_MAE"]
    rmse = -ket_qua_cv["test_RMSE"]
    r2 = ket_qua_cv["test_R2"]

    print("MAE từng fold :", [round(x, 4) for x in mae])
    print("RMSE từng fold:", [round(x, 4) for x in rmse])
    print("R² từng fold  :", [round(x, 4) for x in r2])

    print("\nTrung bình:")
    print("MAE :", round(mae.mean(), 4))
    print("RMSE:", round(rmse.mean(), 4))
    print("R²  :", round(r2.mean(), 4))

    print("\nĐộ lệch chuẩn:")
    print("MAE :", round(mae.std(), 4))
    print("RMSE:", round(rmse.std(), 4))
    print("R²  :", round(r2.std(), 4))

    ket_qua.append({
        "Mo_hinh": ten_mo_hinh,
        "MAE": mae.mean(),
        "RMSE": rmse.mean(),
        "R2": r2.mean(),
        "SD_MAE": mae.std(),
        "SD_RMSE": rmse.std(),
        "SD_R2": r2.std()
    })


# ============================================================
# 9. BẢNG SO SÁNH
# ============================================================

df_ket_qua = pd.DataFrame(ket_qua)

df_ket_qua = df_ket_qua.sort_values(
    by="MAE"
)


print("\n")
print("=" * 80)
print("SO SÁNH 3 MÔ HÌNH - 5 FOLD CROSS VALIDATION")
print("=" * 80)

print(
    df_ket_qua.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}"
    )
)


# ============================================================
# 10. XÁC ĐỊNH MODEL TỐT NHẤT
# ============================================================

model_tot_nhat = df_ket_qua.iloc[0]

print("\n")
print("=" * 60)
print("MODEL TỐT NHẤT THEO MAE")
print("=" * 60)

print("Mô hình:", model_tot_nhat["Mo_hinh"])
print("MAE    :", round(model_tot_nhat["MAE"], 4))
print("RMSE   :", round(model_tot_nhat["RMSE"], 4))
print("R²     :", round(model_tot_nhat["R2"], 4))