console.log("BAO VE TRANG DA CHAY");
document.addEventListener("DOMContentLoaded", function () {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const taiKhoan =
    localStorage.getItem("taiKhoan") || sessionStorage.getItem("taiKhoan");

  // Chưa đăng nhập
  if (!token || !taiKhoan) {
    window.location.href = window.location.origin + "/Fontend/index.html";
    return;
  }

  let thongTinTaiKhoan;

  try {
    thongTinTaiKhoan = JSON.parse(taiKhoan);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("taiKhoan");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("taiKhoan");

    window.location.href = window.location.origin + "/Fontend/index.html";
    return;
  }

  const vaiTro = thongTinTaiKhoan.vaiTro;

  // Xác định khu vực hiện tại
  const duongDan = window.location.pathname.toLowerCase();

  const dangOTrangSinhVien = duongDan.includes("/pages/sinh-vien/");

  const dangOTrangGiangVien = duongDan.includes("/pages/giang-vien/");

  // Sinh viên không được vào khu vực giảng viên
  if (dangOTrangGiangVien && vaiTro !== "GIANG_VIEN") {
    window.location.href = "../sinh-vien/Home.html";

    return;
  }

  // Giảng viên không được vào khu vực sinh viên
  if (dangOTrangSinhVien && vaiTro !== "SINH_VIEN") {
    window.location.href = "../giang-vien/Home.html";

    return;
  }
});
