// ============================================================
// HEADER - THÔNG TIN SINH VIÊN
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
// API
// ============================================================

const API_BASE_URL = "";

const API_DU_DOAN_DIEM_HOC_PHAN = `${API_BASE_URL}/api/du-doan/diem-hoc-phan`;

const API_HOC_PHAN = `${API_BASE_URL}/api/hoc-phan`;

// ============================================================
// DỰ ĐOÁN ĐIỂM HỌC PHẦN
// ============================================================

const nutDuDoan = document.getElementById("nut-du-doan");

const tenHocPhan = document.getElementById("ten-hoc-phan");

const maHocPhan = document.getElementById("ma-hoc-phan");

const soTinChi = document.getElementById("so-tin-chi");

const khungThongTinHocPhan = document.querySelector(".thong-tin-hoc-phan");

// ============================================================
// CÁC Ô NHẬP ĐIỂM
// ============================================================

const diemChuyenCan = document.getElementById("diem-chuyen-can");

const diemThuongXuyen = document.getElementById("diem-thuong-xuyen");

const tyLeHoanThanhBaiTap = document.getElementById("ty-le-hoan-thanh-bai-tap");

const soBuoiNghi = document.getElementById("so-buoi-nghi");

// ============================================================
// CÁC Ô KẾT QUẢ
// ============================================================

const diemThang10 = document.getElementById("diem-thang-10");

const diemThang4 = document.getElementById("diem-thang-4");

const diemChu = document.getElementById("diem-chu");

const xepLoai = document.getElementById("xep-loai");

// ============================================================
// CÁC NÚT
// ============================================================

const nutLamMoi = document.querySelector(".nut-lam-moi");

const nutDuDoanLai = document.querySelector(".nut-du-doan-lai");

const nutLuu = document.querySelector(".nut-luu");

// ============================================================
// KHU VỰC KẾT QUẢ
// ============================================================

const khuVucKetQua = document.getElementById("khu-vuc-ket-qua");

// ============================================================
// KHU VỰC NHẬN ĐỊNH + LỜI KHUYÊN
// ============================================================

const khuVucNhanDinh = document.querySelector(".hop-nhan-dinh .noi-dung-hop");

const khuVucLoiKhuyen = document.querySelector(".hop-loi-khuyen .noi-dung-hop");

// ============================================================
// DANH SÁCH HỌC PHẦN
// ============================================================

let danhSachHocPhan = [];

const oTenHocPhan = document.getElementById("ten-hoc-phan");

const maHocPhanElement = document.getElementById("ma-hoc-phan");

const soTinChiElement = document.getElementById("so-tin-chi");

// ============================================================
// KHUNG TÌM KIẾM HỌC PHẦN
// ============================================================

const oTimKiem = document.querySelector(".o-tim-kiem-hoc-phan");

// ============================================================
// TẠO KHUNG GỢI Ý
// ============================================================

let khuVucGoiY = null;

if (oTimKiem) {
  khuVucGoiY = document.createElement("div");

  khuVucGoiY.className = "danh-sach-goi-y-hoc-phan";

  khuVucGoiY.style.display = "none";

  oTimKiem.appendChild(khuVucGoiY);
}

// ============================================================
// ẨN KHU VỰC KẾT QUẢ KHI MỚI VÀO
// ============================================================

if (khuVucKetQua) {
  khuVucKetQua.style.display = "none";
}

// ============================================================
// ẨN KHUNG THÔNG TIN HỌC PHẦN
// ============================================================

if (khungThongTinHocPhan) {
  khungThongTinHocPhan.style.display = "none";
}

// ============================================================
// TOKEN
// ============================================================

function layToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// ============================================================
// ESCAPE HTML
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
// XÓA DỮ LIỆU NHẬP
// ============================================================

function xoaDuLieuNhap() {
  // ----------------------------------------------------------
  // Xóa lỗi trước
  // ----------------------------------------------------------

  xoaTatCaLoiInput();

  // ----------------------------------------------------------
  // Học phần
  // ----------------------------------------------------------

  if (oTenHocPhan) {
    oTenHocPhan.value = "";
  }

  if (maHocPhanElement) {
    maHocPhanElement.textContent = "";
  }

  if (soTinChiElement) {
    soTinChiElement.textContent = "";
  }

  // ----------------------------------------------------------
  // Ẩn khung học phần
  // ----------------------------------------------------------

  if (khungThongTinHocPhan) {
    khungThongTinHocPhan.style.display = "none";
  }

  // ----------------------------------------------------------
  // Điểm
  // ----------------------------------------------------------

  if (diemChuyenCan) {
    diemChuyenCan.value = "";
  }

  if (diemThuongXuyen) {
    diemThuongXuyen.value = "";
  }

  if (tyLeHoanThanhBaiTap) {
    tyLeHoanThanhBaiTap.value = "";
  }

  if (soBuoiNghi) {
    soBuoiNghi.value = "";
  }

  // ----------------------------------------------------------
  // Gợi ý
  // ----------------------------------------------------------

  if (khuVucGoiY) {
    khuVucGoiY.innerHTML = "";

    khuVucGoiY.style.display = "none";
  }
}

// ============================================================
// NÚT LÀM MỚI
// ============================================================

if (nutLamMoi) {
  nutLamMoi.addEventListener("click", function () {
    xoaDuLieuNhap();

    if (khuVucKetQua) {
      khuVucKetQua.style.display = "none";
    }

    if (oTenHocPhan) {
      oTenHocPhan.focus();
    }
  });
}

