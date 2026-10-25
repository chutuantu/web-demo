
from flask import Flask, request, jsonify
from pathlib import Path

import pandas as pd
import joblib
import numpy as np

import sys
import os


# ============================================================
# 1. IMPORT HÀM PHÂN TÍCH CŨ
# ============================================================

sys.path.append(
    os.path.join(
        os.path.dirname(__file__),
        "src"
    )
)

from phan_tich_ket_qua import phan_tich_ket_qua


# ============================================================
# 2. KHỞI TẠO FLASK
# ============================================================

app = Flask(__name__)


# ============================================================
# 3. ĐƯỜNG DẪN GỐC
# ============================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
)


# ============================================================
# 4. ĐƯỜNG DẪN CÁC MODEL
# ============================================================

MODEL_DIEM_HOC_PHAN = (
    BASE_DIR
    / "models"
    / "mo_hinh_du_doan_diem_hoc_phan.pkl"
)


MODEL_GPA_HOC_KY_TIEP_THEO = (
    BASE_DIR
    / "models"
    / "mo_hinh_du_doan_gpa_hoc_ky_tiep_theo.pkl"
)


MODEL_GPA_TOT_NGHIEP = (
    BASE_DIR
    / "models"
    / "mo_hinh_du_doan_gpa_tot_nghiep.pkl"
)


# ============================================================
# 5. LOAD MODEL ĐIỂM HỌC PHẦN
# ============================================================

try:

    model_diem_hoc_phan = joblib.load(
        MODEL_DIEM_HOC_PHAN
    )

    print("=" * 60)
    print("ĐÃ LOAD MODEL ĐIỂM HỌC PHẦN")
    print("=" * 60)
    print(
        "Model:",
        MODEL_DIEM_HOC_PHAN
    )

except Exception as error:

    model_diem_hoc_phan = None

    print("=" * 60)
    print("LỖI LOAD MODEL ĐIỂM HỌC PHẦN")
    print("=" * 60)
    print(error)


# ============================================================
# 6. LOAD MODEL GPA HỌC KỲ TIẾP THEO
# ============================================================

try:

    model_gpa_hoc_ky_tiep_theo = joblib.load(
        MODEL_GPA_HOC_KY_TIEP_THEO
    )

    print("=" * 60)
    print("ĐÃ LOAD MODEL GPA HỌC KỲ TIẾP THEO")
    print("=" * 60)
    print(
        "Model:",
        MODEL_GPA_HOC_KY_TIEP_THEO
    )

except Exception as error:

    model_gpa_hoc_ky_tiep_theo = None

    print("=" * 60)
    print("LỖI LOAD MODEL GPA HỌC KỲ TIẾP THEO")
    print("=" * 60)
    print(error)


# ============================================================
# 7. LOAD MODEL GPA TỐT NGHIỆP
# ============================================================

try:

    model_gpa_tot_nghiep = joblib.load(
        MODEL_GPA_TOT_NGHIEP
    )

    print("=" * 60)
    print("ĐÃ LOAD MODEL GPA TỐT NGHIỆP")
    print("=" * 60)
    print(
        "Model:",
        MODEL_GPA_TOT_NGHIEP
    )

except Exception as error:

    model_gpa_tot_nghiep = None

    print("=" * 60)
    print("LỖI LOAD MODEL GPA TỐT NGHIỆP")
    print("=" * 60)
    print(error)


# ============================================================
# 8. API KIỂM TRA SERVER
# ============================================================

@app.get("/")
def trang_chu():

    return jsonify({

        "thanh_cong":
            True,

        "message":
            "ML API đang hoạt động",

        "model_diem_hoc_phan":
            model_diem_hoc_phan is not None,

        "model_gpa_hoc_ky_tiep_theo":
            model_gpa_hoc_ky_tiep_theo is not None,

        "model_gpa_tot_nghiep":
            model_gpa_tot_nghiep is not None
    })


# ============================================================
# 9. API DỰ ĐOÁN ĐIỂM HỌC PHẦN
# ============================================================

