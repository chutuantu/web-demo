// ============================================================
// STUDYAI - GIẢNG VIÊN
// QUẢN LÝ TÀI LIỆU
// ============================================================

// ============================================================
// 1. API
// ============================================================

const API_BASE_URL = "http://localhost:3000";

const API_TAI_NGUYEN = `${API_BASE_URL}/api/giang-vien/tai-nguyen`;

const API_TAI_NGUYEN_UPLOAD = `${API_BASE_URL}/api/giang-vien/tai-nguyen/upload`;

// ============================================================
// 2. BIẾN DỮ LIỆU
// ============================================================

let danhSachTaiNguyen = [];

let danhSachTaiNguyenLoc = [];

let danhSachTaiNguyenDangChon = new Set();

let trangHienTai = 1;

let soBanGhiMoiTrang = 5;

let tongSoTrang = 1;

let itemDangSua = null;

// ============================================================
// 3. HEADER - THÔNG TIN
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
// 4. TOKEN
// ============================================================

function layTokenTaiLieu() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// ============================================================
// 5. ESCAPE HTML
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
// 6. CHUẨN HÓA CHUỖI
// ============================================================

function chuanHoaChuoi(chuoi) {
  return String(chuoi || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ============================================================
// 7. FORMAT
// ============================================================

function dinhDangSo(giaTri) {
  return Number(giaTri || 0).toLocaleString("vi-VN");
}

function dinhDangNgay(giaTri) {
  if (!giaTri) {
    return "-";
  }

  const ngay = new Date(giaTri);

  if (Number.isNaN(ngay.getTime())) {
    return String(giaTri);
  }

  return ngay.toLocaleDateString("vi-VN");
}

function dinhDangNgayGio(giaTri) {
  if (!giaTri) {
    return "-";
  }

  const ngay = new Date(giaTri);

  if (Number.isNaN(ngay.getTime())) {
    return String(giaTri);
  }

  return `${ngay.toLocaleDateString(
    "vi-VN",
  )}<br><small>${ngay.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}</small>`;
}

// ============================================================
// 8. DUNG LƯỢNG
// ============================================================

function dinhDangDungLuong(bytes) {
  const giaTri = Number(bytes);

  if (!Number.isFinite(giaTri) || giaTri <= 0) {
    return "-";
  }

  const donVi = ["Bytes", "KB", "MB", "GB"];

  let so = giaTri;

  let i = 0;

  while (so >= 1024 && i < donVi.length - 1) {
    so /= 1024;

    i++;
  }

  return `${so.toFixed(i === 0 ? 0 : 2)} ${donVi[i]}`;
}

// ============================================================
// 9. LOẠI TÀI NGUYÊN
// ============================================================

function layTenLoai(loai) {
  const giaTri = String(loai || "").toUpperCase();

  if (giaTri === "TAI_LIEU") {
    return "Tài liệu";
  }

  if (giaTri === "VIDEO") {
    return "Video";
  }

  if (giaTri === "WEBSITE") {
    return "Link";
  }

  return "Khác";
}

// ============================================================
// 10. ICON LOẠI
// ============================================================

function layIconLoai(item) {
  const loai = String(item.loaiTaiNguyen || "").toUpperCase();

  const duoi = String(item.duoiFile || "").toLowerCase();

  if (loai === "VIDEO") {
    return {
      className: "video",
      icon: "video",
    };
  }

  if (loai === "WEBSITE") {
    return {
      className: "link",
      icon: "link",
    };
  }

  if (duoi === "ppt" || duoi === "pptx") {
    return {
      className: "pptx",
      icon: "presentation",
    };
  }

  if (duoi === "doc" || duoi === "docx") {
    return {
      className: "word",
      icon: "file-text",
    };
  }

  return {
    className: "pdf",
    icon: "file-type-2",
  };
}

// ============================================================
// 11. CLASS TRẠNG THÁI
// ============================================================

function layClassTrangThai(trangThai) {
  return trangThai ? "status-published" : "status-pending";
}

// ============================================================
// 12. TẢI DANH SÁCH + THỐNG KÊ
// ============================================================

async function taiDuLieuTaiLieu() {
  const token = layTokenTaiLieu();

  if (!token) {
    console.warn("Không tìm thấy token.");

    return false;
  }

  try {
    const response = await fetch(API_TAI_NGUYEN, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      throw new Error("Backend không trả về JSON hợp lệ.");
    }

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể tải danh sách tài liệu.");
    }

    danhSachTaiNguyen = Array.isArray(data.taiNguyen) ? data.taiNguyen : [];

    danhSachTaiNguyenLoc = [...danhSachTaiNguyen];

    capNhatThongKe(danhSachTaiNguyen, data.thongKe);

    taoLocMonHoc(danhSachTaiNguyen);

    trangHienTai = 1;

    apDungLocVaRender();

    return true;
  } catch (error) {
    console.error("Lỗi tải tài nguyên:", error);

    hienThiLoiTaiLieu(error.message);

    return false;
  }
}

// ============================================================
// 13. HIỂN THỊ LỖI
// ============================================================

function hienThiLoiTaiLieu(thongBao) {
  const tbody = document.querySelector(".table-container tbody");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr>
      <td
        colspan="8"
        style="
          text-align:center;
          padding:35px;
          color:#dc2626;
        "
      >
        ${escapeHTML(thongBao || "Không thể tải dữ liệu.")}
      </td>
    </tr>
  `;
}

// ============================================================
// 14. THỐNG KÊ
// ============================================================

function capNhatThongKe(danhSach, thongKeBackend) {
  const tong = Number(thongKeBackend?.tongTaiNguyen || 0);

  const taiLieu = Number(thongKeBackend?.tongTaiLieu || 0);

  const video = Number(thongKeBackend?.tongVideo || 0);

  const website = Number(thongKeBackend?.tongWebsite || 0);

  const tongCard = document.querySelector(
    ".stat-card:nth-child(2) .stat-value",
  );

  const taiLieuCard = document.querySelector(
    ".stat-card:nth-child(3) .stat-value",
  );

  const videoCard = document.querySelector(
    ".stat-card:nth-child(4) .stat-value",
  );

  const websiteCard = document.querySelector(
    ".stat-card:nth-child(5) .stat-value",
  );

  if (tongCard) {
    tongCard.textContent = dinhDangSo(tong);
  }

  if (taiLieuCard) {
    taiLieuCard.textContent = dinhDangSo(taiLieu);
  }

  if (videoCard) {
    videoCard.textContent = dinhDangSo(video);
  }

  if (websiteCard) {
    websiteCard.textContent = dinhDangSo(website);
  }

  // ==========================================================
  // PHẦN PHỤ
  // ==========================================================

  const cacSub = document.querySelectorAll(".stat-card .stat-sub");

  if (cacSub.length >= 5) {
    const phanTramTaiLieu =
      tong > 0 ? ((taiLieu / tong) * 100).toFixed(1) : "0.0";

    const phanTramVideo = tong > 0 ? ((video / tong) * 100).toFixed(1) : "0.0";

    const phanTramWebsite =
      tong > 0 ? ((website / tong) * 100).toFixed(1) : "0.0";

    cacSub[1].textContent = "Tài liệu đã đăng";

    cacSub[2].textContent = `${phanTramTaiLieu}% tổng số`;

    cacSub[3].textContent = `${phanTramVideo}% tổng số`;

    cacSub[4].textContent = `${phanTramWebsite}% tổng số`;
  }
}

// ============================================================
// 15. TẠO LỌC MÔN HỌC
// ============================================================

function taoLocMonHoc(danhSach) {
  const select = document.getElementById("loc-mon-hoc");

  if (!select) {
    return;
  }

  const monHocMap = new Map();

  danhSach.forEach(function (item) {
    const hocPhan = item.hocPhan;

    if (hocPhan && hocPhan.idHocPhan) {
      monHocMap.set(
        String(hocPhan.idHocPhan),
        hocPhan.tenHocPhan || hocPhan.maHocPhan || "Học phần",
      );
    }
  });

  select.innerHTML = `
      <option value="">
        Tất cả môn học
      </option>
    `;

  Array.from(monHocMap.entries())
    .sort(function (a, b) {
      return a[1].localeCompare(b[1], "vi");
    })
    .forEach(function ([id, ten]) {
      const option = document.createElement("option");

      option.value = id;

      option.textContent = ten;

      select.appendChild(option);
    });
}

// ============================================================
// 16. LỌC + TÌM KIẾM
// ============================================================

function apDungLocVaRender() {
  const oTimKiem = document.getElementById("o-tim-tai-nguyen");

  const locMonHoc = document.getElementById("loc-mon-hoc");

  const locLoai = document.getElementById("loc-loai");

  const locTrangThai = document.getElementById("loc-trang-thai");

  const tuKhoa = chuanHoaChuoi(oTimKiem?.value || "");

  const idHocPhan = locMonHoc?.value || "";

  const loai = String(locLoai?.value || "").toUpperCase();

  const trangThai = locTrangThai?.value || "";

  danhSachTaiNguyenLoc = danhSachTaiNguyen.filter(function (item) {
    // ----------------------------------------------------
    // TỪ KHÓA
    // ----------------------------------------------------

    if (tuKhoa) {
      const chuoi = chuanHoaChuoi(
        [
          item.tenTaiNguyen,

          item.moTa,

          item.hocPhan?.tenHocPhan,

          item.hocPhan?.maHocPhan,

          layTenLoai(item.loaiTaiNguyen),

          item.duoiFile,
        ]
          .filter(Boolean)
          .join(" "),
      );

      if (!chuoi.includes(tuKhoa)) {
        return false;
      }
    }

    // ----------------------------------------------------
    // MÔN HỌC
    // ----------------------------------------------------

    if (
      idHocPhan &&
      String(item.hocPhan?.idHocPhan || "") !== String(idHocPhan)
    ) {
      return false;
    }

    // ----------------------------------------------------
    // LOẠI
    // ----------------------------------------------------

    if (loai && String(item.loaiTaiNguyen || "").toUpperCase() !== loai) {
      return false;
    }

    // ----------------------------------------------------
    // TRẠNG THÁI
    // ----------------------------------------------------

    if (trangThai === "1" && item.trangThai !== true) {
      return false;
    }

    if (trangThai === "0" && item.trangThai !== false) {
      return false;
    }

    return true;
  });

  const tongTrangTinh =
    danhSachTaiNguyenLoc.length === 0
      ? 1
      : Math.ceil(danhSachTaiNguyenLoc.length / soBanGhiMoiTrang);

  tongSoTrang = tongTrangTinh;

  if (trangHienTai > tongSoTrang) {
    trangHienTai = tongSoTrang;
  }

  renderBangTaiNguyen();

  renderPhanTrang();

  capNhatTrangThaiCheckboxTong();
}

// ============================================================
// 17. RENDER BẢNG
// ============================================================

function renderBangTaiNguyen() {
  const tbody = document.querySelector(".table-container tbody");

  if (!tbody) {
    console.warn("Không tìm thấy tbody.");

    return;
  }

  tbody.innerHTML = "";

  if (danhSachTaiNguyenLoc.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="8"
          style="
            text-align:center;
            padding:35px;
            color:#6b7280;
          "
        >
          Không có tài liệu phù hợp.
        </td>
      </tr>
    `;

    taoLucide();

    return;
  }

  const batDau = (trangHienTai - 1) * soBanGhiMoiTrang;

  const ketThuc = batDau + soBanGhiMoiTrang;

  const danhSachHienThi = danhSachTaiNguyenLoc.slice(batDau, ketThuc);

  danhSachHienThi.forEach(function (item, index) {
    const tr = document.createElement("tr");

    const id = Number(item.idTaiNguyen);

    tr.dataset.idTaiNguyen = String(id);

    if (danhSachTaiNguyenDangChon.has(id)) {
      tr.classList.add("dong-duoc-chon");
    }

    const soThuTu = batDau + index + 1;

    const icon = layIconLoai(item);

    const tenHocPhan =
      item.hocPhan?.tenHocPhan || item.hocPhan?.maHocPhan || "-";

    const duoiFile = String(item.duoiFile || "").toUpperCase();

    let hienThiLoai = layTenLoai(item.loaiTaiNguyen);

    if (
      duoiFile &&
      String(item.loaiTaiNguyen || "").toUpperCase() === "TAI_LIEU"
    ) {
      hienThiLoai = duoiFile;
    }

    const trangThai = item.trangThai ? "Đã xuất bản" : "Chờ xuất bản";

    const statusClass = layClassTrangThai(Boolean(item.trangThai));

    const dungLuong = dinhDangDungLuong(item.kichThuocFile);

    tr.innerHTML = `
        <td>
          <input
            type="checkbox"
            class="checkbox-tai-nguyen"
            ${danhSachTaiNguyenDangChon.has(id) ? "checked" : ""}
          />
        </td>

        <td>
          <div class="doc-title-cell">

            <div
              class="doc-type-icon ${icon.className}"
            >
              <i
                data-lucide="${icon.icon}"
              ></i>
            </div>

            <div>
              <div class="doc-name">
                ${escapeHTML(item.tenTaiNguyen || "Tài nguyên")}
              </div>

              <div class="doc-desc">
                ${escapeHTML(item.moTa || "Không có mô tả")}
              </div>
            </div>

          </div>
        </td>

        <td>
          ${escapeHTML(tenHocPhan)}
        </td>

        <td>
          <span
            class="tag tag-${
              String(item.loaiTaiNguyen || "").toLowerCase() === "website"
                ? "link"
                : String(item.loaiTaiNguyen || "").toLowerCase() === "video"
                  ? "video"
                  : duoiFile === "PPTX" || duoiFile === "PPT"
                    ? "pptx"
                    : "pdf"
            }"
          >
            ${escapeHTML(hienThiLoai)}
          </span>
        </td>

        <td>
          ${escapeHTML(dungLuong)}
        </td>

        <td>
          ${dinhDangNgayGio(item.ngayTao)}
        </td>

        <td>
          <span
            class="status ${statusClass}"
          >
            ${trangThai}
          </span>
        </td>

        <td>
          <div
            class="action-buttons"
          >

            <button
              type="button"
              class="btn-action nut-xem-tai-nguyen"
              title="Xem"
              data-id="${id}"
            >
              <i
                <i class="fa-solid fa-eye"></i>
              ></i>
            </button>

            <button
              type="button"
              class="btn-action nut-sua-tai-nguyen"
              title="Sửa"
              data-id="${id}"
            >
              <i class="fa-solid fa-pen"></i>
            </button>

            <button
              type="button"
              class="btn-action danger nut-xoa-tai-nguyen"
              title="Xóa"
              data-id="${id}"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>

            <button
              type="button"
              class="btn-action nut-mo-menu-thao-tac"
              title="Thao tác khác"
              data-id="${id}"
            >
              <i class="fa-solid fa-bars"></i>
            </button>

          </div>
        </td>
      `;

    tbody.appendChild(tr);
  });

  taoLucide();

  ganSuKienCheckboxDong();

  ganSuKienNutThaoTac();
}

