// ======================================================
// HEADER / FOOTER KHU VỰC ADMIN
// - Mở/đóng menu tài khoản
// - Hiển thị tên + mã đăng nhập của quản trị viên
// - Đăng xuất (gọi API rồi xoá phiên cục bộ)
// ======================================================

(function () {
  "use strict";

  const layGiaTri = (key) =>
    localStorage.getItem(key) || sessionStorage.getItem(key);

  function layTaiKhoan() {
    const raw = layGiaTri("taiKhoan");

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function taoAvatar(hopAvatar) {
    if (!hopAvatar) {
      return;
    }

    const taiKhoan = layTaiKhoan();

    const chu = (taiKhoan?.maDangNhap || "A").trim().charAt(0).toUpperCase();

    hopAvatar.textContent = chu;

    hopAvatar.style.display = "flex";

    hopAvatar.style.alignItems = "center";

    hopAvatar.style.justifyContent = "center";

    hopAvatar.style.fontWeight = "700";

    hopAvatar.style.color = "var(--xanh_la)";
  }

  function capNhatThongTinTaiKhoan() {
    const taiKhoan = layTaiKhoan();

    const oTen = document.querySelector(".thong-tin .ten span");

    if (oTen) {
      oTen.textContent = "Quản trị viên";
    }

    const oVaiTro = document.querySelectorAll(".thong-tin .ten span")[1];

    if (oVaiTro) {
      oVaiTro.textContent = taiKhoan?.vaiTro || "ADMIN";
    }

    const oHoTen = document.querySelector(".thong-tin-chi-tiet .ho-ten strong");

    if (oHoTen) {
      oHoTen.textContent = "Quản trị viên";
    }

    const oTaiKhoan = document.querySelector(
      ".thong-tin-chi-tiet .tai-khoan strong",
    );

    if (oTaiKhoan) {
      oTaiKhoan.textContent = taiKhoan?.maDangNhap || "--";
    }

    taoAvatar(document.querySelector(".thong-tin .atavar"));
  }

  function batDauMenuTaiKhoan() {
    const muiTen = document.querySelector(".thong-tin");

    const chiTiet = document.querySelector(".thong-tin-chi-tiet");

    const icon = document.querySelector(".thong-tin > .fa-caret-down");

    if (!muiTen || !chiTiet) {
      return;
    }

    muiTen.addEventListener("click", function (event) {
      chiTiet.classList.toggle("show");

      if (icon) {
        icon.classList.toggle("active");
      }

      event.stopPropagation();
    });

    chiTiet.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    document.addEventListener("click", function () {
      chiTiet.classList.remove("show");

      if (icon) {
        icon.classList.remove("active");
      }
    });
  }

  async function dangXuat(event) {
    if (event) {
      event.preventDefault();
    }

    const idPhien = layGiaTri("idPhien");

    try {
      if (idPhien) {
        await fetch("/api/dang-xuat", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            idPhien: Number(idPhien),
          }),
        });
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      ["token", "taiKhoan", "idPhien", "ghiNhoDangNhap"].forEach(function (key) {
        localStorage.removeItem(key);

        sessionStorage.removeItem(key);
      });

      window.location.replace("/index.html");
    }
  }

  function batDauDangXuat() {
    const nutDangXuat = document.querySelector(".thong-tin-chi-tiet .dang-xuat");

    if (nutDangXuat) {
      nutDangXuat.addEventListener("click", dangXuat);
    }

    const nutDangXuatTrang = document.getElementById("logout");

    if (nutDangXuatTrang) {
      nutDangXuatTrang.addEventListener("click", dangXuat);
    }
  }

  function batDau() {
    capNhatThongTinTaiKhoan();

    batDauMenuTaiKhoan();

    batDauDangXuat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", batDau);
  } else {
    batDau();
  }
})();
