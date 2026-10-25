// ============================================================
// DANH SÁCH SINH VIÊN - GIẢNG VIÊN
// ============================================================

// ============================================================
// 1. HEADER - THÔNG TIN
// ============================================================

const muiTenThongTin = document.querySelector(".thong-tin");

const khungThongTinChiTiet = document.querySelector(".thong-tin-chi-tiet");

const iconMuiTen = document.querySelector(".thong-tin > .fa-caret-down");

if (muiTenThongTin && khungThongTinChiTiet) {
  muiTenThongTin.addEventListener("click", function (e) {
    khungThongTinChiTiet.classList.toggle("show");

    if (iconMuiTen) {
      iconMuiTen.classList.toggle("active");
    }

    e.stopPropagation();
  });

  khungThongTinChiTiet.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("click", function () {
    khungThongTinChiTiet.classList.remove("show");

    if (iconMuiTen) {
      iconMuiTen.classList.remove("active");
    }
  });
}

// ============================================================
// 2. API
// ============================================================

const API_BASE_URL = "";

const API_DANH_SACH_SINH_VIEN = `${API_BASE_URL}/api/giang-vien/danh-sach-sinh-vien`;

const API_THONG_KE_SINH_VIEN = `${API_BASE_URL}/api/giang-vien/danh-sach-sinh-vien/thong-ke`;

const API_CHI_TIET_SINH_VIEN = `${API_BASE_URL}/api/giang-vien/sinh-vien`;

const API_XUAT_EXCEL = `${API_BASE_URL}/api/giang-vien/danh-sach-sinh-vien/xuat-excel`;

const API_XUAT_PDF = `${API_BASE_URL}/api/giang-vien/danh-sach-sinh-vien/xuat-pdf`;

// ============================================================
// 3. DỮ LIỆU
// ============================================================

let danhSachSinhVien = [];

let trangHienTai = 1;

let soBanGhiMoiTrang = 5;

let tongSoSinhVien = 0;

let tongSoTrang = 1;

// ============================================================
// 4. TOKEN
// ============================================================

function layToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// ============================================================
// 5. DOM
// ============================================================

function layTbody() {
  return document.querySelector(".bang-du-lieu table tbody");
}

function layNutTimKiem() {
  return document.querySelector(".nut-tim-kiem");
}

function layNutDatLai() {
  return document.querySelector(".nut-dat-lai");
}

// ============================================================
// 6. ESCAPE HTML
// ============================================================

