/* =========================================================
   HOME - ĐỒNG BỘ BACKEND
   API:
   GET /api/home/du-lieu
========================================================= */

/* =========================================================
   1. CẤU HÌNH API
========================================================= */

const API_BASE_URL = "http://localhost:3000";

const API_HOME = `${API_BASE_URL}/api/home/du-lieu`;

/* =========================================================
   2. LẤY TOKEN
========================================================= */

function layToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/* =========================================================
   3. THÔNG TIN HEADER
========================================================= */

const muiTenThongTin = document.querySelector(".thong-tin");

const khungThongTinChiTiet = document.querySelector(".thong-tin-chi-tiet");

const iconMuiTen = document.querySelector(".thong-tin > i");

if (muiTenThongTin && khungThongTinChiTiet && iconMuiTen) {
  muiTenThongTin.addEventListener("click", function (e) {
    khungThongTinChiTiet.classList.toggle("show");
    iconMuiTen.classList.toggle("active");
    e.stopPropagation();
  });

  khungThongTinChiTiet.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("click", function () {
    khungThongTinChiTiet.classList.remove("show");
    iconMuiTen.classList.remove("active");
  });
}

/* =========================================================
   4. BANNER
========================================================= */

const carouselSlide = document.querySelector(".hop-banner");

const images = document.querySelectorAll(".banner img");

const dots = document.querySelectorAll(".dot");

const prevBtn = document.querySelector(".ben-trai");

const nextBtn = document.querySelector(".ben-phai");

let currentIndex = 0;
let timer = null;

if (carouselSlide && images.length > 0) {
  const totalImages = images.length;

  if (totalImages > 1) {
    const firstClone = images[0].cloneNode(true);

    carouselSlide.appendChild(firstClone);
  }

  function capNhatBanner(index) {
    carouselSlide.style.transition = "transform 0.5s ease-in-out";

    currentIndex = index;

    carouselSlide.style.transform = `translateX(${-currentIndex * 100}%)`;

    dots.forEach((dot) => {
      dot.classList.remove("active");
    });

    if (dots.length > 0) {
      let dotIndex = currentIndex;

      if (currentIndex >= totalImages) {
        dotIndex = 0;
      }

      if (currentIndex < 0) {
        dotIndex = totalImages - 1;
      }

      dots[dotIndex]?.classList.add("active");
    }
  }

  carouselSlide.addEventListener("transitionend", function () {
    if (totalImages > 1 && currentIndex === totalImages) {
      carouselSlide.style.transition = "none";

      currentIndex = 0;

      carouselSlide.style.transform = "translateX(0%)";
    }

    if (totalImages > 1 && currentIndex < 0) {
      carouselSlide.style.transition = "none";

      currentIndex = totalImages - 1;

      carouselSlide.style.transform = `translateX(${-currentIndex * 100}%)`;
    }
  });

  function nextBanner() {
    if (totalImages <= 1) {
      return;
    }

    if (currentIndex >= totalImages) {
      return;
    }

    capNhatBanner(currentIndex + 1);
  }

  function prevBanner() {
    if (totalImages <= 1) {
      return;
    }

    if (currentIndex === 0) {
      capNhatBanner(-1);
    } else {
      capNhatBanner(currentIndex - 1);
    }
  }

  function batTuDong() {
    clearInterval(timer);

    if (totalImages > 1) {
      timer = setInterval(nextBanner, 3000);
    }
  }

  nextBtn?.addEventListener("click", function () {
    nextBanner();
    batTuDong();
  });

  prevBtn?.addEventListener("click", function () {
    prevBanner();
    batTuDong();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", function (e) {
      const index = Number(e.currentTarget.getAttribute("data-index"));

      if (Number.isInteger(index) && index >= 0 && index < totalImages) {
        capNhatBanner(index);
        batTuDong();
      }
    });
  });

  capNhatBanner(0);
  batTuDong();
}

/* =========================================================
   5. DOM BIỂU ĐỒ
========================================================= */

const gpaChart = document.getElementById("gpa-chart");

const radarChart = document.getElementById("radar-chart");

/* =========================================================
   6. DOM NHẬN ĐỊNH
========================================================= */

const danhSachNhanDinh = document.querySelector(".nhan-dinh");

/* =========================================================
   7. DOM GỢI Ý
========================================================= */

const danhSachGoiYUuTien = document.querySelector(".goi-y .nen-hoc ul");

const danhSachGoiYCaiThien = document.querySelector(".goi-y .can-cai-thien ul");

/* =========================================================
   8. THỐNG KÊ MAIN
========================================================= */

const cacOThongKe = document.querySelectorAll(
  ".thong-ke-he-thong .the-thong-ke",
);

