const express = require("express");
const axios = require("axios");

const { sql, layPool } = require("../config/database");
const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

// ============================================================
// FLASK API
// ============================================================

const ML_API_URL = "http://127.0.0.1:5000/du-doan-gpa-tot-nghiep";

// ============================================================
// TÍNH XU HƯỚNG GPA
// ============================================================

function tinhXuHuongGPA(danhSachGPA) {
  const n = danhSachGPA.length;

  if (n < 2) {
    return 0;
  }

  const x = danhSachGPA.map((_, index) => index + 1);

  const trungBinhX = x.reduce((tong, giaTri) => tong + giaTri, 0) / n;

  const trungBinhY = danhSachGPA.reduce((tong, giaTri) => tong + giaTri, 0) / n;

  let tuSo = 0;
  let mauSo = 0;

  for (let i = 0; i < n; i++) {
    tuSo += (x[i] - trungBinhX) * (danhSachGPA[i] - trungBinhY);

    mauSo += (x[i] - trungBinhX) ** 2;
  }

  if (mauSo === 0) {
    return 0;
  }

  return tuSo / mauSo;
}

// ============================================================
// XẾP LOẠI GPA
// Đồng bộ với các trang dự đoán trước
// ============================================================

function xepLoaiGPA(gpa) {
  if (gpa >= 3.6) {
    return "Xuất sắc";
  }

  if (gpa >= 3.2) {
    return "Giỏi";
  }

  if (gpa >= 2.5) {
    return "Khá";
  }

  if (gpa >= 2.0) {
    return "Trung bình";
  }

  return "Yếu";
}

// ============================================================
// TÍNH GPA CẦN ĐẠT Ở CÁC TÍN CHỈ CÒN LẠI
//
// Công thức:
// GPA cần đạt =
// (GPA mục tiêu * tổng tín chỉ toàn khóa
//  - GPA hiện tại * tín chỉ đã tích lũy)
// / tín chỉ còn lại
//
// rawValue được giữ để đánh giá khả năng.
// displayValue được giới hạn 0 - 4 để hiển thị.
// ============================================================

function tinhGpaCanDat(gpaMucTieu, gpaHienTai, tinChiTichLuy, tinChiToanKhoa) {
  const tinChiConLai = tinChiToanKhoa - tinChiTichLuy;

  if (tinChiConLai <= 0) {
    return {
      raw: null,
      display: null,
    };
  }

  const raw =
    (gpaMucTieu * tinChiToanKhoa - gpaHienTai * tinChiTichLuy) / tinChiConLai;

  if (!Number.isFinite(raw)) {
    return {
      raw: null,
      display: null,
    };
  }

  return {
    raw: Number(raw.toFixed(4)),
    display: Number(Math.max(0, Math.min(4, raw)).toFixed(2)),
  };
}

// ============================================================
// ĐÁNH GIÁ KHẢ NĂNG ĐẠT MỤC TIÊU
//
// Đây là mức đánh giá trong giao diện,
// KHÔNG phải xác suất thống kê.
// ============================================================

function danhGiaKhaNang(gpaDuDoan, gpaMucTieu) {
  const chenhLech = gpaDuDoan - gpaMucTieu;

  if (chenhLech >= 0.15) {
    return {
      muc: "Cao",
      phanTram: 90,
      moTa: "GPA dự kiến đang cao hơn mục tiêu.",
    };
  }

  if (chenhLech >= 0) {
    return {
      muc: "Khá cao",
      phanTram: 80,
      moTa: "GPA dự kiến đạt hoặc nhỉnh hơn mục tiêu.",
    };
  }

  if (chenhLech >= -0.15) {
    return {
      muc: "Trung bình",
      phanTram: 60,
      moTa: "GPA dự kiến khá gần mục tiêu.",
    };
  }

  if (chenhLech >= -0.35) {
    return {
      muc: "Thấp",
      phanTram: 40,
      moTa: "GPA dự kiến đang thấp hơn mục tiêu.",
    };
  }

  return {
    muc: "Rất thấp",
    phanTram: 20,
    moTa: "GPA dự kiến còn cách khá xa mục tiêu.",
  };
}

// ============================================================
// NHẬN ĐỊNH
// ============================================================

