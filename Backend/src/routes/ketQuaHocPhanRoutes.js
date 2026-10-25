const express = require("express");

const { sql, layPool } = require("../config/database");

const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

// ============================================================
// GET /api/ket-qua-hoc-phan
// Lấy kết quả học phần của sinh viên đang đăng nhập
// ============================================================

router.get("/", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    // --------------------------------------------------
    // JWT của bạn có:
    //
    // {
    //   id: 2,
    //   maDangNhap: "...",
    //   vaiTro: "SINH_VIEN"
    // }
    //
    // xac_thuc.js:
    // req.taiKhoan = thongTin
    // --------------------------------------------------

    const idTaiKhoan = req.taiKhoan.idTaiKhoan;

    if (!idTaiKhoan) {
      return res.status(401).json({
        thanhCong: false,
        thongBao: "Không xác định được tài khoản đăng nhập.",
      });
    }

    // --------------------------------------------------
    // Lấy pool SQL Server
    // --------------------------------------------------

    const pool = layPool();

    // --------------------------------------------------
    // Tìm sinh viên từ tài khoản
    // --------------------------------------------------

    const ketQuaSinhVien = await pool
      .request()
      .input("ID_TAI_KHOAN", sql.Int, idTaiKhoan).query(`
                        SELECT
                            ID_SINH_VIEN,
                            MA_SINH_VIEN,
                            HO_TEN
                        FROM SINH_VIEN
                        WHERE ID_TAI_KHOAN = @ID_TAI_KHOAN
                    `);

    if (ketQuaSinhVien.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy thông tin sinh viên.",
      });
    }

    const sinhVien = ketQuaSinhVien.recordset[0];

    // --------------------------------------------------
    // Lấy dữ liệu học phần
    // --------------------------------------------------

    const ketQuaHocPhan = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN).query(`
                        SELECT
                            KQ.ID_KET_QUA_HOC_PHAN,

                            KQ.HOC_KY,

                            KQ.NAM_HOC,

                            HP.ID_HOC_PHAN,

                            HP.MA_HOC_PHAN,

                            HP.TEN_HOC_PHAN,

                            HP.SO_TIN_CHI,

                            KQ.DIEM_CHUYEN_CAN,

                            KQ.DIEM_THUONG_XUYEN,

                            KQ.TY_LE_HOAN_THANH_BAI_TAP,

                            KQ.SO_BUOI_NGHI,

                            KQ.DIEM_THI,

                            KQ.DIEM_HOC_PHAN

                        FROM KET_QUA_HOC_PHAN AS KQ

                        INNER JOIN HOC_PHAN AS HP
                            ON KQ.ID_HOC_PHAN = HP.ID_HOC_PHAN

                        WHERE
                            KQ.ID_SINH_VIEN = @ID_SINH_VIEN

                        ORDER BY
                            KQ.NAM_HOC,
                            KQ.HOC_KY,
                            HP.MA_HOC_PHAN
                    `);

    // --------------------------------------------------
    // Trả về
    // --------------------------------------------------

    return res.json({
      thanhCong: true,

      sinhVien: {
        idSinhVien: sinhVien.ID_SINH_VIEN,

        maSinhVien: sinhVien.MA_SINH_VIEN,

        hoTen: sinhVien.HO_TEN,
      },

      duLieu: ketQuaHocPhan.recordset,
    });
  } catch (error) {
    console.error("Lỗi lấy kết quả học phần:", error);

    return res.status(500).json({
      thanhCong: false,

      thongBao: "Không thể lấy dữ liệu học phần.",
    });
  }
});

module.exports = router;
