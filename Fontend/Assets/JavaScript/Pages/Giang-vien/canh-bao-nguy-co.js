// ============================================================
// STUDYAI - GIẢNG VIÊN
// CẢNH BÁO NGUY CƠ HỌC TẬP
// ============================================================

// ============================================================
// 1. API
// ============================================================

const API_BASE_URL = "";

const API_CANH_BAO_NGUY_CO = `${API_BASE_URL}/api/giang-vien/canh-bao-nguy-co`;

// ============================================================
// 2. BIẾN
// ============================================================

let danhSachSinhVien = [];

let trangHienTai = 1;

let soBanGhiMoiTrang = 5;

let tongSoTrang = 1;

let dangTaiDuLieu = false;

// ============================================================
// 3. TOKEN
// ============================================================

function layToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// ============================================================
// 4. FORMAT SỐ
// ============================================================

function dinhDangSo(giaTri) {
  const so = Number(giaTri);

  if (!Number.isFinite(so)) {
    return "0";
  }

  return so.toLocaleString("vi-VN");
}

// ============================================================
// 5. FORMAT GPA
// ============================================================

function dinhDangGPA(giaTri) {
  const so = Number(giaTri);

  if (!Number.isFinite(so)) {
    return "-";
  }

  return so.toFixed(2);
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
// 7. FORMAT NGÀY
// ============================================================

function dinhDangNgayGio(giaTri) {
  if (!giaTri) {
    return "-";
  }

  const ngay = new Date(giaTri);

  if (Number.isNaN(ngay.getTime())) {
    return "-";
  }

  return `${ngay.toLocaleDateString("vi-VN")} ${ngay.toLocaleTimeString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

// ============================================================
// 8. XÁC ĐỊNH CLASS NGUY CƠ
// ============================================================

function layClassNguyCo(mucDo) {
  if (mucDo === "Cao") {
    return "level-red";
  }

  if (mucDo === "Trung bình") {
    return "level-yellow";
  }

  return "level-green";
}

// ============================================================
// 9. XÁC ĐỊNH CLASS AVATAR
// ============================================================

function layClassAvatar(index) {
  const cacClass = ["red", "orange", "blue", "green", "purple"];

  return cacClass[index % cacClass.length];
}

// ============================================================
// 10. LẤY CHỮ AVATAR
// ============================================================

function layChuAvatar(hoTen) {
  const ten = String(hoTen || "").trim();

  if (!ten) {
    return "?";
  }

  const cacTu = ten.split(/\s+/);

  if (cacTu.length === 1) {
    return cacTu[0].substring(0, 1).toUpperCase();
  }

  return (
    cacTu[0].substring(0, 1).toUpperCase() +
    cacTu[cacTu.length - 1].substring(0, 1).toUpperCase()
  );
}

// ============================================================
// 11. HEADER - THÔNG TIN GIẢNG VIÊN
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
// 12. TẢI DỮ LIỆU
// ============================================================

async function taiDuLieuCanhBao({ trang = trangHienTai, tuKhoa = null } = {}) {
  if (dangTaiDuLieu) {
    return;
  }

  const token = layToken();

  if (!token) {
    console.warn("Không tìm thấy token đăng nhập.");

    return;
  }

  dangTaiDuLieu = true;

  try {
    const input = document.getElementById("tim-kiem-canh-bao");

    const tuKhoaSuDung = tuKhoa !== null ? tuKhoa : input?.value?.trim() || "";

    const params = new URLSearchParams();

    params.set("trang", String(trang));

    params.set("soBanGhi", String(soBanGhiMoiTrang));

    if (tuKhoaSuDung) {
      params.set("tuKhoa", tuKhoaSuDung);
    }

    const response = await fetch(
      `${API_CANH_BAO_NGUY_CO}?${params.toString()}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },
      },
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      throw new Error("Backend không trả về JSON hợp lệ.");
    }

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể tải dữ liệu cảnh báo.");
    }

    // ========================================================
    // LƯU
    // ========================================================

    danhSachSinhVien = Array.isArray(data.sinhVien) ? data.sinhVien : [];

    trangHienTai = Number(data.phanTrang?.trangHienTai || 1);

    tongSoTrang = Number(data.phanTrang?.tongSoTrang || 1);

    // ========================================================
    // RENDER
    // ========================================================

    hienThiThongKe(data.thongKe);

    hienThiDonut(data.donut);

    hienThiXuHuong(data.xuHuong);

    hienThiNguyenNhan(data.nguyenNhan);

    hienThiBang(danhSachSinhVien, data.phanTrang);

    hienThiPhanTrang(data.phanTrang);

    hienThiCapNhat(data.capNhatLuc);
  } catch (error) {
    console.error("Lỗi tải dữ liệu cảnh báo:", error);

    hienThiBangLoi(error.message);
  } finally {
    dangTaiDuLieu = false;
  }
}

