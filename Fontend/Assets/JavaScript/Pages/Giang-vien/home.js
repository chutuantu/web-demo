// ============================================================
// EDUPREDICT AI
// HOME GIẢNG VIÊN
// ============================================================

const API_BASE_URL = "";

const API_HOME = `${API_BASE_URL}/api/giang-vien/home`;

const API_XU_HUONG = `${API_BASE_URL}/api/giang-vien/home/xu-huong`;

const API_NGUY_CO = `${API_BASE_URL}/api/giang-vien/home/nguy-co`;

const API_HOAT_DONG = `${API_BASE_URL}/api/giang-vien/home/hoat-dong`;

const API_SINH_VIEN = `${API_BASE_URL}/api/giang-vien/home/sinh-vien`;

// ============================================================
// BIẾN TOÀN CỤC
// ============================================================

let duLieuHome = null;

let duLieuXuHuong = [];

let duLieuPhanBo = [];

let soHocKyDangXem = 6;

let chartXuHuong = null;

let chartPhanBo = null;

// ============================================================
// TOKEN
// ============================================================

function layToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================
// FORMAT SỐ
// ============================================================

function formatSo(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("vi-VN");
}

// ============================================================
// FORMAT GPA
// ============================================================

function formatGPA(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "-";
  }

  return number.toFixed(2);
}

// ============================================================
// FORMAT NGÀY GIỜ
// ============================================================

