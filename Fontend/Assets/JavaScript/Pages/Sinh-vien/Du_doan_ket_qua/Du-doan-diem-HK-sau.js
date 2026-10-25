const mui_ten_thong_tin = document.querySelector(".thong-tin");
const khung_thong_tin_chi_tiet = document.querySelector(".thong-tin-chi-tiet");
const icon_mui_ten = document.querySelector(".thong-tin i");

mui_ten_thong_tin.addEventListener("click", function (e) {
  khung_thong_tin_chi_tiet.classList.toggle("show");
  icon_mui_ten.classList.toggle("active");
  e.stopPropagation();
});

khung_thong_tin_chi_tiet.addEventListener("click", function (e) {
  e.stopPropagation();
});

document.addEventListener("click", function () {
  khung_thong_tin_chi_tiet.classList.remove("show");
  icon_mui_ten.classList.remove("active");
});

/* phần main */
/* GPA các học kỳ trước */
/* ===========================
   VALIDATION GPA
=========================== */
const nutDuDoan = document.getElementById("nut-du-doan");
const khuKetQuaDuDoan = document.getElementById("khu-ket-qua-du-doan");
const chonHocKyGanNhat = document.getElementById("chon-hoc-ky-gan-nhat");

khuKetQuaDuDoan.classList.add("an-ket-qua");

function hienThiThayDoi(element, giaTri) {
  if (!element) {
    return;
  }

  const dong = element.closest(".chenh-lech");

  if (!dong) {
    return;
  }

  const icon = dong.querySelector("i");

  // Không có dữ liệu
  if (
    giaTri === null ||
    giaTri === undefined ||
    !Number.isFinite(Number(giaTri))
  ) {
    dong.style.display = "none";
    return;
  }

  const value = Number(giaTri);

  dong.style.display = "flex";

  // Xóa trạng thái cũ
  dong.classList.remove("tang", "giam");

  // =========================
  // TĂNG
  // =========================
  if (value > 0) {
    dong.classList.add("tang");

    if (icon) {
      icon.className = "fa-solid fa-arrow-up";
    }

    element.textContent = `Tăng ${value.toFixed(2)} so với HK gần nhất`;

    return;
  }

  // =========================
  // GIẢM
  // =========================
  if (value < 0) {
    dong.classList.add("giam");

    if (icon) {
      icon.className = "fa-solid fa-arrow-down";
    }

    element.textContent = `Giảm ${Math.abs(value).toFixed(2)} so với HK gần nhất`;

    return;
  }

  // =========================
  // KHÔNG ĐỔI
  // =========================
  if (icon) {
    icon.className = "fa-solid fa-minus";
  }

  element.textContent = "Không thay đổi so với HK gần nhất";
}

