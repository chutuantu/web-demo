from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split

from sklearn.linear_model import LinearRegression

from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
)

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)


# ============================================================
# 1. ĐƯỜNG DẪN
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "raw"
    / "du_lieu_gpa_hoc_ky_tiep_theo.csv"
)

MODEL_DIR = (
    BASE_DIR
    / "models"
)

MODEL_PATH = (
    MODEL_DIR
    / "mo_hinh_du_doan_gpa_hoc_ky_tiep_theo.pkl"
)


# ============================================================
# 2. ĐỌC DATASET
# ============================================================

df = pd.read_csv(DATA_PATH)


# ============================================================
# 3. CÁC BIẾN ĐẦU VÀO
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


COT_MUC_TIEU = (
    "gpa_hoc_ky_tiep_theo"
)


# ============================================================
# 4. TẠO X VÀ y
# ============================================================

X = df[COT_DAU_VAO]

y = df[COT_MUC_TIEU]


# ============================================================
# 5. CHIA TRAIN / TEST
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)


# ============================================================
# 6. HIỂN THỊ THÔNG TIN
# ============================================================

print("=" * 60)

print(
    "HUẤN LUYỆN MODEL DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO"
)

print("=" * 60)

print()

print(
    "Số dòng:",
    len(df)
)

print(
    "Số cột:",
    len(df.columns)
)

print()

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


# ============================================================
# 7. CÁC MODEL
# ============================================================

models = {

    "Linear Regression":
        LinearRegression(),

    "Random Forest":
        RandomForestRegressor(
            n_estimators=300,
            random_state=42
        ),

    "Gradient Boosting":
        GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=3,
            random_state=42
        ),
}


# ============================================================
# 8. HUẤN LUYỆN + ĐÁNH GIÁ
# ============================================================

ketQua = []


for tenModel, model in models.items():

    print()
    print("-" * 60)

    print(
        "Đang huấn luyện:",
        tenModel
    )


    # --------------------------------------------------------
    # Huấn luyện
    # --------------------------------------------------------

    model.fit(
        X_train,
        y_train
    )


    # --------------------------------------------------------
    # Dự đoán
    # --------------------------------------------------------

    y_pred = model.predict(
        X_test
    )


    # --------------------------------------------------------
    # MAE
    # --------------------------------------------------------

    mae = mean_absolute_error(
        y_test,
        y_pred
    )


    # --------------------------------------------------------
    # RMSE
    # --------------------------------------------------------

    rmse = (
        mean_squared_error(
            y_test,
            y_pred
        )
        ** 0.5
    )


    # --------------------------------------------------------
    # R²
    # --------------------------------------------------------

    r2 = r2_score(
        y_test,
        y_pred
    )


    print(
        "MAE :",
        round(mae, 4)
    )

    print(
        "RMSE:",
        round(rmse, 4)
    )

    print(
        "R²  :",
        round(r2, 4)
    )


    ketQua.append({

        "Mo_hinh":
            tenModel,

        "MAE":
            mae,

        "RMSE":
            rmse,

        "R2":
            r2,

        "model":
            model,
    })


# ============================================================
# 9. SO SÁNH CÁC MODEL
# ============================================================

print()
print("=" * 60)

print(
    "SO SÁNH CÁC MÔ HÌNH"
)

print("=" * 60)


bangSoSanh = pd.DataFrame([
    {

        "Mo_hinh":
            item["Mo_hinh"],

        "MAE":
            item["MAE"],

        "RMSE":
            item["RMSE"],

        "R2":
            item["R2"],

    }

    for item in ketQua
])


print(
    bangSoSanh
        .sort_values(
            by="RMSE",
            ascending=True
        )
        .to_string(
            index=False
        )
)


# ============================================================
# 10. CHỌN MODEL TỐT NHẤT
# ============================================================
#
# Ưu tiên:
# RMSE thấp nhất
# sau đó MAE thấp nhất
# ============================================================

modelTotNhat = min(
    ketQua,
    key=lambda item: (
        item["RMSE"],
        item["MAE"],
    ),
)


print()
print("=" * 60)

print(
    "MODEL TỐT NHẤT"
)

print("=" * 60)


print(
    "Tên:",
    modelTotNhat["Mo_hinh"]
)


print(
    "MAE:",
    round(
        modelTotNhat["MAE"],
        4
    )
)

print(
    "RMSE:",
    round(
        modelTotNhat["RMSE"],
        4
    )
)

print(
    "R²:",
    round(
        modelTotNhat["R2"],
        4
    )
)


# ============================================================
# 11. LƯU MODEL
# ============================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


joblib.dump(
    modelTotNhat["model"],
    MODEL_PATH
)


print()

print(
    "Đã lưu model tại:"
)

print(
    MODEL_PATH
)


# ============================================================
# 12. MỘT SỐ KẾT QUẢ DỰ ĐOÁN MẪU
# ============================================================

y_du_doan_mau =modelTotNhat["model"].predict(X_test)


bangDuDoan = pd.DataFrame({

    "Thuc_te":
        y_test.values[:10],

    "Du_doan":
        y_du_doan_mau[:10],
})


print()
print("=" * 60)

print(
    "MỘT SỐ KẾT QUẢ DỰ ĐOÁN"
)

print("=" * 60)

print(
    bangDuDoan.to_string(
        index=False
    )
)