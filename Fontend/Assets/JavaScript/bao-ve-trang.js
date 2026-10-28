// ============================================================
// BAO VE TRANG - GUARD + XU LY PHIEN HET HAN
// ============================================================

console.log("BAO VE TRANG DA CHAY");

// ============================================================
// HELPER: XOA PHIEU VA CHUYEN VE DANG NHAP
// ============================================================

let daChuyenHuong = false;

function xoaLuuTruPhien() {
  try {
    ["token", "taiKhoan", "idPhien", "ghiNhoDangNhap"].forEach(function (k) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch (e) {
    // ignore storage errors
  }
}

function tokenHetHan(token) {
  try {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (!payload || !payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return false;
  }
}

function hetHanPhienVaChuyenVeDangNhap() {
  if (daChuyenHuong) return;
  daChuyenHuong = true;

  xoaLuuTruPhien();

  const dangOTrangDangNhap = window.location.pathname
    .toLowerCase()
    .endsWith("/index.html");

  if (!dangOTrangDangNhap) {
    try {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    } catch (e) {
      // ignore
    }
    window.location.href = window.location.origin + "/index.html";
  }
}

// ============================================================
// INTERCEPTOR window.fetch - PHAT HIEN 401 / TOKEN HET HAN
// ============================================================

(function caiDatInterceptorFetch() {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return;
  }

  const fetchGoc = window.fetch.bind(window);

  window.fetch = async function (...args) {
    // Kiem tra token truoc khi gui request
    const tokenHienTai =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (tokenHienTai && tokenHetHan(tokenHienTai)) {
      hetHanPhienVaChuyenVeDangNhap();
      return new Promise(function () {});
    }

    let phanHoi;
    try {
      phanHoi = await fetchGoc(...args);
    } catch (e) {
      throw e;
    }

    // Xac dinh URL request
    let url = "";
    try {
      if (typeof args[0] === "string") {
        url = args[0];
      } else if (args[0] && typeof args[0].url === "string") {
        url = args[0].url;
      }
    } catch (e) {
      url = "";
    }

    const laApi = /\/api\//.test(url);
    const laDangNhap = /dang-nhap/.test(url);

    if (phanHoi && phanHoi.status === 401 && laApi && !laDangNhap) {
      hetHanPhienVaChuyenVeDangNhap();
      return new Promise(function () {});
    }

    return phanHoi;
  };
})();

// ============================================================
// GUARD DANG NHAP + KIEM TRA HET HAN (chay ngay khi script load)
// ============================================================

(function guardDangNhap() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const taiKhoan =
    localStorage.getItem("taiKhoan") || sessionStorage.getItem("taiKhoan");

  // Token da het han -> xoa va chuyen ve dang nhap
  if (token && tokenHetHan(token)) {
    hetHanPhienVaChuyenVeDangNhap();
    return;
  }

  // Chua dang nhap
  if (!token || !taiKhoan) {
    window.location.href = window.location.origin + "/index.html";
    return;
  }

  let thongTinTaiKhoan;

  try {
    thongTinTaiKhoan = JSON.parse(taiKhoan);
  } catch (error) {
    xoaLuuTruPhien();

    window.location.href = window.location.origin + "/index.html";
    return;
  }

  const vaiTro = thongTinTaiKhoan.vaiTro;

  // Xac dinh khu vuc hien tai
  const duongDan = window.location.pathname.toLowerCase();

  const dangOTrangSinhVien = duongDan.includes("/pages/sinh-vien/");

  const dangOTrangGiangVien = duongDan.includes("/pages/giang-vien/");

  // Sinh vien khong duoc vao khu vuc giang vien
  if (dangOTrangGiangVien && vaiTro !== "GIANG_VIEN") {
    window.location.href = "/Pages/Sinh-vien/Home.html";

    return;
  }

  // Giang vien khong duoc vao khu vuc sinh vien
  if (dangOTrangSinhVien && vaiTro !== "SINH_VIEN") {
    window.location.href = "/Pages/Giang-vien/Home.html";

    return;
  }

  // Kiem tra dinh ky de bat truong hop token het han trong luc mo tab
  setInterval(function () {
    const tokenHienTai =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (tokenHienTai && tokenHetHan(tokenHienTai)) {
      hetHanPhienVaChuyenVeDangNhap();
    }
  }, 30000);
})();
