
// ======================================================
// LẤY THÔNG TIN NGƯỜI DÙNG
// ======================================================

async function layThongTinNguoiDung() {
  try {
    // ==================================================
    // LẤY TOKEN
    // ==================================================

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      console.error("Không tìm thấy token.");
      return;
    }

    // ==================================================
    // LẤY THÔNG TIN TÀI KHOẢN
    // ==================================================

    let taiKhoan = null;

    const taiKhoanLocal = localStorage.getItem("taiKhoan");
    const taiKhoanSession = sessionStorage.getItem("taiKhoan");

    try {
      if (taiKhoanLocal) {
        taiKhoan = JSON.parse(taiKhoanLocal);
      } else if (taiKhoanSession) {
        taiKhoan = JSON.parse(taiKhoanSession);
      }
    } catch (error) {
      console.error("Không thể đọc thông tin tài khoản:", error);
    }

    // ==================================================
    // XÁC ĐỊNH VAI TRÒ
    // ==================================================

    let vaiTro = null;

    if (taiKhoan) {
      vaiTro =
        taiKhoan.VAI_TRO ||
        taiKhoan.vaiTro ||
        taiKhoan.VAI_TAI_KHOAN ||
        taiKhoan.vai_tro;
    }

    // Nếu không lấy được vai trò từ localStorage/sessionStorage
    // thì báo lỗi để tránh gọi nhầm API.
    if (!vaiTro) {
      console.error("Không xác định được vai trò người dùng.");
      return;
    }

    vaiTro = vaiTro.toUpperCase();

    console.log("Vai trò người dùng:", vaiTro);

    // ==================================================
    // XÁC ĐỊNH API HỒ SƠ
    // ==================================================

    let apiHoSo = "";

    if (vaiTro === "SINH_VIEN") {
      apiHoSo = "http://localhost:3000/api/sinh-vien/ho-so";
    } else if (vaiTro === "GIANG_VIEN") {
      apiHoSo = "http://localhost:3000/api/giang-vien/ho-so";
    } else {
      console.error("Vai trò không được hỗ trợ:", vaiTro);
      return;
    }

    // ==================================================
    // GỌI API
    // ==================================================

    const phanHoi = await fetch(apiHoSo, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const duLieu = await phanHoi.json();

    console.log("Phản hồi hồ sơ:", duLieu);

    // ==================================================
    // KIỂM TRA PHẢN HỒI
    // ==================================================

    if (!phanHoi.ok || !duLieu.thanhCong) {
      console.error(
        "Không lấy được hồ sơ:",
        duLieu.thongBao || "Không rõ lỗi"
      );

      return;
    }

    const nguoiDung = duLieu.hoSo;

    if (!nguoiDung) {
      console.error("Backend không trả về dữ liệu hồ sơ.");
      return;
    }

    // ==================================================
    // XÁC ĐỊNH HỌ TÊN
    // ==================================================

    const hoTen =
      nguoiDung.HO_TEN ||
      nguoiDung.hoTen ||
      "Chưa cập nhật";

    // ==================================================
    // XÁC ĐỊNH MÃ NGƯỜI DÙNG
    // ==================================================

    let maNguoiDung = "Chưa cập nhật";

    if (vaiTro === "SINH_VIEN") {
      maNguoiDung =
        nguoiDung.MA_SINH_VIEN ||
        nguoiDung.maSinhVien ||
        "Chưa cập nhật";
    }

    if (vaiTro === "GIANG_VIEN") {
      maNguoiDung =
        nguoiDung.MA_GIANG_VIEN ||
        nguoiDung.maGiangVien ||
        "Chưa cập nhật";
    }

    // ==================================================
    // HEADER
    // ==================================================

    const tenHeader =
      document.querySelector(".ten span:first-child");

    const maHeader =
      document.querySelector(".ten span:nth-child(2)");

    const hoTenDropdown =
      document.querySelector(".ho-ten strong");

    const taiKhoanDropdown =
      document.querySelector(".tai-khoan strong");

    // Họ tên trên header
    if (tenHeader) {
      tenHeader.textContent = hoTen;
    }

    // Mã sinh viên / mã giảng viên trên header
    if (maHeader) {
      maHeader.textContent = maNguoiDung;
    }

    // Họ tên trong dropdown
    if (hoTenDropdown) {
      hoTenDropdown.textContent = hoTen;
    }

    // Tài khoản trong dropdown
    if (taiKhoanDropdown) {
      taiKhoanDropdown.textContent = maNguoiDung;
    }

    // ==================================================
    // THÔNG TIN NGƯỜI DÙNG
    // ==================================================

    const tenSinhVien =
      document.querySelector(".thong-tin-sinh-vien h3");

    const maSinhVien =
      document.querySelector(".thong-tin-sinh-vien .ma-sv");

    if (tenSinhVien) {
      tenSinhVien.textContent = hoTen;
    }

    if (maSinhVien) {
      maSinhVien.textContent = maNguoiDung;
    }

    // ==================================================
    // CÁC DÒNG THÔNG TIN
    // ==================================================

    const cacDongThongTin =
      document.querySelectorAll(".ds-thong-tin > div");

    // --------------------------------------------------
    // SINH VIÊN
    // --------------------------------------------------

    if (vaiTro === "SINH_VIEN") {
      /*
        0 = Lớp
        1 = Ngành
        2 = Niên khóa
        3 = Khoa
        4 = Trạng thái
      */

      if (cacDongThongTin[0]) {
        const o = cacDongThongTin[0].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.LOP_HOC ||
            nguoiDung.lopHoc ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[1]) {
        const o = cacDongThongTin[1].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.NGANH_HOC ||
            nguoiDung.nganhHoc ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[2]) {
        const o = cacDongThongTin[2].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.NIEN_KHOA ||
            nguoiDung.nienKhoa ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[3]) {
        const o = cacDongThongTin[3].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.KHOA ||
            nguoiDung.khoa ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[4]) {
        const o = cacDongThongTin[4].querySelector("strong");

        if (o) {
          o.textContent = "Đang học";
        }
      }
    }

    // --------------------------------------------------
    // GIẢNG VIÊN
    // --------------------------------------------------

    if (vaiTro === "GIANG_VIEN") {
      /*
        Với giảng viên, vẫn tận dụng các dòng
        .ds-thong-tin hiện tại.

        0 = Bộ môn / Đơn vị
        1 = Chuyên ngành
        2 = Học vị
        3 = Khoa
        4 = Trạng thái

        Nếu HTML của trang giảng viên đang dùng
        thứ tự khác thì chỉ cần đổi các vị trí [0]...[4].
      */

      if (cacDongThongTin[0]) {
        const o = cacDongThongTin[0].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.BO_MON ||
            nguoiDung.BO_MON_CONG_TAC ||
            nguoiDung.DON_VI ||
            nguoiDung.DON_VI_CONG_TAC ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[1]) {
        const o = cacDongThongTin[1].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.CHUYEN_NGANH ||
            nguoiDung.CHUYEN_MON ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[2]) {
        const o = cacDongThongTin[2].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.HOC_VI ||
            nguoiDung.TRINH_DO ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[3]) {
        const o = cacDongThongTin[3].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.KHOA ||
            nguoiDung.DON_VI ||
            "Chưa cập nhật";
        }
      }

      if (cacDongThongTin[4]) {
        const o = cacDongThongTin[4].querySelector("strong");

        if (o) {
          o.textContent =
            nguoiDung.TRANG_THAI ||
            "Đang công tác";
        }
      }
    }

  } catch (error) {
    console.error(
      "Lỗi khi lấy thông tin người dùng:",
      error
    );
  }
}