/* =========================================================
   9. THỐNG KÊ FOOTER
========================================================= */

const tongTruyCap = document.getElementById("tong-truy-cap");

const dangOnline = document.getElementById("dang-online");

const tongSinhVien = document.getElementById("tong-sinh-vien");

const tongGiangVien = document.getElementById("tong-giang-vien");

/* =========================================================
   10. FORMAT SỐ
========================================================= */

function dinhDangSo(giaTri) {
  if (giaTri === null || giaTri === undefined || giaTri === "") {
    return "--";
  }

  const so = Number(giaTri);

  if (!Number.isFinite(so)) {
    return "--";
  }

  return so.toLocaleString("vi-VN");
}

/* =========================================================
   11. XÓA BIỂU ĐỒ GPA
========================================================= */

function xoaBieuDoGPA() {
  if (!gpaChart) {
    return;
  }

  gpaChart.innerHTML = "";
}

/* =========================================================
   12. VẼ KHUNG BIỂU ĐỒ GPA
========================================================= */

function veKhungBieuDoGPA(danhSach, duDoan = null) {
  if (!gpaChart) {
    return;
  }

  const width = 720;
  const height = 380;

  const paddingLeft = 60;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 50;

  const chartWidth = width - paddingLeft - paddingRight;

  const chartHeight = height - paddingTop - paddingBottom;

  gpaChart.setAttribute("viewBox", `0 0 ${width} ${height}`);

  gpaChart.setAttribute("preserveAspectRatio", "xMidYMid meet");

  /* =======================================================
     GRID
  ======================================================= */

  for (let i = 0; i <= 8; i++) {
    const y = paddingTop + i * (chartHeight / 8);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", paddingLeft);

    line.setAttribute("y1", y);

    line.setAttribute("x2", width - paddingRight);

    line.setAttribute("y2", y);

    line.setAttribute("stroke", "#e8e8e8");

    line.setAttribute("stroke-width", "1");

    gpaChart.appendChild(line);
  }

  /* =======================================================
     TRỤC
  ======================================================= */

  const trucDoc = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line",
  );

  trucDoc.setAttribute("x1", paddingLeft);

  trucDoc.setAttribute("y1", paddingTop);

  trucDoc.setAttribute("x2", paddingLeft);

  trucDoc.setAttribute("y2", height - paddingBottom);

  trucDoc.setAttribute("stroke", "#555");

  trucDoc.setAttribute("stroke-width", "2");

  gpaChart.appendChild(trucDoc);

  const trucNgang = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line",
  );

  trucNgang.setAttribute("x1", paddingLeft);

  trucNgang.setAttribute("y1", height - paddingBottom);

  trucNgang.setAttribute("x2", width - paddingRight);

  trucNgang.setAttribute("y2", height - paddingBottom);

  trucNgang.setAttribute("stroke", "#555");

  trucNgang.setAttribute("stroke-width", "2");

  gpaChart.appendChild(trucNgang);

  /* =======================================================
     NHÃN GPA TRỤC Y
  ======================================================= */

  for (let i = 0; i <= 8; i++) {
    const value = (4 - i * 0.5).toFixed(1);

    const y = paddingTop + i * (chartHeight / 8);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    text.setAttribute("x", "15");

    text.setAttribute("y", y + 5);

    text.setAttribute("fill", "#666");

    text.setAttribute("font-size", "13");

    text.setAttribute("font-family", "Arial");

    text.textContent = value;

    gpaChart.appendChild(text);
  }

  /* =======================================================
     CHƯA CÓ DỰ ĐOÁN
     
     Chỉ hiện:
     - lưới
     - trục
     - số GPA
     
     Không hiện:
     - HK1
     - HK2
     - điểm
     - đường
  ======================================================= */

  const coDuDoan = duDoan && Number.isFinite(Number(duDoan.gpaDuDoan));

  if (!coDuDoan) {
    return;
  }

  /* =======================================================
     CÓ DỰ ĐOÁN
     
     Ví dụ:
     HK1 HK2 HK3 HK4 HK5(Dự đoán)
     
     Tất cả dùng cùng một hệ tọa độ.
  ======================================================= */

  const tongDiem = danhSach.length + 1;

  function tinhX(index) {
    if (tongDiem <= 1) {
      return paddingLeft + chartWidth / 2;
    }

    return paddingLeft + (chartWidth / (tongDiem - 1)) * index;
  }

  /* =======================================================
     NHÃN HỌC KỲ THỰC TẾ
  ======================================================= */

  danhSach.forEach((item, index) => {
    const x = tinhX(index);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    text.setAttribute("x", x);

    text.setAttribute("y", height - 18);

    text.setAttribute("fill", "#666");

    text.setAttribute("font-size", "13");

    text.setAttribute("font-family", "Arial");

    text.setAttribute("text-anchor", "middle");

    text.textContent = `HK${Number(item.hocKy ?? index + 1)}`;

    gpaChart.appendChild(text);
  });

  /* =======================================================
     NHÃN HỌC KỲ DỰ ĐOÁN
  ======================================================= */

  const hocKyDuDoan = Number(duDoan.hocKyDuDoan);

  const xDuDoan = tinhX(danhSach.length);

  const nhanDuDoan = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text",
  );

  nhanDuDoan.setAttribute("x", xDuDoan);

  nhanDuDoan.setAttribute("y", height - 18);

  nhanDuDoan.setAttribute("fill", "#2563eb");

  nhanDuDoan.setAttribute("font-size", "13");

  nhanDuDoan.setAttribute("font-weight", "700");

  nhanDuDoan.setAttribute("font-family", "Arial");

  nhanDuDoan.setAttribute("text-anchor", "middle");

  nhanDuDoan.textContent = `HK${hocKyDuDoan} (Dự đoán)`;

  gpaChart.appendChild(nhanDuDoan);
}

