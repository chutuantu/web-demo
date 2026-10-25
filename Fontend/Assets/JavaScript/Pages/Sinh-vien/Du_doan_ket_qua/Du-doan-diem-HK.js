// ============================================================
// TRANG DỰ ĐOÁN GPA HỌC KỲ
// ============================================================

// ============================================================
// 1. THÔNG TIN TÀI KHOẢN TRÊN HEADER
// ============================================================

const muiTenThongTin = document.querySelector(".thong-tin");

const khungThongTinChiTiet = document.querySelector(".thong-tin-chi-tiet");

const iconMuiTen = document.querySelector(".thong-tin i");

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

// ============================================================
// 2. DANH SÁCH HỌC PHẦN
// ============================================================

let danhSachHocPhan = [];

// ============================================================
// 3. THÀNH PHẦN HTML
// ============================================================

const bangDuLieuMonHoc = document.getElementById("bang-du-lieu-mon-hoc");

const nutThemMon = document.querySelector(".nut-them-mon");

const nutDuDoan = document.getElementById("nut-du-doan");

const nutTaiBaoCao = document.getElementById("nut-tai-bao-cao");

const khuVucKetQua = document.getElementById("ket-qua-du-doan");

// ============================================================
// 4. ID LẦN DỰ ĐOÁN HIỆN TẠI
// ============================================================

let idDuDoanHienTai = null;

// ============================================================
// 5. DỮ LIỆU BIỂU ĐỒ
// ============================================================

let duLieuBieuDo = [];

// ============================================================
// 6. ẨN KẾT QUẢ KHI MỚI VÀO
// ============================================================

if (khuVucKetQua) {
  khuVucKetQua.style.display = "none";
}

// ============================================================
// 7. TẢI DANH SÁCH HỌC PHẦN
// ============================================================

async function taiDanhSachHocPhan() {
  try {
    const response = await fetch("/api/hoc-phan");

    const data = await response.json();

    if (!response.ok || !data.thanh_cong) {
      throw new Error(data.message || "Không thể lấy danh sách học phần.");
    }

    danhSachHocPhan = Array.isArray(data.du_lieu)
      ? data.du_lieu.map((mon) => ({
          id: Number(mon.ID_HOC_PHAN),

          ma: String(mon.MA_HOC_PHAN),

          ten: String(mon.TEN_HOC_PHAN),

          tinChi: Number(mon.SO_TIN_CHI),
        }))
      : [];

    console.log("Danh sách học phần:", danhSachHocPhan);
  } catch (error) {
    console.error("Lỗi tải danh sách học phần:", error);
  }
}

// ============================================================
// 8. KHỞI TẠO BẢNG
// ============================================================

function khoiTaoBang() {
  if (!bangDuLieuMonHoc) {
    return;
  }

  capNhatSTT();

  ganSuKienXoa();

  ganSuKienNhapHocPhan();
}

// ============================================================
// 9. CẬP NHẬT STT
// ============================================================

function capNhatSTT() {
  if (!bangDuLieuMonHoc) {
    return;
  }

  const tatCaHang = bangDuLieuMonHoc.querySelectorAll("tr");

  tatCaHang.forEach((hang, viTri) => {
    if (hang.cells[0]) {
      hang.cells[0].textContent = viTri + 1;
    }
  });
}

// ============================================================
// 10. THÊM HỌC PHẦN
// ============================================================

if (nutThemMon) {
  nutThemMon.addEventListener("click", themMonHoc);
}

function themMonHoc() {
  if (!bangDuLieuMonHoc) {
    return;
  }

  const hangMoi = document.createElement("tr");

  hangMoi.innerHTML = `
    <td></td>

    <td>
      <div class="khung-goi-y-mon-hoc">

        <input
          type="text"
          class="nhap-ten-hoc-phan"
          placeholder="Nhập tên học phần..."
          autocomplete="off"
        />

        <div class="danh-sach-goi-y"></div>

      </div>
    </td>

    <td class="o-so-tin-chi">
      --
    </td>

    <td>
      <input
        type="number"
        min="0"
        max="10"
        step="0.01"
      />
    </td>

    <td>
      <input
        type="number"
        min="0"
        max="10"
        step="0.01"
      />
    </td>

    <td>
      <input
        type="number"
        min="0"
        max="10"
        step="0.01"
      />
    </td>

    <td>
      <button
        type="button"
        class="nut-xoa"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
  `;

  bangDuLieuMonHoc.appendChild(hangMoi);

  capNhatSTT();

  ganSuKienXoa();

  ganSuKienNhapHocPhan();
}

// ============================================================
// 11. XÓA HỌC PHẦN
// ============================================================

function ganSuKienXoa() {
  if (!bangDuLieuMonHoc) {
    return;
  }

  const tatCaNutXoa = bangDuLieuMonHoc.querySelectorAll(".nut-xoa");

  tatCaNutXoa.forEach((nut) => {
    if (nut.dataset.daGanSuKien === "true") {
      return;
    }

    nut.dataset.daGanSuKien = "true";

    nut.addEventListener("click", function () {
      const hang = this.closest("tr");

      if (!hang) {
        return;
      }

      hang.remove();

      capNhatSTT();
    });
  });
}

// ============================================================
// 12. AUTOCOMPLETE
// ============================================================