// ============================================================
// 18. LUCIDE
// ============================================================

function taoLucide() {
  if (typeof window.lucide === "undefined") {
    return;
  }

  try {
    window.lucide.createIcons();
  } catch (error) {
    console.warn("Không thể render Lucide:", error);
  }
}

// ============================================================
// 19. CHECKBOX TỪNG DÒNG
// ============================================================

function ganSuKienCheckboxDong() {
  const cacCheckbox = document.querySelectorAll(".checkbox-tai-nguyen");

  cacCheckbox.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      const tr = checkbox.closest("tr");

      if (!tr) {
        return;
      }

      const id = Number(tr.dataset.idTaiNguyen);

      if (!Number.isInteger(id) || id <= 0) {
        return;
      }

      if (checkbox.checked) {
        danhSachTaiNguyenDangChon.add(id);

        tr.classList.add("dong-duoc-chon");
      } else {
        danhSachTaiNguyenDangChon.delete(id);

        tr.classList.remove("dong-duoc-chon");
      }

      capNhatTrangThaiCheckboxTong();

      capNhatNutXoaNhieu();
    });
  });
}

// ============================================================
// 20. CHECKBOX TỔNG
// ============================================================

function capNhatTrangThaiCheckboxTong() {
  const checkboxTong = document.querySelector(
    ".table-container thead input[type='checkbox']",
  );

  if (!checkboxTong) {
    return;
  }

  const cacCheckbox = document.querySelectorAll(".checkbox-tai-nguyen");

  if (cacCheckbox.length === 0) {
    checkboxTong.checked = false;

    checkboxTong.indeterminate = false;

    return;
  }

  const soDaChon = Array.from(cacCheckbox).filter(function (checkbox) {
    return checkbox.checked;
  }).length;

  checkboxTong.checked = soDaChon === cacCheckbox.length;

  checkboxTong.indeterminate = soDaChon > 0 && soDaChon < cacCheckbox.length;
}