/* =========================================================
   13. VẼ BIỂU ĐỒ GPA THẬT
========================================================= */

function veDuongGPA(danhSachGPA, duDoan) {
  if (
    !gpaChart ||
    !Array.isArray(danhSachGPA) ||
    danhSachGPA.length === 0 ||
    !duDoan
  ) {
    return;
  }

  const width = 720;
  const height = 380;

  const paddingLeft = 60;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 50;

  const chartWidth = width - paddingLeft - paddingRight;

  const chartHeight = height - paddingTop - paddingBottom;

  const gpaDuDoan = Number(duDoan.gpaDuDoan);

  if (!Number.isFinite(gpaDuDoan)) {
    return;
  }

  const tongDiem = danhSachGPA.length + 1;

  function tinhX(index) {
    if (tongDiem <= 1) {
      return paddingLeft + chartWidth / 2;
    }

    return paddingLeft + (chartWidth / (tongDiem - 1)) * index;
  }

  function tinhY(gpa) {
    const giaTri = Math.max(0, Math.min(4, Number(gpa)));

    return paddingTop + ((4 - giaTri) / 4) * chartHeight;
  }

  /* =======================================================
     GRADIENT
  ======================================================= */

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const gradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient",
  );

  gradient.setAttribute("id", "gradientLineHome");

  gradient.setAttribute("x1", "0%");

  gradient.setAttribute("y1", "0%");

  gradient.setAttribute("x2", "100%");

  gradient.setAttribute("y2", "0%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");

  stop1.setAttribute("offset", "0%");

  stop1.setAttribute("stop-color", "#0fb530");

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");

  stop2.setAttribute("offset", "100%");

  stop2.setAttribute("stop-color", "#2ecc71");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  gpaChart.appendChild(defs);

  /* =======================================================
     ĐIỂM THỰC TẾ
  ======================================================= */

  const cacDiem = danhSachGPA.map((item, index) => ({
    x: tinhX(index),

    y: tinhY(item.gpa),

    gpa: Number(item.gpa),

    hk: Number(item.hocKy ?? index + 1),
  }));

  /* =======================================================
     ĐƯỜNG GPA THỰC TẾ - NÉT LIỀN
  ======================================================= */

  if (cacDiem.length >= 2) {
    const points = cacDiem.map((item) => `${item.x},${item.y}`).join(" ");

    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline",
    );

    line.setAttribute("fill", "none");

    line.setAttribute("stroke", "url(#gradientLineHome)");

    line.setAttribute("stroke-width", "4");

    line.setAttribute("stroke-linejoin", "round");

    line.setAttribute("stroke-linecap", "round");

    line.setAttribute("points", points);

    gpaChart.appendChild(line);

    if (typeof line.getTotalLength === "function") {
      try {
        const length = line.getTotalLength();

        line.style.strokeDasharray = String(length);

        line.style.strokeDashoffset = String(length);

        if (typeof line.animate === "function") {
          line.animate(
            [
              {
                strokeDashoffset: length,
              },
              {
                strokeDashoffset: 0,
              },
            ],
            {
              duration: 1200,
              fill: "forwards",
            },
          );
        } else {
          line.style.strokeDashoffset = "0";
        }
      } catch (error) {
        console.warn("Không thể animation đường GPA:", error);
      }
    }
  }

  /* =======================================================
     CÁC ĐIỂM GPA THỰC TẾ
  ======================================================= */

  cacDiem.forEach((item) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );

    circle.setAttribute("class", "gpa-point");

    circle.setAttribute("cx", item.x);

    circle.setAttribute("cy", item.y);

    circle.setAttribute("r", "6");

    circle.setAttribute("fill", "#0fb530");

    circle.setAttribute("stroke", "#fff");

    circle.setAttribute("stroke-width", "3");

    gpaChart.appendChild(circle);

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );

    label.setAttribute("x", item.x);

    label.setAttribute("y", item.y - 12);

    label.setAttribute("fill", "#555");

    label.setAttribute("font-size", "12");

    label.setAttribute("text-anchor", "middle");

    label.textContent = item.gpa.toFixed(2);

    gpaChart.appendChild(label);

    ganTooltipGPA(circle, `HK${item.hk}`, item.gpa);
  });

  /* =======================================================
     GPA DỰ ĐOÁN
  ======================================================= */

  const diemCuoi = cacDiem[cacDiem.length - 1];

  const xDuDoan = tinhX(danhSachGPA.length);

  const yDuDoan = tinhY(gpaDuDoan);

  /* =======================================================
     ĐƯỜNG GPA DỰ ĐOÁN - NÉT ĐỨT
  ======================================================= */

  const lineDuDoan = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line",
  );

  lineDuDoan.setAttribute("x1", diemCuoi.x);

  lineDuDoan.setAttribute("y1", diemCuoi.y);

  lineDuDoan.setAttribute("x2", xDuDoan);

  lineDuDoan.setAttribute("y2", yDuDoan);

  lineDuDoan.setAttribute("stroke", "#2563eb");

  lineDuDoan.setAttribute("stroke-width", "4");

  lineDuDoan.setAttribute("stroke-dasharray", "8 7");

  lineDuDoan.setAttribute("stroke-linecap", "round");

  gpaChart.appendChild(lineDuDoan);

  /* =======================================================
     ĐIỂM DỰ ĐOÁN
  ======================================================= */

  const circleDuDoan = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );

  circleDuDoan.setAttribute("class", "gpa-point-du-doan");

  circleDuDoan.setAttribute("cx", xDuDoan);

  circleDuDoan.setAttribute("cy", yDuDoan);

  circleDuDoan.setAttribute("r", "7");

  circleDuDoan.setAttribute("fill", "#2563eb");

  circleDuDoan.setAttribute("stroke", "#fff");

  circleDuDoan.setAttribute("stroke-width", "3");

  gpaChart.appendChild(circleDuDoan);

  /* =======================================================
     GIÁ TRỊ GPA DỰ ĐOÁN
  ======================================================= */

  const labelDuDoan = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text",
  );

  labelDuDoan.setAttribute("x", xDuDoan);

  labelDuDoan.setAttribute("y", yDuDoan - 14);

  labelDuDoan.setAttribute("fill", "#2563eb");

  labelDuDoan.setAttribute("font-size", "12");

  labelDuDoan.setAttribute("font-weight", "700");

  labelDuDoan.setAttribute("text-anchor", "middle");

  labelDuDoan.textContent = gpaDuDoan.toFixed(2);

  gpaChart.appendChild(labelDuDoan);

  const hocKyDuDoan = Number(
    duDoan.hocKyDuDoan ?? duDoan.hocKy ?? danhSachGPA.length + 1,
  );

  ganTooltipGPA(circleDuDoan, `HK${hocKyDuDoan} (Dự đoán)`, gpaDuDoan);
}