function ganSuKienNhapHocPhan() {
  if (!bangDuLieuMonHoc) {
    return;
  }

  const tatCaONhap = bangDuLieuMonHoc.querySelectorAll(".nhap-ten-hoc-phan");

  tatCaONhap.forEach((oNhap) => {
    if (oNhap.dataset.daGanSuKien === "true") {
      return;
    }

    oNhap.dataset.daGanSuKien = "true";

    oNhap.addEventListener("input", function () {
      // Khi người dùng gõ lại,
      // mã cũ không còn chắc chắn đúng.
      this.removeAttribute("data-ma-hoc-phan");

      const hang = this.closest("tr");

      const oTinChi = hang?.querySelector(".o-so-tin-chi");

      if (oTinChi) {
        oTinChi.textContent = "--";
      }

      hienThiDanhSachGoiY(this);
    });

    oNhap.addEventListener("click", function () {
      hienThiDanhSachGoiY(this);
    });
  });
}

// ============================================================
// 13. TÌM HỌC PHẦN
// ============================================================

function timHocPhan(tuKhoa) {
  const tuKhoaKhongDau = boDauTiengViet(tuKhoa);

  if (!tuKhoaKhongDau) {
    return [];
  }

  return danhSachHocPhan.filter((mon) => {
    const ten = boDauTiengViet(mon.ten);

    const ma = boDauTiengViet(mon.ma);

    return ten.includes(tuKhoaKhongDau) || ma.includes(tuKhoaKhongDau);
  });
}

// ============================================================
// 14. HIỂN THỊ GỢI Ý
// ============================================================

function hienThiDanhSachGoiY(oNhap) {
  if (!oNhap) {
    return;
  }

  document.querySelectorAll(".danh-sach-goi-y").forEach((ds) => {
    ds.style.display = "none";
  });

  const khungGoiY = oNhap.closest(".khung-goi-y-mon-hoc");

  if (!khungGoiY) {
    return;
  }

  const hopGoiY = khungGoiY.querySelector(".danh-sach-goi-y");

  if (!hopGoiY) {
    return;
  }

  const tuKhoa = oNhap.value.trim().toLowerCase();

  hopGoiY.innerHTML = "";

  if (!tuKhoa) {
    hopGoiY.style.display = "none";

    return;
  }

  let ketQua = timHocPhan(tuKhoa);

  ketQua = ketQua.slice(0, 8);

  if (ketQua.length === 0) {
    hopGoiY.style.display = "none";

    return;
  }

  ketQua.forEach((mon) => {
    const muc = document.createElement("div");

    muc.className = "muc-goi-y";

    muc.innerHTML = `
        <strong>
          ${mon.ten}
        </strong>

        <span>
          ${mon.ma}
        </span>
      `;

    hopGoiY.appendChild(muc);
  });

  hopGoiY.style.display = "block";
}

// ============================================================
// 15. CHỌN HỌC PHẦN
// ============================================================

document.addEventListener("click", function (e) {
  const mucGoiY = e.target.closest(".muc-goi-y");

  if (!mucGoiY) {
    return;
  }

  const khungGoiY = mucGoiY.closest(".khung-goi-y-mon-hoc");

  const oNhap = khungGoiY?.querySelector(".nhap-ten-hoc-phan");

  if (!khungGoiY || !oNhap) {
    return;
  }

  const tenHocPhan = mucGoiY.querySelector("strong")?.textContent.trim();

  const hocPhan = danhSachHocPhan.find(
    (mon) => boDauTiengViet(mon.ten) === boDauTiengViet(tenHocPhan),
  );

  if (!hocPhan) {
    return;
  }

  const hang = khungGoiY.closest("tr");

  const oTinChi = hang?.querySelector(".o-so-tin-chi");

  // ----------------------------------------------------------
  // Kiểm tra trùng
  // ----------------------------------------------------------

  if (kiemTraTrungHocPhan(oNhap, hocPhan.ma)) {
    hienThiLoi(oNhap, "Học phần này đã được thêm.");

    return;
  }

  // ----------------------------------------------------------
  // Gán dữ liệu
  // ----------------------------------------------------------

  oNhap.value = hocPhan.ten;

  oNhap.dataset.maHocPhan = hocPhan.ma;

  if (oTinChi) {
    oTinChi.textContent = hocPhan.tinChi;
  }

  xoaLoiInput(oNhap);

  document.querySelectorAll(".danh-sach-goi-y").forEach((ds) => {
    ds.style.display = "none";
  });
});

// ============================================================
// 16. KIỂM TRA TRÙNG HỌC PHẦN
// ============================================================

function kiemTraTrungHocPhan(oNhapHienTai, maHocPhan) {
  if (!bangDuLieuMonHoc) {
    return false;
  }

  const tatCaONhap = bangDuLieuMonHoc.querySelectorAll(".nhap-ten-hoc-phan");

  return Array.from(tatCaONhap).some((oNhap) => {
    if (oNhap === oNhapHienTai) {
      return false;
    }

    const ma = (oNhap.dataset.maHocPhan || "").trim().toUpperCase();

    return ma && ma === String(maHocPhan).trim().toUpperCase();
  });
}

// ============================================================
// 17. CLICK RA NGOÀI → ĐÓNG GỢI Ý
// ============================================================