// ============================================================
// 21. CHECKBOX TỔNG - SỰ KIỆN
// ============================================================

function ganSuKienCheckboxTong() {
  const checkboxTong = document.querySelector(
    ".table-container thead input[type='checkbox']",
  );

  if (!checkboxTong) {
    return;
  }

  checkboxTong.addEventListener("change", function () {
    const cacCheckbox = document.querySelectorAll(".checkbox-tai-nguyen");

    cacCheckbox.forEach(function (checkbox) {
      const tr = checkbox.closest("tr");

      if (!tr) {
        return;
      }

      const id = Number(tr.dataset.idTaiNguyen);

      if (!Number.isInteger(id) || id <= 0) {
        return;
      }

      checkbox.checked = checkboxTong.checked;

      if (checkboxTong.checked) {
        danhSachTaiNguyenDangChon.add(id);

        tr.classList.add("dong-duoc-chon");
      } else {
        danhSachTaiNguyenDangChon.delete(id);

        tr.classList.remove("dong-duoc-chon");
      }
    });

    checkboxTong.indeterminate = false;

    capNhatNutXoaNhieu();
  });
}

// ============================================================
// 22. NÚT XÓA NHIỀU
// ============================================================

function taoNutXoaNhieu() {
  let nut = document.querySelector(".nut-xoa-nhieu-tai-nguyen");

  if (nut) {
    return;
  }

  const filterBar = document.querySelector(".filter-bar");

  if (!filterBar) {
    return;
  }

  nut = document.createElement("button");

  nut.type = "button";

  nut.className = "nut-xoa-nhieu-tai-nguyen";

  nut.disabled = true;

  nut.innerHTML = `
    <i data-lucide="trash-2"></i>
    Xóa đã chọn
  `;

  filterBar.appendChild(nut);

  nut.addEventListener("click", xoaNhieuTaiNguyen);

  taoLucide();

  capNhatNutXoaNhieu();
}

function capNhatNutXoaNhieu() {
  const nut = document.querySelector(".nut-xoa-nhieu-tai-nguyen");

  if (!nut) {
    return;
  }

  const soLuong = danhSachTaiNguyenDangChon.size;

  nut.disabled = soLuong === 0;

  nut.innerHTML =
    soLuong > 0
      ? `
        <i data-lucide="trash-2"></i>
        Xóa đã chọn (${soLuong})
      `
      : `
        <i data-lucide="trash-2"></i>
        Xóa đã chọn
      `;

  taoLucide();
}

// ============================================================
// 23. XÓA NHIỀU
// ============================================================

async function xoaNhieuTaiNguyen() {
  const ids = Array.from(danhSachTaiNguyenDangChon);

  if (ids.length === 0) {
    return;
  }

  const xacNhan = window.confirm(
    `Bạn có chắc muốn xóa ${ids.length} tài nguyên đã chọn không?`,
  );

  if (!xacNhan) {
    return;
  }

  const token = layTokenTaiLieu();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");

    return;
  }

  const nut = document.querySelector(".nut-xoa-nhieu-tai-nguyen");

  if (nut) {
    nut.disabled = true;

    nut.innerHTML = `
      <i data-lucide="loader-circle"></i>
      Đang xóa...
    `;

    taoLucide();
  }

  try {
    const ketQua = await Promise.allSettled(
      ids.map(function (id) {
        return fetch(`${API_TAI_NGUYEN}/${id}`, {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,

            Accept: "application/json",
          },
        }).then(async function (response) {
          let data = null;

          try {
            data = await response.json();
          } catch {
            throw new Error("Backend không trả JSON.");
          }

          if (!response.ok || !data?.thanhCong) {
            throw new Error(data?.thongBao || "Xóa thất bại.");
          }

          return data;
        });
      }),
    );

    const thanhCong = ketQua.filter(
      (item) => item.status === "fulfilled",
    ).length;

    const thatBai = ketQua.length - thanhCong;

    danhSachTaiNguyenDangChon.clear();

    await taiDuLieuTaiLieu();

    if (thatBai === 0) {
      alert(`Đã xóa ${thanhCong} tài nguyên.`);
    } else {
      alert(
        `Đã xóa ${thanhCong} tài nguyên. ${thatBai} tài nguyên chưa xóa được.`,
      );
    }
  } catch (error) {
    console.error("Lỗi xóa nhiều:", error);

    alert(error.message || "Không thể xóa tài nguyên.");
  }

  capNhatNutXoaNhieu();
}

// ============================================================
// 24. XÓA MỘT
// ============================================================