/* =========================================================
   14. TOOLTIP GPA
========================================================= */

function ganTooltipGPA(element, ten, gpa) {
  if (!element) {
    return;
  }

  let tooltip = document.getElementById("home-gpa-tooltip");

  if (!tooltip) {
    tooltip = document.createElement("div");

    tooltip.id = "home-gpa-tooltip";

    tooltip.style.position = "fixed";

    tooltip.style.background = "#222";

    tooltip.style.color = "#fff";

    tooltip.style.padding = "8px 12px";

    tooltip.style.borderRadius = "8px";

    tooltip.style.fontSize = "13px";

    tooltip.style.pointerEvents = "none";

    tooltip.style.display = "none";

    tooltip.style.zIndex = "99999";

    document.body.appendChild(tooltip);
  }

  element.addEventListener("mouseenter", function () {
    tooltip.style.display = "block";

    tooltip.innerHTML = `
        <strong>${ten}</strong>
        <br>
        GPA: ${Number(gpa).toFixed(2)}
      `;

    element.setAttribute("r", "9");
  });

  element.addEventListener("mousemove", function (e) {
    tooltip.style.left = `${e.clientX + 15}px`;

    tooltip.style.top = `${e.clientY - 20}px`;
  });

  element.addEventListener("mouseleave", function () {
    tooltip.style.display = "none";

    element.setAttribute(
      "r",
      element.classList.contains("gpa-point-du-doan") ? "7" : "6",
    );
  });
}