document.addEventListener("click", function (e) {
  if (e.target.closest(".khung-goi-y-mon-hoc")) {
    return;
  }

  document.querySelectorAll(".danh-sach-goi-y").forEach((ds) => {
    ds.style.display = "none";
  });
});

// ============================================================
// 18. THAY ĐỔI INPUT TÊN HỌC PHẦN
// ============================================================

document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("nhap-ten-hoc-phan")) {
    return;
  }

  const oNhap = e.target;

  const ten = oNhap.value.trim();

  const hocPhan = danhSachHocPhan.find(
    (mon) => boDauTiengViet(mon.ten) === boDauTiengViet(ten),
  );

  const hang = oNhap.closest("tr");

  const oTinChi = hang?.querySelector(".o-so-tin-chi");

  if (!hocPhan) {
    oNhap.removeAttribute("data-ma-hoc-phan");

    if (oTinChi) {
      oTinChi.textContent = "--";
    }

    return;
  }

  if (kiemTraTrungHocPhan(oNhap, hocPhan.ma)) {
    alert("Học phần này đã được thêm.");

    oNhap.value = "";

    oNhap.removeAttribute("data-ma-hoc-phan");

    if (oTinChi) {
      oTinChi.textContent = "--";
    }

    return;
  }

  oNhap.value = hocPhan.ten;

  oNhap.dataset.maHocPhan = hocPhan.ma;

  if (oTinChi) {
    oTinChi.textContent = hocPhan.tinChi;
  }
});

// ============================================================
// 19. BỎ DẤU TIẾNG VIỆT
// ============================================================