function escapeHTML(giaTri) {
  if (giaTri === null || giaTri === undefined) {
    return "";
  }

  return String(giaTri)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// 7. CHUẨN HÓA
// ============================================================

function chuanHoaChuoi(chuoi) {
  return String(chuoi ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ============================================================
// 8. CLASS TRẠNG THÁI
// ============================================================

function layClassTrangThai(trangThai) {
  const giaTri = chuanHoaChuoi(trangThai);

  if (giaTri === "xuat sac" || giaTri === "gioi" || giaTri === "kha") {
    return "trang-thai-kha";
  }

  if (giaTri === "trung binh kha") {
    return "trang-thai-trung-binh-kha";
  }

  if (giaTri === "trung binh") {
    return "trang-thai-trung-binh";
  }

  if (giaTri === "canh bao") {
    return "trang-thai-canh-bao";
  }

  return "trang-thai-trung-binh";
}

// ============================================================
// 9. HIỂN THỊ THỐNG KÊ
// ============================================================

function hienThiThongKeSinhVien(thongKe) {
  if (!thongKe) {
    return;
  }

  const cacThe = document.querySelectorAll(".the-thong-ke");

  if (cacThe.length < 5) {
    console.warn("Không tìm thấy đủ 5 thẻ thống kê.");

    return;
  }

  const giaTri = [
    thongKe.tongSinhVien,
    thongKe.sinhVienNam1,
    thongKe.sinhVienNam2,
    thongKe.sinhVienNam3,
    thongKe.sinhVienNam4,
  ];

  giaTri.forEach(function (so, index) {
    const h2 = cacThe[index].querySelector("h2");

    if (h2) {
      h2.textContent = Number(so || 0).toLocaleString("vi-VN");
    }
  });
}

// ============================================================
// 10. TẢI THỐNG KÊ
// ============================================================

async function taiThongKeSinhVien() {
  const token = layToken();

  if (!token) {
    console.warn("Không có token đăng nhập.");

    return false;
  }

  try {
    const response = await fetch(API_THONG_KE_SINH_VIEN, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể tải thống kê sinh viên.");
    }

    hienThiThongKeSinhVien(data.thongKe);

    console.log("THỐNG KÊ SINH VIÊN:", data.thongKe);

    return true;
  } catch (error) {
    console.error("Lỗi tải thống kê sinh viên:", error);

    return false;
  }
}

// ============================================================
// 11. RENDER BẢNG
// ============================================================

function renderDanhSachSinhVien() {
  const tbody = layTbody();

  if (!tbody) {
    console.error("Không tìm thấy tbody của bảng sinh viên.");

    return;
  }

  tbody.innerHTML = "";

  if (danhSachSinhVien.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="9"
          style="
            text-align:center;
            padding:30px;
          "
        >
          Không có sinh viên phù hợp.
        </td>
      </tr>
    `;

    return;
  }

  danhSachSinhVien.forEach(function (sinhVien, index) {
    const tr = document.createElement("tr");

    const stt = (trangHienTai - 1) * soBanGhiMoiTrang + index + 1;

    const gpa =
      sinhVien.gpaHienTai !== null && sinhVien.gpaHienTai !== undefined
        ? Number(sinhVien.gpaHienTai).toFixed(2)
        : "-";

    const trangThai = sinhVien.trangThai || "Chưa xác định";

    const classTrangThai =
      sinhVien.classTrangThai || layClassTrangThai(trangThai);

    tr.innerHTML = `
        <td>
          ${stt}
        </td>

        <td>
          ${escapeHTML(sinhVien.maSinhVien)}
        </td>

        <td>
          ${escapeHTML(sinhVien.hoTen)}
        </td>

        <td>
          ${escapeHTML(sinhVien.lopHoc)}
        </td>

        <td>
          ${escapeHTML(sinhVien.khoaHoc)}
        </td>

        <td>
          ${escapeHTML(sinhVien.nganhHoc)}
        </td>

        <td>
          ${gpa}
        </td>

        <td>
          <span
            class="trang-thai ${classTrangThai}"
          >
            ${escapeHTML(trangThai)}
          </span>
        </td>

        <td class="cot-thao-tac">

          <button
            type="button"
            class="nut-hanh-dong-nho nut-xem-chi-tiet"
            title="Xem"
            data-id="${Number(sinhVien.idSinhVien)}"
          >
            <i
              class="fa-solid fa-eye"
            ></i>
          </button>

        </td>
      `;

    tbody.appendChild(tr);
  });
}

// ============================================================
// 12. PHÂN TRANG
// ============================================================

function renderPhanTrang() {
  const khung = document.querySelector(".phan-trang");

  if (!khung) {
    return;
  }

  const moTa = khung.querySelector("span");

  const khungNut = khung.querySelector(".nut-phan-trang");

  if (!khungNut) {
    return;
  }

  const tu =
    tongSoSinhVien === 0 ? 0 : (trangHienTai - 1) * soBanGhiMoiTrang + 1;

  const den = Math.min(trangHienTai * soBanGhiMoiTrang, tongSoSinhVien);

  if (moTa) {
    moTa.textContent = `Hiển thị ${tu} đến ${den} của ${tongSoSinhVien} bản ghi`;
  }

  khungNut.innerHTML = "";

  // Trước

  const nutTruoc = document.createElement("button");

  nutTruoc.type = "button";

  nutTruoc.className = "trang";

  nutTruoc.innerHTML = "&lt;";

  nutTruoc.disabled = trangHienTai <= 1;

  nutTruoc.addEventListener("click", function () {
    if (trangHienTai <= 1) {
      return;
    }

    trangHienTai--;

    taiDanhSachSinhVien();
  });

  khungNut.appendChild(nutTruoc);

  if (tongSoTrang <= 0) {
    return;
  }

  for (let i = 1; i <= tongSoTrang; i++) {
    const nut = document.createElement("button");

    nut.type = "button";

    nut.className = "trang";

    nut.textContent = i;

    if (i === trangHienTai) {
      nut.classList.add("active");
    }

    nut.addEventListener("click", function () {
      if (i === trangHienTai) {
        return;
      }

      trangHienTai = i;

      taiDanhSachSinhVien();
    });

    khungNut.appendChild(nut);
  }

  // Sau

  const nutSau = document.createElement("button");

  nutSau.type = "button";

  nutSau.className = "trang";

  nutSau.innerHTML = "&gt;";

  nutSau.disabled = trangHienTai >= tongSoTrang;

  nutSau.addEventListener("click", function () {
    if (trangHienTai >= tongSoTrang) {
      return;
    }

    trangHienTai++;

    taiDanhSachSinhVien();
  });

  khungNut.appendChild(nutSau);
}

// ============================================================
// 13. TẢI DANH SÁCH
// ============================================================

async function taiDanhSachSinhVien() {
  const token = layToken();

  if (!token) {
    console.warn("Không tìm thấy token.");

    return false;
  }

  try {
    const tuKhoa =
      document.getElementById("tim-kiem-sinh-vien")?.value.trim() || "";

    const khoa = document.getElementById("chon-khoa")?.value || "";

    const lop = document.getElementById("chon-lop")?.value || "";

    const nganh = document.getElementById("chon-nganh")?.value || "";

    const trangThai = document.getElementById("chon-trang-thai")?.value || "";

    const params = new URLSearchParams();

    params.set("trang", String(trangHienTai));

    params.set("soBanGhi", String(soBanGhiMoiTrang));

    if (tuKhoa) {
      params.set("tuKhoa", tuKhoa);
    }

    if (khoa) {
      params.set("khoa", khoa);
    }

    if (lop) {
      params.set("lop", lop);
    }

    if (nganh) {
      params.set("nganh", nganh);
    }

    if (trangThai) {
      params.set("trangThai", trangThai);
    }

    const response = await fetch(
      `${API_DANH_SACH_SINH_VIEN}?${params.toString()}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể tải danh sách sinh viên.");
    }

    danhSachSinhVien = Array.isArray(data.sinhVien) ? data.sinhVien : [];

    tongSoSinhVien = Number(data.phanTrang?.tongSo || 0);

    tongSoTrang = Number(data.phanTrang?.tongSoTrang || 0);

    trangHienTai = Number(data.phanTrang?.trangHienTai || 1);

    soBanGhiMoiTrang = Number(
      data.phanTrang?.soBanGhiMoiTrang || soBanGhiMoiTrang,
    );

    renderDanhSachSinhVien();

    renderPhanTrang();

    console.log("DANH SÁCH SINH VIÊN:", data);

    return true;
  } catch (error) {
    console.error("Lỗi tải danh sách sinh viên:", error);

    const tbody = layTbody();

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td
            colspan="9"
            style="
              text-align:center;
              padding:30px;
              color:#b91c1c;
            "
          >
            Không thể tải danh sách sinh viên.
          </td>
        </tr>
      `;
    }

    return false;
  }
}

// ============================================================
// 14. LẤY BỘ LỌC HIỆN TẠI
// ============================================================

function layThamSoXuatBaoCao() {
  const params = new URLSearchParams();

  const tuKhoa =
    document.getElementById("tim-kiem-sinh-vien")?.value.trim() || "";

  const khoa = document.getElementById("chon-khoa")?.value || "";

  const lop = document.getElementById("chon-lop")?.value || "";

  const nganh = document.getElementById("chon-nganh")?.value || "";

  const trangThai = document.getElementById("chon-trang-thai")?.value || "";

  if (tuKhoa) {
    params.set("tuKhoa", tuKhoa);
  }

  if (khoa) {
    params.set("khoa", khoa);
  }

  if (lop) {
    params.set("lop", lop);
  }

  if (nganh) {
    params.set("nganh", nganh);
  }

  if (trangThai) {
    params.set("trangThai", trangThai);
  }

  return params;
}

// ============================================================
// TẢI FILE TỪ BACKEND
// ============================================================

async function taiFileBaoCao(
  apiURL,
  tenFileMacDinh,
) {
  const token =
    layToken();

  if (!token) {
    alert(
      "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.",
    );

    return;
  }

  try {
    const params =
      layThamSoXuatBaoCao();

    const url =
      `${apiURL}?${params.toString()}`;

    const response =
      await fetch(
        url,
        {
          method:
            "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/octet-stream",
          },
        },
      );

    if (!response.ok) {
      let thongBao =
        "Không thể tải báo cáo.";

      try {
        const data =
          await response.json();

        thongBao =
          data?.thongBao ||
          thongBao;
      } catch {
        // Backend trả file/lỗi khác JSON
      }

      throw new Error(
        thongBao,
      );
    }

    const blob =
      await response.blob();

    if (
      !blob ||
      blob.size === 0
    ) {
      throw new Error(
        "File báo cáo rỗng.",
      );
    }

    // ========================================================
    // LẤY TÊN FILE TỪ HEADER
    // ========================================================

    let tenFile =
      tenFileMacDinh;

    const contentDisposition =
      response.headers.get(
        "Content-Disposition",
      );

    if (
      contentDisposition
    ) {
      const ketQua =
        contentDisposition.match(
          /filename="([^"]+)"/i,
        );

      if (
        ketQua &&
        ketQua[1]
      ) {
        tenFile =
          ketQua[1];
      }
    }

    // ========================================================
    // TẢI FILE
    // ========================================================

    const blobURL =
      window.URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href =
      blobURL;

    link.download =
      tenFile;

    document.body.appendChild(
      link,
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      blobURL,
    );
  } catch (error) {
    console.error(
      "Lỗi tải báo cáo:",
      error,
    );

    alert(
      error.message ||
        "Không thể tải báo cáo.",
    );
  }
}

// ============================================================
// 15. XUẤT EXCEL
// ============================================================

const nutXuatExcel =
  document.querySelector(
    ".nut-xuat-excel",
  );

if (nutXuatExcel) {
  nutXuatExcel.addEventListener(
    "click",
    async function () {
      nutXuatExcel.disabled =
        true;

      const noiDungCu =
        nutXuatExcel.innerHTML;

      nutXuatExcel.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Đang xuất...
      `;

      try {
        await taiFileBaoCao(
          API_XUAT_EXCEL,
          "danh-sach-sinh-vien.xlsx",
        );
      } finally {
        nutXuatExcel.disabled =
          false;

        nutXuatExcel.innerHTML =
          noiDungCu;
      }
    },
  );
}

// ============================================================
// 16. XUẤT PDF
// ============================================================

const nutXuatPDF =
  document.querySelector(
    ".nut-xuat-pdf",
  );

if (nutXuatPDF) {
  nutXuatPDF.addEventListener(
    "click",
    async function () {
      nutXuatPDF.disabled =
        true;

      const noiDungCu =
        nutXuatPDF.innerHTML;

      nutXuatPDF.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Đang xuất...
      `;

      try {
        await taiFileBaoCao(
          API_XUAT_PDF,
          "danh-sach-sinh-vien.pdf",
        );
      } finally {
        nutXuatPDF.disabled =
          false;

        nutXuatPDF.innerHTML =
          noiDungCu;
      }
    },
  );
}

// ============================================================
// 14. RESET
// ============================================================

function datLaiBoLoc() {
  const oTimKiem = document.getElementById("tim-kiem-sinh-vien");

  const chonKhoa = document.getElementById("chon-khoa");

  const chonLop = document.getElementById("chon-lop");

  const chonNganh = document.getElementById("chon-nganh");

  const chonTrangThai = document.getElementById("chon-trang-thai");

  if (oTimKiem) {
    oTimKiem.value = "";
  }

  if (chonKhoa) {
    chonKhoa.value = "";
  }

  if (chonLop) {
    chonLop.value = "";
  }

  if (chonNganh) {
    chonNganh.value = "";
  }

  if (chonTrangThai) {
    chonTrangThai.value = "";
  }

  trangHienTai = 1;

  taiDanhSachSinhVien();
}

// ============================================================
// 15. XEM CHI TIẾT
// ============================================================

async function xemChiTietSinhVien(idSinhVien) {
  const token = layToken();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");

    return;
  }

  const id = Number(idSinhVien);

  if (!Number.isInteger(id) || id <= 0) {
    console.error("ID sinh viên không hợp lệ:", idSinhVien);

    return;
  }

  try {
    const response = await fetch(`${API_CHI_TIET_SINH_VIEN}/${id}`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể tải chi tiết sinh viên.");
    }

    hienThiModalChiTietSinhVien(data.sinhVien);
  } catch (error) {
    console.error("Lỗi xem chi tiết sinh viên:", error);

    alert(error.message || "Không thể tải chi tiết sinh viên.");
  }
}

// ============================================================
// 16. TẠO MODAL
// ============================================================

function taoModalChiTiet() {
  let modal = document.getElementById("modal-chi-tiet-sinh-vien");

  if (modal) {
    return modal;
  }

  modal = document.createElement("div");

  modal.id = "modal-chi-tiet-sinh-vien";

  modal.innerHTML = `
    <div
      class="lop-phu-chi-tiet-sinh-vien"
    ></div>

    <div
      class="khung-chi-tiet-sinh-vien"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tieu-de-chi-tiet-sinh-vien"
    >

      <div
        class="dau-khung-chi-tiet-sinh-vien"
      >

        <div>

          <h2
            id="tieu-de-chi-tiet-sinh-vien"
          >
            Chi tiết sinh viên
          </h2>

          <p>
            Thông tin học tập và kết quả dự đoán
          </p>

        </div>

        <button
          type="button"
          class="nut-dong-chi-tiet-sinh-vien"
          aria-label="Đóng"
        >
          <i
            class="fa-solid fa-xmark"
          ></i>
        </button>

      </div>

      <div
        class="noi-dung-chi-tiet-sinh-vien"
      ></div>

    </div>
  `;

  document.body.appendChild(modal);

  const lopPhu = modal.querySelector(".lop-phu-chi-tiet-sinh-vien");

  const nutDong = modal.querySelector(".nut-dong-chi-tiet-sinh-vien");

  if (lopPhu) {
    lopPhu.addEventListener("click", dongModalChiTietSinhVien);
  }

  if (nutDong) {
    nutDong.addEventListener("click", dongModalChiTietSinhVien);
  }

  return modal;
}

// ============================================================
// 17. ĐÓNG MODAL
// ============================================================

function dongModalChiTietSinhVien() {
  const modal = document.getElementById("modal-chi-tiet-sinh-vien");

  if (!modal) {
    return;
  }

  modal.classList.remove("dang-mo");

  document.body.style.overflow = "";
}

// ============================================================
// 18. HIỂN THỊ MODAL
// ============================================================

function hienThiModalChiTietSinhVien(sinhVien) {
  if (!sinhVien) {
    return;
  }

  const modal = taoModalChiTiet();

  const noiDung = modal.querySelector(".noi-dung-chi-tiet-sinh-vien");

  if (!noiDung) {
    return;
  }

  /* ========================================================
     GPA DỰ ĐOÁN HỌC KỲ
  ======================================================== */

  const duDoanHocKyHTML = sinhVien.duDoanHocKy
    ? `
        <div
          class="dong-thong-tin-chi-tiet"
        >

          <span>
            GPA dự đoán học kỳ
          </span>

          <strong>
            ${Number(sinhVien.duDoanHocKy.gpa).toFixed(2)}
          </strong>

        </div>
      `
    : "";

  /* ========================================================
     GPA HỌC KỲ TIẾP THEO
  ======================================================== */

  let duDoanTiepTheoHTML = "";

  if (sinhVien.duDoanHocKyTiepTheo) {
    const duDoan = sinhVien.duDoanHocKyTiepTheo;

    duDoanTiepTheoHTML = `
      <div
        class="khung-du-doan-chi-tiet"
      >

        <div>

          <span>
            GPA học kỳ tiếp theo
          </span>

          <strong>
            ${Number(duDoan.gpa).toFixed(2)}
          </strong>

        </div>

        <small>
          HK${Number(duDoan.hocKy)}
        </small>

      </div>
    `;
  } else {
    duDoanTiepTheoHTML = `
      <div
        class="khong-co-du-doan-chi-tiet"
      >
        Sinh viên chưa dự đoán GPA học kỳ tiếp theo.
      </div>
    `;
  }

  /* ========================================================
     TRẠNG THÁI
  ======================================================== */

  const trangThai = sinhVien.trangThai || "Chưa xác định";

  const classTrangThai =
    sinhVien.classTrangThai || layClassTrangThai(trangThai);

  /* ========================================================
     HTML MODAL
     
     ĐÃ BỎ:
     - GPA các học kỳ
     - danh sách HK1, HK2, HK3...
     ======================================================== */

  noiDung.innerHTML = `
    <div
      class="thong-tin-ca-nhan-chi-tiet"
    >

      <div
        class="dong-thong-tin-chi-tiet"
      >
        <span>
          Mã sinh viên
        </span>

        <strong>
          ${escapeHTML(sinhVien.maSinhVien)}
        </strong>
      </div>

      <div
        class="dong-thong-tin-chi-tiet"
      >
        <span>
          Họ và tên
        </span>

        <strong>
          ${escapeHTML(sinhVien.hoTen)}
        </strong>
      </div>

      <div
        class="dong-thong-tin-chi-tiet"
      >
        <span>
          Lớp
        </span>

        <strong>
          ${escapeHTML(sinhVien.lopHoc)}
        </strong>
      </div>

      <div
        class="dong-thong-tin-chi-tiet"
      >
        <span>
          Khóa
        </span>

        <strong>
          ${escapeHTML(sinhVien.khoaHoc)}
        </strong>
      </div>

      <div
        class="dong-thong-tin-chi-tiet"
      >
        <span>
          Ngành học
        </span>

        <strong>
          ${escapeHTML(sinhVien.nganhHoc)}
        </strong>
      </div>

    </div>

    ${duDoanHocKyHTML}

    ${duDoanTiepTheoHTML}

    <div
      class="trang-thai-chi-tiet"
    >

      <span>
        Trạng thái hiện tại
      </span>

      <strong
        class="trang-thai ${classTrangThai}"
      >
        ${escapeHTML(trangThai)}
      </strong>

    </div>
  `;

  modal.classList.add("dang-mo");

  document.body.style.overflow = "hidden";
}

// ============================================================
// 19. CLICK TRÊN BẢNG
// ============================================================

document.addEventListener("click", function (event) {
  const nutXem = event.target.closest(".nut-xem-chi-tiet");

  if (nutXem) {
    xemChiTietSinhVien(Number(nutXem.dataset.id));

    return;
  }

  const nutPhanTich = event.target.closest(".nut-phan-tich-sinh-vien");

  if (nutPhanTich) {
    console.log("Nút phân tích được chọn:", Number(nutPhanTich.dataset.id));

    return;
  }
});

// ============================================================
// 20. TÌM KIẾM
// ============================================================

const nutTimKiem = layNutTimKiem();

if (nutTimKiem) {
  nutTimKiem.addEventListener("click", function () {
    trangHienTai = 1;

    taiDanhSachSinhVien();
  });
}

// ============================================================
// 21. ENTER
// ============================================================

const oTimKiem = document.getElementById("tim-kiem-sinh-vien");

if (oTimKiem) {
  oTimKiem.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      trangHienTai = 1;

      taiDanhSachSinhVien();
    }
  });
}

// ============================================================
// 22. ĐẶT LẠI
// ============================================================

const nutDatLai = layNutDatLai();

if (nutDatLai) {
  nutDatLai.addEventListener("click", datLaiBoLoc);
}

// ============================================================
// 23. SỐ BẢN GHI
// ============================================================

const selectSoBanGhi = document.getElementById("so-ban-ghi");

if (selectSoBanGhi) {
  selectSoBanGhi.addEventListener("change", function () {
    const giaTri = Number(selectSoBanGhi.value);

    if (![5, 10].includes(giaTri)) {
      soBanGhiMoiTrang = 5;
    } else {
      soBanGhiMoiTrang = giaTri;
    }

    trangHienTai = 1;

    taiDanhSachSinhVien();
  });
}

// ============================================================
// 24. BỘ LỌC
// ============================================================

const chonKhoa = document.getElementById("chon-khoa");

const chonLop = document.getElementById("chon-lop");

const chonNganh = document.getElementById("chon-nganh");

const chonTrangThai = document.getElementById("chon-trang-thai");

[chonKhoa, chonLop, chonNganh, chonTrangThai].forEach(function (select) {
  if (!select) {
    return;
  }

  select.addEventListener("change", function () {
    trangHienTai = 1;

    taiDanhSachSinhVien();
  });
});

// ============================================================
// 25. KHỞI TẠO
// ============================================================

async function khoiTaoTrang() {
  console.log("DANH SÁCH SINH VIÊN - KHỞI TẠO");

  if (selectSoBanGhi) {
    const giaTri = Number(selectSoBanGhi.value);

    if ([5, 10].includes(giaTri)) {
      soBanGhiMoiTrang = giaTri;
    }
  }

  await taiDanhSachSinhVien();

  await taiThongKeSinhVien();

  console.log("DANH SÁCH SINH VIÊN - HOÀN TẤT");
}

// ============================================================
// 26. DOM READY
// ============================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", khoiTaoTrang, {
    once: true,
  });
} else {
  khoiTaoTrang();
}
