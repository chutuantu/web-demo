const express = require("express");

const { sql, layPool } = require("../config/database.js");
const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

router.get("/ho-so", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    const pool = layPool();

    const ketQua = await pool
      .request()
      .input("idTaiKhoan", sql.Int, req.taiKhoan.idTaiKhoan).query(`
                    SELECT
  ID_SINH_VIEN,
  MA_SINH_VIEN,
  HO_TEN,
  NGAY_SINH,
  GIOI_TINH,
  NGANH_HOC,
  LOP_HOC,
  KHOA_HOC,
  NIEN_KHOA,
  KHOA,
  ANH_DAI_DIEN
FROM SINH_VIEN
WHERE ID_TAI_KHOAN = @idTaiKhoan
                `);

    if (ketQua.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy hồ sơ sinh viên.",
      });
    }

    return res.json({
      thanhCong: true,
      hoSo: ketQua.recordset[0],
    });
  } catch (error) {
    console.error("Lỗi lấy hồ sơ sinh viên:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Lỗi máy chủ.",
    });
  }
});

// ======================================================
// LẤY GPA CÁC HỌC KỲ CỦA SINH VIÊN
// GET /api/sinh-vien/gpa
// ======================================================

router.get("/gpa", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    // 1. Lấy ID tài khoản từ JWT
    const idTaiKhoan = req.taiKhoan.idTaiKhoan;

    // 2. Tìm ID sinh viên tương ứng
    const request = new sql.Request();

    request.input("idTaiKhoan", sql.Int, idTaiKhoan);

    const sinhVien = await request.query(`
        SELECT ID_SINH_VIEN
        FROM SINH_VIEN
        WHERE ID_TAI_KHOAN = @idTaiKhoan
      `);

    if (sinhVien.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy sinh viên.",
      });
    }

    const idSinhVien = sinhVien.recordset[0].ID_SINH_VIEN;

    // 3. Lấy GPA các học kỳ
    const requestGPA = new sql.Request();

    requestGPA.input("idSinhVien", sql.Int, idSinhVien);

    const ketQua = await requestGPA.query(`
        SELECT
          HOC_KY,
          NAM_HOC,
          GPA,
          TONG_TIN_CHI
        FROM KET_QUA_HOC_KY
        WHERE ID_SINH_VIEN = @idSinhVien
        ORDER BY
          ISNULL(
            TRY_CONVERT(
              INT,
              LEFT(NAM_HOC, 4)
            ),
            0
          ) ASC,
          HOC_KY ASC
      `);

    // 4. Trả dữ liệu
    return res.json({
      thanhCong: true,
      gpa: ketQua.recordset,
    });
  } catch (error) {
    console.error("Lỗi lấy GPA:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Lỗi máy chủ.",
    });
  }
});

// ======================================================
// NHẬN ĐỊNH TỪ HỆ THỐNG
// GET /api/sinh-vien/nhan-dinh
// ======================================================