function formatNgayGio(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

// ============================================================
// "X phút trước"
// ============================================================

function formatThoiGianTuongDoi(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const now = new Date();

  const chenhLech = Math.max(0, now.getTime() - date.getTime());

  const giay = Math.floor(chenhLech / 1000);

  if (giay < 60) {
    return "Vừa xong";
  }

  const phut = Math.floor(giay / 60);

  if (phut < 60) {
    return `${phut} phút trước`;
  }

  const gio = Math.floor(phut / 60);

  if (gio < 24) {
    return `${gio} giờ trước`;
  }

  const ngay = Math.floor(gio / 24);

  if (ngay < 7) {
    return `${ngay} ngày trước`;
  }

  return formatNgayGio(value);
}

// ============================================================
// FETCH API
// ============================================================

async function goiAPI(url, options = {}) {
  const token = layToken();

  if (!token) {
    throw new Error("Không tìm thấy token đăng nhập.");
  }

  const response = await fetch(url, {
    ...options,

    headers: {
      Accept: "application/json",

      Authorization: `Bearer ${token}`,

      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("Backend không trả về JSON hợp lệ.");
  }

  if (!response.ok || !data?.thanhCong) {
    throw new Error(data?.thongBao || "Có lỗi xảy ra khi gọi API.");
  }

  return data;
}

// ============================================================
// HEADER
// ============================================================

function khoiTaoHeader() {
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

// ============================================================
// NGÀY HIỆN TẠI
// ============================================================

function capNhatNgayHomNay() {
  const elements = document.querySelectorAll(".thong-tin-ngay span");

  if (!elements.length) {
    return;
  }

  const now = new Date();

  const ngay = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  elements.forEach(function (element) {
    element.textContent = `Hôm nay là ${ngay}`;
  });
}

// ============================================================
// THÔNG TIN GV
// ============================================================

function hienThiGiangVien(giangVien) {
  if (!giangVien) {
    return;
  }

  const ten = document.querySelector(".ten-giang-vien");

  if (ten) {
    ten.textContent = giangVien.hoTen || "Giảng viên";
  }

  const tenHeader = document.querySelector(".ten span:first-child");

  if (tenHeader) {
    tenHeader.textContent = giangVien.hoTen || "Giảng viên";
  }

  const maHeader = document.querySelector(".ten span:last-child");

  if (maHeader) {
    maHeader.textContent = giangVien.maGiangVien || "";
  }

  const hoTenChiTiet = document.querySelector(".ho-ten span strong");

  if (hoTenChiTiet) {
    hoTenChiTiet.textContent = giangVien.hoTen || "";
  }

  const taiKhoan = document.querySelector(".tai-khoan span strong");

  if (taiKhoan) {
    taiKhoan.textContent = giangVien.maGiangVien || "";
  }
}

// ============================================================
// THỐNG KÊ
// ============================================================

function hienThiThongKe(thongKe) {
  if (!thongKe) {
    return;
  }

  const tong = document.getElementById("gia-tri-tong-sinh-vien");

  const nguyCoCao = document.getElementById("gia-tri-nguy-co-cao");

  const luotDuDoan = document.getElementById("gia-tri-luot-du-doan");

  const taiLieu = document.getElementById("gia-tri-tai-lieu-da-dang");

  if (tong) {
    tong.textContent = formatSo(thongKe.tongSinhVien);
  }

  if (nguyCoCao) {
    nguyCoCao.textContent = formatSo(thongKe.sinhVienNguyCoCao);
  }

  if (luotDuDoan) {
    luotDuDoan.textContent = formatSo(thongKe.luotDuDoan);
  }

  if (taiLieu) {
    taiLieu.textContent = formatSo(thongKe.taiLieuDaDang);
  }

  const soNguyCo = document.getElementById("so-sinh-vien-nguy-co");

  if (soNguyCo) {
    soNguyCo.textContent = formatSo(thongKe.tongNguyCo);
  }
}

// ============================================================
// FOOTER
// ============================================================

function hienThiThongKeTruyCap(data) {
  if (!data) {
    return;
  }

  const tong = document.getElementById("tong-truy-cap");

  const online = document.getElementById("dang-online");

  const sinhVien = document.getElementById("tong-sinh-vien-footer");

  const giangVien = document.getElementById("tong-giang-vien-footer");

  if (tong) {
    tong.textContent = formatSo(data.tongTruyCap);
  }

  if (online) {
    online.textContent = formatSo(data.dangOnline);
  }

  if (sinhVien) {
    sinhVien.textContent = formatSo(data.sinhVien);
  }

  if (giangVien) {
    giangVien.textContent = formatSo(data.giangVien);
  }
}

// ============================================================
// VẼ BIỂU ĐỒ TREND
//
// Canvas thuần.
// Không Chart.js.
// ============================================================

function veBieuDoXuHuong(data) {
  const canvas = document.getElementById("bieu-do-xu-huong");

  const khung = document.getElementById("khung-bieu-do-xu-huong");

  if (!canvas || !khung) {
    return;
  }

  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;

  const width = canvas.clientWidth || 600;

  const height = canvas.clientHeight || 215;

  canvas.width = width * dpr;

  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, width, height);

  const values = Array.isArray(data) ? data : [];

  if (values.length === 0) {
    hienThiTooltipTrend(null);

    return;
  }

  // ----------------------------------------------------------
  // KHU VỰC VẼ
  // ----------------------------------------------------------

  const laMobile = window.matchMedia("(max-width: 1024px)").matches;

  const paddingLeft = laMobile ? 26 : 20;

  const paddingRight = laMobile ? 12 : 20;

  const paddingTop = laMobile ? 22 : 12;

  const paddingBottom = 38;

  const chartWidth = width - paddingLeft - paddingRight;

  const chartHeight = height - paddingTop - paddingBottom;

  // ----------------------------------------------------------
  // ĐƯỜNG LƯỚI
  // ----------------------------------------------------------

  ctx.save();

  ctx.strokeStyle = "#edf0ef";

  ctx.lineWidth = 1;

  ctx.setLineDash([3, 4]);

  for (let i = 0; i <= 4; i++) {
    const y = paddingTop + (chartHeight * i) / 4;

    ctx.beginPath();

    ctx.moveTo(paddingLeft, y);

    ctx.lineTo(width - paddingRight, y);

    ctx.stroke();
  }

  ctx.restore();

  // ----------------------------------------------------------
  // TRỤC X
  // ----------------------------------------------------------

  ctx.save();

  ctx.fillStyle = "#737a76";

  ctx.font = "9px Arial";

  ctx.textAlign = "center";

  ctx.textBaseline = "top";

  values.forEach(function (item, index) {
    const x = tinhXTrend(index, values.length, paddingLeft, chartWidth);

    ctx.fillText(`HK${item.hocKy}`, x, height - paddingBottom + 10);
  });

  ctx.restore();

  // ----------------------------------------------------------
  // Y LABEL
  // ----------------------------------------------------------

  ctx.save();

  ctx.fillStyle = "#7b827f";

  ctx.font = "9px Arial";

  ctx.textAlign = "right";

  ctx.textBaseline = "middle";

  const yLabels = ["100%", "75%", "50%", "25%", "0%"];

  yLabels.forEach(function (label, index) {
    const y = paddingTop + (chartHeight * index) / 4;

    ctx.fillText(label, paddingLeft - 6, y);
  });

  ctx.restore();

  // ----------------------------------------------------------
  // ĐƯỜNG GPA
  //
  // Chuyển 0-4 thành 0-100
  // để cùng hệ trục.
  // ----------------------------------------------------------

  const diemGPA = veDuongTrend(
    ctx,
    values.map((item) => (Number(item.gpaTrungBinh) / 4) * 100),
    "#23965d",
    {
      width,
      height,
      paddingLeft,
      paddingTop,
      chartWidth,
      chartHeight,
      dashed: false,
    },
  );

  // ----------------------------------------------------------
  // KHÁ GIỎI
  // ----------------------------------------------------------

  const diemKhaGioi = veDuongTrend(
    ctx,
    values.map((item) => Number(item.tiLeKhaGioi)),
    "#4289db",
    {
      width,
      height,
      paddingLeft,
      paddingTop,
      chartWidth,
      chartHeight,
    },
  );

  // ----------------------------------------------------------
  // NGUY CƠ
  // ----------------------------------------------------------

  const diemNguyCo = veDuongTrend(
    ctx,
    values.map((item) => Number(item.tiLeNguyCo)),
    "#d9534f",
    {
      width,
      height,
      paddingLeft,
      paddingTop,
      chartWidth,
      chartHeight,
    },
  );

  chartXuHuong = [
    {
      ten: "GPA trung bình",
      mau: "#23965d",
      diem: diemGPA,
      loai: "gpa",
    },

    {
      ten: "Tỷ lệ sinh viên khá giỏi",
      mau: "#4289db",
      diem: diemKhaGioi,
      loai: "phan-tram",
    },

    {
      ten: "Tỷ lệ sinh viên nguy cơ",
      mau: "#d9534f",
      diem: diemNguyCo,
      loai: "phan-tram",
    },
  ];
}

// ============================================================
// TINH X
// ============================================================

function tinhXTrend(index, total, left, width) {
  if (total <= 1) {
    return left + width / 2;
  }

  return left + (width / (total - 1)) * index;
}

// ============================================================
// TINH Y
// ============================================================

function tinhYTrend(value, top, height) {
  const normalized = Math.max(0, Math.min(100, Number(value) || 0));

  return top + height * (1 - normalized / 100);
}

// ============================================================
// VẼ 1 ĐƯỜNG
// ============================================================

function veDuongTrend(ctx, values, color, config) {
  const { width, paddingLeft, paddingTop, chartWidth, chartHeight } = config;

  const points = values.map(function (value, index) {
    const x = tinhXTrend(index, values.length, paddingLeft, chartWidth);

    const y = tinhYTrend(value, paddingTop, chartHeight);

    return {
      x,
      y,
      value,
    };
  });

  ctx.save();

  ctx.beginPath();

  ctx.strokeStyle = color;

  ctx.lineWidth = 2;

  ctx.lineCap = "round";

  ctx.lineJoin = "round";

  if (config.dashed) {
    ctx.setLineDash([5, 4]);
  }

  points.forEach(function (point, index) {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();

  ctx.restore();

  // --------------------------------------------------------
  // ĐIỂM
  // --------------------------------------------------------

  points.forEach(function (point) {
    ctx.save();

    ctx.beginPath();

    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);

    ctx.fillStyle = "#ffffff";

    ctx.fill();

    ctx.beginPath();

    ctx.arc(point.x, point.y, 2.8, 0, Math.PI * 2);

    ctx.fillStyle = color;

    ctx.fill();

    ctx.restore();

    // ----------------------------------------------------
    // LABEL
    // ----------------------------------------------------

    ctx.save();

    ctx.fillStyle = color;

    ctx.font = "600 9px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "bottom";

    let label;

    if (color === "#23965d") {
      label = ((Number(point.value) / 100) * 4).toFixed(2);
    } else {
      label = `${Number(point.value).toFixed(0)}%`;
    }

    ctx.fillText(label, point.x, point.y - 7);

    ctx.restore();
  });

  return points;
}

// ============================================================
// TOOLTIP TREND
// ============================================================

function khoiTaoTooltipTrend() {
  const canvas = document.getElementById("bieu-do-xu-huong");

  const khung = document.getElementById("khung-bieu-do-xu-huong");

  const tooltip = document.getElementById("hop-thong-tin-bieu-do");

  const tieuDe = document.getElementById("tieu-de-tooltip");

  const noiDung = document.getElementById("noi-dung-tooltip");

  if (!canvas || !khung || !tooltip || !tieuDe || !noiDung) {
    return;
  }

  canvas.addEventListener("mousemove", function (event) {
    if (!Array.isArray(chartXuHuong)) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;

    const y = event.clientY - rect.top;

    let ganNhat = null;

    let khoangCach = 18;

    chartXuHuong.forEach(function (nhom) {
      nhom.diem.forEach(function (diem) {
        const dx = x - diem.x;

        const dy = y - diem.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < khoangCach) {
          khoangCach = distance;

          ganNhat = {
            nhom,
            diem,
          };
        }
      });
    });

    if (!ganNhat) {
      tooltip.style.display = "none";

      return;
    }

    const item =
      duLieuXuHuong[
        Math.min(
          duLieuXuHuong.length - 1,
          Math.max(0, nhomIndexTuDiem(ganNhat)),
        )
      ];

    if (!item) {
      return;
    }

    const ten = ganNhat.nhom.ten;

    tieuDe.textContent = `HK${item.hocKy}`;

    let giaTri;

    if (ganNhat.nhom.loai === "gpa") {
      giaTri = `${formatGPA(item.gpaTrungBinh)}`;
    } else if (ten === "Tỷ lệ sinh viên khá giỏi") {
      giaTri = `${item.tiLeKhaGioi}%`;
    } else {
      giaTri = `${item.tiLeNguyCo}%`;
    }

    noiDung.innerHTML = `
        <div class="dong-tooltip">
          <span
            class="diem-tooltip"
            style="
              background:${ganNhat.nhom.mau}
            "
          ></span>

          <span>
            ${escapeHTML(ten)}:
            <strong>
              ${escapeHTML(giaTri)}
            </strong>
          </span>
        </div>
      `;

    tooltip.style.display = "block";

    let left = x + 15;

    let top = y - 55;

    if (left + tooltip.offsetWidth > khung.clientWidth) {
      left = x - tooltip.offsetWidth - 15;
    }

    if (top < 5) {
      top = 5;
    }

    tooltip.style.left = `${left}px`;

    tooltip.style.top = `${top}px`;
  });

  canvas.addEventListener("mouseleave", function () {
    tooltip.style.display = "none";
  });
}

// ============================================================
// TÌM INDEX ĐIỂM
// ============================================================

function nhomIndexTuDiem(thongTin) {
  const diem = thongTin.diem;

  const danhSach = thongTin.nhom.diem;

  let ganNhat = 0;

  let min = Infinity;

  danhSach.forEach(function (item, index) {
    const dx = Math.abs(item.x - diem.x);

    if (dx < min) {
      min = dx;

      ganNhat = index;
    }
  });

  return ganNhat;
}

// ============================================================
// DONUT PHÂN BỐ
// ============================================================

function veBieuDoPhanBo(data) {
  const canvas = document.getElementById("bieu-do-phan-bo-xep-loai");

  const danhSach = document.getElementById("danh-sach-xep-loai");

  if (!canvas || !danhSach) {
    return;
  }

  const ctx = canvas.getContext("2d");

  const size = Math.min(canvas.clientWidth || 180, canvas.clientHeight || 180);

  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;

  canvas.height = size * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(0, 0, size, size);

  const center = size / 2;

  const radius = Math.min(76, size / 2 - 8);

  const innerRadius = radius - 22;

  const colors = {
    "Xuất sắc": "#168a55",

    Giỏi: "#4389df",

    Khá: "#68b982",

    "Trung bình": "#f1ad35",

    Yếu: "#e15b55",
  };

  const tong = data.reduce(
    (total, item) => total + Number(item.soLuong || 0),
    0,
  );

  let angle = -Math.PI / 2;

  data.forEach(function (item) {
    const soLuong = Number(item.soLuong || 0);

    if (soLuong <= 0 || tong <= 0) {
      return;
    }

    const slice = (soLuong / tong) * Math.PI * 2;

    ctx.beginPath();

    ctx.arc(center, center, radius, angle, angle + slice);

    ctx.arc(center, center, innerRadius, angle + slice, angle, true);

    ctx.closePath();

    ctx.fillStyle = colors[item.ten] || "#9ca3af";

    ctx.fill();

    angle += slice;
  });

  // ----------------------------------------------------------
  // Trung tâm
  // ----------------------------------------------------------

  ctx.fillStyle = "#ffffff";

  ctx.beginPath();

  ctx.arc(center, center, innerRadius - 1, 0, Math.PI * 2);

  ctx.fill();

  chartPhanBo = data;

  // ----------------------------------------------------------
  // Cập nhật list
  // ----------------------------------------------------------

  const mapping = {
    "xuat-sac": "Xuất sắc",
    gioi: "Giỏi",
    kha: "Khá",
    "trung-binh": "Trung bình",
    yeu: "Yếu",
  };

  Object.entries(mapping).forEach(function ([id, ten]) {
    const row = danhSach.querySelector(`[data-loai="${id}"]`);

    if (!row) {
      return;
    }

    const item = data.find((element) => element.ten === ten);

    if (!item) {
      return;
    }

    const strong = row.querySelector(".so-luong-xep-loai strong");

    const span = row.querySelector(".so-luong-xep-loai span");

    if (strong) {
      strong.textContent = formatSo(item.soLuong);
    }

    if (span) {
      span.textContent = `(${item.phanTram}%)`;
    }
  });

  const tongElement = document.getElementById("tong-sinh-vien-phan-bo");

  if (tongElement) {
    tongElement.textContent = formatSo(tong);
  }
}

// ============================================================
// NGUY CƠ HOME - HIỂN THỊ 5 NGƯỜI
// ============================================================

function hienThiDanhSachNguyCo(danhSach, tongCao, tongTrungBinh) {
  const khung = document.getElementById("khung-danh-sach-nguy-co-home");

  if (!khung) {
    return;
  }

  const header = khung.querySelector(".tieu-de-bang-nguy-co");

  khung.innerHTML = header ? header.outerHTML : "";

  const boLoc = document.getElementById("bo-loc-nguy-co");

  const mucLoc = boLoc?.value || "cao";

  let danhSachHien = Array.isArray(danhSach) ? danhSach : [];

  if (mucLoc === "cao") {
    danhSachHien = danhSach.filter((sv) => sv.nguyCo === "Cao");
  } else if (mucLoc === "trung-binh") {
    danhSachHien = danhSach.filter((sv) => sv.nguyCo === "Trung bình");
  } else {
    danhSachHien = danhSach;
  }

  danhSachHien = danhSachHien.slice(0, 5);

  if (danhSachHien.length === 0) {
    khung.insertAdjacentHTML(
      "beforeend",
      `
        <div
          style="
            padding:25px;
            text-align:center;
            color:#79837f;
            font-size:12px;
          "
        >
          <i
            class="fa-solid fa-user-check"
            style="
              display:block;
              margin-bottom:8px;
              font-size:20px;
            "
          ></i>

          Không có sinh viên phù hợp.
        </div>
      `,
    );

    return;
  }

  danhSachHien.forEach(function (sv) {
    const row = document.createElement("div");

    row.className = "dong-sinh-vien-nguy-co";

    row.dataset.mucDo = sv.nguyCo === "Cao" ? "cao" : "trung-binh";

    const phanTram = tinhPhanTramNguyCo(sv);

    row.innerHTML = `
        <div
          class="thong-tin-sinh-vien-nguy-co"
        >
          <div
            class="anh-sinh-vien-nguy-co"
          >
            <span
              style="
                font-weight:700;
                font-size:11px;
              "
            >
              ${escapeHTML(sv.avatar || "?")}
            </span>
          </div>

          <div>
            <strong>
              ${escapeHTML(sv.hoTen || "-")}
            </strong>

            <span>
              ${escapeHTML(sv.maSinhVien || "-")}
            </span>
          </div>
        </div>

        <div
          class="thong-tin-lop-nguy-co"
        >
          ${escapeHTML(sv.lopHoc || "-")}
        </div>

        <div
          class="diem-gpa-nguy-co"
        >
          ${formatGPA(sv.gpa)}
        </div>

        <div>
          <span
            class="
              diem-nguy-co
              ${sv.nguyCo === "Cao" ? "cao" : "trung-binh"}
            "
          >
            ${phanTram}%
          </span>
        </div>

        <div
          class="nguyen-nhan-nguy-co"
        >
          <span>
            ${escapeHTML(sv.nguyenNhan || "-")}
          </span>
        </div>

        <div>
          <span
            class="
              trang-thai-nguy-co
              ${sv.nguyCo === "Cao" ? "cao" : "trung-binh"}
            "
          >
            ${sv.nguyCo === "Cao" ? "Nguy cơ cao" : "Cần theo dõi"}
          </span>
        </div>

        <div>
          <button
            type="button"
            class="nut-xem-sinh-vien"
            data-id="${Number(sv.idSinhVien)}"
          >
            Xem
            <i
              class="fa-solid fa-chevron-right"
            ></i>
          </button>
        </div>
      `;

    khung.appendChild(row);
  });

  const soElement = document.getElementById("so-sinh-vien-nguy-co");

  if (soElement) {
    soElement.textContent = formatSo(tongCao + tongTrungBinh);
  }
}

// ============================================================
// TÍNH PHẦN TRĂM NGUY CƠ HIỂN THỊ
// ============================================================

function tinhPhanTramNguyCo(sv) {
  const gpa = Number(sv.gpa);

  if (!Number.isFinite(gpa)) {
    return 0;
  }

  let result = 50 + (2.5 - gpa) * 40;

  result = Math.max(0, Math.min(100, result));

  return Math.round(result);
}

// ============================================================
// LOAD TẤT CẢ NGUY CƠ CHO MODAL
// ============================================================

async function layToanBoNguyCo(mucDo = "cao") {
  const params = new URLSearchParams();

  params.set("mucDo", mucDo);

  return goiAPI(`${API_NGUY_CO}?${params.toString()}`);
}

// ============================================================
// MODAL
// ============================================================

function taoModal(id, tieuDe) {
  let modal = document.getElementById(id);

  if (modal) {
    return modal;
  }

  modal = document.createElement("div");

  modal.id = id;

  modal.className = "modal-home-gv";

  modal.innerHTML = `
    <div
      class="noi-dung-modal-home-gv"
    >
      <div
        class="dau-modal-home-gv"
      >
        <h2>
          ${escapeHTML(tieuDe)}
        </h2>

        <button
          type="button"
          class="nut-dong-modal-home-gv"
        >
          <i
            class="fa-solid fa-xmark"
          ></i>
        </button>
      </div>

      <div
        class="noi-dung-trong-modal-home-gv"
      ></div>
    </div>
  `;

  document.body.appendChild(modal);

  const nutDong = modal.querySelector(".nut-dong-modal-home-gv");

  nutDong.addEventListener("click", function () {
    dongModal(id);
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      dongModal(id);
    }
  });

  return modal;
}

function moModal(id) {
  const modal = document.getElementById(id);

  if (!modal) {
    return;
  }

  modal.classList.add("dang-mo");

  document.body.style.overflow = "hidden";
}

function dongModal(id) {
  const modal = document.getElementById(id);

  if (!modal) {
    return;
  }

  modal.classList.remove("dang-mo");

  document.body.style.overflow = "";
}

// ============================================================
// MODAL TẤT CẢ NGUY CƠ
// ============================================================

function hienThiModalNguyCo(danhSach) {
  const modal = taoModal(
    "modal-tat-ca-nguy-co",
    "Tất cả sinh viên cần theo dõi",
  );

  const noiDung = modal.querySelector(".noi-dung-trong-modal-home-gv");

  if (!noiDung) {
    return;
  }

  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    noiDung.innerHTML = `
      <div
        style="
          padding:40px;
          text-align:center;
          color:#758079;
        "
      >
        Không có sinh viên nguy cơ.
      </div>
    `;

    moModal("modal-tat-ca-nguy-co");

    return;
  }

  noiDung.innerHTML = `
    <div
      class="danh-sach-nguy-co-modal"
    >
      ${danhSach
        .map(function (sv) {
          return `
              <div
                class="dong-nguy-co-modal"
              >
                <div
                  class="thong-tin-nguy-co-modal"
                >
                  <div
                    class="avatar-nguy-co-modal"
                  >
                    ${escapeHTML(sv.avatar || "?")}
                  </div>

                  <div>
                    <strong>
                      ${escapeHTML(sv.hoTen || "-")}
                    </strong>

                    <small>
                      ${escapeHTML(sv.maSinhVien || "-")}
                      ${sv.lopHoc ? ` · ${escapeHTML(sv.lopHoc)}` : ""}
                    </small>
                  </div>
                </div>

                <strong>
                  ${formatGPA(sv.gpa)}
                </strong>

                <span>
                  ${escapeHTML(sv.nguyenNhan || "-")}
                </span>

                <span
                  class="
                    badge-nguy-co-modal
                    ${sv.nguyCo === "Cao" ? "cao" : "trung-binh"}
                  "
                >
                  ${escapeHTML(sv.nguyCo)}
                </span>
              </div>
            `;
        })
        .join("")}
    </div>
  `;

  moModal("modal-tat-ca-nguy-co");
}

// ============================================================
// MODAL CHI TIẾT SINH VIÊN
// ============================================================

async function xemChiTietSinhVien(id) {
  const modal = taoModal("modal-chi-tiet-sinh-vien", "Chi tiết sinh viên");

  const noiDung = modal.querySelector(".noi-dung-trong-modal-home-gv");

  if (!noiDung) {
    return;
  }

  noiDung.innerHTML = `
    <div
      style="
        min-height:200px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#748079;
      "
    >
      <i
        class="fa-solid fa-spinner fa-spin"
        style="margin-right:8px"
      ></i>

      Đang tải dữ liệu...
    </div>
  `;

  moModal("modal-chi-tiet-sinh-vien");

  try {
    const data = await goiAPI(`${API_SINH_VIEN}/${Number(id)}`);

    const sv = data.sinhVien;

    const gpaHocKy = Array.isArray(sv.gpaHocKy) ? sv.gpaHocKy : [];

    noiDung.innerHTML = `
      <div
        class="modal-thong-tin-sinh-vien"
      >
        ${taoOThongTin("Mã sinh viên", sv.maSinhVien)}

        ${taoOThongTin("Họ và tên", sv.hoTen)}

        ${taoOThongTin("Lớp", sv.lopHoc)}

        ${taoOThongTin("Khóa", sv.khoaHoc)}

        ${taoOThongTin("Ngành học", sv.nganhHoc)}

        ${taoOThongTin("GPA hiện tại", formatGPA(sv.gpaHienTai))}

        ${taoOThongTin("Xếp loại", sv.xepLoaiHienTai)}

        ${taoOThongTin("Mức nguy cơ", sv.nguyCo)}
      </div>

      <div
        class="tieu-de-modal-home-gv"
      >
        GPA các học kỳ
      </div>

      ${
        gpaHocKy.length > 0
          ? `
            <div
              class="danh-sach-gpa-modal"
            >
              ${gpaHocKy
                .map(function (item) {
                  return `
                      <div
                        class="item-gpa-modal"
                      >
                        <span>
                          HK${Number(item.hocKy)}
                        </span>

                        <strong>
                          ${formatGPA(item.gpa)}
                        </strong>
                      </div>
                    `;
                })
                .join("")}
            </div>
          `
          : `
            <div
              style="
                color:#7a847f;
                font-size:12px;
              "
            >
              Chưa có dữ liệu GPA thực tế.
            </div>
          `
      }

      <div
        class="tieu-de-modal-home-gv"
      >
        Dự đoán học kỳ tiếp theo
      </div>

      ${
        sv.duDoan
          ? `
            <div
              class="khung-du-doan-modal"
            >
              ${taoDongDuDoan("Học kỳ dự đoán", `HK${sv.duDoan.hocKy}`)}

              ${taoDongDuDoan("GPA dự đoán", formatGPA(sv.duDoan.gpa))}

              ${taoDongDuDoan("Xếp loại", sv.duDoan.xepLoai || "-")}

              ${taoDongDuDoan(
                "Chuyên cần",
                sv.duDoan.tyLeChuyenCan !== null
                  ? `${sv.duDoan.tyLeChuyenCan}%`
                  : "-",
              )}

              ${taoDongDuDoan(
                "Tự học / tuần",
                sv.duDoan.gioTuHocTuan !== null
                  ? `${sv.duDoan.gioTuHocTuan} giờ`
                  : "-",
              )}

              ${taoDongDuDoan(
                "Làm thêm / tuần",
                sv.duDoan.gioLamThemTuan !== null
                  ? `${sv.duDoan.gioLamThemTuan} giờ`
                  : "-",
              )}
            </div>
          `
          : `
            <div
              style="
                padding:14px;
                border-radius:10px;
                background:#f8faf9;
                color:#78837d;
                font-size:12px;
              "
            >
              Sinh viên chưa có dự đoán GPA học kỳ tiếp theo.
            </div>
          `
      }

      ${
        sv.nguyenNhan
          ? `
            <div
              class="tieu-de-modal-home-gv"
            >
              Nguyên nhân / nhận định
            </div>

            <div
              class="danh-sach-text-modal"
            >
              <div
                class="dong-text-modal"
              >
                <i
                  class="fa-solid fa-circle-info"
                ></i>

                <span>
                  ${escapeHTML(sv.nguyenNhan)}
                </span>
              </div>
            </div>
          `
          : ""
      }

      ${
        sv.duDoan &&
        Array.isArray(sv.duDoan.nhanDinh) &&
        sv.duDoan.nhanDinh.length > 0
          ? `
            <div
              class="tieu-de-modal-home-gv"
            >
              Nhận định từ hệ thống
            </div>

            <div
              class="danh-sach-text-modal"
            >
              ${sv.duDoan.nhanDinh
                .map(function (item) {
                  return `
                      <div
                        class="dong-text-modal"
                      >
                        <i
                          class="fa-solid fa-check-circle"
                        ></i>

                        <span>
                          ${escapeHTML(item)}
                        </span>
                      </div>
                    `;
                })
                .join("")}
            </div>
          `
          : ""
      }

      ${
        sv.duDoan &&
        Array.isArray(sv.duDoan.loiKhuyen) &&
        sv.duDoan.loiKhuyen.length > 0
          ? `
            <div
              class="tieu-de-modal-home-gv"
            >
              Lời khuyên
            </div>

            <div
              class="danh-sach-text-modal"
            >
              ${sv.duDoan.loiKhuyen
                .map(function (item) {
                  return `
                      <div
                        class="dong-text-modal"
                      >
                        <i
                          class="fa-solid fa-lightbulb"
                        ></i>

                        <span>
                          ${escapeHTML(item)}
                        </span>
                      </div>
                    `;
                })
                .join("")}
            </div>
          `
          : ""
      }
    `;
  } catch (error) {
    noiDung.innerHTML = `
      <div
        style="
          padding:30px;
          text-align:center;
          color:#d9534f;
        "
      >
        ${escapeHTML(error.message)}
      </div>
    `;
  }
}

// ============================================================
// Ô THÔNG TIN
// ============================================================

function taoOThongTin(label, value) {
  return `
    <div
      class="o-thong-tin-modal-home-gv"
    >
      <span>
        ${escapeHTML(label)}
      </span>

      <strong>
        ${escapeHTML(value || "-")}
      </strong>
    </div>
  `;
}

// ============================================================
// DÒNG DỰ ĐOÁN
// ============================================================

function taoDongDuDoan(label, value) {
  return `
    <div
      class="dong-du-doan-modal"
    >
      <span>
        ${escapeHTML(label)}
      </span>

      <strong>
        ${escapeHTML(value)}
      </strong>
    </div>
  `;
}

// ============================================================
// MODAL NHẬT KÝ
// ============================================================

function hienThiModalNhatKy(danhSach) {
  const modal = taoModal("modal-nhat-ky-home-gv", "Nhật ký hoạt động");

  const noiDung = modal.querySelector(".noi-dung-trong-modal-home-gv");

  if (!noiDung) {
    return;
  }

  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    noiDung.innerHTML = `
      <div
        style="
          padding:40px;
          text-align:center;
          color:#78837d;
        "
      >
        Chưa có hoạt động nào.
      </div>
    `;

    moModal("modal-nhat-ky-home-gv");

    return;
  }

  noiDung.innerHTML = `
    <div
      class="nhat-ky-modal"
    >
      ${danhSach
        .map(function (item) {
          return `
              <div
                class="item-nhat-ky-modal"
              >
                <div
                  class="
                    icon-nhat-ky-modal
                    ${escapeHTML(item.classIcon || "")}
                  "
                >
                  <i
                    class="fa-solid
                      ${escapeHTML(item.icon || "fa-clock")}
                  ></i>
                </div>

                <div
                  class="noi-dung-nhat-ky-modal"
                >
                  <strong>
                    ${escapeHTML(item.tieuDe || "-")}
                  </strong>

                  <span>
                    ${escapeHTML(item.noiDung || "-")}
                  </span>
                </div>

                <div
                  class="thoi-gian-nhat-ky-modal"
                >
                  ${formatThoiGianTuongDoi(item.thoiGian)}
                  <br />

                  <small>
                    ${formatNgayGio(item.thoiGian)}
                  </small>
                </div>
              </div>
            `;
        })
        .join("")}
    </div>
  `;

  moModal("modal-nhat-ky-home-gv");
}