nutDuDoan.addEventListener("click", async function () {
  const gpaHopLe = kiemTraGPATheoYeuCau();

  const keHoachHopLe = kiemTraKeHoachTheoYeuCau();

  if (!gpaHopLe || !keHoachHopLe) {
    khuKetQuaDuDoan.classList.add("an-ket-qua");

    return;
  }

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");

    return;
  }

  const hocKyGanNhat = chonHocKyGanNhat.selectedIndex + 1;

  const noiDungCu = nutDuDoan.innerHTML;

  nutDuDoan.disabled = true;

  nutDuDoan.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> Đang dự đoán...';

  const gpaLichSu = [];

  tatCaOGPA.forEach((oNhap) => {
    if (!oNhap.disabled) {
      gpaLichSu.push(Number(oNhap.value));
    }
  });

  try {
    const response = await fetch(
      "http://localhost:3000/api/du-doan/gpa-hoc-ky-tiep-theo",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          hocKyGanNhat: hocKyGanNhat,

          gpaLichSu: gpaLichSu,

          tongTinChiKyToi: Number(
            document.getElementById("tong-tin-chi").value,
          ),

          gioTuHocTuan: Number(document.getElementById("gio-tu-hoc").value),

          tyLeChuyenCan: Number(
            document.getElementById("ty-le-chuyen-can").value,
          ),

          gioLamThemTuan: Number(document.getElementById("gio-lam-them").value),
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.thanhCong) {
      throw new Error(
        data.thongBao || "Không thể dự đoán GPA học kỳ tiếp theo.",
      );
    }

    const ketQua = data.ketQua;

    // ==================================================
    // HIỂN THỊ KẾT QUẢ
    // ==================================================

    capNhatKetQua(
      ketQua.gpaDuDoan.toFixed(2),
      Number(ketQua.diemHe10).toFixed(2),
      ketQua.xepLoai,
      "",
    );

    // ==================================================
    // CHÊNH LỆCH GPA
    // ==================================================

    const dongGPA = document.getElementById("chenh-lech-gpa").parentElement;

    // ==================================================
    // CHÊNH LỆCH GPA
    // So với học kỳ cuối cùng người dùng vừa nhập
    // ==================================================

    const gpaCuoiCung = gpaLichSu[gpaLichSu.length - 1];

    const gpaDuDoan = Number(ketQua.gpaDuDoan);

    const chenhLechGPA = Number((gpaDuDoan - gpaCuoiCung).toFixed(2));

    hienThiThayDoi(document.getElementById("chenh-lech-gpa"), chenhLechGPA);

    // ==================================================
    // CHÊNH LỆCH HỆ 10
    // ==================================================

    // ==================================================
    // CHÊNH LỆCH HỆ 10
    // ==================================================

    const diemHe10DuDoan = Number(ketQua.diemHe10);

    const diemHe10KyCuoi = gpaCuoiCung * 2.5;

    const chenhLechThang10 = Number(
      (diemHe10DuDoan - diemHe10KyCuoi).toFixed(2),
    );

    hienThiThayDoi(
      document.getElementById("chenh-lech-thang10"),
      chenhLechThang10,
    );

    // ==================================================
    // NHẬN XÉT
    // ==================================================

    hienThiNhanXet(ketQua.nhanDinh);

    // ==================================================
    // GỢI Ý
    // ==================================================

    hienThiGoiY(ketQua.loiKhuyen);

    // ==================================================
    // BIỂU ĐỒ
    // ==================================================

    const gpaThucTe = [];

    tatCaOGPA.forEach((oNhap) => {
      if (!oNhap.disabled) {
        gpaThucTe.push(Number(oNhap.value));
      }
    });

    capNhatBieuDo(gpaThucTe, Number(ketQua.gpaDuDoan));

    // ==================================================
    // HIỆN KẾT QUẢ
    // ==================================================

    khuKetQuaDuDoan.classList.remove("an-ket-qua");

    setTimeout(() => {
      khuKetQuaDuDoan.scrollIntoView({
        behavior: "smooth",

        block: "start",
      });
    }, 100);
  } catch (error) {
    console.error("Lỗi dự đoán GPA:", error);

    alert(error.message || "Không thể kết nối đến hệ thống dự đoán.");
  } finally {
    nutDuDoan.disabled = false;

    nutDuDoan.innerHTML = noiDungCu;
  }
});

const tatCaOGPA = document.querySelectorAll(".o-gpa input");

function kiemTraGPA(oNhap) {
  if (oNhap.disabled) {
    return true;
  }

  const oBaoLoi = oNhap.parentElement.querySelector(".loi-gpa");
  const giaTri = oNhap.value.trim();

  // Xóa trạng thái lỗi cũ
  oNhap.classList.remove("input-loi");
  oBaoLoi.textContent = "";

  // Bỏ trống → không hợp lệ
  if (giaTri === "") {
    oNhap.classList.add("input-loi");

    oBaoLoi.textContent = "Trường này là bắt buộc.";

    return false;
  }

  const so = Number(giaTri);

  // Không phải số
  if (!Number.isFinite(so)) {
    oNhap.classList.add("input-loi");
    oBaoLoi.textContent = "Vui lòng nhập GPA hợp lệ.";
    return false;
  }

  // Ngoài khoảng 0 - 4
  if (so < 0 || so > 4) {
    oNhap.classList.add("input-loi");
    oBaoLoi.textContent = "GPA phải nằm trong khoảng 0 đến 4.";
    return false;
  }

  // Không quá 2 chữ số thập phân
  const phanThapPhan = giaTri.split(".")[1];

  if (phanThapPhan && phanThapPhan.length > 2) {
    oNhap.classList.add("input-loi");
    oBaoLoi.textContent = "GPA chỉ được nhập tối đa 2 chữ số thập phân.";
    return false;
  }

  return true;
}

