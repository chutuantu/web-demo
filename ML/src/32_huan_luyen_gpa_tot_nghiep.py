from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor
)
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


# ============================================================
# 1. ĐƯỜNG DẪN
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "raw"
    / "du_lieu_gpa_tot_nghiep.csv"
)

MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
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

    "muc_do_co_gang"
]


# ============================================================
# 3. BIẾN MỤC TIÊU
# ============================================================

TARGET_COLUMN = (
    "gpa_tot_nghiep"
)


# ============================================================
# 4. ĐỌC DATASET
# ============================================================

print("=" * 60)
print(
    "HUẤN LUYỆN MODEL DỰ ĐOÁN GPA TỐT NGHIỆP"
)
print("=" * 60)


try:

    df = pd.read_csv(
        DATA_FILE
    )

except FileNotFoundError:

    print(
        "\nKhông tìm thấy dataset:"
    )

    print(
        DATA_FILE
    )

    raise SystemExit(1)

except Exception as error:

    print(
        "\nLỗi đọc dataset:"
    )

    print(
        error
    )

    raise SystemExit(1)


# ============================================================
# 5. KIỂM TRA CỘT
# ============================================================

cac_cot_can_thiet = (
    FEATURE_COLUMNS
    + [TARGET_COLUMN]
)


cac_cot_thieu = [

    column

    for column in cac_cot_can_thiet

    if column not in df.columns
]


if cac_cot_thieu:

    print(
        "\nDataset đang thiếu các cột:"
    )

    for column in cac_cot_thieu:

        print(
            "-",
            column
        )

    raise SystemExit(1)


# ============================================================
# 6. CHỈ GIỮ CÁC CỘT CẦN THIẾT
# ============================================================

df = df[
    cac_cot_can_thiet
].copy()


# ============================================================
# 7. XỬ LÝ GIÁ TRỊ THIẾU
# ============================================================

so_dong_truoc =len(df)


df = df.dropna()


so_dong_sau =len(df)


if so_dong_truoc != so_dong_sau:

    print(
        "\nĐã loại bỏ",
        so_dong_truoc - so_dong_sau,
        "dòng chứa giá trị thiếu."
    )


# ============================================================
# 8. TÁCH X VÀ y
# ============================================================

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
    "Số cột:",
    len(df.columns)
)


print(
    "\nSố biến đầu vào:",
    len(
        FEATURE_COLUMNS
    )
)


print(
    "Biến mục tiêu:",
    TARGET_COLUMN
)


# ============================================================
# 9. TRAIN / TEST
# ============================================================

X_train, X_test, y_train, y_test = (
    train_test_split(

        X,

        y,

        test_size=0.20,

        random_state=42
    )
)


print(
    "\nSố mẫu train:",
    len(X_train)
)


print(
    "Số mẫu test :",
    len(X_test)
)


# ============================================================
# 10. CÁC MODEL
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
        )
}


# ============================================================
# 11. HUẤN LUYỆN
# ============================================================

ket_qua = []


model_da_huan_luyen = {}


for ten_model, model in models.items():

    print(
        "\n" + "-" * 60
    )


    print(
        f"Đang huấn luyện: {ten_model}"
    )


    try:

        model.fit(
            X_train,
            y_train
        )


        y_du_doan = (
            model.predict(
                X_test
            )
        )


        # ----------------------------------------------------
        # MAE
        # ----------------------------------------------------

        mae = (
            mean_absolute_error(
                y_test,
                y_du_doan
            )
        )


        # ----------------------------------------------------
        # RMSE
        # ----------------------------------------------------

        rmse = (
            mean_squared_error(
                y_test,
                y_du_doan
            ) ** 0.5
        )


        # ----------------------------------------------------
        # R²
        # ----------------------------------------------------

        r2 = (
            r2_score(
                y_test,
                y_du_doan
            )
        )


        print(
            f"MAE : {mae:.4f}"
        )


        print(
            f"RMSE: {rmse:.4f}"
        )


        print(
            f"R²  : {r2:.4f}"
        )


        ket_qua.append({

            "Mo_hinh":
                ten_model,

            "MAE":
                mae,

            "RMSE":
                rmse,

            "R2":
                r2
        })


        model_da_huan_luyen[
            ten_model
        ] = model


    except Exception as error:

        print(
            f"Lỗi huấn luyện {ten_model}:"
        )

        print(
            error
        )


# ============================================================
# 12. KIỂM TRA MODEL
# ============================================================

if not ket_qua:

    print(
        "\nKhông có model nào huấn luyện thành công."
    )

    raise SystemExit(1)


# ============================================================
# 13. SO SÁNH MODEL
# ============================================================

bang_ket_qua = (
    pd.DataFrame(
        ket_qua
    )
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
    "SO SÁNH CÁC MÔ HÌNH"
)

print(
    "=" * 60
)


print(
    bang_ket_qua.to_string(
        index=False
    )
)


# ============================================================
# 14. MODEL TỐT NHẤT
# ============================================================

model_tot_nhat =bang_ket_qua.iloc[
        0
    ]["Mo_hinh"]


mae_tot_nhat =float(
        bang_ket_qua.iloc[
            0
        ]["MAE"]
    )


rmse_tot_nhat =float(
        bang_ket_qua.iloc[
            0
        ]["RMSE"]
    )


r2_tot_nhat =float(
        bang_ket_qua.iloc[
            0
        ]["R2"]
    )


model =model_da_huan_luyen[
        model_tot_nhat
    ]


print(
    "\n" + "=" * 60
)

print(
    "MODEL TỐT NHẤT"
)

print(
    "=" * 60
)


print(
    "Tên:",
    model_tot_nhat
)


print(
    f"MAE: {mae_tot_nhat:.4f}"
)


print(
    f"RMSE: {rmse_tot_nhat:.4f}"
)


print(
    f"R²: {r2_tot_nhat:.4f}"
)


# ============================================================
# 15. LƯU MODEL
# ============================================================

MODEL_FILE = (
    MODEL_DIR
    / "mo_hinh_du_doan_gpa_tot_nghiep.pkl"
)


joblib.dump(
    model,
    MODEL_FILE
)


print(
    "\nĐã lưu model tại:"
)


print(
    MODEL_FILE
)


# ============================================================
# 16. MỘT SỐ KẾT QUẢ DỰ ĐOÁN
# ============================================================

print(
    "\n" + "=" * 60
)

print(
    "MỘT SỐ KẾT QUẢ DỰ ĐOÁN"
)

print(
    "=" * 60
)


y_du_doan_mau = (
    model.predict(
        X_test
    )
)


bang_mau = pd.DataFrame({

    "Thuc_te":
        y_test.values[:10],

    "Du_doan":
        y_du_doan_mau[:10]
})


print(
    bang_mau.to_string(
        index=False
    )
)


# ============================================================
# 17. THÔNG TIN MODEL
# ============================================================

print(
    "\n" + "=" * 60
)

print(
    "THÔNG TIN MODEL"
)

print(
    "=" * 60
)


print(
    "Các biến đầu vào:"
)


for index, column in enumerate(
    FEATURE_COLUMNS,
    start=1
):

    print(
        f"{index}. {column}"
    )


print(
    "\nBiến mục tiêu:",
    TARGET_COLUMN
)


print(
    "\nHoàn tất huấn luyện."
)