// ============================================================
// 13. THỐNG KÊ
// ============================================================

function hienThiThongKe(thongKe) {
  if (!thongKe) {
    return;
  }

  const tong = document.getElementById("tong-sinh-vien-nguy-co");

  const cao = document.getElementById("nguy-co-cao");

  const trungBinh = document.getElementById("nguy-co-trung-binh");

  const thap = document.getElementById("nguy-co-thap");

  if (tong) {
    tong.textContent = dinhDangSo(thongKe.tongSinhVien);
  }

  if (cao) {
    cao.textContent = dinhDangSo(thongKe.nguyCoCao);
  }

  if (trungBinh) {
    trungBinh.textContent = dinhDangSo(thongKe.nguyCoTrungBinh);
  }

  if (thap) {
    thap.textContent = dinhDangSo(thongKe.nguyCoThap);
  }
}

// ============================================================
// 14. DONUT
// ============================================================

function hienThiDonut(donut) {
  if (!donut) {
    return;
  }

  const tong = Number(donut.tong || 0);

  const cao = Number(donut.cao || 0);

  const trungBinh = Number(donut.trungBinh || 0);

  const thap = Number(donut.thap || 0);

  const phanTramCao = tong > 0 ? (cao / tong) * 100 : 0;

  const phanTramTrungBinh = tong > 0 ? (trungBinh / tong) * 100 : 0;

  const donutElement = document.getElementById("chart-donut-nguy-co");

  if (donutElement) {
    const moc1 = phanTramCao;

    const moc2 = phanTramCao + phanTramTrungBinh;

    donutElement.style.background = `conic-gradient(
        #e85a5c 0 ${moc1}%,
        #f4c76a ${moc1}% ${moc2}%,
        #39b66e ${moc2}% 100%
      )`;
  }

  const donutTong = document.getElementById("donut-tong");

  if (donutTong) {
    donutTong.innerHTML = `
      ${dinhDangSo(tong)}
      <br />
      <small>
        Tổng số
      </small>
    `;
  }

  const legendCao = document.getElementById("legend-nguy-co-cao");

  const legendTrung = document.getElementById("legend-nguy-co-trung-binh");

  const legendThap = document.getElementById("legend-nguy-co-thap");

  if (legendCao) {
    legendCao.textContent = `${dinhDangSo(cao)} (${phanTramCao.toFixed(2)}%)`;
  }

  if (legendTrung) {
    legendTrung.textContent = `${dinhDangSo(
      trungBinh,
    )} (${phanTramTrungBinh.toFixed(2)}%)`;
  }

  if (legendThap) {
    legendThap.textContent = `${dinhDangSo(thap)} (${(tong > 0
      ? (thap / tong) * 100
      : 0
    ).toFixed(2)}%)`;
  }
}

// ============================================================
// 15. BIỂU ĐỒ XU HƯỚNG
// ============================================================
// ============================================================
// 15. BIỂU ĐỒ XU HƯỚNG
// ============================================================