tatCaOGPA.forEach((oNhap) => {
  // Kiểm tra khi người dùng nhập
  oNhap.addEventListener("input", () => {
    kiemTraGPA(oNhap);
  });

  // Kiểm tra lại khi rời khỏi ô
  oNhap.addEventListener("blur", () => {
    kiemTraGPA(oNhap);
  });
});

/* ===========================
   KIỂM TRA GPA BẮT BUỘC
   KHI BẤM DỰ ĐOÁN
=========================== */

function kiemTraGPATheoYeuCau() {
  let hopLe = true;

  const hocKyGanNhat = chonHocKyGanNhat.selectedIndex + 1;

  tatCaOGPA.forEach((oNhap, index) => {
    // Ô bị khóa → bỏ qua
    if (oNhap.disabled) {
      return;
    }

    const soHocKy = index + 1;

    const giaTri = oNhap.value.trim();

    const oBaoLoi = oNhap.parentElement.querySelector(".loi-gpa");

    // --------------------------------------------
    // Xóa lỗi cũ
    // --------------------------------------------

    oNhap.classList.remove("input-loi");

    if (oBaoLoi) {
      oBaoLoi.textContent = "";
    }

    // --------------------------------------------
    // GPA bắt buộc
    // --------------------------------------------

    if (giaTri === "") {
      // Chỉ cần kiểm tra các kỳ đã chọn
      if (soHocKy <= hocKyGanNhat) {
        oNhap.classList.add("input-loi");

        if (oBaoLoi) {
          oBaoLoi.textContent = "Trường này là bắt buộc.";
        }

        hopLe = false;
      }

      return;
    }

    // --------------------------------------------
    // Có giá trị → kiểm tra GPA
    // --------------------------------------------

    if (!kiemTraGPA(oNhap)) {
      hopLe = false;
    }
  });

  return hopLe;
}

function kiemTraKeHoachTheoYeuCau() {
  let hopLe = true;

  cacInputKeHoach.forEach((cauHinh) => {
    const input = document.getElementById(cauHinh.id);
    const oBaoLoi =
      input.parentElement.parentElement.querySelector(".loi-ke-hoach");

    // Xóa lỗi cũ
    input.classList.remove("input-ke-hoach-loi");
    oBaoLoi.textContent = "";

    // Bỏ trống
    if (input.value.trim() === "") {
      input.classList.add("input-ke-hoach-loi");
      oBaoLoi.textContent = "Trường này là bắt buộc.";
      hopLe = false;
      return;
    }

    // Có giá trị → kiểm tra giới hạn
    if (!kiemTraInputKeHoach(input, cauHinh)) {
      hopLe = false;
    }
  });

  return hopLe;
}

let danhSachGPA = [];

/* ===========================
   VALIDATION KẾ HOẠCH HK TỚI
=========================== */

const cacInputKeHoach = [
  {
    id: "tong-tin-chi",
    min: 1,
    max: 30,
    ten: "Tổng số tín chỉ",
  },
  {
    id: "gio-tu-hoc",
    min: 0,
    max: 168,
    ten: "Số giờ tự học",
  },
  {
    id: "gio-lam-them",
    min: 0,
    max: 168,
    ten: "Số giờ làm thêm",
  },
];

function kiemTraInputKeHoach(input, cauHinh) {
  const oBaoLoi =
    input.parentElement.parentElement.querySelector(".loi-ke-hoach");

  // Xóa lỗi cũ
  input.classList.remove("input-ke-hoach-loi");
  oBaoLoi.textContent = "";

  const giaTri = input.value.trim();

  // Bỏ trống → hợp lệ
  if (giaTri === "") {
    return true;
  }

  const so = Number(giaTri);

  // Không phải số
  if (!Number.isFinite(so)) {
    input.classList.add("input-ke-hoach-loi");
    oBaoLoi.textContent = `${cauHinh.ten} không hợp lệ.`;
    return false;
  }

  // Ngoài giới hạn
  if (so < cauHinh.min || so > cauHinh.max) {
    input.classList.add("input-ke-hoach-loi");

    oBaoLoi.textContent = `${cauHinh.ten} phải từ ${cauHinh.min} đến ${cauHinh.max}.`;

    return false;
  }

  return true;
}

