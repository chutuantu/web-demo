const express = require("express");

const { sql } = require("../config/database");

const router = express.Router();

// ============================================================
// GET /api/hoc-phan
// Lấy danh sách học phần
// ============================================================

router.get("/", async (req, res) => {
  try {
    const result = await sql.query(`
            SELECT
                ID_HOC_PHAN,
                MA_HOC_PHAN,
                TEN_HOC_PHAN,
                SO_TIN_CHI
            FROM HOC_PHAN
            WHERE TRANG_THAI = 1
            ORDER BY TEN_HOC_PHAN
        `);

    return res.json({
      thanh_cong: true,
      du_lieu: result.recordset,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách học phần:", error);

    return res.status(500).json({
      thanh_cong: false,
      message: "Không thể lấy danh sách học phần",
    });
  }
});

module.exports = router;
