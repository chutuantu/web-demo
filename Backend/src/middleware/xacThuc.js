const jwt = require("jsonwebtoken");

function xacThuc(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({
                thanhCong: false,
                thongBao: "Bạn chưa đăng nhập."
            });
        }

        const parts = header.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                thanhCong: false,
                thongBao: "Token không hợp lệ."
            });
        }

        const token = parts[1];

        const thongTin = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        // console.log("JWT THỰC TẾ:", thongTin);

        req.taiKhoan = thongTin;

        next();

    } catch (error) {
        return res.status(401).json({
            thanhCong: false,
            thongBao: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
        });
    }
}

module.exports = xacThuc;