async function xoaMotTaiNguyen(id) {
  const taiNguyen = danhSachTaiNguyen.find(function (item) {
    return Number(item.idTaiNguyen) === Number(id);
  });

  if (!taiNguyen) {
    return;
  }

  const xacNhan = window.confirm(
    `Bạn có chắc muốn xóa "${taiNguyen.tenTaiNguyen}" không?`,
  );

  if (!xacNhan) {
    return;
  }

  const token = layTokenTaiLieu();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");
    return;
  }

  // ==========================================================
  // TÌM HÀNG ĐANG XÓA
  // ==========================================================

  const hangDangXoa = document.querySelector(
    `tr[data-id-tai-nguyen="${Number(id)}"]`,
  );

  // ==========================================================
  // KHÓA NÚT XÓA
  // ==========================================================

  const nutXoa = hangDangXoa?.querySelector(".nut-xoa-tai-nguyen");

  if (nutXoa) {
    nutXoa.disabled = true;

    nutXoa.innerHTML = `
      <i data-lucide="loader-circle"></i>
    `;

    taoLucide();
  }

  try {
    // ========================================================
    // GỌI BACKEND
    // ========================================================

    const response = await fetch(`${API_TAI_NGUYEN}/${Number(id)}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error("Backend không trả về JSON hợp lệ.");
    }

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể xóa tài nguyên.");
    }

    // ========================================================
    // 1. XÓA KHỎI MẢNG DỮ LIỆU FRONTEND
    // ========================================================

    danhSachTaiNguyen = danhSachTaiNguyen.filter(function (item) {
      return Number(item.idTaiNguyen) !== Number(id);
    });

    // ========================================================
    // 2. XÓA KHỎI DANH SÁCH ĐANG LỌC
    // ========================================================

    danhSachTaiNguyenLoc = danhSachTaiNguyenLoc.filter(function (item) {
      return Number(item.idTaiNguyen) !== Number(id);
    });

    // ========================================================
    // 3. BỎ KHỎI DANH SÁCH ĐANG CHỌN
    // ========================================================

    danhSachTaiNguyenDangChon.delete(Number(id));

    // ========================================================
    // 4. XÓA HÀNG KHỎI DOM NGAY LẬP TỨC
    // ========================================================

    if (hangDangXoa) {
      hangDangXoa.remove();
    }

    // ========================================================
    // 5. CẬP NHẬT TRẠNG THÁI CHECKBOX
    // ========================================================

    capNhatTrangThaiCheckboxTong();

    capNhatNutXoaNhieu();

    // ========================================================
    // 6. CẬP NHẬT LẠI BẢNG
    // ========================================================

    const tongSoTrangMoi =
      danhSachTaiNguyenLoc.length === 0
        ? 1
        : Math.ceil(danhSachTaiNguyenLoc.length / soBanGhiMoiTrang);

    tongSoTrang = tongSoTrangMoi;

    if (trangHienTai > tongSoTrang) {
      trangHienTai = tongSoTrang;
    }

    renderBangTaiNguyen();

    renderPhanTrang();

    // ========================================================
    // 7. CẬP NHẬT THỐNG KÊ
    // ========================================================

    capNhatThongKe(danhSachTaiNguyen, null);

    // ========================================================
    // 8. THÔNG BÁO
    // ========================================================

    alert(data.thongBao || "Đã xóa tài nguyên.");
  } catch (error) {
    console.error("Lỗi xóa tài nguyên:", error);

    alert(error.message || "Không thể xóa tài nguyên.");

    // ========================================================
    // NẾU XÓA THẤT BẠI → KHÔNG XÓA HÀNG
    // ========================================================

    if (nutXoa) {
      nutXoa.disabled = false;

      nutXoa.innerHTML = `
        <i data-lucide="trash-2"></i>
      `;

      taoLucide();
    }
  }
}

// ============================================================
// 25. MODAL CƠ BẢN
// ============================================================

function taoKhungModal() {
  let khung = document.querySelector(".khung-modal-tai-nguyen");

  if (khung) {
    return khung;
  }

  khung = document.createElement("div");

  khung.className = "khung-modal-tai-nguyen";

  khung.innerHTML = `
    <div
      class="modal-tai-nguyen"
      role="dialog"
      aria-modal="true"
    >

      <div
        class="modal-tai-nguyen-header"
      >

        <h2
          class="modal-tai-nguyen-tieu-de"
        >
        </h2>

        <button
          type="button"
          class="nut-dong-modal-tai-nguyen"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

      </div>

      <div
        class="modal-tai-nguyen-body"
      ></div>

      <div
        class="modal-tai-nguyen-footer"
      ></div>

    </div>
  `;

  document.body.appendChild(khung);

  const nutDong = khung.querySelector(".nut-dong-modal-tai-nguyen");

  nutDong.addEventListener("click", dongModal);

  khung.addEventListener("click", function (event) {
    if (event.target === khung) {
      dongModal();
    }
  });

  taoLucide();

  return khung;
}

function moModal({ tieuDe = "", noiDung = "", footer = "" } = {}) {
  const khung = taoKhungModal();

  khung.querySelector(".modal-tai-nguyen-tieu-de").textContent = tieuDe;

  khung.querySelector(".modal-tai-nguyen-body").innerHTML = noiDung;

  khung.querySelector(".modal-tai-nguyen-footer").innerHTML = footer;

  khung.classList.add("dang-mo");

  document.body.style.overflow = "hidden";

  taoLucide();
}

function dongModal() {
  const khung = document.querySelector(".khung-modal-tai-nguyen");

  if (!khung) {
    return;
  }

  khung.classList.remove("dang-mo");

  document.body.style.overflow = "";

  khung.querySelector(".modal-tai-nguyen-body").innerHTML = "";

  khung.querySelector(".modal-tai-nguyen-footer").innerHTML = "";
}

// ============================================================
// 26. ESC
// ============================================================

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    dongModal();
    dongMenuThaoTac();
  }
});

// ============================================================
// 27. MODAL THÊM
// ============================================================

function moModalThemTaiNguyen() {
  itemDangSua = null;

  moModal({
    tieuDe: "Thêm tài liệu mới",

    noiDung: `
      <form
        class="form-tai-nguyen"
        id="form-them-tai-nguyen"
      >

        <div
          class="form-hai-cot"
        >

          <div
            class="form-group-tai-nguyen"
          >
            <label>
              Tên tài liệu
              <span style="color:red">
                *
              </span>
            </label>

            <input
              type="text"
              name="tenTaiNguyen"
              maxlength="200"
              required
              placeholder="Nhập tên tài liệu..."
            />
          </div>

          <div
            class="form-group-tai-nguyen"
          >
            <label>
              Loại tài nguyên
              <span style="color:red">
                *
              </span>
            </label>

            <select
              name="loaiTaiNguyen"
              id="them-loai-tai-nguyen"
              required
            >

              <option
                value="TAI_LIEU"
              >
                Tài liệu
              </option>

              <option
                value="VIDEO"
              >
                Video
              </option>

              <option
                value="WEBSITE"
              >
                Website / Link
              </option>

            </select>
          </div>

        </div>

        <div
          class="form-group-tai-nguyen"
        >

          <label>
            Môn học
          </label>

          <select
            name="idHocPhan"
            id="them-hoc-phan"
          >
            <option value="">
              Không gắn môn học
            </option>
          </select>

        </div>

        <div
          class="form-group-tai-nguyen"
        >

          <label>
            Mô tả
          </label>

          <textarea
            name="moTa"
            maxlength="1000"
            placeholder="Nhập mô tả tài liệu..."
          ></textarea>

        </div>

        <div
          class="khu-vuc-upload-tai-nguyen"
          id="khu-vuc-file-moi"
        >

          <div
            class="form-group-tai-nguyen"
          >

            <label>
              Chọn file
              <span style="color:red">
                *
              </span>
            </label>

            <input
              type="file"
              name="file"
              id="them-file"
            />

            <div
              class="thong-tin-file-tai-nguyen"
            >
              PDF, Word hoặc Video.
            </div>

          </div>

        </div>

        <div
          class="form-group-tai-nguyen hidden"
          id="khu-vuc-url-moi"
        >

          <label>
            Đường dẫn website
            <span style="color:red">
              *
            </span>
          </label>

          <input
            type="url"
            name="duongDanUrl"
            id="them-url"
            placeholder="https://..."
          />

        </div>

      </form>
    `,

    footer: `
      <button
        type="button"
        class="nut-modal-tai-nguyen nut-modal-huy"
        data-action="dong-modal"
      >
        Hủy
      </button>

      <button
        type="button"
        class="nut-modal-tai-nguyen nut-modal-luu"
        id="nut-luu-tai-nguyen"
      >
        <i data-lucide="save"></i>
        Thêm tài nguyên
      </button>
    `,
  });

  taoDanhSachHocPhanChoModal(document.getElementById("them-hoc-phan"));

  const selectLoai = document.getElementById("them-loai-tai-nguyen");

  const khuFile = document.getElementById("khu-vuc-file-moi");

  const khuUrl = document.getElementById("khu-vuc-url-moi");

  function capNhatLoai() {
    const loai = selectLoai.value;

    if (loai === "WEBSITE") {
      // Website → chỉ hiện ô đường dẫn
      khuFile.style.display = "none";
      khuUrl.style.display = "";
    } else if (loai === "VIDEO") {
      // Video → chỉ hiện ô chọn file
      khuFile.style.display = "";
      khuUrl.style.display = "none";
    } else {
      // Tài liệu → chỉ hiện ô chọn file
      khuFile.style.display = "";
      khuUrl.style.display = "none";
    }
  }

  selectLoai.addEventListener("change", capNhatLoai);

  capNhatLoai();

  document
    .getElementById("nut-luu-tai-nguyen")
    .addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      themTaiNguyen();
    });
}

// ============================================================
// 28. DANH SÁCH HỌC PHẦN
// ============================================================

function taoDanhSachHocPhanChoModal(select, giaTriChon = "") {
  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Không gắn môn học
    </option>
  `;

  const map = new Map();

  danhSachTaiNguyen.forEach(function (item) {
    const hocPhan = item.hocPhan;

    if (hocPhan && hocPhan.idHocPhan) {
      map.set(
        String(hocPhan.idHocPhan),
        hocPhan.tenHocPhan || hocPhan.maHocPhan || "Học phần",
      );
    }
  });

  Array.from(map.entries())
    .sort(function (a, b) {
      return a[1].localeCompare(b[1], "vi");
    })
    .forEach(function ([id, ten]) {
      const option = document.createElement("option");

      option.value = id;

      option.textContent = ten;

      if (String(giaTriChon) === String(id)) {
        option.selected = true;
      }

      select.appendChild(option);
    });
}

// ============================================================
// 29. THÊM TÀI NGUYÊN
// ============================================================

async function themTaiNguyen() {
  const form = document.getElementById("form-them-tai-nguyen");

  if (!form) {
    return;
  }

  const token = layTokenTaiLieu();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");

    return;
  }

  const ten = form.elements.tenTaiNguyen.value.trim();

  const loai = form.elements.loaiTaiNguyen.value;

  const moTa = form.elements.moTa.value.trim();

  const idHocPhan = form.elements.idHocPhan.value;

  const file = form.elements.file?.files?.[0] || null;

  const url = form.elements.duongDanUrl?.value.trim() || "";

  if (!ten) {
    alert("Vui lòng nhập tên tài nguyên.");

    return;
  }

  if (loai !== "WEBSITE" && !file) {
    alert("Vui lòng chọn file.");

    return;
  }

  if (loai === "WEBSITE" && !url) {
    alert("Vui lòng nhập đường dẫn website.");

    return;
  }

  const nut = document.getElementById("nut-luu-tai-nguyen");

  if (nut) {
    nut.disabled = true;

    nut.innerHTML = `
      <i data-lucide="loader-circle"></i>
      Đang lưu...
    `;

    taoLucide();
  }

  try {
    let response;

    if (loai === "WEBSITE") {
      response = await fetch(API_TAI_NGUYEN, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify({
          idHocPhan: idHocPhan ? Number(idHocPhan) : null,

          tenTaiNguyen: ten,

          loaiTaiNguyen: "WEBSITE",

          moTa: moTa || null,

          duongDanUrl: url,
        }),
      });
    } else {
      const formData = new FormData();

      formData.append("tenTaiNguyen", ten);

      formData.append("loaiTaiNguyen", loai);

      formData.append("moTa", moTa);

      if (idHocPhan) {
        formData.append("idHocPhan", idHocPhan);
      }

      formData.append("file", file);

      response = await fetch(API_TAI_NGUYEN_UPLOAD, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },

        body: formData,
      });
    }

    let data = null;

    try {
      data = await response.json();
    } catch {
      throw new Error("File không hợp lê.");
    }

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể thêm tài nguyên.");
    }

    dongModal();

    await taiDuLieuTaiLieu();

    alert(data.thongBao || "Thêm tài nguyên thành công.");
  } catch (error) {
    console.error("Lỗi thêm tài nguyên:", error);

    alert(error.message || "Không thể thêm tài nguyên.");

    if (nut) {
      nut.disabled = false;

      nut.innerHTML = `
        <i data-lucide="save"></i>
        Thêm tài nguyên
      `;

      taoLucide();
    }
  }
}

