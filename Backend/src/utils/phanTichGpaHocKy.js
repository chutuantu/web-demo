function phanTichGpaHocKy({ gpa, xepLoai, hocPhan }) {
  const nhanDinh = [];
  const loiKhuyen = [];

  // =========================================================
  // 1. NHẬN ĐỊNH THEO GPA
  // =========================================================

  if (gpa >= 3.6) {
    nhanDinh.push(
      `GPA học kỳ dự kiến đạt ${gpa.toFixed(2)}, thuộc mức Xuất sắc.`,
    );

    loiKhuyen.push("Tiếp tục duy trì phong độ học tập hiện tại.");
  } else if (gpa >= 3.2) {
    nhanDinh.push(`GPA học kỳ dự kiến đạt ${gpa.toFixed(2)}, thuộc mức Giỏi.`);

    loiKhuyen.push("Tiếp tục duy trì kết quả học tập hiện tại.");
  } else if (gpa >= 2.5) {
    nhanDinh.push(`GPA học kỳ dự kiến đạt ${gpa.toFixed(2)}, thuộc mức Khá.`);

    loiKhuyen.push(
      "Tăng thời gian ôn tập cho các học phần có điểm dự đoán thấp.",
    );
  } else if (gpa >= 2.0) {
    nhanDinh.push(
      `GPA học kỳ dự kiến đạt ${gpa.toFixed(2)}, thuộc mức Trung bình.`,
    );

    loiKhuyen.push("Cần tăng cường thời gian học tập và ôn tập trong học kỳ.");
  } else {
    nhanDinh.push(`GPA học kỳ dự kiến đạt ${gpa.toFixed(2)}, thuộc mức Yếu.`);

    loiKhuyen.push(
      "Cần xây dựng kế hoạch học tập cụ thể và ưu tiên các học phần có kết quả thấp.",
    );
  }

  // =========================================================
  // 2. NHẬN ĐỊNH CHUNG
  // =========================================================

  if (xepLoai === "Xuất sắc") {
    nhanDinh.push("Kết quả dự đoán cho thấy nền tảng học tập rất tốt.");
  } else if (xepLoai === "Giỏi") {
    nhanDinh.push("Kết quả học tập nhìn chung đang ở mức tốt.");
  } else if (xepLoai === "Khá") {
    nhanDinh.push(
      "Kết quả học tập ở mức khá nhưng vẫn còn khả năng cải thiện.",
    );
  } else {
    nhanDinh.push(
      "Kết quả dự đoán cho thấy cần chú trọng hơn đến một số học phần.",
    );
  }

  // =========================================================
  // 3. PHÂN TÍCH TỪNG HỌC PHẦN
  // =========================================================

  const danhSachDiem = hocPhan.map((mon) => Number(mon.diem_hoc_phan_he_10));

  if (danhSachDiem.length > 0) {
    const diemThapNhat = Math.min(...danhSachDiem);

    const monThapNhat = hocPhan.find(
      (mon) => Number(mon.diem_hoc_phan_he_10) === diemThapNhat,
    );

    // -----------------------------------------------------
    // Có môn dưới 5
    // -----------------------------------------------------

    const monNguyCo = hocPhan.filter(
      (mon) => Number(mon.diem_hoc_phan_he_10) < 5,
    );

    if (monNguyCo.length > 0) {
      nhanDinh.push(
        `Có ${monNguyCo.length} học phần có điểm dự đoán dưới 5 và cần được ưu tiên cải thiện.`,
      );

      loiKhuyen.push(
        "Ưu tiên ôn tập các học phần có điểm dự đoán thấp hoặc có nguy cơ không đạt.",
      );
    } else {
      nhanDinh.push("Không có học phần nào có điểm dự đoán dưới 5.");
    }

    // -----------------------------------------------------
    // Môn thấp nhất
    // -----------------------------------------------------

    if (monThapNhat) {
      nhanDinh.push(
        `Học phần có điểm dự đoán thấp nhất là ${monThapNhat.ten_hoc_phan} với ${diemThapNhat.toFixed(2)} điểm.`,
      );

      loiKhuyen.push(
        `Nên dành thêm thời gian ôn tập cho học phần ${monThapNhat.ten_hoc_phan}.`,
      );
    }

    // -----------------------------------------------------
    // Kiểm tra độ chênh giữa các môn
    // -----------------------------------------------------

    const diemCaoNhat = Math.max(...danhSachDiem);

    const chenhLech = diemCaoNhat - diemThapNhat;

    if (chenhLech <= 1) {
      nhanDinh.push("Điểm dự đoán giữa các học phần khá đồng đều.");
    } else {
      nhanDinh.push(
        "Kết quả giữa các học phần có sự chênh lệch và nên ưu tiên các môn có điểm thấp.",
      );
    }
  }

  // =========================================================
  // 4. GỢI Ý CHUNG
  // =========================================================

  loiKhuyen.push(
    "Duy trì việc tham gia học tập và hoàn thành đầy đủ các yêu cầu của học phần.",
  );

  // =========================================================
  // 5. LOẠI BỎ CÂU TRÙNG
  // =========================================================

  const nhanDinhKhongTrung = [...new Set(nhanDinh)];

  const loiKhuyenKhongTrung = [...new Set(loiKhuyen)];

  return {
    nhanDinh: nhanDinhKhongTrung,
    loiKhuyen: loiKhuyenKhongTrung,
  };
}

module.exports = {
  phanTichGpaHocKy,
};