/* =========================================================
   15. HIỂN THỊ GPA HOME
========================================================= */

function hienThiGPAHome(gpaLichSu, duDoan) {
  /*
   * =======================================================
   * CHỈ DÙNG DỮ LIỆU ĐÃ LƯU TRONG BẢN DỰ ĐOÁN
   * =======================================================
   */

  const duDoanTiepTheo = duDoan?.gpaHocKyTiepTheo || null;

  /*
   * Chưa có dự đoán:
   * chỉ trục + lưới
   */

  if (!duDoanTiepTheo) {
    xoaBieuDoGPA();

    veKhungBieuDoGPA([], null);

    return;
  }

  /*
   * =======================================================
   * HỌC KỲ DỰ ĐOÁN
   * =======================================================
   */

  const hocKyDuDoan = Number(duDoanTiepTheo.hocKyDuDoan);

  if (!Number.isInteger(hocKyDuDoan) || hocKyDuDoan < 2 || hocKyDuDoan > 9) {
    console.error("Học kỳ dự đoán không hợp lệ:", duDoanTiepTheo);

    xoaBieuDoGPA();

    veKhungBieuDoGPA([], null);

    return;
  }

  /*
   * =======================================================
   * GPA LỊCH SỬ CỦA CHÍNH LẦN DỰ ĐOÁN
   * =======================================================
   *
   * Ví dụ:
   *
   * dự đoán HK2:
   * [2.45]
   *
   * dự đoán HK5:
   * [2.45, 3.05, 3.58, 3.32]
   *
   * dự đoán HK8:
   * [gpa1,...,gpa7]
   */

  const danhSachGPA = Array.isArray(duDoanTiepTheo.gpaLichSu)
    ? duDoanTiepTheo.gpaLichSu
        .map((gpa, index) => ({
          hocKy: index + 1,

          gpa: Number(gpa),
        }))
        .filter((item) => Number.isFinite(item.gpa))
    : [];

  /*
   * Kiểm tra dữ liệu.
   */

  if (danhSachGPA.length !== hocKyDuDoan - 1) {
    console.warn("Số GPA lịch sử không khớp học kỳ dự đoán:", {
      hocKyDuDoan,
      soGPA: danhSachGPA.length,
      gpaLichSu: duDoanTiepTheo.gpaLichSu,
    });
  }

  /*
   * =======================================================
   * VẼ LẠI BIỂU ĐỒ
   * =======================================================
   */

  xoaBieuDoGPA();

  /*
   * Trục + lưới + nhãn
   */

  veKhungBieuDoGPA(danhSachGPA, duDoanTiepTheo);

  /*
   * Đường thực tế + đường dự đoán
   */

  if (danhSachGPA.length > 0) {
    veDuongGPA(danhSachGPA, duDoanTiepTheo);
  }
}

/* =========================================================
   16. RADAR - XÓA
========================================================= */

function xoaRadar() {
  if (!radarChart) {
    return;
  }

  radarChart.innerHTML = "";
}

/* =========================================================
   17. VẼ NỀN RADAR
========================================================= */

function veNenRadar() {
  if (!radarChart) {
    return;
  }

  const cx = 210;
  const cy = 210;
  const R = 150;

  radarChart.setAttribute("viewBox", "0 0 420 420");

  /* =======================================================
     LƯỚI
  ======================================================= */

  for (let level = 1; level <= 5; level++) {
    const r = R * (level / 5);

    const points = [];

    for (let i = 0; i < 5; i++) {
      const angle = ((-90 + i * 72) * Math.PI) / 180;

      const x = cx + r * Math.cos(angle);

      const y = cy + r * Math.sin(angle);

      points.push(`${x},${y}`);
    }

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );

    polygon.setAttribute("points", points.join(" "));

    polygon.setAttribute("fill", "none");

    polygon.setAttribute("stroke", "#d9d9d9");

    polygon.setAttribute("stroke-width", "1");

    radarChart.appendChild(polygon);
  }

  /* =======================================================
     MỐC %
  ======================================================= */

  [100, 80, 60, 40, 20].forEach((value, index) => {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    text.setAttribute("x", cx + 6);

    text.setAttribute("y", cy - R * (1 - index / 5) + 5);

    text.setAttribute("font-size", "11");

    text.setAttribute("fill", "#888");

    text.textContent = `${value}%`;

    radarChart.appendChild(text);
  });

  /* =======================================================
     TRỤC
  ======================================================= */

  for (let i = 0; i < 5; i++) {
    const angle = ((-90 + i * 72) * Math.PI) / 180;

    const x = cx + R * Math.cos(angle);

    const y = cy + R * Math.sin(angle);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", cx);

    line.setAttribute("y1", cy);

    line.setAttribute("x2", x);

    line.setAttribute("y2", y);

    line.setAttribute("stroke", "#d9d9d9");

    radarChart.appendChild(line);
  }

  /* =======================================================
     LABEL
  ======================================================= */

  const labels = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"];

  labels.forEach((label, index) => {
    const angle = ((-90 + index * 72) * Math.PI) / 180;

    const x = cx + (R + 25) * Math.cos(angle);

    const y = cy + (R + 25) * Math.sin(angle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    text.setAttribute("x", x);

    text.setAttribute("y", y);

    text.setAttribute("text-anchor", "middle");

    text.setAttribute("font-size", "14");

    text.setAttribute("fill", "#555");

    text.setAttribute("font-family", "Arial");

    text.textContent = label;

    radarChart.appendChild(text);
  });
}