function boDauTiengViet(chuoi) {
  return String(chuoi || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

// ============================================================
// 20. ĐIỀU HƯỚNG BÀN PHÍM
// ============================================================

document.addEventListener("keydown", function (e) {
  const oNhap = document.activeElement;

  if (!oNhap?.classList.contains("nhap-ten-hoc-phan")) {
    return;
  }

  const khung = oNhap.closest(".khung-goi-y-mon-hoc");

  const danhSach = khung?.querySelector(".danh-sach-goi-y");

  if (!danhSach) {
    return;
  }

  const cacMuc = danhSach.querySelectorAll(".muc-goi-y");

  if (cacMuc.length === 0) {
    return;
  }

  let viTri = Array.from(cacMuc).findIndex((muc) =>
    muc.classList.contains("duoc-chon"),
  );

  if (e.key === "ArrowDown") {
    e.preventDefault();

    if (viTri >= 0) {
      cacMuc[viTri].classList.remove("duoc-chon");
    }

    viTri++;

    if (viTri >= cacMuc.length) {
      viTri = 0;
    }

    cacMuc[viTri].classList.add("duoc-chon");

    cacMuc[viTri].scrollIntoView({
      block: "nearest",
    });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();

    if (viTri >= 0) {
      cacMuc[viTri].classList.remove("duoc-chon");
    }

    viTri--;

    if (viTri < 0) {
      viTri = cacMuc.length - 1;
    }

    cacMuc[viTri].classList.add("duoc-chon");

    cacMuc[viTri].scrollIntoView({
      block: "nearest",
    });
  } else if (e.key === "Enter") {
    if (viTri < 0) {
      return;
    }

    e.preventDefault();

    cacMuc[viTri].click();
  } else if (e.key === "Escape") {
    danhSach.style.display = "none";
  }
});

// ============================================================
// 21. HIỂN THỊ LỖI INPUT
// ============================================================

function hienThiLoi(oInput, noiDung = "Trường này là bắt buộc") {
  if (!oInput) {
    return;
  }

  xoaLoiInput(oInput);

  oInput.classList.add("input-bi-loi");

  const thongBao = document.createElement("div");

  thongBao.className = "thong-bao-loi";

  thongBao.textContent = noiDung;

  oInput.insertAdjacentElement("afterend", thongBao);
}

// ============================================================
// 22. XÓA LỖI INPUT
// ============================================================

function xoaLoiInput(oInput) {
  if (!oInput) {
    return;
  }

  oInput.classList.remove("input-bi-loi");

  const loi = oInput.parentElement?.querySelector(".thong-bao-loi");

  if (loi) {
    loi.remove();
  }
}

// ============================================================
// 23. KIỂM TRA DỮ LIỆU
// ============================================================

function kiemTraDuLieu() {
  if (!bangDuLieuMonHoc) {
    return false;
  }

  const tatCaHang = bangDuLieuMonHoc.querySelectorAll("tr");

  if (tatCaHang.length === 0) {
    alert("Vui lòng thêm ít nhất một học phần.");

    return false;
  }

  // ----------------------------------------------------------
  // Xóa lỗi cũ
  // ----------------------------------------------------------

  document.querySelectorAll(".thong-bao-loi").forEach((loi) => loi.remove());

  document
    .querySelectorAll(".input-bi-loi")
    .forEach((input) => input.classList.remove("input-bi-loi"));

  let coLoi = false;

  const danhSachDaNhap = new Set();

  // ----------------------------------------------------------
  // Kiểm tra từng dòng
  // ----------------------------------------------------------

  tatCaHang.forEach((hang) => {
    const oNhapTen = hang.querySelector(".nhap-ten-hoc-phan");

    if (!oNhapTen) {
      return;
    }

    const ten = oNhapTen.value.trim();

    // ======================================================
    // TÊN HỌC PHẦN
    // ======================================================

    if (!ten) {
      hienThiLoi(oNhapTen, "Trường này là bắt buộc");

      coLoi = true;
    } else {
      const hocPhan = danhSachHocPhan.find(
        (mon) => boDauTiengViet(mon.ten) === boDauTiengViet(ten),
      );

      if (!hocPhan) {
        hienThiLoi(oNhapTen, `Học phần "${ten}" không tồn tại trong danh sách`);

        coLoi = true;
      } else {
        const ma = hocPhan.ma.trim().toUpperCase();

        if (danhSachDaNhap.has(ma)) {
          hienThiLoi(oNhapTen, `Học phần "${hocPhan.ten}" bị trùng`);

          coLoi = true;
        } else {
          danhSachDaNhap.add(ma);
        }
      }
    }

    // ======================================================
    // ĐIỂM
    // ======================================================

    const cacInputDiem = hang.querySelectorAll("input[type='number']");

    const diemChuyenCan = cacInputDiem[0];

    const diemThuongXuyen = cacInputDiem[1];

    const diemThi = cacInputDiem[2];

    if (!diemChuyenCan) {
      return;
    }

    // ------------------------------------------------------
    // Chuyên cần bắt buộc
    // ------------------------------------------------------

    if (diemChuyenCan.value.trim() === "") {
      hienThiLoi(diemChuyenCan, "Trường này là bắt buộc");

      coLoi = true;
    }

    // ------------------------------------------------------
    // Thường xuyên bắt buộc
    // ------------------------------------------------------

    if (diemThuongXuyen.value.trim() === "") {
      hienThiLoi(diemThuongXuyen, "Trường này là bắt buộc");

      coLoi = true;
    }

    // ------------------------------------------------------
    // Kiểm tra khoảng điểm
    // Điểm thi được phép bỏ trống
    // ------------------------------------------------------

    [diemChuyenCan, diemThuongXuyen, diemThi].forEach((oDiem) => {
      if (!oDiem) {
        return;
      }

      const giaTri = oDiem.value.trim();

      if (!giaTri) {
        return;
      }

      const diem = Number(giaTri);

      if (!Number.isFinite(diem) || diem < 0 || diem > 10) {
        hienThiLoi(oDiem, "Điểm phải từ 0 đến 10");

        coLoi = true;
      }
    });
  });

  if (coLoi) {
    const loiDauTien = document.querySelector(".input-bi-loi");

    if (loiDauTien) {
      loiDauTien.scrollIntoView({
        behavior: "smooth",

        block: "center",
      });

      loiDauTien.focus();
    }

    return false;
  }

  return true;
}

// ============================================================
// 24. KIỂM TRA ĐIỂM NGAY KHI NHẬP
// ============================================================

document.addEventListener("input", function (e) {
  if (!e.target.matches("input[type='number']")) {
    return;
  }

  const oDiem = e.target;

  const giaTri = oDiem.value.trim();

  if (!giaTri) {
    xoaLoiInput(oDiem);

    return;
  }

  const diem = Number(giaTri);

  if (!Number.isFinite(diem) || diem < 0 || diem > 10) {
    hienThiLoi(oDiem, "Điểm phải từ 0 đến 10");
  } else {
    xoaLoiInput(oDiem);
  }
});

// ============================================================
// 25. LẤY TOKEN
// ============================================================

function layToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// ============================================================
// 26. HIỂN THỊ SO SÁNH KỲ TRƯỚC
// ============================================================

function hienThiSoSanh(dong, soSanh) {
  if (!dong) {
    return;
  }

  const icon = dong.querySelector("i");

  const span = dong.querySelector("span");

  // ----------------------------------------------------------
  // Không có kỳ trước
  // ----------------------------------------------------------

  if (
    soSanh === null ||
    soSanh === undefined ||
    !Number.isFinite(Number(soSanh))
  ) {
    dong.style.display = "none";

    return;
  }

  dong.style.display = "";

  const giaTri = Number(soSanh);

  dong.classList.remove("thay-doi-tang", "thay-doi-giam", "thay-doi-khong-doi");

  // ==========================================================
  // TĂNG
  // ==========================================================

  if (giaTri > 0) {
    dong.classList.add("thay-doi-tang");

    if (icon) {
      icon.className = "fa-solid fa-arrow-up";
    }

    if (span) {
      span.textContent = `Tăng ${giaTri.toFixed(2)} so với học kỳ trước`;
    }

    return;
  }

  // ==========================================================
  // GIẢM
  // ==========================================================

  if (giaTri < 0) {
    dong.classList.add("thay-doi-giam");

    if (icon) {
      icon.className = "fa-solid fa-arrow-down";
    }

    if (span) {
      span.textContent = `Giảm ${Math.abs(giaTri).toFixed(2)} so với học kỳ trước`;
    }

    return;
  }

  // ==========================================================
  // KHÔNG ĐỔI
  // ==========================================================

  dong.classList.add("thay-doi-khong-doi");

  if (icon) {
    icon.className = "fa-solid fa-minus";
  }

  if (span) {
    span.textContent = "Không thay đổi so với học kỳ trước";
  }
}

// ============================================================
// 27. LỜI NHẮN THEO XẾP LOẠI
// ============================================================

function hienThiLoiNhan(xepLoai) {
  const loiNhan = document.getElementById("loi-nhan");

  if (!loiNhan) {
    return;
  }

  if (xepLoai === "Xuất sắc" || xepLoai === "Giỏi") {
    loiNhan.textContent = "Tiếp tục giữ vững phong độ!";
  } else if (xepLoai === "Khá") {
    loiNhan.textContent = "Cố gắng duy trì và cải thiện thêm nhé!";
  } else if (xepLoai === "Trung bình") {
    loiNhan.textContent = "Bạn vẫn còn nhiều cơ hội để cải thiện kết quả.";
  } else {
    loiNhan.textContent = "Hãy ưu tiên cải thiện các học phần có kết quả thấp.";
  }
}

// ============================================================
// 28. HIỂN THỊ NHẬN ĐỊNH
// ============================================================

function hienThiNhanDinh(danhSach) {
  const khuVuc = document.getElementById("danh-sach-nhan-xet");

  if (!khuVuc) {
    return;
  }

  khuVuc.innerHTML = "";

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

    khuVuc.appendChild(li);
  });
}