function taoNhanDinh({
  gpaDuDoan,
  gpaKyGanNhat,
  gpaMucTieu,
  xuHuongGPA,
  gpaCanDatRaw,
  gpaCanDatHienThi,
}) {
  const nhanDinh = [];

  const chenhLechKy = gpaDuDoan - gpaKyGanNhat;

  if (Math.abs(chenhLechKy) <= 0.1) {
    nhanDinh.push(
      "GPA tốt nghiệp dự kiến tương đối gần với GPA học kỳ gần nhất.",
    );
  } else if (chenhLechKy > 0.1) {
    nhanDinh.push(
      `GPA tốt nghiệp dự kiến cao hơn ${chenhLechKy.toFixed(
        2,
      )} điểm so với GPA học kỳ gần nhất.`,
    );
  } else {
    nhanDinh.push(
      `GPA tốt nghiệp dự kiến thấp hơn ${Math.abs(chenhLechKy).toFixed(
        2,
      )} điểm so với GPA học kỳ gần nhất.`,
    );
  }

  if (xuHuongGPA > 0.03) {
    nhanDinh.push("Lịch sử GPA đang có xu hướng tăng.");
  } else if (xuHuongGPA < -0.03) {
    nhanDinh.push("Lịch sử GPA đang có xu hướng giảm.");
  } else {
    nhanDinh.push("Lịch sử GPA tương đối ổn định.");
  }

  if (gpaDuDoan >= gpaMucTieu) {
    nhanDinh.push("GPA tốt nghiệp dự kiến đang đạt mục tiêu đã đặt.");
  } else {
    nhanDinh.push("GPA tốt nghiệp dự kiến hiện thấp hơn mục tiêu.");
  }

  if (gpaCanDatRaw !== null && Number.isFinite(gpaCanDatRaw)) {
    if (gpaCanDatRaw > 4) {
      nhanDinh.push(
        "GPA cần đạt ở các tín chỉ còn lại vượt quá 4.00 nên mục tiêu hiện tại rất khó đạt.",
      );
    } else if (gpaCanDatRaw <= 0) {
      nhanDinh.push(
        "Mục tiêu hiện tại đã có thể đạt được với kết quả đã tích lũy.",
      );
    } else {
      nhanDinh.push(
        `GPA cần đạt ở các tín chỉ còn lại khoảng ${gpaCanDatHienThi.toFixed(
          2,
        )}.`,
      );
    }
  }

  return nhanDinh;
}

// ============================================================
// LỜI KHUYÊN
// ============================================================

function taoLoiKhuyen({
  gpaDuDoan,
  gpaMucTieu,
  xuHuongGPA,
  mucDoCoGang,
  gpaCanDatRaw,
  tinChiConLai,
}) {
  const loiKhuyen = [];

  if (gpaDuDoan >= gpaMucTieu) {
    loiKhuyen.push(
      "Tiếp tục duy trì kết quả học tập hiện tại để bảo đảm mục tiêu tốt nghiệp.",
    );
  } else {
    loiKhuyen.push("Cần cải thiện kết quả ở các học kỳ và học phần còn lại.");
  }

  if (xuHuongGPA < -0.03) {
    loiKhuyen.push(
      "GPA đang có xu hướng giảm, nên ưu tiên tìm nguyên nhân và điều chỉnh kế hoạch học tập.",
    );
  }

  if (gpaCanDatRaw !== null && Number.isFinite(gpaCanDatRaw)) {
    if (gpaCanDatRaw > 4) {
      loiKhuyen.push(
        "Mục tiêu hiện tại rất khó đạt với số tín chỉ còn lại; nên xem xét điều chỉnh mục tiêu.",
      );
    } else if (gpaCanDatRaw >= 3.6) {
      loiKhuyen.push(
        "Cần duy trì kết quả ở mức rất cao trong các tín chỉ còn lại.",
      );
    } else if (gpaCanDatRaw >= 3.2) {
      loiKhuyen.push("Cần duy trì kết quả khá cao trong các tín chỉ còn lại.");
    }
  }

  if (mucDoCoGang === "binh-thuong") {
    loiKhuyen.push(
      "Nên tăng mức độ đầu tư cho học tập nếu mục tiêu tốt nghiệp đang cao hơn kết quả dự kiến.",
    );
  }

  if (mucDoCoGang === "co-gang") {
    loiKhuyen.push(
      "Tiếp tục duy trì mức độ cố gắng và ưu tiên các học phần có ảnh hưởng lớn.",
    );
  }

  if (mucDoCoGang === "rat-co-gang") {
    loiKhuyen.push(
      "Tiếp tục phát huy mức độ cố gắng hiện tại và theo dõi GPA sau từng học kỳ.",
    );
  }

  if (tinChiConLai <= 30 && gpaDuDoan < gpaMucTieu) {
    loiKhuyen.push(
      "Số tín chỉ còn lại không nhiều, vì vậy cần tận dụng tốt từng học phần.",
    );
  }

  return [...new Set(loiKhuyen)];
}

