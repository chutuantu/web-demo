const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sql, layPool } = require("../config/database");

const router = express.Router();

// POST /api/dang-nhap
router.post("/dang-nhap", async (req, res) => {
  try {
    const { maDangNhap, matKhau } = req.body;

    // Kiểm tra dữ liệu gửi lên
    if (!maDangNhap || !matKhau) {
      return res.status(400).json({
        thanhCong: false,
        thongBao: "Vui lòng nhập mã đăng nhập và mật khẩu.",
      });
    }

    const pool = layPool();

    // Tìm tài khoản
    const ketQua = await pool
      .request()
      .input("maDangNhap", sql.VarChar(30), maDangNhap).query(`
                SELECT
                    ID_TAI_KHOAN,
                    MA_DANG_NHAP,
                    MAT_KHAU,
                    VAI_TRO,
                    TRANG_THAI
                FROM TAI_KHOAN
                WHERE MA_DANG_NHAP = @maDangNhap
            `);

    if (ketQua.recordset.length === 0) {
      return res.status(401).json({
        thanhCong: false,
        thongBao: "Mã đăng nhập hoặc mật khẩu không đúng.",
      });
    }

    const taiKhoan = ketQua.recordset[0];

    // Kiểm tra trạng thái tài khoản
    if (!taiKhoan.TRANG_THAI) {
      return res.status(403).json({
        thanhCong: false,
        thongBao: "Tài khoản đã bị khóa.",
      });
    }

    // Kiểm tra mật khẩu bằng bcrypt
    const matKhauDung = await bcrypt.compare(matKhau, taiKhoan.MAT_KHAU);

    if (!matKhauDung) {
      return res.status(401).json({
        thanhCong: false,
        thongBao: "Mã đăng nhập hoặc mật khẩu không đúng.",
      });
    }

    const payload = {
      idTaiKhoan: taiKhoan.ID_TAI_KHOAN,
      maDangNhap: taiKhoan.MA_DANG_NHAP,
      vaiTro: taiKhoan.VAI_TRO,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // ======================================================
    // GHI NHẬN LƯỢT TRUY CẬP
    // ======================================================

    const ketQuaTruyCap = await pool
      .request()
      .input("idTaiKhoan", sql.Int, taiKhoan.ID_TAI_KHOAN).query(`
    INSERT INTO LICH_SU_TRUY_CAP
    (
      ID_TAI_KHOAN
    )
    OUTPUT INSERTED.ID_TRUY_CAP
    VALUES
    (
      @idTaiKhoan
    )
  `);

    // ======================================================
    // TẠO PHIÊN ĐĂNG NHẬP
    // ======================================================

    const ketQuaPhien = await pool
      .request()
      .input("idTaiKhoan", sql.Int, taiKhoan.ID_TAI_KHOAN).query(`
    INSERT INTO PHIEN_DANG_NHAP
    (
      ID_TAI_KHOAN,
      THOI_GIAN_DANG_NHAP,
      THOI_GIAN_HOAT_DONG_CUOI,
      DANG_ONLINE
    )
    OUTPUT INSERTED.ID_PHIEN
    VALUES
    (
      @idTaiKhoan,
      GETDATE(),
      GETDATE(),
      1
    )
  `);

    const idPhien = ketQuaPhien.recordset[0].ID_PHIEN;

    return res.json({
      thanhCong: true,
      thongBao: "Đăng nhập thành công.",
      token: token,

      taiKhoan: {
        id: taiKhoan.ID_TAI_KHOAN,
        maDangNhap: taiKhoan.MA_DANG_NHAP,
        vaiTro: taiKhoan.VAI_TRO,
      },

      idPhien: idPhien,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Lỗi máy chủ.",
    });
  }
});

// POST /api/dang-xuat
router.post("/dang-xuat", async (req, res) => {
  try {
    const { idPhien } = req.body;

    // Kiểm tra ID phiên
    if (!idPhien) {
      return res.status(400).json({
        thanhCong: false,
        thongBao: "Thiếu ID phiên đăng nhập.",
      });
    }

    const pool = layPool();

    // Chuyển phiên hiện tại sang OFFLINE
    const ketQua = await pool.request().input("idPhien", sql.Int, idPhien)
      .query(`
        UPDATE PHIEN_DANG_NHAP
        SET
          DANG_ONLINE = 0
          THOI_GIAN_HOAT_DONG_CUOI = GETDATE()
        WHERE ID_PHIEN = @idPhien
          AND DANG_ONLINE = 1
      `);

    return res.json({
      thanhCong: true,
      thongBao: "Đăng xuất thành công.",
    });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Lỗi máy chủ.",
    });
  }
});

module.exports = router;
