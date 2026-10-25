function phanQuyen(...vaiTroDuocPhep) {
    return (req, res, next) => {
        // Kiểm tra xem người dùng đã được xác thực chưa
        if (!req.taiKhoan) {
            return res.status(401).json({
                thanhCong: false,
                thongBao: "Bạn chưa đăng nhập."
            });
        }

        // Kiểm tra vai trò
        if (!vaiTroDuocPhep.includes(req.taiKhoan.vaiTro)) {
            return res.status(403).json({
                thanhCong: false,
                thongBao: "Bạn không có quyền truy cập chức năng này."
            });
        }

        next();
    };
}

module.exports = phanQuyen;