@app.post("/du-doan")
def du_doan():

    # --------------------------------------------------------
    # Kiểm tra model
    # --------------------------------------------------------

    if model_diem_hoc_phan is None:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Mô hình điểm học phần chưa được tải"

        }), 500


    # --------------------------------------------------------
    # Lấy JSON
    # --------------------------------------------------------

    du_lieu = request.get_json(
        silent=True
    )


    if not du_lieu:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Dữ liệu gửi lên không hợp lệ"

        }), 400


    # --------------------------------------------------------
    # Trường bắt buộc
    # --------------------------------------------------------

    cac_truong_bat_buoc = [

        "ma_hoc_phan",

        "so_tin_chi",

        "diem_chuyen_can",

        "diem_thuong_xuyen",

        "ty_le_hoan_thanh_bai_tap",

        "so_buoi_nghi"
    ]


    for truong in cac_truong_bat_buoc:

        if truong not in du_lieu:

            return jsonify({

                "thanh_cong":
                    False,

                "message":
                    f"Thiếu trường: {truong}"

            }), 400


    # --------------------------------------------------------
    # Chuyển kiểu dữ liệu
    # --------------------------------------------------------

    try:

        ma_hoc_phan = str(
            du_lieu["ma_hoc_phan"]
        ).strip().upper()


        so_tin_chi = int(
            du_lieu["so_tin_chi"]
        )


        diem_chuyen_can = float(
            du_lieu["diem_chuyen_can"]
        )


        diem_thuong_xuyen = float(
            du_lieu["diem_thuong_xuyen"]
        )


        ty_le_hoan_thanh_bai_tap = float(
            du_lieu[
                "ty_le_hoan_thanh_bai_tap"
            ]
        )


        so_buoi_nghi = int(
            du_lieu["so_buoi_nghi"]
        )


    except (
        ValueError,
        TypeError
    ):

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Kiểu dữ liệu đầu vào không hợp lệ"

        }), 400


    # --------------------------------------------------------
    # Kiểm tra phạm vi
    # --------------------------------------------------------

    if not 0 <= diem_chuyen_can <= 10:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Điểm chuyên cần phải từ 0 đến 10"

        }), 400


    if not 0 <= diem_thuong_xuyen <= 10:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Điểm thường xuyên phải từ 0 đến 10"

        }), 400


    if not 0 <= ty_le_hoan_thanh_bai_tap <= 100:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Tỷ lệ hoàn thành bài tập phải từ 0 đến 100%"

        }), 400


    if so_tin_chi <= 0:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Số tín chỉ không hợp lệ"

        }), 400


    if so_buoi_nghi < 0:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Số buổi nghỉ không được âm"

        }), 400


    # --------------------------------------------------------
    # DataFrame
    # --------------------------------------------------------

    X = pd.DataFrame([{

        "ma_hoc_phan":
            ma_hoc_phan,

        "so_tin_chi":
            so_tin_chi,

        "diem_chuyen_can":
            diem_chuyen_can,

        "diem_thuong_xuyen":
            diem_thuong_xuyen,

        "ty_le_hoan_thanh_bai_tap":
            ty_le_hoan_thanh_bai_tap,

        "so_buoi_nghi":
            so_buoi_nghi

    }])


    # --------------------------------------------------------
    # Dự đoán
    # --------------------------------------------------------

    try:

        diem_du_doan = (
            model_diem_hoc_phan
            .predict(X)[0]
        )

    except Exception as error:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Không thể thực hiện dự đoán",

            "error":
                str(error)

        }), 500


    # --------------------------------------------------------
    # Giới hạn điểm
    # --------------------------------------------------------

    diem_du_doan = max(
        0,
        min(
            10,
            float(diem_du_doan)
        )
    )


    diem_du_doan = round(
        diem_du_doan,
        2
    )


    # --------------------------------------------------------
    # Phân tích
    # --------------------------------------------------------

    try:

        phan_tich = phan_tich_ket_qua(

            diem_du_doan =
                diem_du_doan,

            diem_chuyen_can =
                diem_chuyen_can,

            diem_thuong_xuyen =
                diem_thuong_xuyen,

            ty_le_hoan_thanh_bai_tap =
                ty_le_hoan_thanh_bai_tap,

            so_buoi_nghi =
                so_buoi_nghi

        )

    except Exception as error:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Không thể phân tích kết quả điểm học phần",

            "error":
                str(error)

        }), 500


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return jsonify({

        "thanh_cong":
            True,

        "du_lieu_dau_vao": {

            "ma_hoc_phan":
                ma_hoc_phan,

            "so_tin_chi":
                so_tin_chi,

            "diem_chuyen_can":
                diem_chuyen_can,

            "diem_thuong_xuyen":
                diem_thuong_xuyen,

            "ty_le_hoan_thanh_bai_tap":
                ty_le_hoan_thanh_bai_tap,

            "so_buoi_nghi":
                so_buoi_nghi
        },

        "ket_qua": {

            "diem_du_doan":
                diem_du_doan,

            "xep_loai":
                phan_tich["xep_loai"],

            "muc_danh_gia":
                phan_tich["muc_danh_gia"],

            "muc_canh_bao":
                phan_tich["muc_canh_bao"],

            "nhan_dinh":
                phan_tich["nhan_dinh"],

            "loi_khuyen":
                phan_tich["loi_khuyen"]
        }
    })


