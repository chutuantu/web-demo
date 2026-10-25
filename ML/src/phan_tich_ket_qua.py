def xep_loai_diem(diem):
    """
    Xếp loại dựa trên điểm học phần hệ 10.
    """

    if diem >= 8.5:
        return "Xuất sắc"

    if diem >= 8.0:
        return "Giỏi"

    if diem >= 6.5:
        return "Khá"

    if diem >= 5.0:
        return "Trung bình"

    return "Yếu"


def phan_tich_ket_qua(
    diem_du_doan,
    diem_chuyen_can,
    diem_thuong_xuyen,
    ty_le_hoan_thanh_bai_tap,
    so_buoi_nghi
):
    """
    Phân tích kết quả dự đoán và dữ liệu đầu vào.

    Hàm này KHÔNG thay thế model ML.
    Model ML chịu trách nhiệm dự đoán điểm.
    Hàm này chịu trách nhiệm phân tích và đưa ra khuyến nghị.
    """

    # ---------------------------------------------------------
    # Chuẩn hóa dữ liệu
    # ---------------------------------------------------------

    diem_du_doan = float(diem_du_doan)
    diem_chuyen_can = float(diem_chuyen_can)
    diem_thuong_xuyen = float(diem_thuong_xuyen)
    ty_le_hoan_thanh_bai_tap = float(ty_le_hoan_thanh_bai_tap)
    so_buoi_nghi = int(so_buoi_nghi)

    # ---------------------------------------------------------
    # 1. XẾP LOẠI
    # ---------------------------------------------------------

    xep_loai = xep_loai_diem(diem_du_doan)

    # ---------------------------------------------------------
    # 2. MỨC ĐÁNH GIÁ
    # ---------------------------------------------------------

    if diem_du_doan >= 8.5:
        muc_danh_gia = "Rất tốt"

    elif diem_du_doan >= 7.0:
        muc_danh_gia = "Tốt"

    elif diem_du_doan >= 5.0:
        muc_danh_gia = "Trung bình"

    else:
        muc_danh_gia = "Cần cải thiện"

    # ---------------------------------------------------------
    # 3. NHẬN ĐỊNH
    # ---------------------------------------------------------

    nhan_dinh = []

    # Nhận định tổng quát
    if diem_du_doan >= 8.5:

        nhan_dinh.append(
            "Kết quả dự đoán cho thấy khả năng đạt kết quả rất tốt "
            "ở học phần này."
        )

    elif diem_du_doan >= 7.0:

        nhan_dinh.append(
            "Kết quả dự đoán cho thấy khả năng đạt kết quả tốt "
            "ở học phần này."
        )

    elif diem_du_doan >= 5.0:

        nhan_dinh.append(
            "Kết quả dự đoán cho thấy sinh viên có khả năng đạt "
            "học phần nhưng vẫn còn một số yếu tố cần cải thiện."
        )

    else:

        nhan_dinh.append(
            "Kết quả dự đoán cho thấy sinh viên có nguy cơ đạt "
            "kết quả chưa đạt yêu cầu ở học phần này."
        )

    # ---------------------------------------------------------
    # 4. PHÂN TÍCH ĐIỂM CHUYÊN CẦN
    # ---------------------------------------------------------

    if diem_chuyen_can >= 8:

        nhan_dinh.append(
            "Điểm chuyên cần đang ở mức tốt và là một yếu tố tích cực."
        )

    elif diem_chuyen_can >= 6.5:

        nhan_dinh.append(
            "Điểm chuyên cần ở mức khá, nên tiếp tục duy trì."
        )

    else:

        nhan_dinh.append(
            "Điểm chuyên cần còn thấp và cần được cải thiện."
        )

    # ---------------------------------------------------------
    # 5. PHÂN TÍCH ĐIỂM THƯỜNG XUYÊN
    # ---------------------------------------------------------

    if diem_thuong_xuyen >= 8:

        nhan_dinh.append(
            "Điểm thường xuyên đang ở mức tốt."
        )

    elif diem_thuong_xuyen >= 6.5:

        nhan_dinh.append(
            "Điểm thường xuyên ở mức khá."
        )

    else:

        nhan_dinh.append(
            "Điểm thường xuyên còn thấp và là yếu tố cần chú ý."
        )

    # ---------------------------------------------------------
    # 6. PHÂN TÍCH HOÀN THÀNH BÀI TẬP
    # ---------------------------------------------------------

    if ty_le_hoan_thanh_bai_tap >= 80:

        nhan_dinh.append(
            "Tỷ lệ hoàn thành bài tập ở mức tốt."
        )

    elif ty_le_hoan_thanh_bai_tap >= 60:

        nhan_dinh.append(
            "Tỷ lệ hoàn thành bài tập ở mức khá."
        )

    else:

        nhan_dinh.append(
            "Tỷ lệ hoàn thành bài tập còn thấp."
        )

    # ---------------------------------------------------------
    # 7. PHÂN TÍCH SỐ BUỔI NGHỈ
    # ---------------------------------------------------------

    if so_buoi_nghi == 0:

        nhan_dinh.append(
            "Sinh viên chưa ghi nhận buổi nghỉ nào."
        )

    elif so_buoi_nghi <= 2:

        nhan_dinh.append(
            "Số buổi nghỉ đang ở mức thấp."
        )

    elif so_buoi_nghi <= 4:

        nhan_dinh.append(
            "Số buổi nghỉ ở mức cần lưu ý."
        )

    else:

        nhan_dinh.append(
            "Số buổi nghỉ tương đối cao và có thể ảnh hưởng "
            "đến kết quả học tập."
        )

    # ---------------------------------------------------------
    # 8. LỜI KHUYÊN
    # ---------------------------------------------------------

    loi_khuyen = []

    # Chuyên cần
    if diem_chuyen_can < 6.5:

        loi_khuyen.append(
            "Nên cải thiện mức độ chuyên cần và tham gia đầy đủ "
            "các buổi học."
        )

    else:

        loi_khuyen.append(
            "Tiếp tục duy trì mức độ chuyên cần hiện tại."
        )

    # Điểm thường xuyên
    if diem_thuong_xuyen < 6.5:

        loi_khuyen.append(
            "Nên tăng cường ôn tập và luyện tập để cải thiện "
            "điểm thường xuyên."
        )

    # Bài tập
    if ty_le_hoan_thanh_bai_tap < 60:

        loi_khuyen.append(
            "Ưu tiên hoàn thành đầy đủ các bài tập được giao "
            "để củng cố kiến thức."
        )

    elif ty_le_hoan_thanh_bai_tap < 80:

        loi_khuyen.append(
            "Nên nâng tỷ lệ hoàn thành bài tập lên mức cao hơn."
        )

    else:

        loi_khuyen.append(
            "Tiếp tục duy trì việc hoàn thành bài tập đầy đủ."
        )

    # Nghỉ học
    if so_buoi_nghi > 4:

        loi_khuyen.append(
            "Nên hạn chế nghỉ học và chủ động bổ sung nội dung "
            "đã bỏ lỡ."
        )

    elif so_buoi_nghi > 2:

        loi_khuyen.append(
            "Nên hạn chế các buổi nghỉ không cần thiết."
        )

    # Điểm dự đoán
    if diem_du_doan < 5:

        loi_khuyen.append(
            "Nên ưu tiên ôn tập các nội dung trọng tâm và theo dõi "
            "kết quả học tập thường xuyên."
        )

    elif diem_du_doan < 7:

        loi_khuyen.append(
            "Nên tập trung cải thiện các yếu tố đang có điểm thấp "
            "để nâng kết quả học phần."
        )

    else:

        loi_khuyen.append(
            "Tiếp tục duy trì phong độ hiện tại và cố gắng ổn định "
            "các chỉ số học tập."
        )

    # ---------------------------------------------------------
    # 9. MỨC CẢNH BÁO
    # ---------------------------------------------------------

    if diem_du_doan < 5:

        muc_canh_bao = "CAO"

    elif diem_du_doan < 6.5:

        muc_canh_bao = "TRUNG BÌNH"

    else:

        muc_canh_bao = "THẤP"

    # ---------------------------------------------------------
    # 10. KẾT QUẢ TRẢ VỀ
    # ---------------------------------------------------------

    return {
        "xep_loai": xep_loai,
        "muc_danh_gia": muc_danh_gia,
        "muc_canh_bao": muc_canh_bao,
        "nhan_dinh": nhan_dinh,
        "loi_khuyen": loi_khuyen
    }
    
if __name__ == "__main__":

    ket_qua = phan_tich_ket_qua(
        diem_du_doan=9.13,
        diem_chuyen_can=8.0,
        diem_thuong_xuyen=7.5,
        ty_le_hoan_thanh_bai_tap=85.0,
        so_buoi_nghi=2
    )

    print("=" * 60)
    print("TEST PHÂN TÍCH KẾT QUẢ")
    print("=" * 60)

    print("\nXếp loại:")
    print(ket_qua["xep_loai"])

    print("\nMức đánh giá:")
    print(ket_qua["muc_danh_gia"])

    print("\nMức cảnh báo:")
    print(ket_qua["muc_canh_bao"])

    print("\nNhận định:")

    for noi_dung in ket_qua["nhan_dinh"]:
        print("-", noi_dung)

    print("\nLời khuyên:")

    for loi_khuyen in ket_qua["loi_khuyen"]:
        print("-", loi_khuyen)