// ======================================================
// ĐĂNG XUẤT
// ======================================================

const nutDangXuat =
  document.querySelector(".dang-xuat");

if (nutDangXuat) {
  nutDangXuat.addEventListener(
    "click",
    async function (event) {

      event.preventDefault();

      try {
        // ==================================================
        // LẤY ID PHIÊN ĐĂNG NHẬP
        // ==================================================

        const idPhien =
          localStorage.getItem("idPhien") ||
          sessionStorage.getItem("idPhien");

        console.log(
          "ID phiên đăng xuất:",
          idPhien
        );

        // ==================================================
        // BÁO BACKEND CHUYỂN PHIÊN SANG OFFLINE
        // ==================================================

        if (idPhien) {

          const phanHoi = await fetch(
            "http://localhost:3000/api/dang-xuat",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                idPhien: Number(idPhien),
              }),
            }
          );

          const duLieu =
            await phanHoi.json();

          console.log(
            "Kết quả đăng xuất:",
            duLieu
          );
        }

      } catch (error) {

        console.error(
          "Lỗi đăng xuất:",
          error
        );

      } finally {

        // ==================================================
        // XÓA LOCAL STORAGE
        // ==================================================

        localStorage.removeItem("token");
        localStorage.removeItem("taiKhoan");
        localStorage.removeItem("idPhien");
        localStorage.removeItem("ghiNhoDangNhap");

        // ==================================================
        // XÓA SESSION STORAGE
        // ==================================================

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("taiKhoan");
        sessionStorage.removeItem("idPhien");

        // ==================================================
        // CHUYỂN VỀ TRANG ĐĂNG NHẬP
        // ==================================================

        window.location.href =
          window.location.origin +
          "/Fontend/index.html";
      }
    }
  );
}