// ============================================================
// 29. HIỂN THỊ GỢI Ý
// ============================================================

function hienThiGoiY(danhSach) {
  const khuVuc = document.getElementById("danh-sach-goi-y");

  if (!khuVuc) {
    return;
  }

  khuVuc.innerHTML = "";

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

    khuVuc.appendChild(li);
  });
}

// ============================================================
// 30. NÚT DỰ ĐOÁN
// ============================================================

if (nutDuDoan) {
  nutDuDoan.addEventListener("click", async function () {
    // ======================================================
    // VALIDATE
    // ======================================================

    if (!kiemTraDuLieu()) {
      return;
    }

    // ======================================================
    // TOKEN
    // ======================================================

    const token = layToken();

    if (!token) {
      alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");

      return;
    }

    // ======================================================
    // HỌC KỲ + NĂM HỌC
    // ======================================================

    const oHocKy = document.getElementById("hoc-ky");

    const oNamHoc = document.getElementById("nam-hoc");

    // ------------------------------------------------------
    // Lấy học kỳ đang chọn
    // ------------------------------------------------------

    const giaTriHocKy =
      oHocKy?.value || oHocKy?.selectedOptions?.[0]?.textContent || "";

    // Chuyển:
    // HK1   → 1
    // HK 2  → 2
    // HK Hè → 3

    let hocKy = 0;

    if (String(giaTriHocKy).toUpperCase().includes("HÈ")) {
      hocKy = 3;
    } else {
      const ketQuaHocKy = String(giaTriHocKy).match(/\d+/);

      if (ketQuaHocKy) {
        hocKy = Number(ketQuaHocKy[0]);
      }
    }

    // ------------------------------------------------------
    // Lấy năm học
    // ------------------------------------------------------

    const namHoc = String(
      oNamHoc?.value || oNamHoc?.selectedOptions?.[0]?.textContent || "",
    )
      .trim()
      .replace(/\s*-\s*/g, "-");

    // ------------------------------------------------------
    // Kiểm tra
    // ------------------------------------------------------

    if (!Number.isInteger(hocKy) || hocKy < 1 || !namHoc) {
      alert("Vui lòng chọn học kỳ và năm học.");

      return;
    }

    // ======================================================
    // TRẠNG THÁI NÚT
    // ======================================================

    const noiDungCu = nutDuDoan.innerHTML;

    nutDuDoan.disabled = true;

    nutDuDoan.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Đang dự đoán...';

    try {
      // ====================================================
      // THU THẬP HỌC PHẦN
      // ====================================================

      const hocPhan = [];

      const tatCaHang = bangDuLieuMonHoc.querySelectorAll("tr");

      tatCaHang.forEach((hang) => {
        const oTen = hang.querySelector(".nhap-ten-hoc-phan");

        if (!oTen) {
          return;
        }

        const maHocPhan = (oTen.dataset.maHocPhan || "").trim().toUpperCase();

        const hocPhanInfo = danhSachHocPhan.find(
          (mon) => mon.ma.trim().toUpperCase() === maHocPhan,
        );

        if (!hocPhanInfo) {
          return;
        }

        const cacInputDiem = hang.querySelectorAll("input[type='number']");

        const diemChuyenCan = Number(cacInputDiem[0]?.value);

        const diemThuongXuyen = Number(cacInputDiem[1]?.value);

        const diemThiValue = cacInputDiem[2]?.value?.trim();

        const diemThi = diemThiValue ? Number(diemThiValue) : null;

        hocPhan.push({
          ma_hoc_phan: hocPhanInfo.ma,

          so_tin_chi: hocPhanInfo.tinChi,

          diem_chuyen_can: diemChuyenCan,

          diem_thuong_xuyen: diemThuongXuyen,

          diem_thi: diemThi,
        });
      });

      if (hocPhan.length === 0) {
        throw new Error("Chưa có học phần hợp lệ để dự đoán.");
      }

      // ====================================================
      // GỌI BACKEND
      // ====================================================

      const response = await fetch(
        "/api/du-doan/gpa-hoc-ky",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            hocKy: hocKy,

            namHoc: namHoc,

            hocPhan: hocPhan,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.thanhCong) {
        throw new Error(data.thongBao || "Không thể dự đoán GPA học kỳ.");
      }

      // ====================================================
      // LẤY KẾT QUẢ
      // ====================================================

      const ketQua = data.ketQua;

      if (!ketQua) {
        throw new Error("Backend không trả về kết quả dự đoán.");
      }

      // ----------------------------------------------------
      // ID DỰ ĐOÁN
      // ----------------------------------------------------

      idDuDoanHienTai = ketQua.idDuDoan || null;

      // ----------------------------------------------------
      // GPA
      // ----------------------------------------------------

      const gpa = Number(ketQua.gpa);

      // ----------------------------------------------------
      // ĐIỂM HỆ 10
      // ----------------------------------------------------

      const diemHe10 = Number(ketQua.diemHe10);

      // ----------------------------------------------------
      // TỔNG TÍN CHỈ
      // ----------------------------------------------------

      const tongTinChi = Number(ketQua.tongTinChi);

      // ----------------------------------------------------
      // XẾP LOẠI
      // ----------------------------------------------------

      const xepLoai = String(ketQua.xepLoai || "");

      // ====================================================
      // HIỆN KHU VỰC KẾT QUẢ
      // ====================================================

      if (khuVucKetQua) {
        khuVucKetQua.style.display = "block";
      }

      // ====================================================
      // GPA
      // ====================================================

      const oGPA = document.getElementById("gpa-du-doan");

      if (oGPA) {
        oGPA.textContent = Number.isFinite(gpa) ? gpa.toFixed(2) : "--";
      }

      // ====================================================
      // ĐIỂM HỆ 10
      // ====================================================

      const oDiemHe10 = document.getElementById("diem-he-10");

      if (oDiemHe10) {
        oDiemHe10.textContent = Number.isFinite(diemHe10)
          ? diemHe10.toFixed(2)
          : "--";
      }

      // ====================================================
      // XẾP LOẠI
      // ====================================================

      const oXepLoai = document.getElementById("xep-loai-du-kien");

      if (oXepLoai) {
        oXepLoai.textContent = xepLoai || "--";
      }

      // ====================================================
      // TỔNG TÍN CHỈ
      // ====================================================

      const oTongTinChi = document.getElementById("tong-tin-chi");

      if (oTongTinChi) {
        oTongTinChi.textContent = Number.isFinite(tongTinChi) ? tongTinChi : 0;
      }

      // ====================================================
      // % MÔN ĐÃ NHẬP
      // ====================================================

      const oPhanTram = document.getElementById("phan-tram-hoan-thanh");

      if (oPhanTram) {
        oPhanTram.textContent = `${hocPhan.length > 0 ? 100 : 0}%`;
      }

      // ====================================================
      // SO SÁNH GPA VỚI KỲ TRƯỚC
      // ====================================================

      const dongSoSanhGPA = document
        .getElementById("chenh-lech-gpa")
        ?.closest(".thay-doi-tich-cuc");

      // ====================================================
      // SO SÁNH HỆ 10 VỚI KỲ TRƯỚC
      // ====================================================

      const dongSoSanhHe10 = document
        .getElementById("chenh-lech-he-10")
        ?.closest(".thay-doi-tich-cuc");

      const soSanhKyTruoc = ketQua.soSanhKyTruoc;

      hienThiSoSanh(dongSoSanhGPA, soSanhKyTruoc?.chenhLechGpa);

      hienThiSoSanh(dongSoSanhHe10, soSanhKyTruoc?.chenhLechHe10);

      // ====================================================
      // LỜI NHẮN XẾP LOẠI
      // ====================================================

      hienThiLoiNhan(xepLoai);

      // ====================================================
      // NHẬN ĐỊNH
      // ====================================================

      hienThiNhanDinh(ketQua.nhanDinh);

      // ====================================================
      // GỢI Ý CẢI THIỆN
      // ====================================================

      hienThiGoiY(ketQua.loiKhuyen);

      // ====================================================
      // THỜI GIAN DỰ ĐOÁN
      // ====================================================

      const thoiGian = document.getElementById("thoi-gian-du-doan");

      if (thoiGian) {
        thoiGian.textContent = new Date().toLocaleString("vi-VN");
      }

      // ====================================================
      // BIỂU ĐỒ ĐIỂM TỪNG MÔN
      // ====================================================

      const hocPhanKetQua = Array.isArray(ketQua.hocPhan) ? ketQua.hocPhan : [];

      const duLieuBieuDoMoi = hocPhanKetQua.map((mon) => ({
        ma: mon.ma_hoc_phan,

        ten: mon.ten_hoc_phan,

        diem: Number(mon.diem_hoc_phan_he_10),
      }));

      capNhatBieuDo(duLieuBieuDoMoi);

      // ====================================================
      // CUỘN ĐẾN KẾT QUẢ
      // ====================================================

      if (khuVucKetQua) {
        khuVucKetQua.scrollIntoView({
          behavior: "smooth",

          block: "start",
        });
      }
    } catch (error) {
      console.error("Lỗi dự đoán GPA:", error);

      alert(error.message || "Không thể kết nối đến hệ thống dự đoán.");
    } finally {
      nutDuDoan.disabled = false;

      nutDuDoan.innerHTML = noiDungCu;
    }
  });
}

