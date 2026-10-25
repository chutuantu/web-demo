const express = require("express");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const taiKhoanRoutes = require("./routes/taiKhoanRoutes");
const sinhVienRoutes = require("./routes/sinhVienRoutes");
const giangVienRoutes = require("./routes/giangVienRoutes");
const thongKeRoutes = require("./routes/thongKeRoutes");
const duDoanRouter = require("./routes/duDoan");
const hocPhanRouter = require("./routes/hocPhanRoutes");
const ketQuaHocPhanRoutes = require("./routes/ketQuaHocPhanRoutes");
const duDoanGpaRoutes = require("./routes/duDoanGpaRoutes");
const baoCaoDuDoanRoutes = require("./routes/baoCaoDuDoanRoutes");
const duDoanGpaTiepTheoRoutes = require("./routes/duDoanGpaTiepTheoRoutes.js");
const duDoanGpaTotNghiepRoutes = require("./routes/duDoanGpaTotNghiepRoutes.js");
const hoTroHocTapRoutes = require("./routes/hoTroHocTapRoutes");
const taiNguyenRoutes = require("./routes/taiNguyenRoutes");
const taiNguyenGiangVienRoutes = require("./routes/taiNguyenGiangVienRoutes.js");
const danhSachSinhVienRoutes = require("./routes/danhSachSinhVienRoutes");
const canhBaoNguyCoRoutes = require("./routes/canhBaoNguyCoRoutes");
const homeGiangVienRoutes = require("./routes/homeGiangVienRoutes");
const cors = require("cors");

const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());

// Đăng nhập
app.use("/api", authRoutes);

// Tài khoản
app.use("/api/tai-khoan", taiKhoanRoutes);
app.use("/api/home", homeRoutes);

// Sinh viên
app.use("/api/sinh-vien", sinhVienRoutes);

// Giảng viên
app.use("/api/giang-vien", giangVienRoutes);
app.use("/api/giang-vien", taiNguyenGiangVienRoutes);

// home-gv
app.use("/api/giang-vien", homeGiangVienRoutes);

// Thống kê
app.use("/api", thongKeRoutes);

// dự đoán
app.use("/api/du-doan", duDoanRouter);
app.use("/api/du-doan", duDoanGpaRoutes);
app.use("/api/du-doan", duDoanGpaTiepTheoRoutes);
app.use("/api/du-doan", duDoanGpaTotNghiepRoutes);

// học phần
app.use("/api/hoc-phan", hocPhanRouter);

// kết quả học phần
app.use("/api/ket-qua-hoc-phan", ketQuaHocPhanRoutes);

// báo cáo
app.use("/api/bao-cao", baoCaoDuDoanRoutes);

// ho-tro-hoc-tap
app.use("/api/ho-tro-hoc-tap", hoTroHocTapRoutes);
app.use("/api/tai-nguyen", taiNguyenRoutes);

// danh-sach-sinh-vien
app.use("/api/giang-vien", danhSachSinhVienRoutes);

// canh-bao-nguy-co
app.use("/api/giang-vien", canhBaoNguyCoRoutes);

// cors
app.use(
  cors({
    origin: "http://localhost:5500",
  }),
);

console.log("=================================");
console.log("THƯ MỤC APP:", __dirname);
console.log("THƯ MỤC UPLOAD:", path.join(__dirname, "uploads"));
console.log("THƯ MỤC TÀI LIỆU:", path.join(__dirname, "uploads", "tai-lieu"));
console.log("=================================");
// ============================================================
// CHO PHÉP FRONTEND TRUY CẬP FILE ĐÃ UPLOAD
// ============================================================

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.get("/kiem-tra-file-pdf", (req, res) => {
  const filePath = path.join(
    __dirname,
    "uploads",
    "tai-lieu",
    "HTML-1789545285662-993785242.pdf",
  );

  console.log("ĐƯỜNG DẪN FILE:", filePath);
  console.log("FILE TỒN TẠI:", fs.existsSync(filePath));

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Không tìm thấy file.");
  }

  res.sendFile(filePath);
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend dự đoán kết quả sinh viên đang hoạt động",
  });
});

module.exports = app;