// ============================================================
// 30. MODAL XEM
// ============================================================

function moModalXemTaiNguyen(id) {
  const item = danhSachTaiNguyen.find(function (taiNguyen) {
    return Number(taiNguyen.idTaiNguyen) === Number(id);
  });

  if (!item) {
    return;
  }

  const loai = String(item.loaiTaiNguyen || "").toUpperCase();

  const url = item.duongDanFile || item.duongDanUrl || "";

  let preview = "";

  if (loai === "VIDEO") {
    preview = url
      ? `
          <div
            class="khung-preview-tai-nguyen"
          >
            <video
              controls
              src="${escapeHTML(url)}"
            ></video>
          </div>
        `
      : `
          <div
            class="khung-preview-tai-nguyen"
          >
            <div
              class="thong-bao-preview-tai-nguyen"
            >
              <i
                data-lucide="video-off"
              ></i>
              <span>
                Chưa có file video.
              </span>
            </div>
          </div>
        `;
  } else if (loai === "WEBSITE") {
    preview = `
      <div
        class="khung-preview-tai-nguyen"
      >
        <div
          class="thong-bao-preview-tai-nguyen"
        >
          <i
            data-lucide="external-link"
          ></i>

          <strong>
            Website tham khảo
          </strong>

          <span>
            ${escapeHTML(item.duongDanUrl || "Chưa có đường dẫn")}
          </span>

          ${
            item.duongDanUrl
              ? `
                <a
                  href="${escapeHTML(item.duongDanUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="nut-modal-tai-nguyen nut-modal-luu"
                >
                  Mở website
                </a>
              `
              : ""
          }
        </div>
      </div>
    `;
  } else {
    const duoi = String(item.duoiFile || "").toLowerCase();

    if (duoi === "pdf") {
      preview = `
        <div
          class="khung-preview-tai-nguyen"
        >
          <iframe
            src="${escapeHTML(url)}"
            title="${escapeHTML(item.tenTaiNguyen)}"
          ></iframe>
        </div>
      `;
    } else {
      preview = `
        <div
          class="khung-preview-tai-nguyen"
        >
          <div
            class="thong-bao-preview-tai-nguyen"
          >
            <i
              data-lucide="file-text"
            ></i>

            <strong>
              ${escapeHTML(
                item.duoiFile
                  ? String(item.duoiFile).toUpperCase()
                  : "TÀI LIỆU",
              )}
            </strong>

            <span>
              Trình duyệt không xem trực tiếp
              định dạng này.
            </span>

            ${
              url
                ? `
                  <a
                    href="${escapeHTML(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="nut-modal-tai-nguyen nut-modal-luu"
                  >
                    Mở file
                  </a>
                `
                : ""
            }
          </div>
        </div>
      `;
    }
  }

  moModal({
    tieuDe: item.tenTaiNguyen || "Tài nguyên",

    noiDung: `
      <div
        class="noi-dung-xem-tai-nguyen"
      >

        <div
          class="thong-tin-xem-tai-nguyen"
        >

          <div
            class="o-thong-tin-xem"
          >
            <span>
              Môn học
            </span>
            <strong>
              ${escapeHTML(
                item.hocPhan?.tenHocPhan ||
                  item.hocPhan?.maHocPhan ||
                  "Không gắn môn",
              )}
            </strong>
          </div>

          <div
            class="o-thong-tin-xem"
          >
            <span>
              Loại
            </span>
            <strong>
              ${escapeHTML(layTenLoai(item.loaiTaiNguyen))}
            </strong>
          </div>

          <div
            class="o-thong-tin-xem"
          >
            <span>
              Lượt xem
            </span>
            <strong>
              ${dinhDangSo(item.luotXem)}
            </strong>
          </div>

          <div
            class="o-thong-tin-xem"
          >
            <span>
              Lượt tải
            </span>
            <strong>
              ${dinhDangSo(item.luotTai)}
            </strong>
          </div>

          <div
            class="o-thong-tin-xem"
          >
            <span>
              Ngày đăng
            </span>
            <strong>
              ${dinhDangNgay(item.ngayTao)}
            </strong>
          </div>

          <div
            class="o-thong-tin-xem"
          >
            <span>
              Trạng thái
            </span>
            <strong>
              ${item.trangThai ? "Đã xuất bản" : "Đang ẩn"}
            </strong>
          </div>

        </div>

        <div
          class="o-thong-tin-xem"
        >
          <span>
            Mô tả
          </span>

          <strong
            style="
              font-weight:400;
              line-height:1.6;
            "
          >
            ${escapeHTML(item.moTa || "Không có mô tả.")}
          </strong>
        </div>

        ${preview}

      </div>
    `,

    footer: `
      <button
        type="button"
        class="nut-modal-tai-nguyen nut-modal-huy"
        data-action="dong-modal"
      >
        Đóng
      </button>
    `,
  });
}