// ============================================================
// 31. NÚT TẢI BÁO CÁO
// ============================================================

if (nutTaiBaoCao) {
  nutTaiBaoCao.addEventListener("click", async function () {
    // ======================================================
    // CHƯA CÓ DỰ ĐOÁN
    // ======================================================

    if (!idDuDoanHienTai) {
      alert("Bạn chưa có kết quả dự đoán để tải báo cáo.");

      return;
    }

    // ======================================================
    // TOKEN
    // ======================================================

    const token = layToken();

    if (!token) {
      alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");

      return;
    }

    // ======================================================
    // TRẠNG THÁI NÚT
    // ======================================================

    const noiDungCu = nutTaiBaoCao.innerHTML;

    nutTaiBaoCao.disabled = true;

    nutTaiBaoCao.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Đang tạo báo cáo...';

    try {
      // ====================================================
      // GỌI API EXCEL
      // ====================================================

      const response = await fetch(
        `/api/bao-cao/du-doan-hoc-ky/${idDuDoanHienTai}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        let thongBao = "Không thể tải báo cáo.";

        try {
          const data = await response.json();

          thongBao = data.thongBao || thongBao;
        } catch (error) {
          // Response có thể không phải JSON
        }

        throw new Error(thongBao);
      }

      // ====================================================
      // NHẬN FILE
      // ====================================================

      const blob = await response.blob();

      // ====================================================
      // TẠO LINK TẢI
      // ====================================================

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      a.download = "Bao_cao_du_doan_GPA.xlsx";

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);

      alert(error.message || "Không thể tải báo cáo.");
    } finally {
      nutTaiBaoCao.disabled = false;

      nutTaiBaoCao.innerHTML = noiDungCu;
    }
  });
}

// ============================================================
// 32. BIỂU ĐỒ CỘT - DỮ LIỆU
// ============================================================

function capNhatBieuDoDiem(duLieu) {
  const chartArea = document.getElementById("chartArea");

  const axisX = document.getElementById("axisX");

  const tooltip = document.getElementById("chartTooltip");

  if (!chartArea || !axisX || !tooltip) {
    return;
  }

  // ----------------------------------------------------------
  // Giữ lại lưới
  // ----------------------------------------------------------

  const gridLines = chartArea.querySelector(".grid-lines");

  chartArea.innerHTML = "";

  if (gridLines) {
    chartArea.appendChild(gridLines);
  }

  axisX.innerHTML = "";

  if (!Array.isArray(duLieu) || duLieu.length === 0) {
    return;
  }

  duLieu.forEach((item) => {
    const diem = Number(item.diem);

    if (!Number.isFinite(diem)) {
      return;
    }

    const heightPercent = Math.max(0, Math.min(100, (diem / 10) * 100));

    const isPassed = diem >= 4;

    const colorClass = isPassed ? "bg-pass" : "bg-fail";

    // ======================================================
    // CỘT
    // ======================================================

    const barContainer = document.createElement("div");

    barContainer.className = "bar-container";

    barContainer.innerHTML = `
        <span class="bar-value">
          ${diem.toFixed(1)}
        </span>

        <div
          class="bar-pill ${colorClass}"
          style="height: ${heightPercent}%"
        ></div>
      `;

    chartArea.appendChild(barContainer);

    // ======================================================
    // TOOLTIP
    // ======================================================

    const barPill = barContainer.querySelector(".bar-pill");

    if (barPill) {
      barPill.addEventListener("mouseenter", function () {
        tooltip.innerHTML = `
              <div class="tooltip-header">

                <div class="tooltip-code">
                  ${item.ma || "---"}
                </div>

                <div class="tooltip-name">
                  ${item.ten || "---"}
                </div>

              </div>

              <div class="tooltip-content">

                <div
                  class="tooltip-dot ${isPassed ? "dot-pass" : "dot-fail"}"
                ></div>

                <span>
                  Điểm:
                </span>

                <strong>
                  ${diem.toFixed(1)}
                </strong>

              </div>
            `;

        tooltip.style.display = "block";

        const rect = barPill.getBoundingClientRect();

        const tooltipWidth = tooltip.offsetWidth;

        let left = rect.left + rect.width / 2 - tooltipWidth / 2;

        let top = rect.top - tooltip.offsetHeight - 10;

        left = Math.max(
          10,
          Math.min(left, window.innerWidth - tooltipWidth - 10),
        );

        if (top < 10) {
          top = rect.bottom + 10;
        }

        tooltip.style.left = `${left}px`;

        tooltip.style.top = `${top}px`;
      });

      barPill.addEventListener("mouseleave", function () {
        tooltip.style.display = "none";
      });
    }

    // ======================================================
    // TÊN TRỤC X
    // ======================================================

    const label = document.createElement("div");

    label.className = "axis-x-label";

    label.textContent = item.ma || "---";

    axisX.appendChild(label);
  });
}

// ============================================================
// 33. PHÂN LOẠI ĐIỂM A/B/C/D/F
// ============================================================

function xepLoaiTheoDiem(diem) {
  if (diem >= 8.5) {
    return "A";
  }

  if (diem >= 7.0) {
    return "B";
  }

  if (diem >= 5.5) {
    return "C";
  }

  if (diem >= 4.0) {
    return "D";
  }

  return "F";
}

// ============================================================
// 34. THỐNG KÊ XẾP LOẠI THEO TÍN CHỈ
// ============================================================

function demXepLoai() {
  const ketQua = {
    A: {
      mon: 0,
      tinChi: 0,
    },

    B: {
      mon: 0,
      tinChi: 0,
    },

    C: {
      mon: 0,
      tinChi: 0,
    },

    D: {
      mon: 0,
      tinChi: 0,
    },

    F: {
      mon: 0,
      tinChi: 0,
    },
  };

  duLieuBieuDo.forEach((item) => {
    const diem = Number(item.diem);

    if (!Number.isFinite(diem)) {
      return;
    }

    const xepLoai = xepLoaiTheoDiem(diem);

    const hocPhan = danhSachHocPhan.find(
      (mon) => boDauTiengViet(mon.ma) === boDauTiengViet(item.ma),
    );

    const tinChi = hocPhan ? Number(hocPhan.tinChi) : Number(item.tinChi) || 0;

    ketQua[xepLoai].mon += 1;

    ketQua[xepLoai].tinChi += tinChi;
  });

  return ketQua;
}

// ============================================================
// 35. VẼ BIỂU ĐỒ TRÒN
// ============================================================

function veBieuDoTron() {
  const vongTron = document.getElementById("vong-tron-bieu-do");

  if (!vongTron) {
    return;
  }

  const thongKe = demXepLoai();

  const tongTinChi = Object.values(thongKe).reduce(
    (tong, item) => tong + item.tinChi,
    0,
  );

  const oTongTinChi = document.getElementById("tong-tin-chi-bieu-do");

  if (oTongTinChi) {
    oTongTinChi.textContent = tongTinChi;
  }

  const cacMuc = ["A", "B", "C", "D", "F"];

  // ----------------------------------------------------------
  // Chưa có dữ liệu
  // ----------------------------------------------------------

  if (tongTinChi <= 0) {
    vongTron.style.background = "#e2e8f0";

    capNhatChuThichRong(thongKe);

    return;
  }

  // ----------------------------------------------------------
  // Tính phần trăm
  // ----------------------------------------------------------

  const phanTram = {};

  cacMuc.forEach((muc) => {
    phanTram[muc] = (thongKe[muc].tinChi / tongTinChi) * 100;
  });

  // ----------------------------------------------------------
  // Tính điểm kết thúc
  // ----------------------------------------------------------

  let batDau = 0;

  const ketThuc = {};

  cacMuc.forEach((muc) => {
    batDau += phanTram[muc];

    ketThuc[muc] = batDau;
  });

  vongTron.style.background = `
      conic-gradient(
        #22c55e 0% ${ketThuc.A}%,
        #3b82f6 ${ketThuc.A}% ${ketThuc.B}%,
        #f59e0b ${ketThuc.B}% ${ketThuc.C}%,
        #ef4444 ${ketThuc.C}% ${ketThuc.D}%,
        #94a3b8 ${ketThuc.D}% 100%
      )
    `;

  // ----------------------------------------------------------
  // Cập nhật chú thích
  // ----------------------------------------------------------

  const mucChuyenDoi = {
    A: ".mau-a",

    B: ".mau-b",

    C: ".mau-c",

    D: ".mau-d",

    F: ".mau-f",
  };

  cacMuc.forEach((muc) => {
    const mau = document.querySelector(mucChuyenDoi[muc]);

    if (!mau) {
      return;
    }

    const khoi = mau.closest(".muc-chu-thich");

    if (!khoi) {
      return;
    }

    const phanTramElement = khoi.querySelector(".phan-tram");

    const tinChiElement = khoi.querySelector(".tin-chi");

    if (phanTramElement) {
      phanTramElement.textContent = `${phanTram[muc].toFixed(1)}%`;
    }

    if (tinChiElement) {
      tinChiElement.textContent = `(${thongKe[muc].tinChi} tín chỉ)`;
    }
  });
}

// ============================================================
// 36. RESET CHÚ THÍCH KHI CHƯA CÓ DỮ LIỆU
// ============================================================

function capNhatChuThichRong(thongKe) {
  const mucChuyenDoi = {
    A: ".mau-a",

    B: ".mau-b",

    C: ".mau-c",

    D: ".mau-d",

    F: ".mau-f",
  };

  Object.keys(mucChuyenDoi).forEach((muc) => {
    const mau = document.querySelector(mucChuyenDoi[muc]);

    if (!mau) {
      return;
    }

    const khoi = mau.closest(".muc-chu-thich");

    if (!khoi) {
      return;
    }

    const phanTram = khoi.querySelector(".phan-tram");

    const tinChi = khoi.querySelector(".tin-chi");

    if (phanTram) {
      phanTram.textContent = "0.0%";
    }

    if (tinChi) {
      tinChi.textContent = "(0 tín chỉ)";
    }
  });
}

// ============================================================
// 37. CẬP NHẬT TOÀN BỘ BIỂU ĐỒ
// ============================================================

function capNhatBieuDo(duLieuMoi) {
  duLieuBieuDo = Array.isArray(duLieuMoi) ? duLieuMoi : [];

  capNhatBieuDoDiem(duLieuBieuDo);

  veBieuDoTron();
}

// ============================================================
// 38. KHỞI ĐỘNG TRANG
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {
  // --------------------------------------------------------
  // Tải học phần từ backend
  // --------------------------------------------------------

  await taiDanhSachHocPhan();

  // --------------------------------------------------------
  // Khởi tạo bảng
  // --------------------------------------------------------

  khoiTaoBang();

  // --------------------------------------------------------
  // Khởi tạo biểu đồ
  // --------------------------------------------------------

  capNhatBieuDo([]);
});
