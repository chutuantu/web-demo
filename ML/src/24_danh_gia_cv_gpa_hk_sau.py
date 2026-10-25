from pathlib import Path

import pandas as pd

from sklearn.model_selection import KFold, cross_validate

from sklearn.linear_model import LinearRegression

from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
)


# ============================================================
# 1. ĐƯỜNG DẪN DATASET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "raw"
    / "du_lieu_gpa_hoc_ky_tiep_theo.csv"
)


# ============================================================
# 2. ĐỌC DATASET
# ============================================================

df = pd.read_csv(DATA_PATH)


# ============================================================
# 3. CỘT ĐẦU VÀO
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
# 4. X VÀ y
# ============================================================

X = df[COT_DAU_VAO]

y = df[COT_MUC_TIEU]


# ============================================================
# 5. K-FOLD
# ============================================================

kf = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42,
)


# ============================================================
# 6. CÁC MODEL
# ============================================================

models = {

    "Linear Regression":
        LinearRegression(),

    "Random Forest":
        RandomForestRegressor(
            n_estimators=300,
            random_state=42,
        ),

    "Gradient Boosting":
        GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=3,
            random_state=42,
        ),
}


# ============================================================
# 7. HIỂN THỊ
# ============================================================

print("=" * 60)

print(
    "ĐÁNH GIÁ 5-FOLD CROSS-VALIDATION"
)

print(
    "MODEL DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO"
)

print("=" * 60)


# ============================================================
# 8. ĐÁNH GIÁ TỪNG MODEL
# ============================================================

ketQua = []


for tenModel, model in models.items():

    print()
    print("-" * 60)

    print(
        "Model:",
        tenModel
    )


    ketQuaCV = cross_validate(
        model,
        X,
        y,
        cv=kf,
        scoring={
            "MAE":
                "neg_mean_absolute_error",

            "RMSE":
                "neg_root_mean_squared_error",

            "R2":
                "r2",
        },
        return_train_score=False,
    )


    # --------------------------------------------------------
    # Đổi MAE/RMSE từ số âm thành số dương
    # --------------------------------------------------------

    mae =-ketQuaCV[
            "test_MAE"
        ]


    rmse =-ketQuaCV[
            "test_RMSE"
        ]


    r2 =ketQuaCV[
            "test_R2"
        ]


    # ========================================================
    # HIỂN THỊ TỪNG FOLD
    # ========================================================

    for i in range(5):

        print()

        print(
            f"Fold {i + 1}"
        )

        print(
            "MAE :",
            round(
                mae[i],
                4
            )
        )

        print(
            "RMSE:",
            round(
                rmse[i],
                4
            )
        )

        print(
            "R²  :",
            round(
                r2[i],
                4
            )
        )


    # ========================================================
    # TRUNG BÌNH
    # ========================================================

    mae_mean = mae.mean()

    rmse_mean = rmse.mean()

    r2_mean = r2.mean()


    # ========================================================
    # ĐỘ LỆCH CHUẨN
    # ========================================================

    mae_std = mae.std()

    rmse_std = rmse.std()

    r2_std = r2.std()


    print()

    print(
        "MAE trung bình :",
        round(
            mae_mean,
            4
        )
    )

    print(
        "RMSE trung bình:",
        round(
            rmse_mean,
            4
        )
    )

    print(
        "R² trung bình  :",
        round(
            r2_mean,
            4
        )
    )


    print()

    print(
        "Độ lệch chuẩn:"
    )

    print(
        "MAE :",
        round(
            mae_std,
            4
        )
    )

    print(
        "RMSE:",
        round(
            rmse_std,
            4
        )
    )

    print(
        "R²  :",
        round(
            r2_std,
            4
        )
    )


    ketQua.append({

        "Mo_hinh":
            tenModel,

        "MAE":
            mae_mean,

        "RMSE":
            rmse_mean,

        "R2":
            r2_mean,

        "MAE_STD":
            mae_std,

        "RMSE_STD":
            rmse_std,

        "R2_STD":
            r2_std,
    })


# ============================================================
# 9. SO SÁNH CUỐI
# ============================================================

bangKetQua = pd.DataFrame(
    ketQua
)


print()
print("=" * 60)

print(
    "SO SÁNH 5-FOLD CROSS-VALIDATION"
)

print("=" * 60)


print(
    bangKetQua[
        [
            "Mo_hinh",
            "MAE",
            "RMSE",
            "R2",
        ]
    ]
    .sort_values(
        by="RMSE",
        ascending=True,
    )
    .to_string(
        index=False
    )
)


# ============================================================
# 10. MODEL TỐT NHẤT
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
    "MODEL TỐT NHẤT THEO 5-FOLD"
)

print("=" * 60)


print(
    "Tên:",
    modelTotNhat["Mo_hinh"]
)

print(
    "MAE trung bình:",
    round(
        modelTotNhat["MAE"],
        4
    )
)

print(
    "RMSE trung bình:",
    round(
        modelTotNhat["RMSE"],
        4
    )
)

print(
    "R² trung bình:",
    round(
        modelTotNhat["R2"],
        4
    )
)

print(
    "Độ lệch chuẩn MAE:",
    round(
        modelTotNhat["MAE_STD"],
        4
    )
)

print(
    "Độ lệch chuẩn RMSE:",
    round(
        modelTotNhat["RMSE_STD"],
        4
    )
)

print(
    "Độ lệch chuẩn R²:",
    round(
        modelTotNhat["R2_STD"],
        4
    )
)