// ======================================================
// LẤY THỐNG KÊ TRUY CẬP
// ======================================================

async function layThongKeTruyCap() {

  try {

    // ==================================================
    // GỌI API THỐNG KÊ
    // ==================================================

    const phanHoi = await fetch(
      "http://localhost:3000/api/thong-ke-truy-cap"
    );

    const duLieu =
      await phanHoi.json();

    console.log(
      "Thống kê truy cập từ backend:",
      duLieu
    );

    // ==================================================
    // KIỂM TRA PHẢN HỒI
    // ==================================================

    if (
      !phanHoi.ok ||
      !duLieu.thanhCong
    ) {

      console.error(
        "Không lấy được thống kê truy cập:",
        duLieu.thongBao
      );

      return;
    }

    // ==================================================
    // LẤY CÁC Ô HIỂN THỊ TRÊN FOOTER
    // ==================================================

    const tongTruyCap =
      document.getElementById(
        "tong-truy-cap"
      );

    const dangOnline =
      document.getElementById(
        "dang-online"
      );

    const tongSinhVien =
      document.getElementById(
        "tong-sinh-vien"
      );

    const tongGiangVien =
      document.getElementById(
        "tong-giang-vien"
      );

    // ==================================================
    // HIỂN THỊ TỔNG TRUY CẬP
    // ==================================================

    if (tongTruyCap) {

      tongTruyCap.textContent =
        Number(
          duLieu.thongKe.tongTruyCap
        ).toLocaleString("vi-VN");
    }

    // ==================================================
    // HIỂN THỊ ĐANG ONLINE
    // ==================================================

    if (dangOnline) {

      dangOnline.textContent =
        Number(
          duLieu.thongKe.dangOnline
        ).toLocaleString("vi-VN");
    }

    // ==================================================
    // HIỂN THỊ TỔNG SINH VIÊN
    // ==================================================

    if (tongSinhVien) {

      tongSinhVien.textContent =
        Number(
          duLieu.thongKe.sinhVien
        ).toLocaleString("vi-VN");
    }

    // ==================================================
    // HIỂN THỊ TỔNG GIẢNG VIÊN
    // ==================================================

    if (tongGiangVien) {

      tongGiangVien.textContent =
        Number(
          duLieu.thongKe.giangVien
        ).toLocaleString("vi-VN");
    }

  } catch (error) {

    console.error(
      "Lỗi lấy thống kê truy cập:",
      error
    );
  }
}


// ======================================================
// KHI TRANG ĐÃ TẢI XONG
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    // Tự động nhận biết sinh viên / giảng viên
    layThongTinNguoiDung();

    // Lấy thống kê truy cập
    layThongKeTruyCap();
  }
);