cacInputKeHoach.forEach((cauHinh) => {
  const input = document.getElementById(cauHinh.id);

  input.addEventListener("input", () => {
    kiemTraInputKeHoach(input, cauHinh);
  });

  input.addEventListener("blur", () => {
    kiemTraInputKeHoach(input, cauHinh);
  });
});

/* ===========================
   KHÓA / MỞ Ô GPA THEO HỌC KỲ
=========================== */

function capNhatTrangThaiOGPA() {
  // HK1 = 1, HK2 = 2, ... HK8 = 8
  const hocKyGanNhat = chonHocKyGanNhat.selectedIndex + 1;

  tatCaOGPA.forEach((oNhap, index) => {
    const soHocKy = index + 1;

    if (soHocKy <= hocKyGanNhat) {
      // Đã chọn đến học kỳ này
      // → mở ô để người dùng nhập GPA
      oNhap.disabled = false;
    } else {
      // Các học kỳ sau đó
      // → khóa và xóa dữ liệu
      oNhap.disabled = true;
      oNhap.value = "";

      // Xóa lỗi nếu có
      oNhap.classList.remove("input-loi");

      const oBaoLoi = oNhap.parentElement.querySelector(".loi-gpa");

      if (oBaoLoi) {
        oBaoLoi.textContent = "";
      }
    }
  });
}

// Khi thay đổi học kỳ
chonHocKyGanNhat.addEventListener("change", capNhatTrangThaiOGPA);

// Chạy ngay khi mở trang
capNhatTrangThaiOGPA();

/* Kế hoạch học kỳ tới*/
const thanhTruot = document.getElementById("ty-le-chuyen-can");

const hienThi = document.getElementById("phan-tram-chuyen-can");

thanhTruot.addEventListener("input", () => {
  hienThi.innerHTML = thanhTruot.value + "%";
});

/* kết quả dự đoán */
function capNhatKetQua(gpa, diem10, xepLoai, ghiChu) {
  document.getElementById("ket-qua-gpa").innerHTML = gpa;

  document.getElementById("ket-qua-thang10").innerHTML = diem10;

  document.getElementById("xep-loai-du-kien").innerHTML = xepLoai;

  document.getElementById("ghi-chu-xep-loai").innerHTML = ghiChu;
}