// ============================================================
// SỰ KIỆN
// ============================================================

function khoiTaoSuKien() {
  // ----------------------------------------------------------
  // FILTER NGUY CƠ
  // ----------------------------------------------------------

  const boLoc = document.getElementById("bo-loc-nguy-co");

  if (boLoc) {
    boLoc.addEventListener("change", function () {
      hienThiDanhSachNguyCo(
        duLieuHome?.sinhVienNguyCoCao || [],
        Number(duLieuHome?.tongSinhVienNguyCoCao || 0),
        Number(duLieuHome?.tongSinhVienNguyCoTrungBinh || 0),
      );
    });
  }

  // ----------------------------------------------------------
  // FILTER TREND
  // ----------------------------------------------------------

  const boLocHocKy = document.getElementById("bo-loc-hoc-ky");

  if (boLocHocKy) {
    boLocHocKy.addEventListener("change", async function () {
      const so = Number(this.value);

      if (![3, 4, 6].includes(so)) {
        return;
      }

      soHocKyDangXem = so;

      try {
        const data = await goiAPI(`${API_XU_HUONG}?soHocKy=${so}`);

        duLieuXuHuong = Array.isArray(data.xuHuong) ? data.xuHuong : [];

        veBieuDoXuHuong(duLieuXuHuong);
      } catch (error) {
        console.error("Lỗi đổi bộ lọc học kỳ:", error);
      }
    });
  }

  // ----------------------------------------------------------
  // XEM TẤT CẢ NGUY CƠ
  // ----------------------------------------------------------

  const nutXemTatCa = document.getElementById("nut-xem-danh-sach-nguy-co");

  if (nutXemTatCa) {
    nutXemTatCa.addEventListener("click", async function () {
      const mucDo = boLoc?.value || "cao";

      try {
        nutXemTatCa.disabled = true;

        const data = await layToanBoNguyCo(mucDo);

        hienThiModalNguyCo(data.sinhVien || []);
      } catch (error) {
        console.error(error);

        alert(error.message);
      } finally {
        nutXemTatCa.disabled = false;
      }
    });
  }

  // ----------------------------------------------------------
  // XEM NHẬT KÝ
  // ----------------------------------------------------------

  const nutNhatKy = document.getElementById("nut-xem-nhat-ky");

  if (nutNhatKy) {
    nutNhatKy.addEventListener("click", async function () {
      try {
        nutNhatKy.disabled = true;

        const data = await goiAPI(`${API_HOAT_DONG}?gioiHan=100`);

        hienThiModalNhatKy(data.hoatDong || []);
      } catch (error) {
        console.error(error);

        alert(error.message);
      } finally {
        nutNhatKy.disabled = false;
      }
    });
  }

  // ----------------------------------------------------------
  // CLICK "XEM" SINH VIÊN
  // ----------------------------------------------------------

  document.addEventListener("click", function (event) {
    const button = event.target.closest(".nut-xem-sinh-vien");

    if (!button) {
      return;
    }

    const id = Number(button.dataset.id);

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    xemChiTietSinhVien(id);
  });

  // ----------------------------------------------------------
  // ESC
  // ----------------------------------------------------------

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      [
        "modal-tat-ca-nguy-co",
        "modal-chi-tiet-sinh-vien",
        "modal-nhat-ky-home-gv",
      ].forEach(function (id) {
        dongModal(id);
      });
    }
  });

  // ----------------------------------------------------------
  // RESIZE
  // ----------------------------------------------------------

  window.addEventListener("resize", function () {
    veBieuDoXuHuong(duLieuXuHuong);

    veBieuDoPhanBo(duLieuPhanBo);
  });
}