/* =========================================================
   18. VẼ DỮ LIỆU RADAR
========================================================= */

function veDuLieuRadar(values) {
  if (!radarChart || !Array.isArray(values)) {
    return;
  }

  const cx = 210;
  const cy = 210;
  const R = 150;

  const dataPoints = [];

  for (let i = 0; i < 5; i++) {
    const value = Math.max(0, Math.min(100, Number(values[i]) || 0));

    const angle = ((-90 + i * 72) * Math.PI) / 180;

    const r = (value / 100) * R;

    const x = cx + r * Math.cos(angle);

    const y = cy + r * Math.sin(angle);

    dataPoints.push({
      x,
      y,
      value,
    });
  }

  /* =======================================================
     POLYGON
  ======================================================= */

  const polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon",
  );

  polygon.setAttribute("id", "radarPolygon");

  polygon.setAttribute(
    "points",
    dataPoints.map((item) => `${item.x},${item.y}`).join(" "),
  );

  polygon.setAttribute("fill", "rgba(15,181,48,.25)");

  polygon.setAttribute("stroke", "#0fb530");

  polygon.setAttribute("stroke-width", "3");

  radarChart.appendChild(polygon);

  /* =======================================================
     ĐIỂM
  ======================================================= */

  const colors = ["#7c3aed", "#16a34a", "#2563eb", "#f59e0b", "#ef4444"];

  const labels = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"];

  dataPoints.forEach((item, index) => {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );

    circle.setAttribute("class", "radarPoint");

    circle.setAttribute("cx", item.x);

    circle.setAttribute("cy", item.y);

    circle.setAttribute("r", "6");

    circle.setAttribute("fill", colors[index]);

    circle.setAttribute("stroke", "#fff");

    circle.setAttribute("stroke-width", "3");

    circle.dataset.label = labels[index];

    circle.dataset.value = `${item.value}%`;

    radarChart.appendChild(circle);

    ganTooltipRadar(circle);
  });

  /* =======================================================
     ANIMATION
  ======================================================= */

  if (typeof polygon.animate === "function") {
    try {
      polygon.animate(
        [
          {
            transform: "scale(.1)",
            transformOrigin: "210px 210px",
            opacity: 0,
          },
          {
            transform: "scale(1)",
            transformOrigin: "210px 210px",
            opacity: 1,
          },
        ],
        {
          duration: 1000,
          fill: "forwards",
        },
      );
    } catch (error) {
      console.warn("Không thể animation radar:", error);
    }
  }
}

/* =========================================================
   19. TOOLTIP RADAR
========================================================= */

function ganTooltipRadar(element) {
  if (!element) {
    return;
  }

  let tooltip = document.getElementById("home-radar-tooltip");

  if (!tooltip) {
    tooltip = document.createElement("div");

    tooltip.id = "home-radar-tooltip";

    tooltip.style.position = "fixed";

    tooltip.style.background = "#222";

    tooltip.style.color = "#fff";

    tooltip.style.padding = "8px 12px";

    tooltip.style.borderRadius = "8px";

    tooltip.style.fontSize = "13px";

    tooltip.style.pointerEvents = "none";

    tooltip.style.display = "none";

    tooltip.style.zIndex = "99999";

    document.body.appendChild(tooltip);
  }

  element.addEventListener("mouseenter", function () {
    tooltip.style.display = "block";

    tooltip.innerHTML = `
        <strong>
          ${element.dataset.label}
        </strong>
        <br>
        ${element.dataset.value}
      `;

    element.setAttribute("r", "9");
  });

  element.addEventListener("mousemove", function (e) {
    tooltip.style.left = `${e.clientX + 15}px`;

    tooltip.style.top = `${e.clientY - 20}px`;
  });

  element.addEventListener("mouseleave", function () {
    tooltip.style.display = "none";

    element.setAttribute("r", "6");
  });
}