// ============================================================
// NÚT DỰ ĐOÁN LẠI
// ============================================================

if (nutDuDoanLai) {
  nutDuDoanLai.addEventListener("click", function () {
    xoaDuLieuNhap();

    if (khuVucKetQua) {
      khuVucKetQua.style.display = "none";
    }

    if (oTenHocPhan) {
      oTenHocPhan.focus();
    }
  });
}

// ============================================================
// NÚT LƯU
// ============================================================

if (nutLuu) {
  nutLuu.addEventListener("click", function () {
    alert("Chức năng lưu kết quả chưa được kết nối.");
  });
}

// ============================================================
// TÌM KIẾM HỌC PHẦN
// ============================================================

if (oTenHocPhan) {
  oTenHocPhan.addEventListener("input", function () {
    const tuKhoa = this.value.trim().toLowerCase();

    // --------------------------------------------------------
    // Xóa lỗi tên học phần
    // --------------------------------------------------------

    xoaLoiInput(oTenHocPhan);

    // --------------------------------------------------------
    // Xóa gợi ý
    // --------------------------------------------------------

    if (khuVucGoiY) {
      khuVucGoiY.innerHTML = "";
    }

    // --------------------------------------------------------
    // Không có từ khóa
    // --------------------------------------------------------

    if (!tuKhoa) {
      if (khuVucGoiY) {
        khuVucGoiY.style.display = "none";
      }

      if (khungThongTinHocPhan) {
        khungThongTinHocPhan.style.display = "none";
      }

      if (maHocPhanElement) {
        maHocPhanElement.textContent = "";
      }

      if (soTinChiElement) {
        soTinChiElement.textContent = "";
      }

      return;
    }

    // --------------------------------------------------------
    // Tìm kiếm
    // --------------------------------------------------------

    const ketQua = danhSachHocPhan.filter(function (hocPhan) {
      const ten = String(hocPhan.TEN_HOC_PHAN || "").toLowerCase();

      const ma = String(hocPhan.MA_HOC_PHAN || "").toLowerCase();

      return ten.includes(tuKhoa) || ma.includes(tuKhoa);
    });

    // --------------------------------------------------------
    // Không tìm thấy
    // --------------------------------------------------------

    if (ketQua.length === 0) {
      if (khuVucGoiY) {
        khuVucGoiY.style.display = "none";
      }

      return;
    }

    // --------------------------------------------------------
    // Tạo gợi ý
    // --------------------------------------------------------

    ketQua.forEach(function (hocPhan) {
      const item = document.createElement("div");

      item.className = "goi-y-hoc-phan";

      item.innerHTML = `
            <div class="thong-tin-goi-y">

              <strong>
                ${escapeHTML(hocPhan.TEN_HOC_PHAN || "")}
              </strong>

              <span>
                ${escapeHTML(hocPhan.MA_HOC_PHAN || "")}
              </span>

            </div>

            <span class="tin-chi-goi-y">
              ${Number(hocPhan.SO_TIN_CHI || 0)}
              tín chỉ
            </span>
          `;

      // ----------------------------------------------------
      // Chọn học phần
      // ----------------------------------------------------

      item.addEventListener("click", function () {
        oTenHocPhan.value = hocPhan.TEN_HOC_PHAN || "";

        maHocPhanElement.textContent = hocPhan.MA_HOC_PHAN || "";

        soTinChiElement.textContent = hocPhan.SO_TIN_CHI || "";

        // Xóa lỗi học phần
        xoaLoiInput(oTenHocPhan);

        // Hiện thông tin
        if (khungThongTinHocPhan) {
          khungThongTinHocPhan.style.display = "grid";
        }

        // Đóng gợi ý
        if (khuVucGoiY) {
          khuVucGoiY.style.display = "none";
        }
      });

      if (khuVucGoiY) {
        khuVucGoiY.appendChild(item);
      }
    });

    // --------------------------------------------------------
    // Hiện gợi ý
    // --------------------------------------------------------

    if (khuVucGoiY) {
      khuVucGoiY.style.display = "block";
    }
  });
}

// ============================================================
// CLICK RA NGOÀI → ĐÓNG GỢI Ý
// ============================================================

document.addEventListener("click", function (event) {
  if (oTimKiem && !oTimKiem.contains(event.target)) {
    if (khuVucGoiY) {
      khuVucGoiY.style.display = "none";
    }
  }
});

// ============================================================
// HIỂN THỊ LỖI
// ============================================================

function hienThiLoi(oInput, noiDung) {
  if (!oInput) {
    return;
  }

  // Xóa lỗi cũ
  xoaLoiInput(oInput);

  // Đánh dấu input lỗi
  oInput.classList.add("input-bi-loi");

  // Tạo thông báo
  const thongBao = document.createElement("div");

  thongBao.className = "thong-bao-loi";

  thongBao.textContent = noiDung;

  // Chèn ngay sau input
  oInput.insertAdjacentElement("afterend", thongBao);
}

// ============================================================
// XÓA LỖI 1 INPUT
// ============================================================

function xoaLoiInput(oInput) {
  if (!oInput) {
    return;
  }

  oInput.classList.remove("input-bi-loi");

  const cha = oInput.parentElement;

  if (!cha) {
    return;
  }

  const loi = cha.querySelector(".thong-bao-loi");

  if (loi) {
    loi.remove();
  }
}

// ============================================================
// XÓA TẤT CẢ LỖI
// ============================================================