router.get("/nhan-dinh", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    // 1. Lấy ID tài khoản từ JWT
    const idTaiKhoan = req.taiKhoan.idTaiKhoan;

    // 2. Tìm sinh viên
    const requestSinhVien = new sql.Request();

    requestSinhVien.input("idTaiKhoan", sql.Int, idTaiKhoan);

    const sinhVien = await requestSinhVien.query(`
        SELECT ID_SINH_VIEN
        FROM SINH_VIEN
        WHERE ID_TAI_KHOAN = @idTaiKhoan
      `);

    if (sinhVien.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy sinh viên.",
      });
    }

    const idSinhVien = sinhVien.recordset[0].ID_SINH_VIEN;

    // 3. Lấy GPA theo học kỳ
    const requestGPA = new sql.Request();

    requestGPA.input("idSinhVien", sql.Int, idSinhVien);

    const ketQua = await requestGPA.query(`
        SELECT
          HOC_KY,
          NAM_HOC,
          GPA
        FROM KET_QUA_HOC_KY
        WHERE ID_SINH_VIEN = @idSinhVien
        ORDER BY
          ISNULL(
            TRY_CONVERT(
              INT,
              LEFT(NAM_HOC, 4)
            ),
            0
          ) ASC,
          HOC_KY ASC
      `);

    const danhSachGPA = ketQua.recordset;

    // Không có dữ liệu GPA
    if (danhSachGPA.length === 0) {
      return res.json({
        thanhCong: true,
        nhanDinh: [],
      });
    }

    // ==================================================
    // 4. Tạo nhận định
    // ==================================================

    const nhanDinh = [];

    // GPA học kỳ gần nhất
    const hocKyCuoi = danhSachGPA[danhSachGPA.length - 1];

    const gpaHienTai = Number(hocKyCuoi.GPA);

    // GPA học kỳ trước
    let gpaTruoc = null;

    if (danhSachGPA.length >= 2) {
      gpaTruoc = Number(danhSachGPA[danhSachGPA.length - 2].GPA);
    }

    // --------------------------------------------------
    // Nhận định 1: xu hướng GPA
    // --------------------------------------------------

    if (gpaTruoc !== null) {
      if (gpaHienTai > gpaTruoc) {
        nhanDinh.push({
          loai: "tich-cuc",
          noiDung: `GPA của bạn đang tăng từ ${gpaTruoc.toFixed(2)} lên ${gpaHienTai.toFixed(2)}.`,
        });
      } else if (gpaHienTai < gpaTruoc) {
        nhanDinh.push({
          loai: "canh-bao",
          noiDung: `GPA của bạn giảm từ ${gpaTruoc.toFixed(2)} xuống ${gpaHienTai.toFixed(2)}.`,
        });
      } else {
        nhanDinh.push({
          loai: "thong-tin",
          noiDung: `GPA học kỳ gần nhất duy trì ở mức ${gpaHienTai.toFixed(2)}.`,
        });
      }
    } else {
      nhanDinh.push({
        loai: "thong-tin",
        noiDung: `GPA học kỳ gần nhất của bạn là ${gpaHienTai.toFixed(2)}.`,
      });
    }

    // --------------------------------------------------
    // Nhận định 2: đánh giá GPA hiện tại
    // --------------------------------------------------

    if (gpaHienTai >= 3.6) {
      nhanDinh.push({
        loai: "tich-cuc",
        noiDung: "GPA hiện tại đang ở mức rất tốt.",
      });
    } else if (gpaHienTai >= 3.2) {
      nhanDinh.push({
        loai: "tich-cuc",
        noiDung: "GPA hiện tại đang ở mức tốt.",
      });
    } else if (gpaHienTai >= 2.5) {
      nhanDinh.push({
        loai: "thong-tin",
        noiDung:
          "GPA hiện tại đang ở mức khá ổn, nên tiếp tục duy trì kết quả học tập.",
      });
    } else {
      nhanDinh.push({
        loai: "canh-bao",
        noiDung: "GPA hiện tại cần được cải thiện trong các học kỳ tiếp theo.",
      });
    }

    // --------------------------------------------------
    // Nhận định 3: so sánh 3 học kỳ gần nhất
    // --------------------------------------------------

    if (danhSachGPA.length >= 3) {
      const ganNhat = danhSachGPA.slice(-3).map(function (item) {
        return Number(item.GPA);
      });

      if (ganNhat[0] < ganNhat[1] && ganNhat[1] < ganNhat[2]) {
        nhanDinh.push({
          loai: "tich-cuc",
          noiDung:
            "GPA của bạn có xu hướng tăng liên tục trong 3 học kỳ gần nhất.",
        });
      }
    }

    // ==================================================
    // 5. Trả kết quả
    // ==================================================

    return res.json({
      thanhCong: true,
      gpaHienTai: gpaHienTai,
      nhanDinh: nhanDinh,
    });
  } catch (error) {
    console.error("Lỗi lấy nhận định:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Lỗi máy chủ.",
    });
  }
});

module.exports = router;
