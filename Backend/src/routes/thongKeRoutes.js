const express = require("express");

const { sql, layPool } = require("../config/database");

const router = express.Router();

// ======================================================
// GET /api/thong-ke-truy-cap
// Thống kê dùng cho footer
// ======================================================

router.get("/thong-ke-truy-cap", async (req, res) => {
  try {
    const pool = layPool();

    // ==================================================
    // 1. TỔNG LƯỢT TRUY CẬP
    // ==================================================

    const ketQuaTongTruyCap = await pool.request().query(`
      SELECT COUNT(*) AS TONG_TRUY_CAP
      FROM LICH_SU_TRUY_CAP
    `);

    // ==================================================
    // 2. SỐ NGƯỜI ĐANG ONLINE
    // ==================================================

    const ketQuaDangOnline = await pool.request().query(`
      SELECT COUNT(*) AS DANG_ONLINE
      FROM PHIEN_DANG_NHAP
      WHERE DANG_ONLINE = 1
    `);

    // ==================================================
    // 3. TỔNG SINH VIÊN
    // ==================================================

    const ketQuaSinhVien = await pool.request().query(`
      SELECT COUNT(*) AS TONG_SINH_VIEN
      FROM TAI_KHOAN
      WHERE VAI_TRO = 'SINH_VIEN'
    `);

    // ==================================================
    // 4. TỔNG GIẢNG VIÊN
    // ==================================================

    const ketQuaGiangVien = await pool.request().query(`
      SELECT COUNT(*) AS TONG_GIANG_VIEN
      FROM TAI_KHOAN
      WHERE VAI_TRO = 'GIANG_VIEN'
    `);

    // ==================================================
    // LẤY KẾT QUẢ
    // ==================================================

    const tongTruyCap =
      ketQuaTongTruyCap.recordset[0].TONG_TRUY_CAP;

    const dangOnline =
      ketQuaDangOnline.recordset[0].DANG_ONLINE;

    const sinhVien =
      ketQuaSinhVien.recordset[0].TONG_SINH_VIEN;

    const giangVien =
      ketQuaGiangVien.recordset[0].TONG_GIANG_VIEN;

    // ==================================================
    // TRẢ VỀ FRONTEND
    // ==================================================

    return res.json({
      thanhCong: true,

      thongKe: {
        tongTruyCap: tongTruyCap,
        dangOnline: dangOnline,
        sinhVien: sinhVien,
        giangVien: giangVien,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê truy cập:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Không thể lấy thống kê truy cập.",
    });
  }
});

module.exports = router;