// ============================================================
// SO SÁNH 4 MỤC TIÊU
// ============================================================

function taoSoSanhMucTieu({ gpaDuDoan }) {
  const gpa = Number(gpaDuDoan);

  if (!Number.isFinite(gpa)) {
    return [];
  }

  // ----------------------------------------------------------
  // Các ngưỡng xếp loại
  // ----------------------------------------------------------

  const nguong = {
    xuatSac: 3.6,
    gioi: 3.2,
    kha: 2.5,
    trungBinh: 2.0,
  };

  // ----------------------------------------------------------
  // Tạo điểm tương đối theo khoảng cách đến từng mức
  //
  // GPA càng gần / càng vượt mức thì điểm càng cao.
  // Sau đó chuẩn hóa để tổng = 100%.
  // ----------------------------------------------------------

  function tinhDiem(muc) {
    const khoangCach = Math.abs(gpa - muc);

    return 1 / (1 + khoangCach * 8);
  }

  let diemXuatSac = 0;
  let diemGioi = 0;
  let diemKha = 0;
  let diemTrungBinh = 0;
  let diemYeu = 0;

  // ----------------------------------------------------------
  // GPA >= 3.6
  // ----------------------------------------------------------

  if (gpa >= nguong.xuatSac) {
    diemXuatSac = 1;
  } else if (gpa >= nguong.gioi) {
    diemXuatSac = tinhDiem(nguong.xuatSac);
    diemGioi = 1;
  } else if (gpa >= nguong.kha) {
    diemXuatSac = tinhDiem(nguong.xuatSac);
    diemGioi = tinhDiem(nguong.gioi);
    diemKha = 1;
  } else if (gpa >= nguong.trungBinh) {
    diemGioi = tinhDiem(nguong.gioi);
    diemKha = tinhDiem(nguong.kha);
    diemTrungBinh = 1;
  } else {
    diemKha = tinhDiem(nguong.kha);
    diemTrungBinh = tinhDiem(nguong.trungBinh);
    diemYeu = 1;
  }

  // ----------------------------------------------------------
  // Chuẩn hóa tổng = 100
  // ----------------------------------------------------------

  const tongDiem = diemXuatSac + diemGioi + diemKha + diemTrungBinh + diemYeu;

  if (tongDiem <= 0) {
    return [
      {
        ten: "Xuất sắc",
        gpaMucTieu: 3.6,
        gpaCanDat: 4,
        khaNang: "Rất thấp",
        phanTramKhaNang: 0,
      },
      {
        ten: "Giỏi",
        gpaMucTieu: 3.2,
        gpaCanDat: 4,
        khaNang: "Rất thấp",
        phanTramKhaNang: 0,
      },
      {
        ten: "Khá",
        gpaMucTieu: 2.5,
        gpaCanDat: 4,
        khaNang: "Rất thấp",
        phanTramKhaNang: 0,
      },
      {
        ten: "Trung bình",
        gpaMucTieu: 2.0,
        gpaCanDat: 4,
        khaNang: "Rất thấp",
        phanTramKhaNang: 0,
      },
      {
        ten: "Yếu",
        gpaMucTieu: 0,
        gpaCanDat: 4,
        khaNang: "Rất thấp",
        phanTramKhaNang: 100,
      },
    ];
  }

  const phanTramXuatSac = Math.round((diemXuatSac / tongDiem) * 100);

  const phanTramGioi = Math.round((diemGioi / tongDiem) * 100);

  const phanTramKha = Math.round((diemKha / tongDiem) * 100);

  const phanTramTrungBinh = Math.round((diemTrungBinh / tongDiem) * 100);

  let phanTramYeu = Math.round((diemYeu / tongDiem) * 100);

  // ----------------------------------------------------------
  // Sửa sai số do làm tròn
  // ----------------------------------------------------------

  const tong =
    phanTramXuatSac +
    phanTramGioi +
    phanTramKha +
    phanTramTrungBinh +
    phanTramYeu;

  phanTramYeu += 100 - tong;

  // ----------------------------------------------------------
  // Hàm mức đánh giá
  // ----------------------------------------------------------

  function danhGia(phanTram) {
    if (phanTram >= 80) {
      return "Cao";
    }

    if (phanTram >= 50) {
      return "Khá cao";
    }

    if (phanTram >= 25) {
      return "Trung bình";
    }

    if (phanTram > 0) {
      return "Thấp";
    }

    return "Rất thấp";
  }

  return [
    {
      ten: "Xuất sắc",
      gpaMucTieu: 3.6,
      gpaCanDat: 3.6,
      khaNang: danhGia(phanTramXuatSac),
      phanTramKhaNang: phanTramXuatSac,
    },
    {
      ten: "Giỏi",
      gpaMucTieu: 3.2,
      gpaCanDat: 3.2,
      khaNang: danhGia(phanTramGioi),
      phanTramKhaNang: phanTramGioi,
    },
    {
      ten: "Khá",
      gpaMucTieu: 2.5,
      gpaCanDat: 2.5,
      khaNang: danhGia(phanTramKha),
      phanTramKhaNang: phanTramKha,
    },
    {
      ten: "Trung bình",
      gpaMucTieu: 2.0,
      gpaCanDat: 2.0,
      khaNang: danhGia(phanTramTrungBinh),
      phanTramKhaNang: phanTramTrungBinh,
    },
    {
      ten: "Yếu",
      gpaMucTieu: 0,
      gpaCanDat: 0,
      khaNang: danhGia(phanTramYeu),
      phanTramKhaNang: phanTramYeu,
    },
  ];
}