# ============================================================
# 10. API DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO
# ============================================================

@app.post(
    "/du-doan-gpa-hoc-ky-tiep-theo"
)
def du_doan_gpa_hoc_ky_tiep_theo():

    # --------------------------------------------------------
    # Kiểm tra model
    # --------------------------------------------------------

    if model_gpa_hoc_ky_tiep_theo is None:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Mô hình GPA học kỳ tiếp theo chưa được tải"

        }), 500


    # --------------------------------------------------------
    # Lấy JSON
    # --------------------------------------------------------

    du_lieu = request.get_json(
        silent=True
    )


    if not du_lieu:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Dữ liệu gửi lên không hợp lệ"

        }), 400


    # --------------------------------------------------------
    # Trường bắt buộc
    # --------------------------------------------------------

    cac_truong_bat_buoc = [

        "gpa_ky_gan_nhat",

        "gpa_trung_binh_lich_su",

        "xu_huong_gpa",

        "so_hoc_ky_da_hoc",

        "tong_tin_chi_ky_toi",

        "gio_tu_hoc_tuan",

        "ty_le_chuyen_can",

        "gio_lam_them_tuan"

    ]


    for truong in cac_truong_bat_buoc:

        if truong not in du_lieu:

            return jsonify({

                "thanh_cong":
                    False,

                "message":
                    f"Thiếu trường: {truong}"

            }), 400


    # --------------------------------------------------------
    # Chuyển dữ liệu
    # --------------------------------------------------------

    try:

        gpa_ky_gan_nhat = float(
            du_lieu[
                "gpa_ky_gan_nhat"
            ]
        )


        gpa_trung_binh_lich_su = float(
            du_lieu[
                "gpa_trung_binh_lich_su"
            ]
        )


        xu_huong_gpa = float(
            du_lieu[
                "xu_huong_gpa"
            ]
        )


        so_hoc_ky_da_hoc = int(
            du_lieu[
                "so_hoc_ky_da_hoc"
            ]
        )


        tong_tin_chi_ky_toi = int(
            du_lieu[
                "tong_tin_chi_ky_toi"
            ]
        )


        gio_tu_hoc_tuan = float(
            du_lieu[
                "gio_tu_hoc_tuan"
            ]
        )


        ty_le_chuyen_can = float(
            du_lieu[
                "ty_le_chuyen_can"
            ]
        )


        gio_lam_them_tuan = float(
            du_lieu[
                "gio_lam_them_tuan"
            ]
        )


    except (
        ValueError,
        TypeError
    ):

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Kiểu dữ liệu đầu vào không hợp lệ"

        }), 400


    # --------------------------------------------------------
    # Kiểm tra finite
    # --------------------------------------------------------

    cac_gia_tri = [

        gpa_ky_gan_nhat,

        gpa_trung_binh_lich_su,

        xu_huong_gpa,

        so_hoc_ky_da_hoc,

        tong_tin_chi_ky_toi,

        gio_tu_hoc_tuan,

        ty_le_chuyen_can,

        gio_lam_them_tuan

    ]


    if not all(
        np.isfinite(
            gia_tri
        )
        for gia_tri in cac_gia_tri
    ):

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Dữ liệu chứa giá trị không hợp lệ"

        }), 400


    # --------------------------------------------------------
    # GPA
    # --------------------------------------------------------

    if not 0 <= gpa_ky_gan_nhat <= 4:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "GPA kỳ gần nhất phải từ 0 đến 4"

        }), 400


    if not 0 <= gpa_trung_binh_lich_su <= 4:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "GPA trung bình lịch sử phải từ 0 đến 4"

        }), 400


    # --------------------------------------------------------
    # Số học kỳ
    # --------------------------------------------------------

    if not 1 <= so_hoc_ky_da_hoc <= 8:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Số học kỳ đã học phải từ 1 đến 8"

        }), 400


    # --------------------------------------------------------
    # Tín chỉ
    # --------------------------------------------------------

    if not 1 <= tong_tin_chi_ky_toi <= 30:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Tổng tín chỉ học kỳ tiếp theo phải từ 1 đến 30"

        }), 400


    # --------------------------------------------------------
    # Giờ tự học
    # --------------------------------------------------------

    if not 0 <= gio_tu_hoc_tuan <= 168:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Số giờ tự học phải từ 0 đến 168"

        }), 400


    # --------------------------------------------------------
    # Chuyên cần
    # --------------------------------------------------------

    if not 0 <= ty_le_chuyen_can <= 100:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Tỷ lệ chuyên cần phải từ 0 đến 100%"

        }), 400


    # --------------------------------------------------------
    # Làm thêm
    # --------------------------------------------------------

    if not 0 <= gio_lam_them_tuan <= 168:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Số giờ làm thêm phải từ 0 đến 168"

        }), 400


    # --------------------------------------------------------
    # DataFrame
    # --------------------------------------------------------

    X = pd.DataFrame([{

        "gpa_ky_gan_nhat":
            gpa_ky_gan_nhat,

        "gpa_trung_binh_lich_su":
            gpa_trung_binh_lich_su,

        "xu_huong_gpa":
            xu_huong_gpa,

        "so_hoc_ky_da_hoc":
            so_hoc_ky_da_hoc,

        "tong_tin_chi_ky_toi":
            tong_tin_chi_ky_toi,

        "gio_tu_hoc_tuan":
            gio_tu_hoc_tuan,

        "ty_le_chuyen_can":
            ty_le_chuyen_can,

        "gio_lam_them_tuan":
            gio_lam_them_tuan

    }])


    # --------------------------------------------------------
    # Dự đoán
    # --------------------------------------------------------

    try:

        gpa_du_doan = (
            model_gpa_hoc_ky_tiep_theo
            .predict(X)[0]
        )

    except Exception as error:

        return jsonify({

            "thanh_cong":
                False,

            "message":
                "Không thể thực hiện dự đoán GPA học kỳ tiếp theo",

            "error":
                str(error)

        }), 500


    # --------------------------------------------------------
    # Giới hạn 0–4
    # --------------------------------------------------------

    gpa_du_doan = max(
        0,
        min(
            4,
            float(gpa_du_doan)
        )
    )


    gpa_du_doan = round(
        gpa_du_doan,
        2
    )


    # --------------------------------------------------------
    # Hệ 10
    # --------------------------------------------------------

    diem_he_10 = round(
        gpa_du_doan * 2.5,
        2
    )


    # --------------------------------------------------------
    # Xếp loại
    # --------------------------------------------------------

    if gpa_du_doan >= 3.6:

        xep_loai = "Xuất sắc"

    elif gpa_du_doan >= 3.2:

        xep_loai = "Giỏi"

    elif gpa_du_doan >= 2.5:

        xep_loai = "Khá"

    elif gpa_du_doan >= 2.0:

        xep_loai = "Trung bình"

    else:

        xep_loai = "Yếu"


    # --------------------------------------------------------
    # Nhận định
    # --------------------------------------------------------

    nhan_dinh = []


    if gpa_du_doan > gpa_ky_gan_nhat:

        nhan_dinh.append(
            "GPA dự đoán có xu hướng tăng so với học kỳ gần nhất."
        )

    elif gpa_du_doan < gpa_ky_gan_nhat:

        nhan_dinh.append(
            "GPA dự đoán có xu hướng giảm so với học kỳ gần nhất."
        )

    else:

        nhan_dinh.append(
            "GPA dự đoán tương đương với học kỳ gần nhất."
        )


    if xu_huong_gpa > 0.03:

        nhan_dinh.append(
            "GPA các học kỳ trước đang có xu hướng tích cực."
        )

    elif xu_huong_gpa < -0.03:

        nhan_dinh.append(
            "GPA các học kỳ trước đang có xu hướng giảm."
        )

    else:

        nhan_dinh.append(
            "GPA các học kỳ trước tương đối ổn định."
        )


    # --------------------------------------------------------
    # Lời khuyên
    # --------------------------------------------------------

    loi_khuyen = []


    if gpa_du_doan >= 3.6:

        loi_khuyen.append(
            "Tiếp tục duy trì phương pháp học tập hiện tại để giữ vững kết quả."
        )

    elif gpa_du_doan >= 3.2:

        loi_khuyen.append(
            "Tiếp tục duy trì kết quả hiện tại và tập trung cải thiện các môn còn thấp."
        )

    elif gpa_du_doan >= 2.5:

        loi_khuyen.append(
            "Nên tăng thời gian tự học và ưu tiên các học phần khó."
        )

    else:

        loi_khuyen.append(
            "Nên xây dựng kế hoạch học tập cụ thể và tăng thời gian ôn tập."
        )


    if gio_tu_hoc_tuan < 10:

        loi_khuyen.append(
            "Nên tăng thời gian tự học mỗi tuần."
        )


    if ty_le_chuyen_can < 85:

        loi_khuyen.append(
            "Nên cải thiện tỷ lệ chuyên cần."
        )


    if gio_lam_them_tuan > 20:

        loi_khuyen.append(
            "Nên cân đối thời gian làm thêm với thời gian học tập."
        )


    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return jsonify({

        "thanh_cong":
            True,

        "du_lieu_dau_vao": {

            "gpa_ky_gan_nhat":
                gpa_ky_gan_nhat,

            "gpa_trung_binh_lich_su":
                gpa_trung_binh_lich_su,

            "xu_huong_gpa":
                xu_huong_gpa,

            "so_hoc_ky_da_hoc":
                so_hoc_ky_da_hoc,

            "tong_tin_chi_ky_toi":
                tong_tin_chi_ky_toi,

            "gio_tu_hoc_tuan":
                gio_tu_hoc_tuan,

            "ty_le_chuyen_can":
                ty_le_chuyen_can,

            "gio_lam_them_tuan":
                gio_lam_them_tuan
        },

        "ket_qua": {

            "gpa_du_doan":
                gpa_du_doan,

            "diem_he_10":
                diem_he_10,

            "xep_loai":
                xep_loai,

            "nhan_dinh":
                nhan_dinh,

            "loi_khuyen":
                loi_khuyen,

            "mo_hinh":
                "Linear Regression"
        }
    })