// ============================================================
// LOAD HOME
// ============================================================

async function taiTrangHome() {
  try {
    const data = await goiAPI(API_HOME);

    duLieuHome = data;

    hienThiGiangVien(data.giangVien);

    capNhatNgayHomNay();

    hienThiThongKe(data.thongKe);

    hienThiThongKeTruyCap(data.thongKeTruyCap);

    duLieuXuHuong = Array.isArray(data.xuHuong) ? data.xuHuong : [];

    duLieuPhanBo = Array.isArray(data.phanBoXepLoai) ? data.phanBoXepLoai : [];

    veBieuDoXuHuong(duLieuXuHuong);

    veBieuDoPhanBo(duLieuPhanBo);

    hienThiDanhSachNguyCo(
      [
        ...(data.sinhVienNguyCoCao || []),
        ...(data.sinhVienNguyCoTrungBinh || []),
      ],
      Number(data.tongSinhVienNguyCoCao || 0),
      Number(data.tongSinhVienNguyCoTrungBinh || 0),
    );

    hienThiHoatDongHome(data.hoatDong || []);
  } catch (error) {
    console.error("Lỗi tải trang home giảng viên:", error);

    hienThiLoiHome(error.message);
  }
}

// ============================================================
// HOẠT ĐỘNG 5 DÒNG HOME
// ============================================================