// ============================================================
// POST
// /api/du-doan/gpa-tot-nghiep
// ============================================================

router.post(
  "/gpa-tot-nghiep",
  xacThuc,
  phanQuyen("SINH_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. LẤY TÀI KHOẢN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!idTaiKhoan) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản đăng nhập.",
        });
      }

      // ======================================================
      // 2. KẾT NỐI DATABASE + LẤY SINH VIÊN
      // ======================================================

      const pool = layPool();

      const sinhVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, idTaiKhoan).query(`
            SELECT
              ID_SINH_VIEN,
              MA_SINH_VIEN,
              HO_TEN,
              NGANH_HOC,
              LOP_HOC,
              KHOA_HOC
            FROM SINH_VIEN
            WHERE ID_TAI_KHOAN = @ID_TAI_KHOAN
          `);

      if (sinhVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin sinh viên.",
        });
      }

      const sinhVien = sinhVienResult.recordset[0];

      // ======================================================
      // 3. NHẬN DỮ LIỆU FRONTEND
      // ======================================================

      const {
        hocKyGanNhat,
        gpaLichSu,
        tinChiTichLuy,
        tinChiToanKhoa,
        gpaMucTieu,
        mucDoCoGang,
      } = req.body;

      const hocKy = Number(hocKyGanNhat);

      const tichLuy = Number(tinChiTichLuy);

      const toanKhoa = Number(tinChiToanKhoa);

      const mucTieu = Number(gpaMucTieu);

      // ======================================================
      // 4. KIỂM TRA HỌC KỲ
      // ======================================================

      if (!Number.isInteger(hocKy) || hocKy < 1 || hocKy > 8) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Học kỳ gần nhất phải từ 1 đến 8.",
        });
      }

      // ======================================================
      // 5. KIỂM TRA GPA LỊCH SỬ
      // ======================================================

      if (!Array.isArray(gpaLichSu)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Dữ liệu GPA lịch sử không hợp lệ.",
        });
      }

      if (gpaLichSu.length !== hocKy) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: `Bạn đã chọn HK${hocKy} nhưng chưa nhập đủ GPA từ HK1 đến HK${hocKy}.`,
        });
      }

      const danhSachGPA = [];

      for (let i = 0; i < gpaLichSu.length; i++) {
        const gpa = Number(gpaLichSu[i]);

        if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: `GPA HK${i + 1} phải từ 0 đến 4.`,
          });
        }

        danhSachGPA.push(Number(gpa.toFixed(2)));
      }

      // ======================================================
      // 6. KIỂM TRA TÍN CHỈ
      // ======================================================

      if (
        !Number.isFinite(tichLuy) ||
        !Number.isInteger(tichLuy) ||
        tichLuy < 0
      ) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Số tín chỉ đã tích lũy không hợp lệ.",
        });
      }

      if (
        !Number.isFinite(toanKhoa) ||
        !Number.isInteger(toanKhoa) ||
        toanKhoa <= 0
      ) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tổng tín chỉ toàn khóa không hợp lệ.",
        });
      }

      if (tichLuy > toanKhoa) {
        return res.status(400).json({
          thanhCong: false,
          thongBao:
            "Số tín chỉ đã tích lũy không được lớn hơn tổng tín chỉ toàn khóa.",
        });
      }

      // ======================================================
      // 7. GPA MỤC TIÊU
      // ======================================================

      if (!Number.isFinite(mucTieu) || mucTieu < 2 || mucTieu > 4) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "GPA mục tiêu phải từ 2.00 đến 4.00.",
        });
      }

      // ======================================================
      // 8. MỨC ĐỘ CỐ GẮNG
      // ======================================================

      const cacMucCoGang = ["binh-thuong", "co-gang", "rat-co-gang"];

      if (!cacMucCoGang.includes(mucDoCoGang)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Mức độ cố gắng không hợp lệ.",
        });
      }

      // ======================================================
      // 9. TÍNH ĐẶC TRƯNG
      // ======================================================

      const gpaKyGanNhat = danhSachGPA[danhSachGPA.length - 1];

      const gpaTrungBinh =
        danhSachGPA.reduce((tong, gpa) => tong + gpa, 0) / danhSachGPA.length;

      const xuHuongGPA = tinhXuHuongGPA(danhSachGPA);

      const soHocKyDaHoc = danhSachGPA.length;

      const tyLeTinChi = toanKhoa > 0 ? tichLuy / toanKhoa : 0;

      const khoangCachMucTieu = mucTieu - gpaTrungBinh;

      const tinChiConLai = toanKhoa - tichLuy;

      // ======================================================
      // 10. MÃ HÓA MỨC ĐỘ CỐ GẮNG
      // ======================================================

      let mucDoCoGangMaHoa;

      if (mucDoCoGang === "binh-thuong") {
        mucDoCoGangMaHoa = 0;
      } else if (mucDoCoGang === "co-gang") {
        mucDoCoGangMaHoa = 1;
      } else {
        mucDoCoGangMaHoa = 2;
      }

      // ======================================================
      // 11. GỌI FLASK
      // ======================================================

      const duLieuML = {
        gpa_ky_gan_nhat: Number(gpaKyGanNhat.toFixed(2)),

        gpa_trung_binh_lich_su: Number(gpaTrungBinh.toFixed(4)),

        xu_huong_gpa: Number(xuHuongGPA.toFixed(4)),

        so_hoc_ky_da_hoc: soHocKyDaHoc,

        ty_le_tin_chi_da_tich_luy: Number(tyLeTinChi.toFixed(4)),

        muc_do_co_gang: mucDoCoGangMaHoa,
      };

      console.log("DỮ LIỆU GPA TỐT NGHIỆP GỬI ML:", duLieuML);

      let mlResponse;

      try {
        mlResponse = await axios.post(ML_API_URL, duLieuML, {
          timeout: 10000,
        });
      } catch (error) {
        console.error("Lỗi gọi ML GPA tốt nghiệp:", error.message);

        return res.status(500).json({
          thanhCong: false,
          thongBao: "Không thể kết nối đến mô hình GPA tốt nghiệp.",
        });
      }

      // ======================================================
      // 12. KIỂM TRA RESPONSE FLASK
      // ======================================================

      if (
        !mlResponse.data ||
        !mlResponse.data.thanh_cong ||
        !mlResponse.data.ket_qua
      ) {
        console.error("Response ML không hợp lệ:", mlResponse.data);

        return res.status(500).json({
          thanhCong: false,
          thongBao: "Mô hình GPA tốt nghiệp không trả kết quả hợp lệ.",
        });
      }

      // ======================================================
      // 13. GPA TỐT NGHIỆP DỰ KIẾN
      // ======================================================

      const gpaDuDoanRaw = Number(mlResponse.data.ket_qua.gpa_du_doan);

      if (!Number.isFinite(gpaDuDoanRaw)) {
        return res.status(500).json({
          thanhCong: false,
          thongBao: "GPA tốt nghiệp dự kiến không hợp lệ.",
        });
      }

      const gpaDuDoan = Number(
        Math.max(0, Math.min(4, gpaDuDoanRaw)).toFixed(2),
      );

      // ======================================================
      // 14. QUY ĐỔI HỆ 10
      // ======================================================

      const diemHe10 = Number((gpaDuDoan * 2.5).toFixed(2));

      // ======================================================
      // 15. XẾP LOẠI
      // ======================================================

      const xepLoai = xepLoaiGPA(gpaDuDoan);

      // ======================================================
      // 16. GPA CẦN ĐẠT
      // ======================================================

      const ketQuaGpaCanDat = tinhGpaCanDat(
        mucTieu,
        gpaTrungBinh,
        tichLuy,
        toanKhoa,
      );

      const gpaCanDatRaw = ketQuaGpaCanDat.raw;

      const gpaCanDat = ketQuaGpaCanDat.display;

      // ======================================================
      // 17. KHẢ NĂNG ĐẠT MỤC TIÊU
      // ======================================================

      const khaNang = danhGiaKhaNang(gpaDuDoan, mucTieu);

      const khaNangDatMucTieu = khaNang.muc;

      const phanTramKhaNang = khaNang.phanTram;

      // ======================================================
      // 18. NHẬN ĐỊNH
      // ======================================================

      const nhanDinh = taoNhanDinh({
        gpaDuDoan,
        gpaKyGanNhat,
        gpaMucTieu: mucTieu,
        xuHuongGPA,
        gpaCanDatRaw,
        gpaCanDatHienThi: gpaCanDat,
      });

      // ======================================================
      // 19. LỜI KHUYÊN
      // ======================================================

      const loiKhuyen = taoLoiKhuyen({
        gpaDuDoan,
        gpaMucTieu: mucTieu,
        xuHuongGPA,
        mucDoCoGang,
        gpaCanDatRaw,
        tinChiConLai,
      });

      // ======================================================
      // 20. SO SÁNH 4 MỤC TIÊU
      // ======================================================

      const soSanhMucTieu = taoSoSanhMucTieu({
        gpaHienTai: gpaTrungBinh,
        tinChiTichLuy: tichLuy,
        tinChiToanKhoa: toanKhoa,
        gpaDuDoan,
      });

      // ======================================================
      // 21. LƯU KẾT QUẢ VÀO DATABASE
      //
      // QUAN TRỌNG:
      // Phải INSERT trước khi res.json().
      // ======================================================

      await pool
        .request()
        .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN)
        .input("SO_HOC_KY_DA_HOC", sql.Int, soHocKyDaHoc)
        .input("TIN_CHI_TICH_LUY", sql.Int, tichLuy)
        .input("TIN_CHI_TOAN_KHOA", sql.Int, toanKhoa)
        .input("GPA_KY_GAN_NHAT", sql.Decimal(3, 2), gpaKyGanNhat)
        .input(
          "GPA_TRUNG_BINH_LICH_SU",
          sql.Decimal(3, 2),
          Number(gpaTrungBinh.toFixed(2)),
        )
        .input("XU_HUONG_GPA", sql.Decimal(5, 3), Number(xuHuongGPA.toFixed(3)))
        .input("GPA_MUC_TIEU", sql.Decimal(3, 2), mucTieu)
        .input("MUC_DO_CO_GANG", sql.Int, mucDoCoGangMaHoa)
        .input(
          "KHOANG_CACH_MUC_TIEU",
          sql.Decimal(3, 2),
          Number(khoangCachMucTieu.toFixed(2)),
        )
        .input("GPA_DU_DOAN", sql.Decimal(3, 2), gpaDuDoan)
        .input("DIEM_HE_10_DU_DOAN", sql.Decimal(4, 2), diemHe10)
        .input("GPA_CAN_DAT", sql.Decimal(3, 2), gpaCanDat)
        .input("XEP_LOAI", sql.NVarChar(30), xepLoai)
        .input("KHA_NANG_DAT_MUC_TIEU", sql.NVarChar(30), khaNangDatMucTieu)
        .input("PHAN_TRAM_KHA_NANG", sql.Int, phanTramKhaNang)
        .input(
          "NHAN_DINH",
          sql.NVarChar(sql.MAX),
          JSON.stringify(nhanDinh || []),
        )
        .input(
          "LOI_KHUYEN",
          sql.NVarChar(sql.MAX),
          JSON.stringify(loiKhuyen || []),
        )
        .input(
          "SO_SANH_MUC_TIEU",
          sql.NVarChar(sql.MAX),
          JSON.stringify(soSanhMucTieu || []),
        ).query(`
          INSERT INTO DU_DOAN_GPA_TOT_NGHIEP (
            ID_SINH_VIEN,
            SO_HOC_KY_DA_HOC,
            TIN_CHI_TICH_LUY,
            TIN_CHI_TOAN_KHOA,
            GPA_KY_GAN_NHAT,
            GPA_TRUNG_BINH_LICH_SU,
            XU_HUONG_GPA,
            GPA_MUC_TIEU,
            MUC_DO_CO_GANG,
            KHOANG_CACH_MUC_TIEU,
            GPA_DU_DOAN,
            DIEM_HE_10_DU_DOAN,
            GPA_CAN_DAT,
            XEP_LOAI,
            KHA_NANG_DAT_MUC_TIEU,
            PHAN_TRAM_KHA_NANG,
            NHAN_DINH,
            LOI_KHUYEN,
            SO_SANH_MUC_TIEU
          )
          VALUES (
            @ID_SINH_VIEN,
            @SO_HOC_KY_DA_HOC,
            @TIN_CHI_TICH_LUY,
            @TIN_CHI_TOAN_KHOA,
            @GPA_KY_GAN_NHAT,
            @GPA_TRUNG_BINH_LICH_SU,
            @XU_HUONG_GPA,
            @GPA_MUC_TIEU,
            @MUC_DO_CO_GANG,
            @KHOANG_CACH_MUC_TIEU,
            @GPA_DU_DOAN,
            @DIEM_HE_10_DU_DOAN,
            @GPA_CAN_DAT,
            @XEP_LOAI,
            @KHA_NANG_DAT_MUC_TIEU,
            @PHAN_TRAM_KHA_NANG,
            @NHAN_DINH,
            @LOI_KHUYEN,
            @SO_SANH_MUC_TIEU
          )
        `);

      // ======================================================
      // 22. TRẢ KẾT QUẢ
      // ======================================================

      return res.json({
        thanhCong: true,

        sinhVien: {
          idSinhVien: sinhVien.ID_SINH_VIEN,

          maSinhVien: sinhVien.MA_SINH_VIEN,

          hoTen: sinhVien.HO_TEN,
        },

        duLieuDauVao: {
          hocKyGanNhat: hocKy,

          gpaLichSu: danhSachGPA,

          gpaKyGanNhat: Number(gpaKyGanNhat.toFixed(2)),

          gpaTrungBinhLichSu: Number(gpaTrungBinh.toFixed(2)),

          xuHuongGPA: Number(xuHuongGPA.toFixed(4)),

          soHocKyDaHoc,

          tinChiTichLuy: tichLuy,

          tinChiToanKhoa: toanKhoa,

          tinChiConLai,

          tyLeTinChiDaTichLuy: Number(tyLeTinChi.toFixed(4)),

          gpaMucTieu: Number(mucTieu.toFixed(2)),

          mucDoCoGang,

          mucDoCoGangMaHoa,

          khoangCachMucTieu: Number(khoangCachMucTieu.toFixed(2)),
        },

        ketQua: {
          gpaDuKien: gpaDuDoan,

          diemHe10,

          xepLoai,

          khaNangDatMucTieu,

          phanTramKhaNang,

          moTaKhaNang: khaNang.moTa,

          gpaCanDat,

          nhanDinh,

          loiKhuyen,

          soSanhMucTieu,
        },
      });
    } catch (error) {
      console.error("Lỗi dự đoán GPA tốt nghiệp:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể dự đoán GPA tốt nghiệp.",

        error: error.message,
      });
    }
  },
);

module.exports = router;