function hienThiXuHuong(xuHuong) {
  const svg = document.getElementById("bieu-do-xu-huong-nguy-co");

  if (!svg) {
    return;
  }

  const duLieu = Array.isArray(xuHuong) ? xuHuong : [];

  // ==========================================================
  // XÓA TOÀN BỘ ĐƯỜNG / ĐIỂM MẪU CŨ
  //
  // GIỮ LẠI:
  // - .grid-lines
  // - .x-labels
  // - .y-labels
  // ==========================================================

  Array.from(svg.children).forEach(function (element) {
    const className = element.getAttribute("class") || "";

    if (
      className === "grid-lines" ||
      className === "x-labels" ||
      className === "y-labels"
    ) {
      return;
    }

    element.remove();
  });

  // ==========================================================
  // LẤY CÁC KHUNG
  // ==========================================================

  const gridLines = svg.querySelector(".grid-lines");

  const xLabels = svg.querySelector(".x-labels");

  const yLabels = svg.querySelector(".y-labels");

  if (gridLines) {
    gridLines.innerHTML = "";
  }

  if (xLabels) {
    xLabels.innerHTML = "";
  }

  if (yLabels) {
    yLabels.innerHTML = "";
  }

  // ==========================================================
  // KHÔNG CÓ DỮ LIỆU
  // ==========================================================

  if (duLieu.length === 0) {
    taoBieuDoRong(svg);

    return;
  }

  // ==========================================================
  // MAX
  // ==========================================================

  const maxValue = Math.max(
    ...duLieu.map(function (item) {
      return Number(item.soLuong || 0);
    }),
    1,
  );

  // ==========================================================
  // MỐC TRỤC Y
  // ==========================================================

  const mocY = [
    0,

    Math.ceil(maxValue * 0.33),

    Math.ceil(maxValue * 0.66),

    maxValue,
  ];

  // ==========================================================
  // GRID
  // ==========================================================

  if (gridLines) {
    mocY.forEach(function (giaTri, index) {
      const y = 140 - index * 40;

      gridLines.insertAdjacentHTML(
        "beforeend",
        `
            <line
              x1="20"
              y1="${y}"
              x2="360"
              y2="${y}"
            ></line>
          `,
      );
    });
  }

  // ==========================================================
  // LABEL TRỤC Y
  // ==========================================================

  if (yLabels) {
    mocY.forEach(function (giaTri, index) {
      const y = 145 - index * 40;

      yLabels.insertAdjacentHTML(
        "beforeend",
        `
            <text
              x="10"
              y="${y}"
            >
              ${giaTri}
            </text>
          `,
      );
    });
  }

  // ==========================================================
  // TÍNH TỌA ĐỘ
  // ==========================================================

  const soDiem = duLieu.length;

  const points = [];

  duLieu.forEach(function (item, index) {
    const soLuong = Number(item.soLuong || 0);

    const x = soDiem === 1 ? 190 : 35 + index * (313 / (soDiem - 1));

    const y = 140 - (soLuong / maxValue) * 115;

    points.push(`${x},${y}`);

    // ======================================================
    // LABEL HK
    // ======================================================

    if (xLabels) {
      xLabels.insertAdjacentHTML(
        "beforeend",
        `
            <text
              x="${x}"
              y="170"
            >
              HK${Number(item.hocKy)}
            </text>
          `,
      );
    }
  });

  // ==========================================================
  // SVG NAMESPACE
  // ==========================================================

  const ns = "http://www.w3.org/2000/svg";

  // ==========================================================
  // TẠO ĐƯỜNG
  // ==========================================================

  const polyline = document.createElementNS(ns, "polyline");

  polyline.setAttribute("class", "duong-xu-huong-dong");

  polyline.setAttribute("points", points.join(" "));

  polyline.setAttribute("fill", "none");

  polyline.setAttribute("stroke", "#d95d57");

  polyline.setAttribute("stroke-width", "3");

  polyline.setAttribute("stroke-linecap", "round");

  polyline.setAttribute("stroke-linejoin", "round");

  svg.appendChild(polyline);

  // ==========================================================
  // TẠO CÁC ĐIỂM
  // ==========================================================

  const group = document.createElementNS(ns, "g");

  group.setAttribute("class", "cac-diem-xu-huong-dong");

  duLieu.forEach(function (item, index) {
    const soLuong = Number(item.soLuong || 0);

    const x = soDiem === 1 ? 190 : 35 + index * (313 / (soDiem - 1));

    const y = 140 - (soLuong / maxValue) * 115;

    const circle = document.createElementNS(ns, "circle");

    circle.setAttribute("cx", String(x));

    circle.setAttribute("cy", String(y));

    circle.setAttribute("r", "5");

    circle.setAttribute("fill", "#d95d57");

    circle.setAttribute("stroke", "white");

    circle.setAttribute("stroke-width", "2");

    group.appendChild(circle);
  });

  svg.appendChild(group);
}

// ============================================================
// 16. BIỂU ĐỒ RỖNG
// ============================================================

function taoBieuDoRong(svg) {
  if (!svg) {
    return;
  }

  const grid = svg.querySelector(".grid-lines");

  if (grid) {
    grid.innerHTML = `
      <line x1="20" y1="20" x2="360" y2="20"></line>
      <line x1="20" y1="60" x2="360" y2="60"></line>
      <line x1="20" y1="100" x2="360" y2="100"></line>
      <line x1="20" y1="140" x2="360" y2="140"></line>
    `;
  }
}

