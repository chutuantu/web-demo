const express = require("express");

const { sql, layPool } = require("../config/database.js");
const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

router.get(
    "/ho-so",
    xacThuc,
    phanQuyen("GIANG_VIEN"),
    async (req, res) => {
        try {
            const pool = layPool();

            const ketQua = await pool.request()
                .input(
                    "idTaiKhoan",
                    sql.Int,
                    req.taiKhoan.idTaiKhoan
                )
                .query(`
                    SELECT
                        ID_GIANG_VIEN,
                        MA_GIANG_VIEN,
                        HO_TEN,
                        EMAIL,
                        BO_MON
                    FROM GIANG_VIEN
                    WHERE ID_TAI_KHOAN = @idTaiKhoan
                `);

            if (ketQua.recordset.length === 0) {
                return res.status(404).json({
                    thanhCong: false,
                    thongBao: "Không tìm thấy hồ sơ giảng viên."
                });
            }

            return res.json({
                thanhCong: true,
                hoSo: ketQua.recordset[0]
            });

        } catch (error) {
            console.error("Lỗi lấy hồ sơ giảng viên:", error);

            return res.status(500).json({
                thanhCong: false,
                thongBao: "Lỗi máy chủ."
            });
        }
    }
);

module.exports = router;