function hienThiHoatDongHome(danhSach) {
  const khung = document.getElementById("danh-sach-hoat-dong");

  if (!khung) {
    return;
  }

  khung.innerHTML = "";

  const ds = Array.isArray(danhSach) ? danhSach.slice(0, 5) : [];

  if (ds.length === 0) {
    khung.innerHTML = `
      <div
        style="
          padding:25px;
          text-align:center;
          color:#78827d;
          font-size:12px;
        "
      >
        Chưa có hoạt động gần đây.
      </div>
    `;

    return;
  }

  ds.forEach(function (item, index) {
    const div = document.createElement("div");

    div.className = "muc-hoat-dong";

    div.innerHTML = `
        <div
          class="
            bieu-tuong-hoat-dong-nho
            ${escapeHTML(item.classIcon || "du-doan")}
          "
        >
          <i
            class="fa-solid
              ${escapeHTML(item.icon || "fa-clock")}
          ></i>
        </div>

        <div
          class="noi-dung-hoat-dong"
        >
          <strong>
            ${escapeHTML(item.tieuDe || "-")}
          </strong>

          <span>
            ${escapeHTML(item.noiDung || "-")}
          </span>
        </div>

        <div
          class="thoi-gian-hoat-dong"
        >
          <span>
            ${formatThoiGianTuongDoi(item.thoiGian)}
          </span>
        </div>
      `;

    div.style.opacity = "0";

    div.style.transform = "translateY(7px)";

    khung.appendChild(div);

    setTimeout(
      function () {
        div.style.transition = "opacity 0.3s ease, transform 0.3s ease";

        div.style.opacity = "1";

        div.style.transform = "translateY(0)";
      },
      80 + index * 70,
    );
  });
}

