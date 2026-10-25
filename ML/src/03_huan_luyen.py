import pandas as pd
from pathlib import Path
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================================
# 1. ĐƯỜNG DẪN
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

FILE_CSV = BASE_DIR / "data" / "raw" / "du_lieu_hoc_phan.csv"

MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(exist_ok=True)


# ============================================================
# 2. ĐỌC DATASET
# ============================================================

df = pd.read_csv(FILE_CSV)

print("=" * 60)
print("HUẤN LUYỆN MÔ HÌNH")
print("=" * 60)

print("Số dòng:", len(df))
print("Số cột:", len(df.columns))


# ============================================================
# 3. INPUT VÀ OUTPUT
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
# 4. CHIA TRAIN / TEST
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


print("\nSố mẫu train:", len(X_train))
print("Số mẫu test :", len(X_test))


# ============================================================
# 5. XÁC ĐỊNH CỘT
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
# 6. TIỀN XỬ LÝ
# ============================================================

bo_tien_xu_ly = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
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
# 7. KHAI BÁO CÁC MÔ HÌNH
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
# 8. HUẤN LUYỆN VÀ ĐÁNH GIÁ
# ============================================================

ket_qua = []

cac_pipeline = {}


for ten_mo_hinh, mo_hinh in cac_mo_hinh.items():

    print("\n" + "-" * 60)
    print("Đang huấn luyện:", ten_mo_hinh)

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

    # Huấn luyện
    pipeline.fit(X_train, y_train)

    # Dự đoán
    y_pred = pipeline.predict(X_test)

    # Đánh giá
    mae = mean_absolute_error(
        y_test,
        y_pred
    )

    rmse = mean_squared_error(
        y_test,
        y_pred
    ) ** 0.5

    r2 = r2_score(
        y_test,
        y_pred
    )

    print("MAE :", round(mae, 4))
    print("RMSE:", round(rmse, 4))
    print("R²  :", round(r2, 4))

    ket_qua.append({
        "Mo_hinh": ten_mo_hinh,
        "MAE": mae,
        "RMSE": rmse,
        "R2": r2
    })

    cac_pipeline[ten_mo_hinh] = pipeline


# ============================================================
# 9. SO SÁNH MÔ HÌNH
# ============================================================

df_ket_qua = pd.DataFrame(ket_qua)

print("\n")
print("=" * 60)
print("SO SÁNH CÁC MÔ HÌNH")
print("=" * 60)

print(
    df_ket_qua
    .sort_values("MAE")
    .to_string(index=False)
)


# ============================================================
# 10. CHỌN MÔ HÌNH TỐT NHẤT
# ============================================================

vi_tri_tot_nhat = df_ket_qua["MAE"].idxmin()

ten_tot_nhat = df_ket_qua.loc[
    vi_tri_tot_nhat,
    "Mo_hinh"
]

mo_hinh_tot_nhat = cac_pipeline[
    ten_tot_nhat
]


print("\n")
print("=" * 60)
print("MÔ HÌNH TỐT NHẤT")
print("=" * 60)

print("Tên:", ten_tot_nhat)


# ============================================================
# 11. LƯU MODEL
# ============================================================

duong_dan_model = (
    MODEL_DIR /
    "mo_hinh_du_doan_diem_hoc_phan.pkl"
)

joblib.dump(
    mo_hinh_tot_nhat,
    duong_dan_model
)


print("\nĐã lưu mô hình tại:")
print(duong_dan_model)


# ============================================================
# 12. HIỂN THỊ MỘT SỐ DỰ ĐOÁN
# ============================================================

y_pred_tot_nhat = mo_hinh_tot_nhat.predict(
    X_test
)

bang_du_doan = pd.DataFrame({
    "Thuc_te": y_test.values,
    "Du_doan": y_pred_tot_nhat
})

print("\n")
print("=" * 60)
print("MỘT SỐ KẾT QUẢ DỰ ĐOÁN")
print("=" * 60)

print(
    bang_du_doan.head(10).to_string(
        index=False
    )
)