# ============================================================
# API DỰ ĐOÁN GPA TỐT NGHIỆP
# ============================================================

@app.post("/du-doan-gpa-tot-nghiep")
def du_doan_gpa_tot_nghiep():

    # --------------------------------------------------------
    # 1. KIỂM TRA MODEL
    # --------------------------------------------------------

    if model_gpa_tot_nghiep is None:

        return jsonify({
            "thanh_cong": False,
            "message": "Mô hình GPA tốt nghiệp chưa được tải"
        }), 500


    # --------------------------------------------------------
    # 2. LẤY JSON
    # --------------------------------------------------------

    du_lieu = request.get_json(
        silent=True
    )


    if not du_lieu:

        return jsonify({
            "thanh_cong": False,
            "message": "Dữ liệu gửi lên không hợp lệ"
        }), 400


    # --------------------------------------------------------
    # 3. 6 BIẾN ĐÚNG VỚI DATASET/MODEL MỚI
    # --------------------------------------------------------

    cac_truong_bat_buoc = [

        "gpa_ky_gan_nhat",

        "gpa_trung_binh_lich_su",

        "xu_huong_gpa",

        "so_hoc_ky_da_hoc",

        "ty_le_tin_chi_da_tich_luy",

        "muc_do_co_gang"

    ]


    for truong in cac_truong_bat_buoc:

        if truong not in du_lieu:

            return jsonify({
                "thanh_cong": False,
                "message":
                    f"Thiếu trường: {truong}"
            }), 400


    # --------------------------------------------------------
    # 4. CHUYỂN KIỂU DỮ LIỆU
    # --------------------------------------------------------

    try:

        gpa_ky_gan_nhat = float(
            du_lieu[
                "gpa_ky_gan_nhat"
            ]
        )

        gpa_trung_binh_lich_su = float(
            du_lieu[
                "gpa_trung_binh_lich_su"
            ]
        )

        xu_huong_gpa = float(
            du_lieu[
                "xu_huong_gpa"
            ]
        )

        so_hoc_ky_da_hoc = int(
            du_lieu[
                "so_hoc_ky_da_hoc"
            ]
        )

        ty_le_tin_chi_da_tich_luy = float(
            du_lieu[
                "ty_le_tin_chi_da_tich_luy"
            ]
        )

        muc_do_co_gang = int(
            du_lieu[
                "muc_do_co_gang"
            ]
        )

    except (
        ValueError,
        TypeError
    ):

        return jsonify({
            "thanh_cong": False,
            "message":
                "Kiểu dữ liệu đầu vào không hợp lệ"
        }), 400


    # --------------------------------------------------------
    # 5. KIỂM TRA GIÁ TRỊ HỮU HẠN
    # --------------------------------------------------------

    cac_gia_tri = [

        gpa_ky_gan_nhat,

        gpa_trung_binh_lich_su,

        xu_huong_gpa,

        so_hoc_ky_da_hoc,

        ty_le_tin_chi_da_tich_luy,

        muc_do_co_gang

    ]


    if not all(
        np.isfinite(
            gia_tri
        )
        for gia_tri in cac_gia_tri
    ):

        return jsonify({
            "thanh_cong": False,
            "message":
                "Dữ liệu chứa giá trị không hợp lệ"
        }), 400


    # --------------------------------------------------------
    # 6. KIỂM TRA GPA
    # --------------------------------------------------------

    if not (
        0 <=
        gpa_ky_gan_nhat <=
        4
    ):

        return jsonify({
            "thanh_cong": False,
            "message":
                "GPA kỳ gần nhất phải từ 0 đến 4"
        }), 400


    if not (
        0 <=
        gpa_trung_binh_lich_su <=
        4
    ):

        return jsonify({
            "thanh_cong": False,
            "message":
                "GPA trung bình lịch sử phải từ 0 đến 4"
        }), 400


    # --------------------------------------------------------
    # 7. KIỂM TRA SỐ HỌC KỲ
    # --------------------------------------------------------

    if not (
        1 <=
        so_hoc_ky_da_hoc <=
        8
    ):

        return jsonify({
            "thanh_cong": False,
            "message":
                "Số học kỳ đã học phải từ 1 đến 8"
        }), 400


    # --------------------------------------------------------
    # 8. KIỂM TRA TỶ LỆ TÍN CHỈ
    # --------------------------------------------------------

    if not (
        0 <=
        ty_le_tin_chi_da_tich_luy <=
        1
    ):

        return jsonify({
            "thanh_cong": False,
            "message":
                "Tỷ lệ tín chỉ đã tích lũy phải từ 0 đến 1"
        }), 400


    # --------------------------------------------------------
    # 9. KIỂM TRA MỨC ĐỘ CỐ GẮNG
    # --------------------------------------------------------

    if muc_do_co_gang not in [
        0,
        1,
        2
    ]:

        return jsonify({
            "thanh_cong": False,
            "message":
                "Mức độ cố gắng không hợp lệ"
        }), 400


    # --------------------------------------------------------
    # 10. TẠO DATAFRAME
    # --------------------------------------------------------
    #
    # THỨ TỰ PHẢI KHỚP DATASET:
    #
    # 1. gpa_ky_gan_nhat
    # 2. gpa_trung_binh_lich_su
    # 3. xu_huong_gpa
    # 4. so_hoc_ky_da_hoc
    # 5. ty_le_tin_chi_da_tich_luy
    # 6. muc_do_co_gang
    #
    # --------------------------------------------------------

    X = pd.DataFrame([{

        "gpa_ky_gan_nhat":
            gpa_ky_gan_nhat,

        "gpa_trung_binh_lich_su":
            gpa_trung_binh_lich_su,

        "xu_huong_gpa":
            xu_huong_gpa,

        "so_hoc_ky_da_hoc":
            so_hoc_ky_da_hoc,

        "ty_le_tin_chi_da_tich_luy":
            ty_le_tin_chi_da_tich_luy,

        "muc_do_co_gang":
            muc_do_co_gang

    }])


    # --------------------------------------------------------
    # 11. DỰ ĐOÁN
    # --------------------------------------------------------

    try:

        gpa_du_doan = (
            model_gpa_tot_nghiep
            .predict(X)[0]
        )

    except Exception as error:

        return jsonify({
            "thanh_cong": False,
            "message":
                "Không thể thực hiện dự đoán GPA tốt nghiệp",
            "error":
                str(error)
        }), 500


    # --------------------------------------------------------
    # 12. GIỚI HẠN 0–4
    # --------------------------------------------------------

    gpa_du_doan = max(
        0,
        min(
            4,
            float(
                gpa_du_doan
            )
        )
    )


    gpa_du_doan = round(
        gpa_du_doan,
        2
    )


    # --------------------------------------------------------
    # 13. QUY ĐỔI HIỂN THỊ HỆ 10
    # --------------------------------------------------------

    diem_he_10 = round(
        gpa_du_doan * 2.5,
        2
    )


    # --------------------------------------------------------
    # 14. XẾP LOẠI
    # --------------------------------------------------------

    if gpa_du_doan >= 3.6:

        xep_loai = "Xuất sắc"

    elif gpa_du_doan >= 3.2:

        xep_loai = "Giỏi"

    elif gpa_du_doan >= 2.5:

        xep_loai = "Khá"

    elif gpa_du_doan >= 2.0:

        xep_loai = "Trung bình"

    else:

        xep_loai = "Yếu"


    # --------------------------------------------------------
    # 15. RESPONSE
    # --------------------------------------------------------

    return jsonify({

        "thanh_cong":
            True,

        "du_lieu_dau_vao": {

            "gpa_ky_gan_nhat":
                gpa_ky_gan_nhat,

            "gpa_trung_binh_lich_su":
                gpa_trung_binh_lich_su,

            "xu_huong_gpa":
                xu_huong_gpa,

            "so_hoc_ky_da_hoc":
                so_hoc_ky_da_hoc,

            "ty_le_tin_chi_da_tich_luy":
                ty_le_tin_chi_da_tich_luy,

            "muc_do_co_gang":
                muc_do_co_gang

        },

        "ket_qua": {

            "gpa_du_doan":
                gpa_du_doan,

            "diem_he_10":
                diem_he_10,

            "xep_loai":
                xep_loai

        }

    })

# ============================================================
# 12. CHẠY SERVER
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("ML API ĐANG CHẠY")
    print("=" * 60)

    print(
        "POST /du-doan"
    )

    print(
        "POST /du-doan-gpa-hoc-ky-tiep-theo"
    )

    print(
        "POST /du-doan-gpa-tot-nghiep"
    )

    print("=" * 60)

# Lấy cổng tự động do Render cấp, nếu chạy ở máy nhà thì tự dùng cổng 5000
port = int(os.environ.get("PORT", 5000))

app.run(
    host="0.0.0.0",
    port=port,
    debug=True
)