// ============================================================
// HIỂN THỊ LỖI
// ============================================================

function hienThiLoiHome(message) {
  const main = document.querySelector(".noi-dung-chinh");

  if (!main) {
    return;
  }

  const old = document.getElementById("thong-bao-loi-home-gv");

  if (old) {
    old.remove();
  }

  const div = document.createElement("div");

  div.id = "thong-bao-loi-home-gv";

  div.style.position = "fixed";

  div.style.right = "20px";

  div.style.bottom = "20px";

  div.style.zIndex = "99999";

  div.style.padding = "12px 16px";

  div.style.borderRadius = "10px";

  div.style.background = "#fff0ef";

  div.style.border = "1px solid #ffd1cf";

  div.style.color = "#c84646";

  div.style.fontSize = "12px";

  div.style.boxShadow = "0 10px 30px rgba(0,0,0,.10)";

  div.innerHTML = `
    <i
      class="fa-solid fa-circle-exclamation"
      style="margin-right:6px"
    ></i>

    ${escapeHTML(message || "Không thể tải dữ liệu.")}
  `;

  document.body.appendChild(div);
}

// ============================================================
// KHỞI TẠO
// ============================================================

async function khoiTaoHomeGiangVien() {
  khoiTaoHeader();

  khoiTaoTooltipTrend();

  khoiTaoSuKien();

  capNhatNgayHomNay();

  await taiTrangHome();
}

// ============================================================
// START
// ============================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", khoiTaoHomeGiangVien, {
    once: true,
  });
} else {
  khoiTaoHomeGiangVien();
}