// ============================================================
// 31. MODAL SỬA
// ============================================================

function moModalSuaTaiNguyen(id) {
  const item = danhSachTaiNguyen.find(function (taiNguyen) {
    return Number(taiNguyen.idTaiNguyen) === Number(id);
  });

  if (!item) {
    return;
  }

  itemDangSua = item;

  const loai = String(item.loaiTaiNguyen || "").toUpperCase();

  moModal({
    tieuDe: "Sửa tài nguyên",

    noiDung: `
      <form
        class="form-tai-nguyen"
        id="form-sua-tai-nguyen"
      >

        <div
          class="form-group-tai-nguyen"
        >
          <label>
            Tên tài nguyên
          </label>

          <input
            type="text"
            name="tenTaiNguyen"
            maxlength="200"
            required
            value="${escapeHTML(item.tenTaiNguyen || "")}"
          />
        </div>

        <div
          class="form-group-tai-nguyen"
        >
          <label>
            Môn học
          </label>

          <select
            name="idHocPhan"
            id="sua-hoc-phan"
          >
            <option value="">
              Không gắn môn học
            </option>
          </select>
        </div>

        <div
          class="form-group-tai-nguyen"
        >

          <label>
            Loại tài nguyên
          </label>

          <input
            type="text"
            value="${escapeHTML(layTenLoai(item.loaiTaiNguyen))}"
            disabled
          />

        </div>

        <div
          class="form-group-tai-nguyen"
        >

          <label>
            Mô tả
          </label>

          <textarea
            name="moTa"
            maxlength="1000"
          >${escapeHTML(item.moTa || "")}</textarea>

        </div>

        ${
          loai === "WEBSITE"
            ? `
              <div
                class="form-group-tai-nguyen"
              >

                <label>
                  Đường dẫn website
                </label>

                <input
                  type="url"
                  name="duongDanUrl"
                  value="${escapeHTML(item.duongDanUrl || "")}"
                />

              </div>
            `
            : ""
        }

        ${
          loai !== "WEBSITE"
            ? `
              <div
                class="khu-vuc-upload-tai-nguyen"
              >

                <div
                  class="form-group-tai-nguyen"
                >

                  <label>
                    Thay file mới
                  </label>

                  <input
                    type="file"
                    id="file-thay-moi"
                  />

                  <div
                    class="thong-tin-file-tai-nguyen"
                  >
                    Để trống nếu không muốn
                    thay file.
                  </div>

                </div>

              </div>
            `
            : ""
        }

      </form>
    `,

    footer: `
      <button
        type="button"
        class="nut-modal-tai-nguyen nut-modal-huy"
        data-action="dong-modal"
      >
        Hủy
      </button>

      <button
        type="button"
        class="nut-modal-tai-nguyen nut-modal-luu"
        id="nut-cap-nhat-tai-nguyen"
      >
        <i data-lucide="save"></i>
        Lưu thay đổi
      </button>
    `,
  });

  taoDanhSachHocPhanChoModal(
    document.getElementById("sua-hoc-phan"),
    item.hocPhan?.idHocPhan || "",
  );

  document
    .getElementById("nut-cap-nhat-tai-nguyen")
    .addEventListener("click", capNhatTaiNguyen);
}

// ============================================================
// 32. CẬP NHẬT THÔNG TIN
// ============================================================

async function capNhatTaiNguyen() {
  if (!itemDangSua) {
    return;
  }

  const form = document.getElementById("form-sua-tai-nguyen");

  if (!form) {
    return;
  }

  const token = layTokenTaiLieu();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");

    return;
  }

  const ten = form.elements.tenTaiNguyen.value.trim();

  const moTa = form.elements.moTa.value.trim();

  const idHocPhan = form.elements.idHocPhan.value;

  const url = form.elements.duongDanUrl?.value.trim() || "";

  if (!ten) {
    alert("Tên tài nguyên không được để trống.");

    return;
  }

  const nut = document.getElementById("nut-cap-nhat-tai-nguyen");

  if (nut) {
    nut.disabled = true;

    nut.innerHTML = `
      <i data-lucide="loader-circle"></i>
      Đang lưu...
    `;

    taoLucide();
  }

  try {
    const response = await fetch(
      `${API_TAI_NGUYEN}/${itemDangSua.idTaiNguyen}`,
      {
        method: "PUT",

        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify({
          idHocPhan: idHocPhan ? Number(idHocPhan) : null,

          tenTaiNguyen: ten,

          moTa: moTa || null,

          duongDanUrl:
            String(itemDangSua.loaiTaiNguyen || "").toUpperCase() === "WEBSITE"
              ? url || null
              : null,
        }),
      },
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      throw new Error("Backend không trả JSON hợp lệ.");
    }

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể cập nhật tài nguyên.");
    }

    // --------------------------------------------------------
    // Nếu có chọn file mới → thay file
    // --------------------------------------------------------

    const fileMoi =
      document.getElementById("file-thay-moi")?.files?.[0] || null;

    if (fileMoi) {
      const formData = new FormData();

      formData.append("file", fileMoi);

      const responseFile = await fetch(
        `${API_TAI_NGUYEN}/${itemDangSua.idTaiNguyen}/thay-file`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,

            Accept: "application/json",
          },

          body: formData,
        },
      );

      let dataFile = null;

      try {
        dataFile = await responseFile.json();
      } catch {
        throw new Error("Backend thay file không trả JSON hợp lệ.");
      }

      if (!responseFile.ok || !dataFile?.thanhCong) {
        throw new Error(dataFile?.thongBao || "Không thể thay file.");
      }
    }

    itemDangSua = null;

    dongModal();

    await taiDuLieuTaiLieu();

    alert("Cập nhật tài nguyên thành công.");
  } catch (error) {
    console.error("Lỗi cập nhật:", error);

    alert(error.message || "Không thể cập nhật tài nguyên.");

    if (nut) {
      nut.disabled = false;

      nut.innerHTML = `
        <i data-lucide="save"></i>
        Lưu thay đổi
      `;

      taoLucide();
    }
  }
}

// ============================================================
// 33. MENU THAO TÁC
// ============================================================

let menuThaoTac = null;

function taoMenuThaoTac() {
  if (menuThaoTac) {
    return menuThaoTac;
  }

  menuThaoTac = document.createElement("div");

  menuThaoTac.className = "khung-menu-thao-tac";

  document.body.appendChild(menuThaoTac);

  return menuThaoTac;
}

function moMenuThaoTac(button, id) {
  const item = danhSachTaiNguyen.find(function (taiNguyen) {
    return Number(taiNguyen.idTaiNguyen) === Number(id);
  });

  if (!item) {
    return;
  }

  const menu = taoMenuThaoTac();

  const noiBat = Boolean(item.noiBat);

  const trangThai = Boolean(item.trangThai);

  menu.innerHTML = `

    <button
      type="button"
      class="item-menu-thao-tac"
      data-menu-action="trang-thai"
      data-id="${Number(id)}"
    >
      <i
        data-lucide="${trangThai ? "eye-off" : "eye"}"
      ></i>

      ${trangThai ? "Ẩn tài nguyên" : "Hiện tài nguyên"}
    </button>

    

    ${
      String(item.loaiTaiNguyen || "").toUpperCase() !== "WEBSITE"
        ? `
          <button
            type="button"
            class="item-menu-thao-tac"
            data-menu-action="thay-file"
            data-id="${Number(id)}"
          >
            <i data-lucide="file-up"></i>
            Thay file
          </button>
        `
        : ""
    }

    <button
      type="button"
      class="item-menu-thao-tac"
      data-menu-action="dong"
    >
      <i data-lucide="x"></i>
      Đóng
    </button>
  `;

  const rect = button.getBoundingClientRect();

  const menuWidth = 195;

  let left = rect.right - menuWidth;

  let top = rect.bottom + 5;

  if (left < 10) {
    left = 10;
  }

  if (left + menuWidth > window.innerWidth - 10) {
    left = window.innerWidth - menuWidth - 10;
  }

  if (top + 220 > window.innerHeight) {
    top = rect.top - 225;
  }

  menu.style.left = `${left}px`;

  menu.style.top = `${top}px`;

  menu.classList.add("dang-mo");

  taoLucide();
}