function xoaTatCaLoiInput() {
  [
    tenHocPhan,
    diemChuyenCan,
    diemThuongXuyen,
    tyLeHoanThanhBaiTap,
    soBuoiNghi,
  ].forEach(function (input) {
    if (input) {
      xoaLoiInput(input);
    }
  });
}

// ============================================================
// VALIDATION HỌC PHẦN
// ============================================================

function kiemTraHocPhan() {
  if (!tenHocPhan || !tenHocPhan.value.trim()) {
    hienThiLoi(tenHocPhan, "Vui lòng chọn học phần.");

    return false;
  }

  const ma = maHocPhan?.textContent?.trim() || "";

  if (!ma) {
    hienThiLoi(tenHocPhan, "Vui lòng chọn học phần từ danh sách gợi ý.");

    return false;
  }

  return true;
}

// ============================================================
// VALIDATION ĐIỂM CHUYÊN CẦN
// ============================================================

function kiemTraDiemChuyenCan() {
  if (!diemChuyenCan) {
    return false;
  }

  const giaTri = diemChuyenCan.value.trim();

  // ----------------------------------------------------------
  // BỎ TRỐNG
  // ----------------------------------------------------------

  if (!giaTri) {
    hienThiLoi(diemChuyenCan, "Vui lòng nhập điểm chuyên cần.");

    return false;
  }

  const diem = Number(giaTri);

  // ----------------------------------------------------------
  // KHÔNG PHẢI SỐ
  // ----------------------------------------------------------

  if (!Number.isFinite(diem)) {
    hienThiLoi(diemChuyenCan, "Điểm chuyên cần phải là số.");

    return false;
  }

  // ----------------------------------------------------------
  // NGOÀI KHOẢNG
  // ----------------------------------------------------------

  if (diem < 0 || diem > 10) {
    hienThiLoi(diemChuyenCan, "Điểm chuyên cần phải từ 0 đến 10.");

    return false;
  }

  return true;
}

// ============================================================
// VALIDATION ĐIỂM THƯỜNG XUYÊN
// ============================================================

function kiemTraDiemThuongXuyen() {
  if (!diemThuongXuyen) {
    return false;
  }

  const giaTri = diemThuongXuyen.value.trim();

  if (!giaTri) {
    hienThiLoi(diemThuongXuyen, "Vui lòng nhập điểm thường xuyên.");

    return false;
  }

  const diem = Number(giaTri);

  if (!Number.isFinite(diem)) {
    hienThiLoi(diemThuongXuyen, "Điểm thường xuyên phải là số.");

    return false;
  }

  if (diem < 0 || diem > 10) {
    hienThiLoi(diemThuongXuyen, "Điểm thường xuyên phải từ 0 đến 10.");

    return false;
  }

  return true;
}

// ============================================================
// VALIDATION TỶ LỆ HOÀN THÀNH
// ============================================================

function kiemTraTyLeHoanThanhBaiTap() {
  if (!tyLeHoanThanhBaiTap) {
    return false;
  }

  const giaTri = tyLeHoanThanhBaiTap.value.trim();

  if (!giaTri) {
    hienThiLoi(tyLeHoanThanhBaiTap, "Vui lòng nhập tỷ lệ hoàn thành bài tập.");

    return false;
  }

  const tyLe = Number(giaTri);

  if (!Number.isFinite(tyLe)) {
    hienThiLoi(tyLeHoanThanhBaiTap, "Tỷ lệ hoàn thành phải là số.");

    return false;
  }

  if (tyLe < 0 || tyLe > 100) {
    hienThiLoi(tyLeHoanThanhBaiTap, "Tỷ lệ hoàn thành phải từ 0 đến 100%.");

    return false;
  }

  return true;
}

// ============================================================
// VALIDATION SỐ BUỔI NGHỈ
// ============================================================

function kiemTraSoBuoiNghi() {
  if (!soBuoiNghi) {
    return false;
  }

  const giaTri = soBuoiNghi.value.trim();

  if (!giaTri) {
    hienThiLoi(soBuoiNghi, "Vui lòng nhập số buổi nghỉ.");

    return false;
  }

  const soBuoi = Number(giaTri);

  if (!Number.isFinite(soBuoi)) {
    hienThiLoi(soBuoiNghi, "Số buổi nghỉ phải là số.");

    return false;
  }

  if (!Number.isInteger(soBuoi)) {
    hienThiLoi(soBuoiNghi, "Số buổi nghỉ phải là số nguyên.");

    return false;
  }

  if (soBuoi < 0) {
    hienThiLoi(soBuoiNghi, "Số buổi nghỉ không được nhỏ hơn 0.");

    return false;
  }

  return true;
}

// ============================================================
// VALIDATION TOÀN BỘ FORM
// ============================================================

function kiemTraToanBoForm() {
  // Xóa lỗi cũ
  xoaTatCaLoiInput();

  // ----------------------------------------------------------
  // 1. Học phần
  // ----------------------------------------------------------

  if (!kiemTraHocPhan()) {
    tenHocPhan?.focus();

    return false;
  }

  // ----------------------------------------------------------
  // 2. Chuyên cần
  // ----------------------------------------------------------

  if (!kiemTraDiemChuyenCan()) {
    diemChuyenCan?.focus();

    return false;
  }

  // ----------------------------------------------------------
  // 3. Thường xuyên
  // ----------------------------------------------------------

  if (!kiemTraDiemThuongXuyen()) {
    diemThuongXuyen?.focus();

    return false;
  }

  // ----------------------------------------------------------
  // 4. Hoàn thành bài tập
  // ----------------------------------------------------------

  if (!kiemTraTyLeHoanThanhBaiTap()) {
    tyLeHoanThanhBaiTap?.focus();

    return false;
  }

  // ----------------------------------------------------------
  // 5. Số buổi nghỉ
  // ----------------------------------------------------------

  if (!kiemTraSoBuoiNghi()) {
    soBuoiNghi?.focus();

    return false;
  }

  return true;
}