// ============================================================
// 17. NGUYÊN NHÂN
// ============================================================

function hienThiNguyenNhan(nguyenNhan) {
  const khung = document.getElementById("danh-sach-nguyen-nhan");

  if (!khung) {
    return;
  }

  const duLieu = Array.isArray(nguyenNhan) ? nguyenNhan : [];

  khung.innerHTML = "";

  duLieu.forEach(function (item) {
    const phanTram = Number(item.phanTram || 0);

    const className = item.className || "warning";

    const mau =
      className === "danger"
        ? "#e85d5d"
        : className === "success"
          ? "#48b86a"
          : "#f4b84d";

    khung.insertAdjacentHTML(
      "beforeend",
      `
          <div
            class="risk-row"
          >

            <div
              class="risk-label"
            >
              <span>
                ${escapeHTML(item.ten)}
              </span>

              <span
                class="risk-percent"
              >
                ${phanTram}%
              </span>
            </div>

            <div
              class="bar"
            >
              <i
                style="
                  width:${phanTram}%;
                  background:${mau};
                "
              ></i>
            </div>

          </div>
        `,
    );
  });
}

// ============================================================
// 18. BẢNG
// ============================================================

function hienThiBang(danhSach, phanTrang) {
  const tbody = document.getElementById("tbody-canh-bao-nguy-co");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="6"
          style="
            text-align:center;
            padding:35px;
            color:#6b7280;
          "
        >
          Không có sinh viên phù hợp.
        </td>
      </tr>
    `;

    return;
  }

  const viTriBatDau = Number(phanTrang?.tu || 1) - 1;

  danhSach.forEach(function (sv, index) {
    const tr = document.createElement("tr");

    const avatar = layChuAvatar(sv.hoTen);

    const avatarClass = layClassAvatar(viTriBatDau + index);

    const classNguyCo = layClassNguyCo(sv.nguyCo);

    tr.innerHTML = `
        <td>
          ${viTriBatDau + index + 1}
        </td>

        <td>
          <div
            class="student-cell"
          >

            <span
              class="
                avatar
                ${avatarClass}
              "
            >
              ${escapeHTML(avatar)}
            </span>

            <div>

              <strong>
                ${escapeHTML(sv.hoTen || "Chưa có tên")}
              </strong>

              <small>
                ${escapeHTML(sv.maSinhVien || "-")}
              </small>

            </div>
          </div>
        </td>

        <td>
          ${escapeHTML(sv.lopHoc || "-")}
        </td>

        <td>
          <span
            class="
              level
              ${classNguyCo}
            "
          >
            ${escapeHTML(sv.nguyCo || "Thấp")}
          </span>
        </td>

        <td>
  ${
    sv.gpaHienTai === null || sv.gpaHienTai === undefined
      ? "-"
      : dinhDangGPA(sv.gpaHienTai)
  }
</td>

        <td>
          <div
            class="action-icons"
          >

            <button
              type="button"
              class="
                nut-xem-chi-tiet-canh-bao
              "
              data-id="${Number(sv.idSinhVien)}"
              title="Xem chi tiết"
              aria-label="Xem chi tiết sinh viên"
            >
              <i
                class="
                  fa-solid
                  fa-eye
                "
              ></i>
            </button>

          </div>
        </td>
      `;

    tbody.appendChild(tr);
  });
}

// ============================================================
// 19. BẢNG LỖI
// ============================================================

function hienThiBangLoi(thongBao) {
  const tbody = document.getElementById("tbody-canh-bao-nguy-co");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr>
      <td
        colspan="6"
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
// 20. PHÂN TRANG
// ============================================================

function hienThiPhanTrang(phanTrang) {
  const khung = document.getElementById("phan-trang-canh-bao");

  if (!khung) {
    return;
  }

  const total = Number(phanTrang?.tongSo || 0);

  const totalPages = Number(phanTrang?.tongSoTrang || 1);

  const current = Number(phanTrang?.trangHienTai || 1);

  khung.innerHTML = "";

  // ========================================================
  // NÚT TRƯỚC
  // ========================================================

  const nutTruoc = document.createElement("button");

  nutTruoc.className = "page-btn";

  nutTruoc.type = "button";

  nutTruoc.textContent = "‹";

  nutTruoc.disabled = current <= 1;

  nutTruoc.addEventListener("click", function () {
    if (current <= 1) {
      return;
    }

    trangHienTai = current - 1;

    taiDuLieuCanhBao({
      trang: trangHienTai,
    });

    cuonLenBang();
  });

  khung.appendChild(nutTruoc);

  // ========================================================
  // TRANG
  // ========================================================

  const cacTrang = taoDanhSachTrang(current, totalPages);

  cacTrang.forEach(function (item) {
    if (item === "...") {
      const span = document.createElement("span");

      span.className = "dots";

      span.textContent = "...";

      khung.appendChild(span);

      return;
    }

    const nut = document.createElement("button");

    nut.type = "button";

    nut.className = "page-btn";

    nut.textContent = String(item);

    if (Number(item) === current) {
      nut.classList.add("active");
    }

    nut.addEventListener("click", function () {
      trangHienTai = Number(item);

      taiDuLieuCanhBao({
        trang: trangHienTai,
      });

      cuonLenBang();
    });

    khung.appendChild(nut);
  });

  // ========================================================
  // NÚT SAU
  // ========================================================

  const nutSau = document.createElement("button");

  nutSau.className = "page-btn";

  nutSau.type = "button";

  nutSau.textContent = "›";

  nutSau.disabled = current >= totalPages;

  nutSau.addEventListener("click", function () {
    if (current >= totalPages) {
      return;
    }

    trangHienTai = current + 1;

    taiDuLieuCanhBao({
      trang: trangHienTai,
    });

    cuonLenBang();
  });

  khung.appendChild(nutSau);

  if (total === 0) {
    return;
  }
}

// ============================================================
// 21. DANH SÁCH TRANG
// ============================================================

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

  const ketQua = [];

  ketQua.push(1);

  if (current > 4) {
    ketQua.push("...");
  }

  const batDau = Math.max(2, current - 1);

  const ketThuc = Math.min(total - 1, current + 1);

  for (let i = batDau; i <= ketThuc; i++) {
    ketQua.push(i);
  }

  if (current < total - 3) {
    ketQua.push("...");
  }

  ketQua.push(total);

  return ketQua;
}

// ============================================================
// 22. CUỘN ĐẾN BẢNG
// ============================================================

function cuonLenBang() {
  const bang = document.querySelector(".table-panel");

  if (!bang) {
    return;
  }

  bang.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
}

// ============================================================
// 23. CẬP NHẬT THỜI GIAN
// ============================================================

function hienThiCapNhat(giaTri) {
  const element = document.getElementById("cap-nhat-canh-bao-nguy-co");

  if (!element) {
    return;
  }

  if (!giaTri) {
    element.textContent = "Cập nhật: -";

    return;
  }

  element.textContent = `Cập nhật: ${dinhDangNgayGio(giaTri)}`;
}

// ============================================================
// 24. TẠO MODAL
// ============================================================

function taoModalChiTiet() {
  let modal = document.querySelector(".modal-canh-bao-nguy-co");

  if (modal) {
    return modal;
  }

  modal = document.createElement("div");

  modal.className = "modal-canh-bao-nguy-co";

  modal.innerHTML = `
    <div
      class="
        modal-canh-bao-noi-dung
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="
        tieu-de-modal-canh-bao
      "
    >

      <div
        class="
          modal-canh-bao-header
        "
      >

        <h2
          id="
            tieu-de-modal-canh-bao
          "
        >
          Chi tiết sinh viên
        </h2>

        <button
          type="button"
          class="
            nut-dong-modal-canh-bao
          "
          aria-label="Đóng"
        >
          <i
            class="
              fa-solid
              fa-xmark
            "
          ></i>
        </button>

      </div>

      <div
        class="
          modal-canh-bao-body
        "
      ></div>

    </div>
  `;

  document.body.appendChild(modal);

  const nutDong = modal.querySelector(".nut-dong-modal-canh-bao");

  if (nutDong) {
    nutDong.addEventListener("click", dongModalChiTiet);
  }

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      dongModalChiTiet();
    }
  });

  return modal;
}

// ============================================================
// 25. ĐÓNG MODAL
// ============================================================

function dongModalChiTiet() {
  const modal = document.querySelector(".modal-canh-bao-nguy-co");

  if (!modal) {
    return;
  }

  modal.classList.remove("dang-mo");

  document.body.style.overflow = "";
}

// ============================================================
// 26. MODAL LOADING
// ============================================================

function hienThiModalDangTai() {
  const modal = taoModalChiTiet();

  const body = modal.querySelector(".modal-canh-bao-body");

  if (!body) {
    return;
  }

  body.innerHTML = `
    <div
      style="
        min-height:220px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#68776f;
      "
    >

      <i
        class="
          fa-solid
          fa-spinner
          fa-spin
        "
        style="
          margin-right:10px;
        "
      ></i>

      Đang tải thông tin...

    </div>
  `;

  modal.classList.add("dang-mo");

  document.body.style.overflow = "hidden";
}

// ============================================================
// 27. XEM CHI TIẾT
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

  hienThiModalDangTai();

  try {
    const response = await fetch(`${API_CANH_BAO_NGUY_CO}/${id}`, {
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
      throw new Error(data?.thongBao || "Không thể tải chi tiết sinh viên.");
    }

    hienThiNoiDungModal(data.sinhVien);
  } catch (error) {
    console.error("Lỗi xem chi tiết:", error);

    const modal = taoModalChiTiet();

    const body = modal.querySelector(".modal-canh-bao-body");

    if (body) {
      body.innerHTML = `
        <div
          style="
            padding:30px;
            text-align:center;
            color:#dc2626;
          "
        >
          ${escapeHTML(error.message)}
        </div>
      `;
    }
  }
}

// ============================================================
// 28. HIỂN THỊ NỘI DUNG MODAL
// ============================================================

function hienThiNoiDungModal(sv) {
  const modal = taoModalChiTiet();

  const body = modal.querySelector(".modal-canh-bao-body");

  if (!body) {
    return;
  }

  /* ==========================================================
     GPA HIỆN TẠI

     GIỐNG TRANG DANH SÁCH SINH VIÊN:

     sv.gpaHienTai

     KHÔNG tự tính lại ở frontend.
  ========================================================== */

  const gpaHienTai =
    sv.gpaHienTai !== null && sv.gpaHienTai !== undefined
      ? Number(sv.gpaHienTai)
      : null;

  const hocKyHienTai =
    sv.hocKyHienTai !== null && sv.hocKyHienTai !== undefined
      ? Number(sv.hocKyHienTai)
      : null;

  const xepLoaiHienTai = sv.xepLoaiHienTai || "Chưa xác định";

  /* ==========================================================
     DỰ ĐOÁN HỌC KỲ
  ========================================================== */

  let duDoanHocKyHTML = "";

  if (sv.duDoanHocKy) {
    duDoanHocKyHTML = `
      <div
        class="
          canh-bao-tieu-de
        "
      >
        Dự đoán học kỳ
      </div>

      <div
        class="
          canh-bao-du-doan
        "
      >

        <div
          class="
            canh-bao-du-doan-hang
          "
        >
          <span>
            GPA dự đoán
          </span>

          <strong>
            ${dinhDangGPA(sv.duDoanHocKy.gpa)}
          </strong>
        </div>

        <div
          class="
            canh-bao-du-doan-hang
          "
        >
          <span>
            Học kỳ
          </span>

          <strong>
            HK${Number(sv.duDoanHocKy.hocKy)}
          </strong>
        </div>

        <div
          class="
            canh-bao-du-doan-hang
          "
        >
          <span>
            Xếp loại
          </span>

          <strong>
            ${escapeHTML(sv.duDoanHocKy.xepLoai || "-")}
          </strong>
        </div>

      </div>
    `;
  }

  /* ==========================================================
     DỰ ĐOÁN HỌC KỲ TIẾP THEO
  ========================================================== */

  let duDoanTiepTheoHTML = "";

  if (sv.duDoanHocKyTiepTheo) {
    const duDoan = sv.duDoanHocKyTiepTheo;

    duDoanTiepTheoHTML = `
      <div
        class="
          canh-bao-tieu-de
        "
      >
        Dự đoán học kỳ tiếp theo
      </div>

      <div
        class="
          canh-bao-du-doan
        "
      >

        <div
          class="
            canh-bao-du-doan-hang
          "
        >
          <span>
            GPA dự đoán
          </span>

          <strong>
            ${dinhDangGPA(duDoan.gpa)}
          </strong>
        </div>

        <div
          class="
            canh-bao-du-doan-hang
          "
        >
          <span>
            Học kỳ
          </span>

          <strong>
            HK${Number(duDoan.hocKy)}
          </strong>
        </div>

        <div
          class="
            canh-bao-du-doan-hang
          "
        >
          <span>
            Xếp loại dự kiến
          </span>

          <strong>
            ${escapeHTML(duDoan.xepLoai || "-")}
          </strong>
        </div>

        ${
          duDoan.tyLeChuyenCan !== null && duDoan.tyLeChuyenCan !== undefined
            ? `
              <div
                class="
                  canh-bao-du-doan-hang
                "
              >
                <span>
                  Tỷ lệ chuyên cần
                </span>

                <strong>
                  ${duDoan.tyLeChuyenCan}%
                </strong>
              </div>
            `
            : ""
        }

        ${
          duDoan.gioTuHocTuan !== null && duDoan.gioTuHocTuan !== undefined
            ? `
              <div
                class="
                  canh-bao-du-doan-hang
                "
              >
                <span>
                  Tự học / tuần
                </span>

                <strong>
                  ${duDoan.gioTuHocTuan} giờ
                </strong>
              </div>
            `
            : ""
        }

        ${
          duDoan.gioLamThemTuan !== null && duDoan.gioLamThemTuan !== undefined
            ? `
              <div
                class="
                  canh-bao-du-doan-hang
                "
              >
                <span>
                  Làm thêm / tuần
                </span>

                <strong>
                  ${duDoan.gioLamThemTuan} giờ
                </strong>
              </div>
            `
            : ""
        }

        ${
          duDoan.gpaKyGanNhat !== null && duDoan.gpaKyGanNhat !== undefined
            ? `
              <div
                class="
                  canh-bao-du-doan-hang
                "
              >
                <span>
                  GPA kỳ gần nhất
                </span>

                <strong>
                  ${dinhDangGPA(duDoan.gpaKyGanNhat)}
                </strong>
              </div>
            `
            : ""
        }

        ${
          duDoan.gpaTrungBinhLichSu !== null &&
          duDoan.gpaTrungBinhLichSu !== undefined
            ? `
              <div
                class="
                  canh-bao-du-doan-hang
                "
              >
                <span>
                  GPA trung bình lịch sử
                </span>

                <strong>
                  ${dinhDangGPA(duDoan.gpaTrungBinhLichSu)}
                </strong>
              </div>
            `
            : ""
        }

      </div>
    `;
  } else {
    duDoanTiepTheoHTML = `
      <div
        class="
          canh-bao-tieu-de
        "
      >
        Dự đoán học kỳ tiếp theo
      </div>

      <div
        class="
          canh-bao-du-doan-khong-co
        "
      >
        Sinh viên chưa có dữ liệu dự đoán GPA học kỳ tiếp theo.
      </div>
    `;
  }

  /* ==========================================================
     NHẬN ĐỊNH
  ========================================================== */

  let nhanDinhHTML = "";

  const nhanDinh = Array.isArray(sv.duDoanHocKyTiepTheo?.nhanDinh)
    ? sv.duDoanHocKyTiepTheo.nhanDinh
    : [];

  if (nhanDinh.length > 0) {
    nhanDinhHTML = `
      <div
        class="
          canh-bao-tieu-de
        "
      >
        Nhận định từ hệ thống
      </div>

      <div
        class="
          canh-bao-danh-sach-text
        "
      >
        ${nhanDinh
          .map(function (item) {
            return `
                <div
                  class="
                    canh-bao-danh-sach-text-item
                  "
                >
                  <i
                    class="
                      fa-solid
                      fa-check-circle
                    "
                  ></i>

                  <span>
                    ${escapeHTML(item)}
                  </span>
                </div>
              `;
          })
          .join("")}
      </div>
    `;
  }

  /* ==========================================================
     LỜI KHUYÊN
  ========================================================== */

  let loiKhuyenHTML = "";

  const loiKhuyen = Array.isArray(sv.duDoanHocKyTiepTheo?.loiKhuyen)
    ? sv.duDoanHocKyTiepTheo.loiKhuyen
    : [];

  if (loiKhuyen.length > 0) {
    loiKhuyenHTML = `
      <div
        class="
          canh-bao-tieu-de
        "
      >
        Lời khuyên
      </div>

      <div
        class="
          canh-bao-danh-sach-text
        "
      >
        ${loiKhuyen
          .map(function (item) {
            return `
                <div
                  class="
                    canh-bao-danh-sach-text-item
                  "
                >
                  <i
                    class="
                      fa-solid
                      fa-lightbulb
                    "
                  ></i>

                  <span>
                    ${escapeHTML(item)}
                  </span>
                </div>
              `;
          })
          .join("")}
      </div>
    `;
  }

  /* ==========================================================
     CLASS NGUY CƠ
  ========================================================== */

  const classNguyCo = layClassNguyCo(sv.nguyCo);

  /* ==========================================================
     RENDER MODAL
     
     BỎ:
       GPA các học kỳ

     THAY BẰNG:
       GPA hiện tại
  ========================================================== */

  body.innerHTML = `
    <!-- ==================================================
         THÔNG TIN SINH VIÊN
    =================================================== -->

    <div
      class="
        canh-bao-thong-tin-grid
      "
    >

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Mã sinh viên
        </span>

        <strong>
          ${escapeHTML(sv.maSinhVien || "-")}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Họ và tên
        </span>

        <strong>
          ${escapeHTML(sv.hoTen || "-")}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Lớp
        </span>

        <strong>
          ${escapeHTML(sv.lopHoc || "-")}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Khóa
        </span>

        <strong>
          ${escapeHTML(sv.khoaHoc || "-")}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Ngành học
        </span>

        <strong>
          ${escapeHTML(sv.nganhHoc || "-")}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Năm học
        </span>

        <strong>
          ${sv.namHoc ? `Năm ${escapeHTML(sv.namHoc)}` : "-"}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Học kỳ hiện tại
        </span>

        <strong>
          ${hocKyHienTai ? `HK${hocKyHienTai}` : "-"}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          GPA hiện tại
        </span>

        <strong>
          ${dinhDangGPA(gpaHienTai)}
        </strong>
      </div>

      <div
        class="
          canh-bao-o-thong-tin
        "
      >
        <span>
          Xếp loại hiện tại
        </span>

        <strong>
          ${escapeHTML(xepLoaiHienTai)}
        </strong>
      </div>

    </div>

    ${duDoanHocKyHTML}

    ${duDoanTiepTheoHTML}

    <!-- ==================================================
         NGUY CƠ
    =================================================== -->

    <div
      class="
        canh-bao-muc-nguy-co
      "
    >

      <span
        class="
          canh-bao-muc-nguy-co-label
        "
      >
        Trạng thái nguy cơ
      </span>

      <span
        class="
          canh-bao-muc-nguy-co-badge
          ${classNguyCo}
        "
      >
        ${escapeHTML(sv.nguyCo || "Thấp")}
      </span>

    </div>

    ${nhanDinhHTML}

    ${loiKhuyenHTML}
  `;

  modal.classList.add("dang-mo");

  document.body.style.overflow = "hidden";
}

// ============================================================
// 29. CLICK NÚT XEM
// ============================================================

document.addEventListener("click", function (event) {
  const nut = event.target.closest(".nut-xem-chi-tiet-canh-bao");

  if (!nut) {
    return;
  }

  const id = Number(nut.dataset.id);

  if (!Number.isInteger(id) || id <= 0) {
    return;
  }

  xemChiTietSinhVien(id);
});

// ============================================================
// 30. ESC ĐÓNG MODAL
// ============================================================

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    dongModalChiTiet();
  }
});

// ============================================================
// 31. TÌM KIẾM
// ============================================================

let timeoutTimKiem = null;

const oTimKiem = document.getElementById("tim-kiem-canh-bao");

if (oTimKiem) {
  oTimKiem.addEventListener("input", function () {
    clearTimeout(timeoutTimKiem);

    timeoutTimKiem = setTimeout(function () {
      trangHienTai = 1;

      taiDuLieuCanhBao({
        trang: 1,

        tuKhoa: oTimKiem.value.trim(),
      });
    }, 300);
  });

  oTimKiem.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();

      clearTimeout(timeoutTimKiem);

      trangHienTai = 1;

      taiDuLieuCanhBao({
        trang: 1,

        tuKhoa: oTimKiem.value.trim(),
      });
    }
  });
}

// ============================================================
// 32. KHỞI TẠO
// ============================================================

async function khoiTaoTrangCanhBaoNguyCo() {
  console.log("Đang khởi tạo trang cảnh báo nguy cơ...");

  await taiDuLieuCanhBao({
    trang: 1,
  });

  console.log("Trang cảnh báo nguy cơ đã sẵn sàng.");
}

// ============================================================
// 33. START
// ============================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", khoiTaoTrangCanhBaoNguyCo, {
    once: true,
  });
} else {
  khoiTaoTrangCanhBaoNguyCo();
}