function dongMenuThaoTac() {
  if (!menuThaoTac) {
    return;
  }

  menuThaoTac.classList.remove("dang-mo");
}

// ============================================================
// 34. NÚT MENU
// ============================================================

function ganSuKienNutThaoTac() {
  const cacNut = document.querySelectorAll(".nut-mo-menu-thao-tac");

  cacNut.forEach(function (nut) {
    nut.addEventListener("click", function (event) {
      event.stopPropagation();

      const id = Number(nut.dataset.id);

      if (menuThaoTac?.classList.contains("dang-mo")) {
        dongMenuThaoTac();
      } else {
        moMenuThaoTac(nut, id);
      }
    });
  });
}

// ============================================================
// 35. CLICK MENU
// ============================================================

document.addEventListener("click", async function (event) {
  const itemMenu = event.target.closest(".item-menu-thao-tac");

  if (itemMenu) {
    event.stopPropagation();

    const action = itemMenu.dataset.menuAction;

    const id = Number(itemMenu.dataset.id);

    dongMenuThaoTac();

    if (action === "noi-bat") {
      await thayDoiNoiBat(id);

      return;
    }

    if (action === "trang-thai") {
      await thayDoiTrangThai(id);

      return;
    }

    if (action === "khoi-phuc") {
      await khoiPhucTaiNguyen(id);

      return;
    }

    if (action === "thay-file") {
      moModalThayFile(id);

      return;
    }

    return;
  }

  if (
    menuThaoTac &&
    !event.target.closest(".khung-menu-thao-tac") &&
    !event.target.closest(".nut-mo-menu-thao-tac")
  ) {
    dongMenuThaoTac();
  }
});

// ============================================================
// 36. THAY ĐỔI NỔI BẬT
// ============================================================