// ============================================================
// XÓA LỖI KHI NGƯỜI DÙNG NHẬP LẠI
// ============================================================

[
  tenHocPhan,
  diemChuyenCan,
  diemThuongXuyen,
  tyLeHoanThanhBaiTap,
  soBuoiNghi,
].forEach(function (input) {
  if (!input) {
    return;
  }

  input.addEventListener("input", function () {
    xoaLoiInput(input);
  });
});

// ============================================================
// BLUR → KIỂM TRA NGAY Ô ĐÓ
// ============================================================

if (diemChuyenCan) {
  diemChuyenCan.addEventListener("blur", function () {
    if (diemChuyenCan.value.trim()) {
      kiemTraDiemChuyenCan();
    }
  });
}

if (diemThuongXuyen) {
  diemThuongXuyen.addEventListener("blur", function () {
    if (diemThuongXuyen.value.trim()) {
      kiemTraDiemThuongXuyen();
    }
  });
}

if (tyLeHoanThanhBaiTap) {
  tyLeHoanThanhBaiTap.addEventListener("blur", function () {
    if (tyLeHoanThanhBaiTap.value.trim()) {
      kiemTraTyLeHoanThanhBaiTap();
    }
  });
}

if (soBuoiNghi) {
  soBuoiNghi.addEventListener("blur", function () {
    if (soBuoiNghi.value.trim()) {
      kiemTraSoBuoiNghi();
    }
  });
}

// ============================================================
// BẤM NÚT DỰ ĐOÁN
// ============================================================

