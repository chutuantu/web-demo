const express = require("express");

const xacThuc = require("../middleware/xacThuc");

const router = express.Router();

router.get("/thong-tin", xacThuc, (req, res) => {
    res.json({
        thanhCong: true,
        thongTinTaiKhoan: req.taiKhoan
    });
});

module.exports = router;