/* =========================================================
   20. HIỂN THỊ RADAR HOME
========================================================= */

function hienThiGiaTriRadar(id, value) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  const giaTri = Math.max(0, Math.min(100, Number(value) || 0));

  element.textContent = `${giaTri}%`;
}

function hienThiRadarHome(radar) {
  const duLieu = radar || {};

  const xuatSac = Number(duLieu.xuatSac) || 0;

  const gioi = Number(duLieu.gioi) || 0;

  const kha = Number(duLieu.kha) || 0;

  const trungBinh = Number(duLieu.trungBinh) || 0;

  const yeu = Number(duLieu.yeu) || 0;

  /* =======================================================
     CHÚ THÍCH
  ======================================================= */

  hienThiGiaTriRadar("xs-value", xuatSac);

  hienThiGiaTriRadar("gioi-value", gioi);

  hienThiGiaTriRadar("kha-value", kha);

  hienThiGiaTriRadar("tb-value", trungBinh);

  hienThiGiaTriRadar("yeu-value", yeu);

  /* =======================================================
     NỀN
  ======================================================= */

  xoaRadar();

  veNenRadar();

  /* =======================================================
     KHÔNG CÓ DỮ LIỆU
     → chỉ giữ nền
  ======================================================= */

  const coDuLieu =
    xuatSac > 0 || gioi > 0 || kha > 0 || trungBinh > 0 || yeu > 0;

  if (!coDuLieu) {
    return;
  }

  /* =======================================================
     CÓ DỮ LIỆU
     → vẽ polygon
  ======================================================= */

  veDuLieuRadar([xuatSac, gioi, kha, trungBinh, yeu]);
}

/* =========================================================
   21. NHẬN ĐỊNH
========================================================= */

function hienThiNhanDinhHome(danhSach) {
  if (!danhSachNhanDinh) {
    return;
  }

  danhSachNhanDinh.innerHTML = "";

  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    return;
  }

  danhSach.forEach((noiDung) => {
    if (
      noiDung === null ||
      noiDung === undefined ||
      String(noiDung).trim() === ""
    ) {
      return;
    }

    const li = document.createElement("li");

    const icon = document.createElement("i");

    icon.className = "fa-solid fa-check";

    const span = document.createElement("span");

    span.className = "noi-dung";

    span.textContent = String(noiDung);

    li.appendChild(icon);

    li.appendChild(span);

    danhSachNhanDinh.appendChild(li);
  });
}

/* =========================================================
   22. GỢI Ý
========================================================= */

function hienThiGoiYHome(danhSach) {
  if (danhSachGoiYUuTien) {
    danhSachGoiYUuTien.innerHTML = "";
  }

  if (danhSachGoiYCaiThien) {
    danhSachGoiYCaiThien.innerHTML = "";
  }

  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    return;
  }

  /*
   * Backend hiện tại trả một mảng
   * lời khuyên chung.
   *
   * Chưa tự ý phân loại khi backend
   * chưa cung cấp loại.
   */

  if (danhSachGoiYUuTien) {
    danhSach.forEach((noiDung) => {
      if (
        noiDung === null ||
        noiDung === undefined ||
        String(noiDung).trim() === ""
      ) {
        return;
      }

      const li = document.createElement("li");

      li.textContent = String(noiDung);

      danhSachGoiYUuTien.appendChild(li);
    });
  }
}

/* =========================================================
   23. THỐNG KÊ MAIN
========================================================= */

function hienThiThongKeHome(thongKe) {
  if (!thongKe) {
    return;
  }

  const cacSo = document.querySelectorAll(
    ".thong-ke-he-thong .the-thong-ke strong",
  );

  if (cacSo.length >= 4) {
    cacSo[0].textContent = dinhDangSo(thongKe.tongSinhVien);

    cacSo[1].textContent = dinhDangSo(thongKe.tongGiangVien);

    cacSo[2].textContent = dinhDangSo(thongKe.tongLuotDuDoan);

    cacSo[3].textContent =
      thongKe.doChinhXac === null || thongKe.doChinhXac === undefined
        ? "--"
        : `${Number(thongKe.doChinhXac).toFixed(1)}%`;
  }
}

/* =========================================================
   24. THỐNG KÊ FOOTER
========================================================= */

function hienThiThongKeFooter(thongKe) {
  if (!thongKe) {
    return;
  }

  /*
   * Không gán nhầm tổng lượt dự đoán
   * vào tổng truy cập.
   */

  if (tongSinhVien) {
    tongSinhVien.textContent = dinhDangSo(thongKe.tongSinhVien);
  }

  if (tongGiangVien) {
    tongGiangVien.textContent = dinhDangSo(thongKe.tongGiangVien);
  }
}