if (nutDuDoan) {
  nutDuDoan.addEventListener("click", async function () {
    // ======================================================
    // 1. VALIDATION
    // ======================================================

    const hopLe = kiemTraToanBoForm();

    if (!hopLe) {
      return;
    }

    // ======================================================
    // 2. LẤY TOKEN
    // ======================================================

    const token = layToken();

    if (!token) {
      alert("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");

      return;
    }

    // ======================================================
    // 3. LẤY DỮ LIỆU
    // ======================================================

    const ma = maHocPhan?.textContent?.trim() || "";

    const tinChi = Number(soTinChi?.textContent?.trim());

    const chuyenCan = Number(diemChuyenCan.value);

    const thuongXuyen = Number(diemThuongXuyen.value);

    const hoanThanh = Number(tyLeHoanThanhBaiTap.value);

    const nghi = Number(soBuoiNghi.value);

    // ======================================================
    // 4. LƯU TÊN NÚT
    // ======================================================

    const noiDungCu = nutDuDoan.innerHTML;

    nutDuDoan.disabled = true;

    nutDuDoan.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Đang dự đoán...
      `;

    try {
      // ====================================================
      // 5. GỌI NODE.JS
      // ====================================================

      const response = await fetch(API_DU_DOAN_DIEM_HOC_PHAN, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },

        body: JSON.stringify({
          ma_hoc_phan: ma,

          so_tin_chi: tinChi,

          diem_chuyen_can: chuyenCan,

          diem_thuong_xuyen: thuongXuyen,

          ty_le_hoan_thanh_bai_tap: hoanThanh,

          so_buoi_nghi: nghi,
        }),
      });

      // ====================================================
      // 6. ĐỌC JSON
      // ====================================================

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error("Backend không trả về JSON hợp lệ.");
      }

      // ====================================================
      // 7. KIỂM TRA PHẢN HỒI
      // ====================================================

      if (!response.ok || !data?.thanh_cong) {
        throw new Error(
          data?.message || data?.thongBao || "Không thể dự đoán.",
        );
      }

      // ====================================================
      // 8. HIỆN KẾT QUẢ
      // ====================================================

      if (khuVucKetQua) {
        khuVucKetQua.style.display = "";
      }

      // ====================================================
      // 9. LẤY KẾT QUẢ ML
      // ====================================================

      const ketQua = data.ket_qua || {};

      const diem = Number(ketQua.diem_du_doan);

      const loai = ketQua.xep_loai || "";

      const mucDanhGia = ketQua.muc_danh_gia || "";

      const mucCanhBao = ketQua.muc_canh_bao || "";

      const nhanDinh = Array.isArray(ketQua.nhan_dinh) ? ketQua.nhan_dinh : [];

      const loiKhuyen = Array.isArray(ketQua.loi_khuyen)
        ? ketQua.loi_khuyen
        : [];

      // ====================================================
      // 10. KIỂM TRA KẾT QUẢ
      // ====================================================

      if (!Number.isFinite(diem)) {
        throw new Error("Kết quả dự đoán không hợp lệ.");
      }

      // ====================================================
      // 11. QUY ĐỔI
      // ====================================================

      const diem4 = quyDoiThang4(diem);

      const chu = quyDoiDiemChu(diem);

      // ====================================================
      // 12. HIỂN THỊ ĐIỂM
      // ====================================================

      if (diemThang10) {
        diemThang10.textContent = diem.toFixed(2);
      }

      if (diemThang4) {
        diemThang4.textContent = diem4.toFixed(2);
      }

      if (diemChu) {
        diemChu.textContent = chu;
      }

      if (xepLoai) {
        xepLoai.textContent = loai;
      }

      // ====================================================
      // 13. NHẬN ĐỊNH
      // ====================================================

      if (khuVucNhanDinh) {
        khuVucNhanDinh.innerHTML = "";

        if (mucDanhGia || mucCanhBao) {
          const dongTongQuat = document.createElement("div");

          dongTongQuat.className = "tung-dong nhan-dinh";

          const icon = document.createElement("i");

          icon.className = "fa-solid fa-circle-check";

          const span = document.createElement("span");

          span.innerHTML = `
              Đánh giá:
              <strong>
                ${escapeHTML(mucDanhGia)}
              </strong>

              ${
                mucCanhBao
                  ? `
                    · Mức cảnh báo:
                    <strong>
                      ${escapeHTML(mucCanhBao)}
                    </strong>
                  `
                  : ""
              }
            `;

          dongTongQuat.appendChild(icon);

          dongTongQuat.appendChild(span);

          khuVucNhanDinh.appendChild(dongTongQuat);
        }

        // --------------------------------------------------
        // Chi tiết
        // --------------------------------------------------

        nhanDinh.forEach(function (noiDung) {
          const dong = document.createElement("div");

          dong.className = "tung-dong nhan-dinh";

          const icon = document.createElement("i");

          icon.className = "fa-solid fa-circle-check";

          const span = document.createElement("span");

          span.textContent = noiDung;

          dong.appendChild(icon);

          dong.appendChild(span);

          khuVucNhanDinh.appendChild(dong);
        });
      }

      // ====================================================
      // 14. LỜI KHUYÊN
      // ====================================================

      if (khuVucLoiKhuyen) {
        khuVucLoiKhuyen.innerHTML = "";

        loiKhuyen.forEach(function (noiDung) {
          const dong = document.createElement("div");

          dong.className = "tung-dong loi-khuyen";

          const icon = document.createElement("i");

          icon.className = "fa-solid fa-circle-check";

          const span = document.createElement("span");

          span.textContent = noiDung;

          dong.appendChild(icon);

          dong.appendChild(span);

          khuVucLoiKhuyen.appendChild(dong);
        });
      }

      // ====================================================
      // 15. THANH TIẾN TRÌNH THANG 10
      // ====================================================

      const thanhThang10 = document.querySelector(
        ".the-ket-qua:nth-child(1) .thanh-tien-trinh",
      );

      if (thanhThang10) {
        const phanTram = Math.max(0, Math.min(100, diem * 10));

        thanhThang10.style.width = `${phanTram}%`;
      }

      // ====================================================
      // 16. THANH TIẾN TRÌNH THANG 4
      // ====================================================

      const thanhThang4 = document.querySelector(
        ".the-ket-qua:nth-child(2) .thanh-tien-trinh",
      );

      if (thanhThang4) {
        const phanTram = Math.max(0, Math.min(100, (diem4 / 4) * 100));

        thanhThang4.style.width = `${phanTram}%`;
      }

      // ====================================================
      // 17. THANH TIẾN TRÌNH ĐIỂM CHỮ
      // ====================================================

      const thanhDiemChu = document.querySelector(
        ".the-ket-qua:nth-child(3) .thanh-tien-trinh",
      );

      if (thanhDiemChu) {
        const phanTram = Math.max(0, Math.min(100, diem * 10));

        thanhDiemChu.style.width = `${phanTram}%`;
      }

      // ====================================================
      // 18. THANH TIẾN TRÌNH XẾP LOẠI
      // ====================================================

      const thanhXepLoai = document.querySelector(
        ".the-ket-qua:nth-child(4) .thanh-tien-trinh",
      );

      if (thanhXepLoai) {
        const phanTram = Math.max(0, Math.min(100, diem * 10));

        thanhXepLoai.style.width = `${phanTram}%`;
      }
    } catch (error) {
      console.error("Lỗi dự đoán:", error);

      alert(error.message || "Không thể kết nối đến hệ thống dự đoán.");
    } finally {
      nutDuDoan.disabled = false;

      nutDuDoan.innerHTML = noiDungCu;
    }
  });
}

// ============================================================
// QUY ĐỔI THANG 10 → THANG 4
// ============================================================

function quyDoiThang4(diem) {
  if (diem >= 9.0) {
    return 4.0;
  }
  
  if (diem >= 8.6) {
    return 3.7;
  }

  if (diem >= 7.8) {
    return 3.5;
  }

  if (diem >= 7.0) {
    return 3.0;
  }

  if (diem >= 6.5) {
    return 2.5;
  }

  if (diem >= 5.5) {
    return 2.0;
  }

  if (diem >= 5.0) {
    return 1.5;
  }

  if (diem >= 4.0) {
    return 1.0;
  }

  return 0.0;
}

// ============================================================
// QUY ĐỔI ĐIỂM CHỮ
// ============================================================

function quyDoiDiemChu(diem) {
  if (diem >= 9.0) {
    return "A+";
  }

  if (diem >= 8.6) {
    return "A";
  }

  if (diem >= 7.8) {
    return "B+";
  }

  if (diem >= 7.0) {
    return "B";
  }

  if (diem >= 6.5) {
    return "C+";
  }

  if (diem >= 5.5) {
    return "C";
  }

  if (diem >= 5.0) {
    return "D+";
  }

  if (diem >= 4.0) {
    return "D";
  }

  return "F";
}

// ============================================================
// TẢI DANH SÁCH HỌC PHẦN
// ============================================================

async function taiDanhSachHocPhan() {
  try {
    const response = await fetch(API_HOC_PHAN, {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      throw new Error("Backend không trả JSON hợp lệ.");
    }

    if (!response.ok || !data?.thanh_cong) {
      throw new Error(
        data?.message || data?.thongBao || "Không thể lấy danh sách học phần.",
      );
    }

    danhSachHocPhan = Array.isArray(data.du_lieu) ? data.du_lieu : [];

    console.log("Đã tải học phần:", danhSachHocPhan);
  } catch (error) {
    console.error("Lỗi tải danh sách học phần:", error);
  }
}

// ============================================================
// KHỞI TẠO HỌC PHẦN
// ============================================================

taiDanhSachHocPhan();

// ============================================================
// ============================================================
// PHẦN TRANG HOME
// ============================================================
// ============================================================

// ============================================================
// BANNER
// ============================================================

const carouselSlide = document.querySelector(".hop-banner");

const images = document.querySelectorAll(".banner img");

const dots = document.querySelectorAll(".dot");

const prevBtn = document.querySelector(".ben-trai");

const nextBtn = document.querySelector(".ben-phai");

if (
  carouselSlide &&
  images.length > 0 &&
  dots.length > 0 &&
  prevBtn &&
  nextBtn
) {
  const totalImages = images.length;

  let currentIndex = 0;

  let timer = null;

  const firstClone = images[0].cloneNode(true);

  carouselSlide.appendChild(firstClone);

  function updateBanner(index) {
    carouselSlide.style.transition = "transform 0.5s ease-in-out";

    currentIndex = index;

    carouselSlide.style.transform = `translateX(${-currentIndex * 100}%)`;

    dots.forEach(function (dot) {
      dot.classList.remove("active");
    });

    const dotIndex = currentIndex === totalImages ? 0 : currentIndex;

    if (dots[dotIndex]) {
      dots[dotIndex].classList.add("active");
    }
  }

  carouselSlide.addEventListener("transitionend", function () {
    if (currentIndex === totalImages) {
      carouselSlide.style.transition = "none";

      currentIndex = 0;

      carouselSlide.style.transform = "translateX(0%)";
    }

    if (currentIndex < 0) {
      carouselSlide.style.transition = "none";

      currentIndex = totalImages - 1;

      carouselSlide.style.transform = `translateX(${-currentIndex * 100}%)`;
    }
  });

  function nextBanner() {
    if (currentIndex >= totalImages) {
      return;
    }

    updateBanner(currentIndex + 1);
  }

  function prevBanner() {
    if (currentIndex === 0) {
      updateBanner(-1);
    } else {
      updateBanner(currentIndex - 1);
    }
  }

  function startAutoPlay() {
    clearInterval(timer);

    timer = setInterval(nextBanner, 3000);
  }

  nextBtn.addEventListener("click", function () {
    nextBanner();

    startAutoPlay();
  });

  prevBtn.addEventListener("click", function () {
    prevBanner();

    startAutoPlay();
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function (e) {
      const clickedIndex = parseInt(e.target.getAttribute("data-index"), 10);

      updateBanner(clickedIndex);

      startAutoPlay();
    });
  });

  startAutoPlay();
}

// ============================================================
// GPA - LẤY DỮ LIỆU BACKEND
// ============================================================

async function layDuLieuGPA() {
  try {
    const token = layToken();

    if (!token) {
      console.error("Không tìm thấy token.");

      return;
    }

    const svg = document.getElementById("gpa-chart");

    if (!svg) {
      return;
    }

    const phanHoi = await fetch(`${API_BASE_URL}/api/sinh-vien/gpa`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    let duLieu = null;

    try {
      duLieu = await phanHoi.json();
    } catch {
      throw new Error("Backend không trả JSON hợp lệ.");
    }

    console.log("Dữ liệu GPA từ backend:", duLieu);

    if (!phanHoi.ok || !duLieu?.thanhCong) {
      console.error("Không lấy được dữ liệu GPA:", duLieu?.thongBao);

      return;
    }

    const gpaData = Array.isArray(duLieu.gpa)
      ? duLieu.gpa.map(function (item) {
          return Number(item.GPA);
        })
      : [];

    if (gpaData.length === 0) {
      return;
    }

    drawGPAChart(gpaData);
  } catch (error) {
    console.error("Lỗi lấy dữ liệu GPA:", error);
  }
}

// ============================================================
// VẼ BIỂU ĐỒ GPA
// ============================================================

function drawGPAChart(data) {
  const svg = document.getElementById("gpa-chart");

  if (!svg || !Array.isArray(data) || data.length === 0) {
    return;
  }

  svg.innerHTML = "";

  const width = 720;

  const height = 380;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const paddingLeft = 60;

  const paddingRight = 25;

  const paddingTop = 30;

  const paddingBottom = 50;

  const chartWidth = width - paddingLeft - paddingRight;

  const chartHeight = height - paddingTop - paddingBottom;

  const max = 4;

  const min = 0;

  // ==========================================================
  // GRID
  // ==========================================================

  for (let i = 0; i <= 8; i++) {
    const y = paddingTop + i * (chartHeight / 8);

    svg.innerHTML += `
      <line
        x1="${paddingLeft}"
        y1="${y}"
        x2="${width - paddingRight}"
        y2="${y}"
        stroke="#e8e8e8"
        stroke-width="1"
      />
    `;
  }

  // ==========================================================
  // AXIS
  // ==========================================================

  svg.innerHTML += `

    <line
      x1="${paddingLeft}"
      y1="${paddingTop}"
      x2="${paddingLeft}"
      y2="${height - paddingBottom}"
      stroke="#555"
      stroke-width="2"
    />

    <line
      x1="${paddingLeft}"
      y1="${height - paddingBottom}"
      x2="${width - paddingRight}"
      y2="${height - paddingBottom}"
      stroke="#555"
      stroke-width="2"
    />

  `;

  // ==========================================================
  // LABEL HỆ 4
  // ==========================================================

  for (let i = 0; i <= 8; i++) {
    const value = (4 - i * 0.5).toFixed(1);

    const y = paddingTop + i * (chartHeight / 8);

    svg.innerHTML += `
      <text
        x="15"
        y="${y + 5}"
        fill="#666"
        font-size="13"
        font-family="Arial"
      >
        ${value}
      </text>
    `;
  }

  // ==========================================================
  // LABEL HỌC KỲ
  // ==========================================================

  data.forEach(function (item, index) {
    let x;

    if (data.length === 1) {
      x = paddingLeft + chartWidth / 2;
    } else {
      x = paddingLeft + (chartWidth / (data.length - 1)) * index;
    }

    svg.innerHTML += `
        <text
          x="${x - 12}"
          y="${height - 18}"
          fill="#666"
          font-size="13"
          font-family="Arial"
        >
          HK${index + 1}
        </text>
      `;
  });

  // ==========================================================
  // TỌA ĐỘ
  // ==========================================================

  const points = [];

  data.forEach(function (value, index) {
    let x;

    if (data.length === 1) {
      x = paddingLeft + chartWidth / 2;
    } else {
      x = paddingLeft + (chartWidth / (data.length - 1)) * index;
    }

    const y = paddingTop + ((max - value) / (max - min)) * chartHeight;

    points.push(`${x},${y}`);
  });

  // ==========================================================
  // GRADIENT
  // ==========================================================

  svg.innerHTML += `

    <defs>

      <linearGradient
        id="gradientLine"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
      >

        <stop
          offset="0%"
          stop-color="#0fb530"
        />

        <stop
          offset="100%"
          stop-color="#2ecc71"
        />

      </linearGradient>

    </defs>

  `;

  // ==========================================================
  // ĐƯỜNG
  // ==========================================================

  svg.innerHTML += `

    <polyline
      id="gpa-line"
      fill="none"
      stroke="url(#gradientLine)"
      stroke-width="4"
      stroke-linejoin="round"
      stroke-linecap="round"
      points="${points.join(" ")}"
    />

  `;

  // ==========================================================
  // ĐIỂM
  // ==========================================================

  data.forEach(function (value, index) {
    let x;

    if (data.length === 1) {
      x = paddingLeft + chartWidth / 2;
    } else {
      x = paddingLeft + (chartWidth / (data.length - 1)) * index;
    }

    const y = paddingTop + ((max - value) / (max - min)) * chartHeight;

    svg.innerHTML += `

        <circle
          class="gpa-point"
          cx="${x}"
          cy="${y}"
          r="6"
          fill="#0fb530"
          stroke="#fff"
          stroke-width="3"
          data-gpa="${value}"
          data-hk="HK${index + 1}"
        />

      `;
  });

  // ==========================================================
  // ANIMATION
  // ==========================================================

  const line = document.getElementById("gpa-line");

  if (line) {
    const length = line.getTotalLength();

    line.style.strokeDasharray = length;

    line.style.strokeDashoffset = length;

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
        duration: 1500,

        fill: "forwards",
      },
    );
  }

  // ==========================================================
  // TOOLTIP
  // ==========================================================

  const tooltip = document.createElement("div");

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

  document.querySelectorAll(".gpa-point").forEach(function (point) {
    point.addEventListener("mouseenter", function () {
      tooltip.style.display = "block";

      tooltip.innerHTML = `
              <strong>
                ${escapeHTML(point.dataset.hk)}
              </strong>
              <br>
              GPA:
              ${escapeHTML(point.dataset.gpa)}
            `;

      point.setAttribute("r", "9");
    });

    point.addEventListener("mousemove", function (e) {
      tooltip.style.left = e.clientX + 15 + "px";

      tooltip.style.top = e.clientY - 20 + "px";
    });

    point.addEventListener("mouseleave", function () {
      tooltip.style.display = "none";

      point.setAttribute("r", "6");
    });
  });
}

// ============================================================
// RADAR
// ============================================================

const radarData = {
  yeu: 5,

  trungBinh: 15,

  kha: 40,

  gioi: 30,

  xuatSac: 10,
};

if (document.getElementById("radar-chart")) {
  drawRadarChart(radarData);
}

// ============================================================
// VẼ RADAR
// ============================================================

function drawRadarChart(data) {
  const svg = document.getElementById("radar-chart");

  if (!svg) {
    return;
  }

  const total = data.yeu + data.trungBinh + data.kha + data.gioi + data.xuatSac;

  if (total !== 100) {
    console.error("Tổng % Radar phải bằng 100.");

    return;
  }

  svg.innerHTML = "";

  const cx = 210;

  const cy = 210;

  const R = 150;

  const labels = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"];

  const values = [data.xuatSac, data.gioi, data.kha, data.trungBinh, data.yeu];

  const xsValue = document.getElementById("xs-value");

  const gioiValue = document.getElementById("gioi-value");

  const khaValue = document.getElementById("kha-value");

  const tbValue = document.getElementById("tb-value");

  const yeuValue = document.getElementById("yeu-value");

  if (xsValue) {
    xsValue.textContent = `${data.xuatSac}%`;
  }

  if (gioiValue) {
    gioiValue.textContent = `${data.gioi}%`;
  }

  if (khaValue) {
    khaValue.textContent = `${data.kha}%`;
  }

  if (tbValue) {
    tbValue.textContent = `${data.trungBinh}%`;
  }

  if (yeuValue) {
    yeuValue.textContent = `${data.yeu}%`;
  }

  // ==========================================================
  // LƯỚI
  // ==========================================================

  for (let lv = 1; lv <= 5; lv++) {
    const r = R * (lv / 5);

    const pts = [];

    for (let i = 0; i < 5; i++) {
      const angle = ((-90 + i * 72) * Math.PI) / 180;

      const x = cx + r * Math.cos(angle);

      const y = cy + r * Math.sin(angle);

      pts.push(`${x},${y}`);
    }

    svg.innerHTML += `

      <polygon
        points="${pts.join(" ")}"
        fill="none"
        stroke="#d9d9d9"
        stroke-width="1"
      />

    `;
  }

  // ==========================================================
  // TRỤC
  // ==========================================================

  for (let i = 0; i < 5; i++) {
    const angle = ((-90 + i * 72) * Math.PI) / 180;

    const x = cx + R * Math.cos(angle);

    const y = cy + R * Math.sin(angle);

    svg.innerHTML += `

      <line
        x1="${cx}"
        y1="${cy}"
        x2="${x}"
        y2="${y}"
        stroke="#d9d9d9"
      />

    `;
  }

  // ==========================================================
  // LABEL
  // ==========================================================

  for (let i = 0; i < 5; i++) {
    const angle = ((-90 + i * 72) * Math.PI) / 180;

    const x = cx + (R + 25) * Math.cos(angle);

    const y = cy + (R + 25) * Math.sin(angle);

    svg.innerHTML += `

      <text
        x="${x}"
        y="${y}"
        text-anchor="middle"
        font-size="14"
        fill="#555"
        font-family="Arial"
      >
        ${escapeHTML(labels[i])}
      </text>

    `;
  }

  // ==========================================================
  // GIÁ TRỊ
  // ==========================================================

  const dataPoints = [];

  for (let i = 0; i < 5; i++) {
    const angle = ((-90 + i * 72) * Math.PI) / 180;

    const r = (values[i] / 100) * R;

    const x = cx + r * Math.cos(angle);

    const y = cy + r * Math.sin(angle);

    dataPoints.push({
      x,
      y,
      value: values[i],
    });
  }

  // ==========================================================
  // POLYGON
  // ==========================================================

  svg.innerHTML += `

    <polygon
      id="radarPolygon"
      points="${dataPoints
        .map(function (p) {
          return `${p.x},${p.y}`;
        })
        .join(" ")}"
      fill="rgba(15,181,48,.25)"
      stroke="#0fb530"
      stroke-width="3"
    />

  `;

  // ==========================================================
  // ĐIỂM
  // ==========================================================

  const pointColors = ["#7c3aed", "#16a34a", "#2563eb", "#f59e0b", "#ef4444"];

  dataPoints.forEach(function (p, index) {
    svg.innerHTML += `

        <circle
          class="radarPoint"
          cx="${p.x}"
          cy="${p.y}"
          r="6"
          fill="${pointColors[index]}"
          stroke="#fff"
          stroke-width="3"
          data-label="${escapeHTML(labels[index])}"
          data-value="${p.value}%"
        />

      `;
  });

  // ==========================================================
  // ANIMATION
  // ==========================================================

  const polygon = document.getElementById("radarPolygon");

  if (polygon) {
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
        duration: 1200,

        fill: "forwards",
      },
    );
  }
}

// ============================================================
// NHẬN ĐỊNH TRANG HOME
// ============================================================

async function layNhanDinh() {
  try {
    const token = layToken();

    if (!token) {
      return;
    }

    const phanHoi = await fetch(`${API_BASE_URL}/api/sinh-vien/nhan-dinh`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    let duLieu = null;

    try {
      duLieu = await phanHoi.json();
    } catch {
      throw new Error("Backend không trả JSON hợp lệ.");
    }

    console.log("Nhận định từ backend:", duLieu);

    if (!phanHoi.ok || !duLieu?.thanhCong) {
      console.error("Không lấy được nhận định:", duLieu?.thongBao);

      return;
    }

    hienThiNhanDinh(duLieu.nhanDinh);
  } catch (error) {
    console.error("Lỗi lấy nhận định:", error);
  }
}

// ============================================================
// HIỂN THỊ NHẬN ĐỊNH
// ============================================================

function hienThiNhanDinh(danhSachNhanDinh) {
  const danhSach = document.querySelector(".nhan-dinh");

  if (!danhSach) {
    return;
  }

  const cacDong = danhSach.querySelectorAll("li");

  if (!Array.isArray(danhSachNhanDinh)) {
    return;
  }

  danhSachNhanDinh.forEach(function (item, index) {
    if (!cacDong[index]) {
      return;
    }

    const noiDung = cacDong[index].querySelector("span.noi-dung");

    if (noiDung) {
      noiDung.textContent = item.noiDung;
    } else {
      const icon = cacDong[index].querySelector("i");

      cacDong[index].textContent = "";

      if (icon) {
        cacDong[index].appendChild(icon);
      }

      cacDong[index].appendChild(document.createTextNode(" " + item.noiDung));
    }
  });
}

// ============================================================
// DOM LOADED
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  layDuLieuGPA();

  layNhanDinh();
});