async function thayDoiNoiBat(id) {
  const item = danhSachTaiNguyen.find(function (taiNguyen) {
    return Number(taiNguyen.idTaiNguyen) === Number(id);
  });

  if (!item) {
    return;
  }

  const token = layTokenTaiLieu();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");

    return;
  }

  try {
    const response = await fetch(`${API_TAI_NGUYEN}/${id}/noi-bat`, {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",

        Accept: "application/json",
      },

      body: JSON.stringify({
        noiBat: !Boolean(item.noiBat),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể cập nhật nổi bật.");
    }

    await taiDuLieuTaiLieu();

    alert(data.thongBao || "Đã cập nhật trạng thái nổi bật.");
  } catch (error) {
    console.error(error);

    alert(error.message || "Không thể cập nhật nổi bật.");
  }
}

// ============================================================
// 37. THAY ĐỔI TRẠNG THÁI
// ============================================================

async function thayDoiTrangThai(id) {
  const item = danhSachTaiNguyen.find(function (taiNguyen) {
    return Number(taiNguyen.idTaiNguyen) === Number(id);
  });

  if (!item) {
    return;
  }

  const token = layTokenTaiLieu();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");

    return;
  }

  const trangThaiMoi = !Boolean(item.trangThai);

  try {
    const response = await fetch(`${API_TAI_NGUYEN}/${id}/trang-thai`, {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",

        Accept: "application/json",
      },

      body: JSON.stringify({
        trangThai: trangThaiMoi,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể cập nhật trạng thái.");
    }

    await taiDuLieuTaiLieu();

    alert(data.thongBao || "Đã cập nhật trạng thái.");
  } catch (error) {
    console.error(error);

    alert(error.message || "Không thể cập nhật trạng thái.");
  }
}

// ============================================================
// 38. KHÔI PHỤC
// ============================================================

async function khoiPhucTaiNguyen(id) {
  const token = layTokenTaiLieu();

  if (!token) {
    alert("Phiên đăng nhập đã hết.");

    return;
  }

  try {
    const response = await fetch(`${API_TAI_NGUYEN}/${id}/khoi-phuc`, {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể khôi phục tài nguyên.");
    }

    await taiDuLieuTaiLieu();

    alert(data.thongBao || "Đã khôi phục tài nguyên.");
  } catch (error) {
    console.error(error);

    alert(error.message || "Không thể khôi phục.");
  }
}

// ============================================================
// 39. MODAL THAY FILE
// ============================================================

function moModalThayFile(id) {
  const item = danhSachTaiNguyen.find(function (taiNguyen) {
    return Number(taiNguyen.idTaiNguyen) === Number(id);
  });

  if (!item) {
    return;
  }

  moModal({
    tieuDe: "Thay file tài nguyên",

    noiDung: `
      <div
        class="form-tai-nguyen"
      >

        <div
          class="o-thong-tin-xem"
        >
          <span>
            Tài nguyên
          </span>

          <strong>
            ${escapeHTML(item.tenTaiNguyen)}
          </strong>
        </div>

        <div
          class="khu-vuc-upload-tai-nguyen"
        >

          <div
            class="form-group-tai-nguyen"
          >

            <label>
              Chọn file mới
            </label>

            <input
              type="file"
              id="modal-file-thay"
            />

            <div
              class="thong-tin-file-tai-nguyen"
            >
              File cũ sẽ được thay bằng file mới.
            </div>

          </div>

        </div>

      </div>
    `,

    footer: `
      <button
        type="button"
        class="nut-modal-tai-nguyen nut-modal-huy"
        data-action="dong-modal"
      >
        Hủy
      </button>

      <button
        type="button"
        class="nut-modal-tai-nguyen nut-modal-luu"
        id="nut-xac-nhan-thay-file"
      >
        <i data-lucide="upload"></i>
        Thay file
      </button>
    `,
  });

  document
    .getElementById("nut-xac-nhan-thay-file")
    .addEventListener("click", async function () {
      const file = document.getElementById("modal-file-thay")?.files?.[0];

      if (!file) {
        alert("Vui lòng chọn file mới.");

        return;
      }

      const token = layTokenTaiLieu();

      if (!token) {
        alert("Phiên đăng nhập đã hết.");

        return;
      }

      try {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(`${API_TAI_NGUYEN}/${id}/thay-file`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,

            Accept: "application/json",
          },

          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data?.thanhCong) {
          throw new Error(data?.thongBao || "Không thể thay file.");
        }

        dongModal();

        await taiDuLieuTaiLieu();

        alert(data.thongBao || "Đã thay file thành công.");
      } catch (error) {
        console.error(error);

        alert(error.message || "Không thể thay file.");
      }
    });
}

// ============================================================
// 40. CLICK TOÀN BỘ NÚT TRONG BẢNG
// ============================================================

document.addEventListener("click", function (event) {
  const nutXem = event.target.closest(".nut-xem-tai-nguyen");

  if (nutXem) {
    moModalXemTaiNguyen(Number(nutXem.dataset.id));

    return;
  }

  const nutSua = event.target.closest(".nut-sua-tai-nguyen");

  if (nutSua) {
    moModalSuaTaiNguyen(Number(nutSua.dataset.id));

    return;
  }

  const nutXoa = event.target.closest(".nut-xoa-tai-nguyen");

  if (nutXoa) {
    xoaMotTaiNguyen(Number(nutXoa.dataset.id));

    return;
  }
});

// ============================================================
// 41. PHÂN TRANG
// ============================================================

function renderPhanTrang() {
  const khung = document.querySelector(".pagination-container");

  if (!khung) {
    return;
  }

  const thongTin = khung.querySelector(".pagination-info");

  const controls = khung.querySelector(".pagination-controls");

  if (!controls) {
    return;
  }

  const tong = danhSachTaiNguyenLoc.length;

  const tu = tong === 0 ? 0 : (trangHienTai - 1) * soBanGhiMoiTrang + 1;

  const den = Math.min(trangHienTai * soBanGhiMoiTrang, tong);

  if (thongTin) {
    thongTin.textContent = `Hiển thị ${tu} - ${den} trong ${tong} tài liệu`;
  }

  controls.innerHTML = "";

  const nutTruoc = document.createElement("button");

  nutTruoc.type = "button";

  nutTruoc.className = "page-btn";

  nutTruoc.innerHTML = `
    <i class="fa-solid fa-arrow-left"></i>
  `;

  nutTruoc.disabled = trangHienTai <= 1;

  nutTruoc.addEventListener("click", function () {
    if (trangHienTai <= 1) {
      return;
    }

    trangHienTai--;

    renderBangTaiNguyen();

    renderPhanTrang();

    cuonLenDauBang();
  });

  controls.appendChild(nutTruoc);

  const cacTrang = taoDanhSachTrang(trangHienTai, tongSoTrang);

  cacTrang.forEach(function (item) {
    if (item === "...") {
      const span = document.createElement("span");

      span.className = "dots";

      span.textContent = "...";

      controls.appendChild(span);

      return;
    }

    const nut = document.createElement("button");

    nut.type = "button";

    nut.className = "page-btn";

    nut.textContent = item;

    if (item === trangHienTai) {
      nut.classList.add("active");
    }

    nut.addEventListener("click", function () {
      trangHienTai = item;

      renderBangTaiNguyen();

      renderPhanTrang();

      cuonLenDauBang();
    });

    controls.appendChild(nut);
  });

  const nutSau = document.createElement("button");

  nutSau.type = "button";

  nutSau.className = "page-btn";

  nutSau.innerHTML = `
    <i class="fa-solid fa-arrow-right"></i>
  `;

  nutSau.disabled = trangHienTai >= tongSoTrang;

  nutSau.addEventListener("click", function () {
    if (trangHienTai >= tongSoTrang) {
      return;
    }

    trangHienTai++;

    renderBangTaiNguyen();

    renderPhanTrang();

    cuonLenDauBang();
  });

  controls.appendChild(nutSau);

  taoLucide();
}

function taoDanhSachTrang(current, total) {
  if (total <= 7) {
    return Array.from(
      {
        length: total,
      },
      function (_, index) {
        return index + 1;
      },
    );
  }

  const danhSach = [];

  danhSach.push(1);

  if (current > 4) {
    danhSach.push("...");
  }

  const batDau = Math.max(2, current - 1);

  const ketThuc = Math.min(total - 1, current + 1);

  for (let i = batDau; i <= ketThuc; i++) {
    danhSach.push(i);
  }

  if (current < total - 3) {
    danhSach.push("...");
  }

  danhSach.push(total);

  return danhSach;
}

function cuonLenDauBang() {
  const bang = document.querySelector(".data-section");

  if (!bang) {
    return;
  }

  bang.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ============================================================
// 42. TÌM KIẾM
// ============================================================

function ganSuKienTimKiem() {
  const input = document.getElementById("o-tim-tai-nguyen");

  if (!input) {
    return;
  }

  input.addEventListener("input", function () {
    trangHienTai = 1;

    apDungLocVaRender();
  });
}

// ============================================================
// 43. CÁC BỘ LỌC
// ============================================================

function ganSuKienBoLoc() {
  const locMon = document.getElementById("loc-mon-hoc");

  const locLoai = document.getElementById("loc-loai");

  const locTrangThai = document.getElementById("loc-trang-thai");

  [locMon, locLoai, locTrangThai].forEach(function (select) {
    if (!select) {
      return;
    }

    select.addEventListener("change", function () {
      trangHienTai = 1;

      apDungLocVaRender();
    });
  });
}

// ============================================================
// 44. LỌC LOẠI - GHI GIÁ TRỊ
// ============================================================

function khoiTaoGiaTriLocLoai() {
  const select = document.getElementById("loc-loai");

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Tất cả loại
    </option>

    <option value="TAI_LIEU">
      Tài liệu
    </option>

    <option value="VIDEO">
      Video
    </option>

    <option value="WEBSITE">
      Website / Link
    </option>
  `;
}

// ============================================================
// 45. LỌC TRẠNG THÁI
// ============================================================

function khoiTaoGiaTriLocTrangThai() {
  const select = document.getElementById("loc-trang-thai");

  if (!select) {
    return;
  }

  select.innerHTML = `
    <option value="">
      Tất cả trạng thái
    </option>

    <option value="1">
      Đã xuất bản
    </option>

    <option value="0">
      Đang ẩn
    </option>
  `;
}

// ============================================================
// 46. LÀM MỚI
// ============================================================

function ganSuKienLamMoi() {
  const nut = document.querySelector(".btn-refresh");

  if (!nut) {
    return;
  }

  nut.addEventListener("click", async function () {
    const input = document.getElementById("o-tim-tai-nguyen");

    const locMon = document.getElementById("loc-mon-hoc");

    const locLoai = document.getElementById("loc-loai");

    const locTrangThai = document.getElementById("loc-trang-thai");

    if (input) {
      input.value = "";
    }

    if (locMon) {
      locMon.value = "";
    }

    if (locLoai) {
      locLoai.value = "";
    }

    if (locTrangThai) {
      locTrangThai.value = "";
    }

    trangHienTai = 1;

    nut.disabled = true;

    try {
      await taiDuLieuTaiLieu();
    } finally {
      nut.disabled = false;
    }
  });
}

// ============================================================
// 47. NÚT THÊM
// ============================================================

function ganSuKienNutThem() {
  const nut = document.getElementById("nut-them-tai-nguyen");

  if (!nut) {
    return;
  }

  nut.addEventListener("click", function () {
    moModalThemTaiNguyen();
  });
}

// ============================================================
// 48. NÚT ĐÓNG MODAL TRONG FOOTER
// ============================================================

document.addEventListener("click", function (event) {
  const nut = event.target.closest('[data-action="dong-modal"]');

  if (nut) {
    dongModal();
  }
});

// ============================================================
// 49. TẠO CHECKBOX HEADER
// ============================================================

function khoiTaoCheckboxTong() {
  const checkbox = document.querySelector(
    ".table-container thead input[type='checkbox']",
  );

  if (!checkbox) {
    console.warn("Không tìm thấy checkbox đầu bảng.");

    return;
  }

  ganSuKienCheckboxTong();
}

// ============================================================
// 50. KHỞI TẠO
// ============================================================

async function khoiTaoTrangTaiLieu() {
  console.log("Trang quản lý tài liệu giảng viên đang khởi tạo...");

  taoNutXoaNhieu();

  khoiTaoGiaTriLocLoai();

  khoiTaoGiaTriLocTrangThai();

  ganSuKienTimKiem();

  ganSuKienBoLoc();

  ganSuKienLamMoi();

  ganSuKienNutThem();

  khoiTaoCheckboxTong();

  taoLucide();

  await taiDuLieuTaiLieu();

  taoLucide();

  console.log("Trang quản lý tài liệu giảng viên đã sẵn sàng.");
}

// ============================================================
// 51. START
// ============================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", khoiTaoTrangTaiLieu, {
    once: true,
  });
} else {
  khoiTaoTrangTaiLieu();
}