/* =========================================================
   25. CHỌN NHẬN ĐỊNH / GỢI Ý TỪ RESPONSE
========================================================= */

function layNhanDinhTuHome(data) {
  if (Array.isArray(data?.nhanDinh) && data.nhanDinh.length > 0) {
    return data.nhanDinh;
  }

  const nhanDinhHocKy = data?.duDoan?.gpaHocKyTiepTheo?.nhanDinh;

  if (Array.isArray(nhanDinhHocKy) && nhanDinhHocKy.length > 0) {
    return nhanDinhHocKy;
  }

  const nhanDinhTotNghiep = data?.duDoan?.gpaTotNghiep?.nhanDinh;

  if (Array.isArray(nhanDinhTotNghiep) && nhanDinhTotNghiep.length > 0) {
    return nhanDinhTotNghiep;
  }

  return [];
}

function layGoiYTuHome(data) {
  if (Array.isArray(data?.goiY) && data.goiY.length > 0) {
    return data.goiY;
  }

  const goiYHocKy = data?.duDoan?.gpaHocKyTiepTheo?.loiKhuyen;

  if (Array.isArray(goiYHocKy) && goiYHocKy.length > 0) {
    return goiYHocKy;
  }

  const goiYTotNghiep = data?.duDoan?.gpaTotNghiep?.loiKhuyen;

  if (Array.isArray(goiYTotNghiep) && goiYTotNghiep.length > 0) {
    return goiYTotNghiep;
  }

  return [];
}

/* =========================================================
   26. XỬ LÝ DỮ LIỆU HOME
========================================================= */

function xuLyDuLieuHome(data) {
  if (!data) {
    return;
  }

  /* =======================================================
     GPA
  ======================================================= */

  hienThiGPAHome(data.gpaLichSu, data.duDoan);

  /* =======================================================
     RADAR
  ======================================================= */

  hienThiRadarHome(data.radar);

  /* =======================================================
     NHẬN ĐỊNH
  ======================================================= */

  hienThiNhanDinhHome(layNhanDinhTuHome(data));

  /* =======================================================
     GỢI Ý
  ======================================================= */

  hienThiGoiYHome(layGoiYTuHome(data));

  /* =======================================================
     THỐNG KÊ
  ======================================================= */

  hienThiThongKeHome(data.thongKe);

  hienThiThongKeFooter(data.thongKe);

  /* =======================================================
     DEBUG
  ======================================================= */

  if (data.sinhVien) {
    console.log("Sinh viên Home:", data.sinhVien);
  }

  console.log("Dữ liệu Home:", data);
}

/* =========================================================
   27. TẢI DỮ LIỆU HOME
========================================================= */

async function taiDuLieuHome() {
  const token = layToken();

  if (!token) {
    console.warn("Không có token đăng nhập.");

    return;
  }

  try {
    const response = await fetch(API_HOME, {
      method: "GET",

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
      throw new Error(data?.thongBao || "Không thể tải dữ liệu trang chủ.");
    }

    xuLyDuLieuHome(data);
  } catch (error) {
    console.error("Lỗi tải dữ liệu Home:", error);

    /*
     * Không alert liên tục nếu Home
     * chỉ lỗi dữ liệu phụ.
     */

    if (error?.message) {
      console.warn(error.message);
    }
  }
}

/* =========================================================
   28. KHỞI TẠO TRẠNG THÁI RỖNG
========================================================= */

function khoiTaoTrangThaiRong() {
  /* =======================================================
     GPA
     
     Chưa có dự đoán:
     → trục
     → lưới
     → số GPA
     → không có HK
     → không có điểm
     → không có đường
  ======================================================= */

  xoaBieuDoGPA();

  veKhungBieuDoGPA([], null);

  /* =======================================================
     RADAR
     
     → lưới
     → trục
     → nhãn
     → tất cả 0%
     → không polygon
  ======================================================= */

  hienThiRadarHome({
    xuatSac: 0,
    gioi: 0,
    kha: 0,
    trungBinh: 0,
    yeu: 0,
  });

  /* =======================================================
     NHẬN ĐỊNH
  ======================================================= */

  hienThiNhanDinhHome([]);

  /* =======================================================
     GỢI Ý
  ======================================================= */

  hienThiGoiYHome([]);
}

/* =========================================================
   29. DOM READY
========================================================= */

async function khoiTaoHome() {
  khoiTaoTrangThaiRong();

  await taiDuLieuHome();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", khoiTaoHome, {
    once: true,
  });
} else {
  khoiTaoHome();
}
