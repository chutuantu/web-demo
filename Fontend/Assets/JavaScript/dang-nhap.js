document.addEventListener("DOMContentLoaded", function () {
  const oMatKhau = document.getElementById("mat-khau");
  const nutAnHienMk = document.getElementById("nut-an-hien-mk");
  const formTaiKhoan = document.getElementById("form-tai-khoan");
  const nutDangNhap = document.getElementById("nut-dang-nhap");

  // ==============================
  // 1. ẨN / HIỆN MẬT KHẨU
  // ==============================

  nutAnHienMk.addEventListener("click", function () {
    if (oMatKhau.type === "password") {
      oMatKhau.type = "text";

      nutAnHienMk.classList.remove("fa-eye");
      nutAnHienMk.classList.add("fa-eye-slash");
    } else {
      oMatKhau.type = "password";

      nutAnHienMk.classList.remove("fa-eye-slash");
      nutAnHienMk.classList.add("fa-eye");
    }
  });

  // ==============================
  // 2. XỬ LÝ ĐĂNG NHẬP
  // ==============================

  formTaiKhoan.addEventListener("submit", dangNhap);

  async function dangNhap(event) {
    // Ngăn form reload trang
    event.preventDefault();

    const maDangNhap = document.getElementById("ma-dang-nhap").value.trim();

    const matKhau = document.getElementById("mat-khau").value;

    // ĐÚNG ID VỚI HTML
    const ghiNhoDangNhap = document.getElementById("ghi-nho").checked;

    // ==============================
    // KIỂM TRA DỮ LIỆU
    // ==============================

    if (!maDangNhap || !matKhau) {
      alert("Vui lòng nhập mã đăng nhập và mật khẩu.");
      return;
    }

    // ==============================
    // VÔ HIỆU HÓA NÚT
    // ==============================

    nutDangNhap.disabled = true;
    nutDangNhap.innerHTML = "Đang đăng nhập...";

    try {
      // ==============================
      // GỌI BACKEND
      // ==============================

      const phanHoi = await fetch("http://localhost:3000/api/dang-nhap", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          maDangNhap: maDangNhap,
          matKhau: matKhau,
        }),
      });

      const duLieu = await phanHoi.json();

      console.log("Phản hồi backend:", duLieu);

      // ==============================
      // ĐĂNG NHẬP THẤT BẠI
      // ==============================

      if (!phanHoi.ok || !duLieu.thanhCong) {
        alert(duLieu.thongBao || "Đăng nhập thất bại.");

        return;
      }

      // ==============================
      // LẤY JWT
      // ==============================

      const token = duLieu.token;

      const idPhien = duLieu.idPhien;

      const thongTinTaiKhoan = JSON.stringify(duLieu.taiKhoan);

      // ==============================
      // LƯU ĐĂNG NHẬP
      // ==============================

      if (ghiNhoDangNhap) {
        // Ghi nhớ → Local Storage
        localStorage.setItem("token", token);

        localStorage.setItem("taiKhoan", thongTinTaiKhoan);

        localStorage.setItem("idPhien", idPhien);

        localStorage.setItem("ghiNhoDangNhap", "true");
      } else {
        sessionStorage.setItem("token", token);

        sessionStorage.setItem("taiKhoan", thongTinTaiKhoan);

        sessionStorage.setItem("idPhien", idPhien);

        localStorage.removeItem("token");
        localStorage.removeItem("taiKhoan");
        localStorage.removeItem("idPhien");
        localStorage.removeItem("ghiNhoDangNhap");
      }

      // ==============================
      // KIỂM TRA THÔNG TIN
      // ==============================

      console.log("Đăng nhập thành công:", duLieu);

      console.log("Mã đăng nhập:", duLieu.taiKhoan.maDangNhap);

      console.log("Vai trò:", duLieu.taiKhoan.vaiTro);

      // ==============================
      // CHUYỂN TRANG THEO VAI TRÒ
      // ==============================

      if (duLieu.taiKhoan.vaiTro === "SINH_VIEN") {
        console.log("→ Chuyển sang trang Sinh viên");

        window.location.href = "Pages/Sinh-vien/Home.html";
      } else if (duLieu.taiKhoan.vaiTro === "GIANG_VIEN") {
        console.log("→ Chuyển sang trang Giảng viên");

        window.location.href = "Pages/Giang-vien/home.html";
      } else {
        alert("Vai trò tài khoản không hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);

      alert("Không thể kết nối đến máy chủ. " + "Hãy kiểm tra backend.");
    } finally {
      nutDangNhap.disabled = false;

      nutDangNhap.innerHTML =
        '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập';
    }
  }
});