/* ===========================
   BIỂU ĐỒ GPA
=========================== */
function capNhatBieuDo(danhSachThucTe, gpaDuDoan) {
  const svg = document.getElementById("duong-bieu-do");

  if (!svg) {
    return;
  }

  svg.innerHTML = "";
  const trucX = document.querySelector(".truc-x");

  if (trucX) {
    trucX.innerHTML = "";
  }

  const rong = 800;
  const cao = 250;

  svg.setAttribute("viewBox", `0 0 ${rong} ${cao}`);

  const duLieu = danhSachThucTe.map(Number);

  const tatCaDiem = [...duLieu, Number(gpaDuDoan)];

  const khoang = rong / Math.max(1, tatCaDiem.length - 1);

  function tinhY(gpa) {
    return cao - (Number(gpa) / 4) * cao;
  }

  function tinhX(index) {
    return index * khoang;
  }

  function taoSVG(tag, attributes = {}) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  // ---------------------------------------------
  // Tọa độ GPA thực tế
  // ---------------------------------------------

  const diemThucTe = duLieu.map((gpa, index) => ({
    x: tinhX(index),

    y: tinhY(gpa),

    gpa: gpa,
  }));

  // ---------------------------------------------
  // Đường thực tế
  // ---------------------------------------------

  if (diemThucTe.length >= 2) {
    const duongThucTe = diemThucTe
      .map((diem, index) => `${index === 0 ? "M" : "L"} ${diem.x} ${diem.y}`)
      .join(" ");

    svg.appendChild(
      taoSVG("path", {
        d: duongThucTe,

        class: "duong-gpa",
      }),
    );
  }

  // ---------------------------------------------
  // Điểm cuối → GPA dự đoán
  // ---------------------------------------------

  if (diemThucTe.length > 0 && Number.isFinite(Number(gpaDuDoan))) {
    const diemCuoi = diemThucTe[diemThucTe.length - 1];

    const xDuDoan = tinhX(tatCaDiem.length - 1);

    const yDuDoan = tinhY(gpaDuDoan);

    svg.appendChild(
      taoSVG("path", {
        d: `M ${diemCuoi.x} ${diemCuoi.y}
             L ${xDuDoan} ${yDuDoan}`,

        class: "duong-gpa duong-du-doan",
      }),
    );
  }

  // ---------------------------------------------
  // Chấm + số GPA thực tế
  // ---------------------------------------------

  diemThucTe.forEach((diem) => {
    const cham = taoSVG("circle", {
      cx: diem.x,

      cy: diem.y,

      r: 7,

      class: "cham-gpa",
    });

    svg.appendChild(cham);

    const text = taoSVG("text", {
      x: diem.x,

      y: diem.y - 15,

      class: "gia-tri-gpa",

      "text-anchor": "middle",
    });

    text.textContent = diem.gpa.toFixed(2);

    svg.appendChild(text);
  });

  // ---------------------------------------------
  // Chấm + số GPA dự đoán
  // ---------------------------------------------

  if (Number.isFinite(Number(gpaDuDoan))) {
    const x = tinhX(tatCaDiem.length - 1);

    const y = tinhY(gpaDuDoan);

    svg.appendChild(
      taoSVG("circle", {
        cx: x,

        cy: y,

        r: 7,

        class: "cham-gpa",
      }),
    );

    const text = taoSVG("text", {
      x: x,

      y: y - 15,

      class: "gia-tri-gpa",

      "text-anchor": "middle",
    });

    text.textContent = Number(gpaDuDoan).toFixed(2);

    svg.appendChild(text);
  }
  if (trucX) {
    // GPA thực tế
    danhSachThucTe.forEach((_, index) => {
      const nhan = document.createElement("span");

      nhan.textContent = `HK${index + 1}`;

      trucX.appendChild(nhan);
    });

    // GPA dự đoán
    if (Number.isFinite(Number(gpaDuDoan))) {
      const nhanDuDoan = document.createElement("span");

      nhanDuDoan.textContent = `HK${danhSachThucTe.length + 1} (Dự đoán)`;

      trucX.appendChild(nhanDuDoan);
    }
  }
}

/* nhận xét và gợi ý */
function capNhatNhanXet(nhanXet, diemManh, goiY) {
  document.getElementById("nhan-xet-chung").innerHTML = nhanXet;

  const dsDiemManh = document.getElementById("danh-sach-diem-manh");
  dsDiemManh.innerHTML = "";

  diemManh.forEach(function (item) {
    dsDiemManh.innerHTML += `<li>${item}</li>`;
  });

  const dsGoiY = document.getElementById("danh-sach-goi-y");
  dsGoiY.innerHTML = "";

  goiY.forEach(function (item) {
    dsGoiY.innerHTML += `<li>${item}</li>`;
  });
}

function hienThiNhanXet(danhSach) {
  const ul = document.getElementById("danh-sach-nhan-xet");

  if (!ul) {
    return;
  }

  ul.innerHTML = "";

  if (!Array.isArray(danhSach)) {
    return;
  }

  danhSach.forEach((noiDung) => {
    const li = document.createElement("li");

    const icon = document.createElement("i");

    icon.className = "fa-solid fa-circle-check";

    const span = document.createElement("span");

    span.textContent = noiDung;

    li.appendChild(icon);
    li.appendChild(span);

    ul.appendChild(li);
  });
}

function hienThiGoiY(danhSach) {
  const ul = document.getElementById("danh-sach-goi-y");

  if (!ul) {
    return;
  }

  ul.innerHTML = "";

  if (!Array.isArray(danhSach)) {
    return;
  }

  danhSach.forEach((noiDung) => {
    const li = document.createElement("li");

    const icon = document.createElement("i");

    icon.className = "fa-solid fa-arrow-right";

    const span = document.createElement("span");

    span.textContent = noiDung;

    li.appendChild(icon);
    li.appendChild(span);

    ul.appendChild(li);
  });
}
