from pathlib import Path

import pandas as pd

from sklearn.model_selection import KFold, cross_validate
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor
)


# ============================================================
# 1. ĐƯỜNG DẪN DATASET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "raw"
    / "du_lieu_gpa_tot_nghiep.csv"
)


# ============================================================
# 2. BIẾN ĐẦU VÀO
# ============================================================

FEATURE_COLUMNS = [
    "gpa_ky_gan_nhat",
    "gpa_trung_binh_lich_su",
    "xu_huong_gpa",
    "so_hoc_ky_da_hoc",
    "ty_le_tin_chi_da_tich_luy",
    "muc_do_co_gang",
]


# ============================================================
# 3. TARGET
# ============================================================

TARGET_COLUMN = "gpa_tot_nghiep"


# ============================================================
# 4. ĐỌC DATASET
# ============================================================

print("=" * 60)
print("ĐÁNH GIÁ 5-FOLD CROSS-VALIDATION")
print("MODEL DỰ ĐOÁN GPA TỐT NGHIỆP")
print("=" * 60)

try:
    df = pd.read_csv(DATA_FILE)

except FileNotFoundError:
    print("\nKhông tìm thấy dataset:")
    print(DATA_FILE)
    raise SystemExit(1)

except Exception as error:
    print("\nLỗi đọc dataset:")
    print(error)
    raise SystemExit(1)


# ============================================================
# 5. KIỂM TRA CỘT
# ============================================================

CAC_COT_CAN_THIET = (
    FEATURE_COLUMNS
    + [TARGET_COLUMN]
)

CAC_COT_THIEU = [
    column
    for column in CAC_COT_CAN_THIET
    if column not in df.columns
]

if CAC_COT_THIEU:
    print("\nDataset thiếu các cột:")

    for column in CAC_COT_THIEU:
        print("-", column)

    raise SystemExit(1)


# ============================================================
# 6. CHUẨN BỊ DỮ LIỆU
# ============================================================

df = df[
    CAC_COT_CAN_THIET
].dropna().copy()


X = df[
    FEATURE_COLUMNS
]

y = df[
    TARGET_COLUMN
]


print(
    "\nSố dòng:",
    len(df)
)

print(
    "Số biến đầu vào:",
    len(FEATURE_COLUMNS)
)

print(
    "Biến mục tiêu:",
    TARGET_COLUMN
)


# ============================================================
# 7. K-FOLD
# ============================================================

kf = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)


# ============================================================
# 8. CÁC MODEL
# ============================================================

models = {

    "Linear Regression":
        LinearRegression(),

    "Random Forest":
        RandomForestRegressor(
            n_estimators=300,
            random_state=42,
            min_samples_leaf=2
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
# 9. METRICS
# ============================================================

scoring = {
    "mae":
        "neg_mean_absolute_error",

    "rmse":
        "neg_root_mean_squared_error",

    "r2":
        "r2",
}


# ============================================================
# 10. ĐÁNH GIÁ
# ============================================================

ket_qua = []


for ten_model, model in models.items():

    print(
        "\n" + "-" * 60
    )

    print(
        f"Model: {ten_model}"
    )


    result = cross_validate(
        model,
        X,
        y,
        cv=kf,
        scoring=scoring,
        return_train_score=False
    )


    # --------------------------------------------------------
    # Chuyển MAE/RMSE từ số âm sang số dương
    # --------------------------------------------------------

    mae_values = (
        -result["test_mae"]
    )

    rmse_values = (
        -result["test_rmse"]
    )

    r2_values = (
        result["test_r2"]
    )


    # --------------------------------------------------------
    # Từng fold
    # --------------------------------------------------------

    for fold in range(5):

        print(
            f"\nFold {fold + 1}"
        )

        print(
            f"MAE : {mae_values[fold]:.4f}"
        )

        print(
            f"RMSE: {rmse_values[fold]:.4f}"
        )

        print(
            f"R²  : {r2_values[fold]:.4f}"
        )


    # --------------------------------------------------------
    # Trung bình
    # --------------------------------------------------------

    mae_mean = (
        mae_values.mean()
    )

    rmse_mean = (
        rmse_values.mean()
    )

    r2_mean = (
        r2_values.mean()
    )


    print(
        f"\nMAE trung bình : {mae_mean:.4f}"
    )

    print(
        f"RMSE trung bình: {rmse_mean:.4f}"
    )

    print(
        f"R² trung bình  : {r2_mean:.4f}"
    )


    # --------------------------------------------------------
    # Độ lệch chuẩn
    # --------------------------------------------------------

    mae_std = (
        mae_values.std()
    )

    rmse_std = (
        rmse_values.std()
    )

    r2_std = (
        r2_values.std()
    )


    print(
        "\nĐộ lệch chuẩn:"
    )

    print(
        f"MAE : {mae_std:.4f}"
    )

    print(
        f"RMSE: {rmse_std:.4f}"
    )

    print(
        f"R²  : {r2_std:.4f}"
    )


    ket_qua.append({

        "Mo_hinh":
            ten_model,

        "MAE":
            mae_mean,

        "RMSE":
            rmse_mean,

        "R2":
            r2_mean,

        "STD_MAE":
            mae_std,

        "STD_RMSE":
            rmse_std,

        "STD_R2":
            r2_std,
    })


# ============================================================
# 11. SO SÁNH
# ============================================================

bang_ket_qua = pd.DataFrame(
    ket_qua
)


bang_ket_qua = (
    bang_ket_qua
    .sort_values(
        by=[
            "R2",
            "MAE",
            "RMSE"
        ],
        ascending=[
            False,
            True,
            True
        ]
    )
    .reset_index(
        drop=True
    )
)


print(
    "\n" + "=" * 60
)

print(
    "SO SÁNH 5-FOLD CROSS-VALIDATION"
)

print(
    "=" * 60
)


print(
    bang_ket_qua[
        [
            "Mo_hinh",
            "MAE",
            "RMSE",
            "R2"
        ]
    ].to_string(
        index=False
    )
)


# ============================================================
# 12. MODEL TỐT NHẤT
# ============================================================

model_tot_nhat = (
    bang_ket_qua.iloc[0]
)


print(
    "\n" + "=" * 60
)

print(
    "MODEL TỐT NHẤT THEO 5-FOLD"
)

print(
    "=" * 60
)


print(
    "Tên:",
    model_tot_nhat["Mo_hinh"]
)

print(
    f"MAE trung bình: "
    f"{model_tot_nhat['MAE']:.4f}"
)

print(
    f"RMSE trung bình: "
    f"{model_tot_nhat['RMSE']:.4f}"
)

print(
    f"R² trung bình: "
    f"{model_tot_nhat['R2']:.4f}"
)

print(
    f"Độ lệch chuẩn MAE: "
    f"{model_tot_nhat['STD_MAE']:.4f}"
)

print(
    f"Độ lệch chuẩn RMSE: "
    f"{model_tot_nhat['STD_RMSE']:.4f}"
)

print(
    f"Độ lệch chuẩn R²: "
    f"{model_tot_nhat['STD_R2']:.4f}"
)