
/* =========================================================
   THÔNG TIN HIỆN TẠI
========================================================= */

const muiTenThongTin =
  document.querySelector(".thong-tin");

const khungThongTinChiTiet =
  document.querySelector(".thong-tin-chi-tiet");

const iconMuiTen =
  document.querySelector(".thong-tin i");

if (
  muiTenThongTin &&
  khungThongTinChiTiet &&
  iconMuiTen
) {
  muiTenThongTin.addEventListener(
    "click",
    function (e) {
      khungThongTinChiTiet.classList.toggle(
        "show",
      );

      iconMuiTen.classList.toggle(
        "active",
      );

      e.stopPropagation();
    },
  );

  khungThongTinChiTiet.addEventListener(
    "click",
    function (e) {
      e.stopPropagation();
    },
  );

  document.addEventListener(
    "click",
    function () {
      khungThongTinChiTiet.classList.remove(
        "show",
      );

      iconMuiTen.classList.remove(
        "active",
      );
    },
  );
}

/* =========================================================
   PHẦN 1 - THÔNG TIN HIỆN TẠI
========================================================= */

const hocKy =
  document.getElementById(
    "hoc-ky-hoan-thanh",
  );

const oGPA =
  document.querySelectorAll(
    ".o-gpa input",
  );

const oTinChiTichLuy =
  document.getElementById(
    "tin-chi-tich-luy",
  );

const oTinChiToanKhoa =
  document.getElementById(
    "tin-chi-toan-khoa",
  );

/* =========================================================
   CẬP NHẬT CÁC Ô GPA
========================================================= */

function capNhatHocKy() {
  if (!hocKy) {
    return;
  }

  const hocKyDaHoc =
    hocKy.selectedIndex + 1;

  oGPA.forEach(
    (input, index) => {
      const thuTu =
        index + 1;

      if (
        thuTu <=
        hocKyDaHoc
      ) {
        input.disabled =
          false;

        input.type =
          "number";

        input.min =
          "0";

        input.max =
          "4";

        input.step =
          "0.01";

        input.placeholder =
          "0.00";

        input.style.background =
          "#ffffff";

        input.style.color =
          "#0f172a";

        if (
          input.value ===
          "--"
        ) {
          input.value =
            "";
        }
      } else {
        input.disabled =
          true;

        input.type =
          "text";

        input.value =
          "--";

        input.style.background =
          "#f8fafc";

        input.style.color =
          "#94a3b8";

        xoaLoiGPA(
          input,
        );
      }
    },
  );
}

if (hocKy) {
  hocKy.addEventListener(
    "change",
    capNhatHocKy,
  );

  capNhatHocKy();
}

/* =========================================================
   KIỂM TRA GPA
========================================================= */

function hienLoiGPA(
  input,
  noiDung,
) {
  let loi =
    input.parentElement.querySelector(
      ".loi-gpa",
    );

  if (!loi) {
    loi =
      document.createElement(
        "div",
      );

    loi.className =
      "loi-gpa";

    input.parentElement.appendChild(
      loi,
    );
  }

  loi.textContent =
    noiDung;

  input.classList.add(
    "input-gpa-loi",
  );
}

function xoaLoiGPA(
  input,
) {
  const loi =
    input.parentElement.querySelector(
      ".loi-gpa",
    );

  if (loi) {
    loi.textContent =
      "";
  }

  input.classList.remove(
    "input-gpa-loi",
  );
}

function kiemTraGPA(
  input,
) {
  if (
    input.disabled
  ) {
    return true;
  }

  const giaTri =
    input.value.trim();

  if (
    giaTri ===
    ""
  ) {
    hienLoiGPA(
      input,
      "Trường này là bắt buộc.",
    );

    return false;
  }

  if (
    input.validity.badInput
  ) {
    hienLoiGPA(
      input,
      "GPA không hợp lệ.",
    );

    return false;
  }

  const gpa =
    Number(
      giaTri,
    );

  if (
    !Number.isFinite(
      gpa,
    )
  ) {
    hienLoiGPA(
      input,
      "GPA không hợp lệ.",
    );

    return false;
  }

  if (
    gpa < 0 ||
    gpa > 4
  ) {
    hienLoiGPA(
      input,
      "GPA phải nằm trong khoảng 0 đến 4.",
    );

    return false;
  }

  if (
    !/^\d+(\.\d{1,2})?$/.test(
      giaTri,
    )
  ) {
    hienLoiGPA(
      input,
      "GPA chỉ được nhập tối đa 2 chữ số thập phân.",
    );

    return false;
  }

  xoaLoiGPA(
    input,
  );

  return true;
}

oGPA.forEach(
  (input) => {
    input.addEventListener(
      "input",
      () => {
        kiemTraGPA(
          input,
        );
      },
    );

    input.addEventListener(
      "blur",
      () => {
        kiemTraGPA(
          input,
        );
      },
    );
  },
);

/* =========================================================
   TÍN CHỈ
========================================================= */

function hienLoiTinChi(
  input,
  noiDung,
) {
  const nhom =
    input.closest(
      ".nhom-input",
    );

  const khung =
    input.closest(
      ".khung-tin-chi",
    );

  if (
    !nhom ||
    !khung
  ) {
    return;
  }

  let loi =
    nhom.querySelector(
      ".loi-input",
    );

  if (!loi) {
    loi =
      document.createElement(
        "div",
      );

    loi.className =
      "loi-input";

    nhom.appendChild(
      loi,
    );
  }

  loi.textContent =
    noiDung;

  khung.classList.add(
    "input-loi",
  );
}

function xoaLoiTinChi(
  input,
) {
  const nhom =
    input.closest(
      ".nhom-input",
    );

  const khung =
    input.closest(
      ".khung-tin-chi",
    );

  if (
    !nhom ||
    !khung
  ) {
    return;
  }

  const loi =
    nhom.querySelector(
      ".loi-input",
    );

  if (loi) {
    loi.textContent =
      "";
  }

  khung.classList.remove(
    "input-loi",
  );
}

function kiemTraTinChi(
  input,
) {
  if (!input) {
    return true;
  }

  const giaTri =
    input.value.trim();

  if (
    giaTri ===
    ""
  ) {
    hienLoiTinChi(
      input,
      "Trường này là bắt buộc.",
    );

    return false;
  }

  if (
    input.validity.badInput
  ) {
    hienLoiTinChi(
      input,
      "Số tín chỉ không hợp lệ.",
    );

    return false;
  }

  const soTinChi =
    Number(
      giaTri,
    );

  if (
    !Number.isFinite(
      soTinChi,
    )
  ) {
    hienLoiTinChi(
      input,
      "Số tín chỉ không hợp lệ.",
    );

    return false;
  }

  if (
    soTinChi < 1
  ) {
    hienLoiTinChi(
      input,
      "Số tín chỉ phải từ 1 trở lên.",
    );

    return false;
  }

  if (
    !Number.isInteger(
      soTinChi,
    )
  ) {
    hienLoiTinChi(
      input,
      "Số tín chỉ phải là số nguyên.",
    );

    return false;
  }

  xoaLoiTinChi(
    input,
  );

  return true;
}

function kiemTraQuanHeTinChi() {
  if (
    !oTinChiTichLuy ||
    !oTinChiToanKhoa
  ) {
    return true;
  }

  const giaTriTichLuy =
    oTinChiTichLuy.value.trim();

  const giaTriToanKhoa =
    oTinChiToanKhoa.value.trim();

  if (
    giaTriTichLuy ===
      "" ||
    giaTriToanKhoa ===
      ""
  ) {
    return true;
  }

  const tichLuy =
    Number(
      giaTriTichLuy,
    );

  const toanKhoa =
    Number(
      giaTriToanKhoa,
    );

  if (
    !Number.isFinite(
      tichLuy,
    ) ||
    !Number.isFinite(
      toanKhoa,
    )
  ) {
    return true;
  }

  if (
    tichLuy >
    toanKhoa
  ) {
    hienLoiTinChi(
      oTinChiTichLuy,
      "Tín chỉ tích lũy không được lớn hơn tín chỉ toàn khóa.",
    );

    return false;
  }

  xoaLoiTinChi(
    oTinChiTichLuy,
  );

  return true;
}

function kiemTraTatCaTinChi() {
  let hopLe =
    true;

  if (
    !kiemTraTinChi(
      oTinChiTichLuy,
    )
  ) {
    hopLe =
      false;
  }

  if (
    !kiemTraTinChi(
      oTinChiToanKhoa,
    )
  ) {
    hopLe =
      false;
  }

  if (
    !kiemTraQuanHeTinChi()
  ) {
    hopLe =
      false;
  }

  if (
    !hopLe
  ) {
    const loiDauTien =
      document.querySelector(
        ".input-loi",
      );

    if (
      loiDauTien
    ) {
      loiDauTien.scrollIntoView(
        {
          behavior:
            "smooth",

          block:
            "center",
        },
      );
    }
  }

  return hopLe;
}

const oTinChi =
  document.querySelectorAll(
    ".khung-tin-chi input",
  );

oTinChi.forEach(
  (input) => {
    input.addEventListener(
      "input",
      () => {
        kiemTraTinChi(
          oTinChiTichLuy,
        );

        kiemTraTinChi(
          oTinChiToanKhoa,
        );

        kiemTraQuanHeTinChi();
      },
    );
  },
);

/* =========================================================
   HIỆU ỨNG INPUT
========================================================= */

const tatCaInput =
  document.querySelectorAll(
    "input, select",
  );

tatCaInput.forEach(
  (input) => {
    input.addEventListener(
      "focus",
      () => {
        if (
          input.parentElement
        ) {
          input.parentElement.classList.add(
            "dang-focus",
          );
        }
      },
    );

    input.addEventListener(
      "blur",
      () => {
        if (
          input.parentElement
        ) {
          input.parentElement.classList.remove(
            "dang-focus",
          );
        }
      },
    );
  },
);

/* =========================================================
   KIỂM TRA THÔNG TIN
========================================================= */

function kiemTraThongTin() {
  let hopLe =
    true;

  oGPA.forEach(
    (input) => {
      if (
        input.disabled
      ) {
        return;
      }

      if (
        !kiemTraGPA(
          input,
        )
      ) {
        hopLe =
          false;
      }
    },
  );

  if (
    !hopLe
  ) {
    const loiDauTien =
      document.querySelector(
        ".input-gpa-loi",
      );

    if (
      loiDauTien
    ) {
      loiDauTien.scrollIntoView(
        {
          behavior:
            "smooth",

          block:
            "center",
        },
      );
    }
  }

  return hopLe;
}

/* =========================================================
   PHẦN 2 - MỤC TIÊU TỐT NGHIỆP
========================================================= */

const dsLoaiBang =
  document.querySelectorAll(
    ".the-loai-bang",
  );

const oNhapGPA =
  document.getElementById(
    "gpa-muc-tieu",
  );

const thanhTruot =
  document.getElementById(
    "thanh-truot-gpa",
  );

const giaTriSlider =
  document.querySelector(
    ".gia-tri-slider",
  );

/* =========================================================
   CẬP NHẬT SLIDER
========================================================= */

function capNhatSlider(
  giaTri,
) {
  if (
    !oNhapGPA ||
    !thanhTruot ||
    !giaTriSlider
  ) {
    return;
  }

  giaTri =
    Number(
      giaTri,
    );

  if (
    !Number.isFinite(
      giaTri,
    )
  ) {
    giaTri =
      3.2;
  }

  giaTri =
    Math.max(
      2,
      Math.min(
        4,
        giaTri,
      ),
    );

  oNhapGPA.value =
    giaTri.toFixed(
      2,
    );

  thanhTruot.value =
    giaTri;

  const phanTram =
    ((giaTri - 2) /
      2) *
    100;

  thanhTruot.style.background = `
    linear-gradient(
      to right,
      #16a34a 0%,
      #16a34a ${phanTram}%,
      #d1d5db ${phanTram}%,
      #d1d5db 100%
    )
  `;

  giaTriSlider.textContent =
    giaTri.toFixed(
      2,
    );

  giaTriSlider.style.left =
    `calc(${phanTram}% + (${0.1 - phanTram * 0.16}px))`;
}

/* =========================================================
   CHỌN LOẠI BẰNG
========================================================= */

function chonLoaiBang(
  gpa,
) {
  dsLoaiBang.forEach(
    (the) => {
      the.classList.remove(
        "dang-chon",
      );
    },
  );

  if (
    gpa >=
    3.6
  ) {
    dsLoaiBang[0]?.classList.add(
      "dang-chon",
    );
  } else if (
    gpa >=
    3.2
  ) {
    dsLoaiBang[1]?.classList.add(
      "dang-chon",
    );
  } else if (
    gpa >=
    2.5
  ) {
    dsLoaiBang[2]?.classList.add(
      "dang-chon",
    );
  } else {
    dsLoaiBang[3]?.classList.add(
      "dang-chon",
    );
  }
}

dsLoaiBang.forEach(
  (the) => {
    the.addEventListener(
      "click",
      () => {
        const gpa =
          Number(
            the.dataset.gpa,
          );

        dsLoaiBang.forEach(
          (item) => {
            item.classList.remove(
              "dang-chon",
            );
          },
        );

        the.classList.add(
          "dang-chon",
        );

        capNhatSlider(
          gpa,
        );
      },
    );
  },
);

if (thanhTruot) {
  thanhTruot.addEventListener(
    "input",
    () => {
      const gpa =
        Number(
          thanhTruot.value,
        );

      capNhatSlider(
        gpa,
      );

      chonLoaiBang(
        gpa,
      );
    },
  );
}

if (oNhapGPA) {
  oNhapGPA.addEventListener(
    "input",
    () => {
      let gpa =
        Number(
          oNhapGPA.value,
        );

      if (
        !Number.isFinite(
          gpa,
        )
      ) {
        return;
      }

      gpa =
        Math.max(
          2,
          Math.min(
            4,
            gpa,
          ),
        );

      capNhatSlider(
        gpa,
      );

      chonLoaiBang(
        gpa,
      );
    },
  );

  oNhapGPA.addEventListener(
    "blur",
    () => {
      const gpa =
        Number(
          oNhapGPA.value,
        );

      if (
        Number.isFinite(
          gpa,
        )
      ) {
        oNhapGPA.value =
          gpa.toFixed(
            2,
          );
      }
    },
  );
}

capNhatSlider(
  3.2,
);

chonLoaiBang(
  3.2,
);

/* =========================================================
   PHẦN 3 - THIẾT LẬP DỰ ĐOÁN
========================================================= */

const dsCoGang =
  document.querySelectorAll(
    ".the-co-gang",
  );

const nutDuDoan =
  document.getElementById(
    "nut-du-doan-gpa",
  );

/* =========================================================
   API BACKEND
========================================================= */

const API_BASE_URL =
  "";

const API_DU_DOAN_GPA_TOT_NGHIEP =
  `${API_BASE_URL}/api/du-doan/gpa-tot-nghiep`;

function layToken() {
  return (
    localStorage.getItem(
      "token",
    ) ||
    sessionStorage.getItem(
      "token",
    )
  );
}

let mucDoCoGang =
  "co-gang";

dsCoGang.forEach(
  (the) => {
    the.addEventListener(
      "click",
      () => {
        dsCoGang.forEach(
          (item) => {
            item.classList.remove(
              "dang-chon",
            );
          },
        );

        the.classList.add(
          "dang-chon",
        );

        mucDoCoGang =
          the.dataset.muc;
      },
    );
  },
);

/* =========================================================
   HÀM LẤY DỮ LIỆU DỰ ĐOÁN
========================================================= */

function layThongTinDuDoan() {
  return {
    hocKy:
      hocKy
        ? hocKy.value
        : "",

    mucTieu:
      oNhapGPA
        ? Number(
            oNhapGPA.value,
          )
        : 3.2,

    mucDoCoGang:
      mucDoCoGang,
  };
}

/* =========================================================
   PHẦN 4 - KẾT QUẢ DỰ ĐOÁN
========================================================= */

const khungKetQua =
  document.getElementById(
    "ket-qua-du-doan",
  );

const cacChucNang =
  document.getElementById(
    "cac-chuc-nang",
  );

const gpaDuKien =
  document.getElementById(
    "gpa-du-kien",
  );

const diemHe10 =
  document.querySelector(
    ".the-ket-qua .thang10",
  );

const xepLoaiDuKien =
  document.getElementById(
    "xep-loai-du-kien",
  );

const gpaCanDat =
  document.getElementById(
    "gpa-can-dat",
  );

const phanTramKhaNang =
  document.getElementById(
    "phan-tram-kha-nang",
  );

const vongTronKhaNang =
  document.getElementById(
    "vong-tron-kha-nang",
  );

const thanhHoanThanh =
  document.getElementById(
    "thanh-hoan-thanh",
  );

const phanTramHoanThanh =
  document.getElementById(
    "phan-tram-hoan-thanh",
  );

const mucDanhGia =
  document.querySelector(
    ".muc-danh-gia",
  );

const trangThai =
  document.querySelector(
    "#ket-qua-du-doan .trang-thai",
  );

const ghiChu =
  document.querySelector(
    "#ket-qua-du-doan .ghi-chu",
  );

/* =========================================================
   ẨN KẾT QUẢ KHI MỞ TRANG
========================================================= */

if (khungKetQua) {
  khungKetQua.style.display =
    "none";
}

if (cacChucNang) {
  cacChucNang.classList.remove(
    "hien",
  );
}

/* =========================================================
   VÒNG TRÒN KHẢ NĂNG
========================================================= */

function capNhatVongTron(
  phanTram,
) {
  if (
    !phanTramKhaNang ||
    !vongTronKhaNang
  ) {
    return;
  }

  phanTram =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          phanTram,
        ),
      ),
    );

  phanTramKhaNang.textContent =
    phanTram +
    "%";

  vongTronKhaNang.style.background = `
    conic-gradient(
      #16a34a 0% ${phanTram}%,
      #e5e7eb ${phanTram}% 100%
    )
  `;
}

/* =========================================================
   THANH TIẾN ĐỘ
========================================================= */

function capNhatTienDo(
  phanTram,
) {
  if (
    !thanhHoanThanh ||
    !phanTramHoanThanh
  ) {
    return;
  }

  phanTram =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          phanTram,
        ),
      ),
    );

  thanhHoanThanh.style.setProperty(
    "--phan-tram-hoan-thanh",
    phanTram +
      "%",
  );

  phanTramHoanThanh.textContent =
    phanTram +
    "%";
}

/* =========================================================
   HIỂN THỊ KẾT QUẢ
========================================================= */

function hienThiKetQua(
  ketQua,
) {
  if (!ketQua) {
    return;
  }

  if (khungKetQua) {
    khungKetQua.style.display =
      "block";
  }

  if (cacChucNang) {
    cacChucNang.classList.add(
      "hien",
    );
  }

  /* GPA DỰ KIẾN */

  if (gpaDuKien) {
    const giaTri =
      Number(
        ketQua.gpaDuKien,
      );

    gpaDuKien.textContent =
      Number.isFinite(
        giaTri,
      )
        ? Math.max(
            0,
            Math.min(
              4,
              giaTri,
            ),
          ).toFixed(
            2,
          )
        : "--";
  }

  /* HỆ 10 */

  if (diemHe10) {
    const giaTri =
      Number(
        ketQua.diemHe10,
      );

    diemHe10.textContent =
      Number.isFinite(
        giaTri,
      )
        ? `${Math.max(
            0,
            Math.min(
              10,
              giaTri,
            ),
          ).toFixed(
            2,
          )} / 10.00`
        : "--";
  }

  /* XẾP LOẠI */

  if (xepLoaiDuKien) {
    xepLoaiDuKien.textContent =
      ketQua.xepLoai ||
      "--";
  }

  /* GPA CẦN ĐẠT */

  if (gpaCanDat) {
    const giaTri =
      Number(
        ketQua.gpaCanDat,
      );

    gpaCanDat.textContent =
      Number.isFinite(
        giaTri,
      )
        ? Math.max(
            0,
            Math.min(
              4,
              giaTri,
            ),
          ).toFixed(
            2,
          )
        : "--";
  }

  /* KHẢ NĂNG ĐẠT MỤC TIÊU */

  let khaNang =
    Number(
      ketQua.phanTramKhaNang,
    );

  /*
   * Nếu GPA dự kiến đã đạt/vượt GPA mục tiêu
   * thì khả năng phải là 100%.
   */
  const gpaDuKienValue =
    Number(
      ketQua.gpaDuKien,
    );

  const gpaMucTieuDangChon =
    oNhapGPA
      ? Number(
          oNhapGPA.value,
        )
      : null;

  if (
    Number.isFinite(
      gpaDuKienValue,
    ) &&
    Number.isFinite(
      gpaMucTieuDangChon,
    ) &&
    gpaDuKienValue >=
      gpaMucTieuDangChon
  ) {
    khaNang =
      100;
  }

  capNhatVongTron(
    Number.isFinite(
      khaNang,
    )
      ? khaNang
      : 0,
  );

  /* MỨC ĐÁNH GIÁ */

  if (mucDanhGia) {
    mucDanhGia.textContent =
      ketQua.khaNangDatMucTieu ||
      "--";
  }

  /* TRẠNG THÁI */

  if (trangThai) {
    trangThai.textContent =
      ketQua.moTaKhaNang ||
      "--";
  }

  /* GHI CHÚ */

  if (ghiChu) {
    ghiChu.textContent =
      ketQua.xepLoai
        ? `Xếp loại dự kiến: ${ketQua.xepLoai}`
        : "--";
  }
}

/* =========================================================
   PHẦN 5 - PHÂN TÍCH VÀ LỜI KHUYÊN
========================================================= */

const cacDongLoiKhuyen =
  document.querySelectorAll(
    ".dong-loi-khuyen",
  );

const danhSachLoiKhuyen =
  [
    document.getElementById(
      "loi-khuyen-1",
    ),

    document.getElementById(
      "loi-khuyen-2",
    ),

    document.getElementById(
      "loi-khuyen-3",
    ),

    document.getElementById(
      "loi-khuyen-4",
    ),
  ];

/* =========================================================
   HIỂN THỊ LỜI KHUYÊN TỪ BACKEND
========================================================= */

function hienThiLoiKhuyenTuBackend(
  danhSach,
) {
  if (
    !Array.isArray(
      danhSach,
    )
  ) {
    danhSach =
      [];
  }

  cacDongLoiKhuyen.forEach(
    (dong, index) => {

      const noiDung =
        danhSach[index];

      if (
        !noiDung
      ) {
        /*
         * Không có nội dung:
         * ẩn cả dòng + icon.
         */
        dong.style.display =
          "none";

        return;
      }

      /*
       * Có nội dung:
       * hiện lại dòng.
       */
      dong.style.display =
        "flex";

      const span =
        dong.querySelector(
          "span",
        );

      if (span) {
        span.textContent =
          noiDung;
      }
    },
  );
}

/* =========================================================
   PHẦN 6 - SO SÁNH MỤC TIÊU
========================================================= */

const cacTheMucTieu =
  document.querySelectorAll(
    ".the-muc-tieu",
  );

const tatCaDongMucTieu =
  document.querySelectorAll(
    ".dong-muc-tieu",
  );

/* =========================================================
   LẤY CÁC THẺ MỤC TIÊU
   Vì HTML hiện tại đang có ID trùng nhau,
   không dùng getElementById() ở đây.
========================================================= */

function layCacOThongTinMucTieu() {
  const cacThe =
    Array.from(
      document.querySelectorAll(
        ".the-muc-tieu",
      ),
    );

  return cacThe.map(
    (the) => ({
      oGPA:
        the.querySelector(
          ".gia-tri-gpa span",
        ),

      oPhanTram:
        the.querySelector(
          ".gia-tri-kha-nang span",
        ),
    }),
  );
}

/* =========================================================
   TÍNH KHẢ NĂNG MỤC TIÊU
========================================================= */

function tinhLaiKhaNangMucTieu(
  item,
) {
  const gpaDuKienValue =
    Number(
      item.gpaDuKien,
    );

  const gpaMucTieu =
    Number(
      item.gpaMucTieu,
    );

  let phanTram =
    Number(
      item.phanTramKhaNang,
    );

  if (
    Number.isFinite(
      gpaDuKienValue,
    ) &&
    Number.isFinite(
      gpaMucTieu,
    ) &&
    gpaDuKienValue >=
      gpaMucTieu
  ) {
    phanTram =
      100;
  }

  if (
    !Number.isFinite(
      phanTram,
    )
  ) {
    phanTram =
      0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      phanTram,
    ),
  );
}

/* =========================================================
   CẬP NHẬT SO SÁNH MỤC TIÊU
========================================================= */

function capNhatSoSanhMucTieu(
  danhSach,
) {
  if (
    !Array.isArray(
      danhSach,
    )
  ) {
    return;
  }

  const cacO =
    layCacOThongTinMucTieu();

  const thuTuMucTieu = [
    "Xuất sắc",
    "Giỏi",
    "Khá",
    "Trung bình",
  ];

  danhSach.forEach(
    (item) => {

      const index =
        thuTuMucTieu.indexOf(
          item.ten,
        );

      if (
        index ===
        -1
      ) {
        return;
      }

      const o =
        cacO[index];

      if (!o) {
        return;
      }

      /*
       * GPA cần đạt luôn giới hạn 0–4.
       */
      let gpaCanDat =
        Number(
          item.gpaCanDat,
        );

      if (
        !Number.isFinite(
          gpaCanDat,
        )
      ) {
        gpaCanDat =
          null;
      } else {
        gpaCanDat =
          Math.max(
            0,
            Math.min(
              4,
              gpaCanDat,
            ),
          );
      }

      /*
       * Khả năng tối đa 100%.
       */
      const khaNang =
        tinhLaiKhaNangMucTieu(
          item,
        );

      if (o.oGPA) {
        o.oGPA.textContent =
          gpaCanDat ===
          null
            ? "--"
            : gpaCanDat.toFixed(
                2,
              );
      }

      if (o.oPhanTram) {
        o.oPhanTram.textContent =
          `${khaNang}%`;
      }
    },
  );
}

function capNhatMauPhanTram() {
  document
    .querySelectorAll(
      ".gia-tri-kha-nang",
    )
    .forEach(
      (item) => {

        const phanTram =
          parseInt(
            item.textContent,
            10,
          ) || 0;

        item.classList.remove(
          "mau-do",
          "mau-xanh",
        );

        if (
          phanTram >=
          80
        ) {
          item.classList.add(
            "mau-xanh",
          );
        } else {
          item.classList.add(
            "mau-do",
          );
        }
      },
    );
}

function chonTheMucTieu(
  ten,
) {
  cacTheMucTieu.forEach(
    (the) => {
      the.classList.remove(
        "dang-chon",
      );
    },
  );

  const viTri = {
    "Xuất sắc": 0,
    "Giỏi": 1,
    "Khá": 2,
    "Trung bình": 3,
  };

  if (
    viTri[ten] !==
    undefined
  ) {
    cacTheMucTieu[
      viTri[ten]
    ]?.classList.add(
      "dang-chon",
    );
  }
}

function toSangMucTieu(
  ten,
) {
  tatCaDongMucTieu.forEach(
    (dong) => {
      dong.style.borderColor =
        "#e5e7eb";

      dong.style.background =
        "#ffffff";
    },
  );

  const viTri = {
    "Xuất sắc": 0,
    "Giỏi": 1,
    "Khá": 2,
    "Trung bình": 3,
  };

  const index =
    viTri[ten];

  if (
    index ===
    undefined
  ) {
    return;
  }

  const mauVien = [
    "#7c3aed",
    "#16a34a",
    "#2563eb",
    "#94a3b8",
  ];

  const mauNen = [
    "#faf5ff",
    "#f0fdf4",
    "#eff6ff",
    "#f8fafc",
  ];

  const dong =
    tatCaDongMucTieu[
      index
    ];

  if (dong) {
    dong.style.borderColor =
      mauVien[index];

    dong.style.background =
      mauNen[index];
  }
}

capNhatMauPhanTram();

/* =========================================================
   PHẦN 7 - DỰ ĐOÁN THẬT
========================================================= */

if (nutDuDoan) {

  nutDuDoan.addEventListener(
    "click",
    async function () {

      /* ---------------------------------------------
         KIỂM TRA DỮ LIỆU
      --------------------------------------------- */

      if (
        !kiemTraThongTin()
      ) {
        return;
      }

      if (
        !kiemTraTatCaTinChi()
      ) {
        return;
      }

      /* ---------------------------------------------
         TOKEN
      --------------------------------------------- */

      const token =
        layToken();

      if (!token) {
        alert(
          "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.",
        );

        return;
      }

      /* ---------------------------------------------
         HỌC KỲ
      --------------------------------------------- */

      const hocKyGanNhat =
        hocKy
          ? hocKy.selectedIndex +
            1
          : 0;

      /* ---------------------------------------------
         GPA LỊCH SỬ
      --------------------------------------------- */

      const gpaLichSu =
        [];

      oGPA.forEach(
        (
          input,
          index,
        ) => {

          const soHocKy =
            index + 1;

          if (
            soHocKy <=
            hocKyGanNhat
          ) {
            gpaLichSu.push(
              Number(
                input.value,
              ),
            );
          }
        },
      );

      /* ---------------------------------------------
         TÍN CHỈ
      --------------------------------------------- */

      const tinChiTichLuy =
        Number(
          oTinChiTichLuy?.value,
        );

      const tinChiToanKhoa =
        Number(
          oTinChiToanKhoa?.value,
        );

      /* ---------------------------------------------
         GPA MỤC TIÊU
      --------------------------------------------- */

      const mucTieu =
        Number(
          oNhapGPA?.value,
        );

      /* ---------------------------------------------
         XÁC ĐỊNH LOẠI MỤC TIÊU
      --------------------------------------------- */

      const xepLoaiMucTieu =
        (() => {

          if (
            mucTieu >=
            3.6
          ) {
            return "Xuất sắc";
          }

          if (
            mucTieu >=
            3.2
          ) {
            return "Giỏi";
          }

          if (
            mucTieu >=
            2.5
          ) {
            return "Khá";
          }

          return "Trung bình";

        })();

      /* ---------------------------------------------
         LOADING
      --------------------------------------------- */

      const noiDungCu =
        nutDuDoan.innerHTML;

      nutDuDoan.disabled =
        true;

      nutDuDoan.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        ĐANG DỰ ĐOÁN...
      `;

      try {

        /* ============================================
           GỌI NODE.JS
        ============================================ */

        const response =
          await fetch(
            API_DU_DOAN_GPA_TOT_NGHIEP,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  hocKyGanNhat:
                    hocKyGanNhat,

                  gpaLichSu:
                    gpaLichSu,

                  tinChiTichLuy:
                    tinChiTichLuy,

                  tinChiToanKhoa:
                    tinChiToanKhoa,

                  gpaMucTieu:
                    mucTieu,

                  mucDoCoGang:
                    mucDoCoGang,
                }),
            },
          );

        /* ============================================
           ĐỌC RESPONSE
        ============================================ */

        let data;

        try {
          data =
            await response.json();

        } catch (
          error
        ) {

          throw new Error(
            "Backend không trả về JSON hợp lệ.",
          );
        }

        /* ============================================
           KIỂM TRA RESPONSE
        ============================================ */

        if (
          !response.ok ||
          !data.thanhCong
        ) {

          throw new Error(
            data.thongBao ||
              "Không thể dự đoán GPA tốt nghiệp.",
          );
        }

        const ketQua =
          data.ketQua;

        if (!ketQua) {

          throw new Error(
            "Backend không trả về kết quả.",
          );
        }

        console.log(
          "Kết quả GPA tốt nghiệp:",
          data,
        );

        /* ============================================
           HIỂN THỊ KẾT QUẢ
        ============================================ */

        hienThiKetQua(
          ketQua,
        );

        /* ============================================
           LỜI KHUYÊN
        ============================================ */

        hienThiLoiKhuyenTuBackend(
          ketQua.loiKhuyen,
        );

        /* ============================================
           SO SÁNH 4 MỤC TIÊU
        ============================================ */

        /*
         * Thêm GPA dự kiến vào item để frontend
         * có thể tự xác định mục tiêu đã đạt hay chưa.
         */

        const danhSachMucTieu =
          Array.isArray(
            ketQua.soSanhMucTieu,
          )
            ? ketQua.soSanhMucTieu.map(
                (item) => ({
                  ...item,

                  gpaDuKien:
                    Number(
                      ketQua.gpaDuKien,
                    ),

                  gpaMucTieu:
                    Number(
                      item.gpaMucTieu,
                    ),
                }),
              )
            : [];

        capNhatSoSanhMucTieu(
          danhSachMucTieu,
        );

        capNhatMauPhanTram();

        /* ============================================
           TIẾN ĐỘ TÍN CHỈ
           GIỮ NGUYÊN LOGIC HIỆN TẠI
        ============================================ */

        const duLieuDauVao =
          data.duLieuDauVao ||
          {};

        const tyLeTinChi =
          Number(
            duLieuDauVao.tyLeTinChiDaTichLuy,
          );

        const tienDo =
          Number.isFinite(
            tyLeTinChi,
          )
            ? tyLeTinChi *
              100
            : 0;

        capNhatTienDo(
          tienDo,
        );

        /* ============================================
           TÔ SÁNG MỤC TIÊU
        ============================================ */

        chonTheMucTieu(
          xepLoaiMucTieu,
        );

        toSangMucTieu(
          xepLoaiMucTieu,
        );

        /* ============================================
           CẬP NHẬT BIỂU ĐỒ
        ============================================ */

        duLieuBieuDo.gpaTichLuy =
          [
            ...gpaLichSu,
          ];

        duLieuBieuDo.gpaDuKien =
          [
            Number(
              ketQua.gpaDuKien,
            ),
          ];

        duLieuBieuDo.mucTieu =
          mucTieu;

        duLieuBieuDo.hocKy =
          gpaLichSu.map(
            (
              _,
              index,
            ) =>
              `HK${index + 1}`,
          );

        /* ============================================
           XÓA DỮ LIỆU SVG CŨ
        ============================================ */

        if (
          luoiBieuDo
        ) {
          luoiBieuDo.innerHTML =
            "";
        }

        if (
          trucBieuDo
        ) {
          trucBieuDo.innerHTML =
            "";
        }

        if (
          nhanGPA
        ) {
          nhanGPA.innerHTML =
            "";
        }

        if (
          nhanHocKy
        ) {
          nhanHocKy.innerHTML =
            "";
        }

        if (
          duongTichLuy
        ) {
          duongTichLuy.setAttribute(
            "d",
            "",
          );
        }

        if (
          duongDuKien
        ) {
          duongDuKien.setAttribute(
            "d",
            "",
          );
        }

        if (
          duongMucTieu
        ) {
          duongMucTieu.setAttribute(
            "d",
            "",
          );
        }

        if (
          cacDiemTichLuy
        ) {
          cacDiemTichLuy.innerHTML =
            "";
        }

        if (
          cacDiemDuKien
        ) {
          cacDiemDuKien.innerHTML =
            "";
        }

        if (
          nhanGiaTri
        ) {
          nhanGiaTri.innerHTML =
            "";
        }

        /* ============================================
           VẼ LẠI BIỂU ĐỒ
        ============================================ */

        veGrid();

        veBieuDo();

        veDiem(
          duLieuBieuDo.gpaTichLuy,
          0,
          "diem-xanh-la",
          cacDiemTichLuy,
        );

        veDiem(
          duLieuBieuDo.gpaDuKien,
          duLieuBieuDo.gpaTichLuy.length,
          "diem-xanh-duong",
          cacDiemDuKien,
        );

        /* ============================================
           HIỆN KẾT QUẢ
        ============================================ */

        if (
          khungKetQua
        ) {
          khungKetQua.style.display =
            "block";
        }

        if (
          cacChucNang
        ) {
          cacChucNang.classList.add(
            "hien",
          );
        }

        /* ============================================
           CUỘN
        ============================================ */

        setTimeout(
          () => {

            if (
              khungKetQua
            ) {
              khungKetQua.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "start",
              });
            }

          },
          100,
        );

      } catch (
        error
      ) {

        console.error(
          "Lỗi dự đoán GPA tốt nghiệp:",
          error,
        );

        alert(
          error.message ||
            "Không thể kết nối đến hệ thống dự đoán.",
        );

      } finally {

        nutDuDoan.disabled =
          false;

        nutDuDoan.innerHTML =
          noiDungCu;
      }
    },
  );
}

/* =========================================================
   PHẦN 8 - DỰ ĐOÁN LẠI
========================================================= */

const nutDuDoanLai =
  document.getElementById(
    "nut-du-doan-lai",
  );

function duDoanLai() {

  /* Cuộn về phần thiết lập */

  const phanThietLap =
    document.getElementById(
      "thiet-lap-du-doan",
    );

  if (
    phanThietLap
  ) {
    phanThietLap.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start",
    });
  }

  /* ẨN KẾT QUẢ */

  if (
    khungKetQua
  ) {
    khungKetQua.style.display =
      "none";
  }

  if (
    cacChucNang
  ) {
    cacChucNang.classList.remove(
      "hien",
    );
  }

  /* RESET KẾT QUẢ */

  if (
    gpaDuKien
  ) {
    gpaDuKien.textContent =
      "--";
  }

  if (
    diemHe10
  ) {
    diemHe10.textContent =
      "--";
  }

  if (
    xepLoaiDuKien
  ) {
    xepLoaiDuKien.textContent =
      "--";
  }

  if (
    gpaCanDat
  ) {
    gpaCanDat.textContent =
      "--";
  }

  if (
    phanTramKhaNang
  ) {
    phanTramKhaNang.textContent =
      "0%";
  }

  if (
    phanTramHoanThanh
  ) {
    phanTramHoanThanh.textContent =
      "0%";
  }

  /* RESET VÒNG TRÒN */

  if (
    vongTronKhaNang
  ) {
    vongTronKhaNang.style.background = `
      conic-gradient(
        #e5e7eb 0% 100%
      )
    `;
  }

  /* RESET THANH TIẾN ĐỘ */

  if (
    thanhHoanThanh
  ) {
    thanhHoanThanh.style.setProperty(
      "--phan-tram-hoan-thanh",
      "0%",
    );
  }

  /* RESET LỜI KHUYÊN */

  cacDongLoiKhuyen.forEach(
    (dong) => {

      dong.style.display =
        "flex";

      const span =
        dong.querySelector(
          "span",
        );

      if (span) {
        span.textContent =
          "--";
      }
    },
  );

  /* RESET PHÂN LOẠI */

  if (
    mucDanhGia
  ) {
    mucDanhGia.textContent =
      "--";
  }

  if (
    trangThai
  ) {
    trangThai.textContent =
      "--";
  }

  if (
    ghiChu
  ) {
    ghiChu.textContent =
      "--";
  }

  /* RESET SO SÁNH */

  const cacO =
    layCacOThongTinMucTieu();

  cacO.forEach(
    (o) => {

      if (
        o.oGPA
      ) {
        o.oGPA.textContent =
          "--";
      }

      if (
        o.oPhanTram
      ) {
        o.oPhanTram.textContent =
          "--";
      }
    },
  );

  /* RESET TÔ SÁNG */

  tatCaDongMucTieu.forEach(
    (dong) => {
      dong.style.borderColor =
        "#e5e7eb";

      dong.style.background =
        "#ffffff";
    },
  );

  cacTheMucTieu.forEach(
    (the) => {
      the.classList.remove(
        "dang-chon",
      );
    },
  );

  /* RESET BIỂU ĐỒ */

  duLieuBieuDo.gpaTichLuy =
    [];

  duLieuBieuDo.gpaDuKien =
    [];

  duLieuBieuDo.hocKy =
    [];

  if (
    duongTichLuy
  ) {
    duongTichLuy.setAttribute(
      "d",
      "",
    );
  }

  if (
    duongDuKien
  ) {
    duongDuKien.setAttribute(
      "d",
      "",
    );
  }

  if (
    duongMucTieu
  ) {
    duongMucTieu.setAttribute(
      "d",
      "",
    );
  }

  if (
    cacDiemTichLuy
  ) {
    cacDiemTichLuy.innerHTML =
      "";
  }

  if (
    cacDiemDuKien
  ) {
    cacDiemDuKien.innerHTML =
      "";
  }

  if (
    nhanGiaTri
  ) {
    nhanGiaTri.innerHTML =
      "";
  }

  veGrid();
}

if (
  nutDuDoanLai
) {
  nutDuDoanLai.addEventListener(
    "click",
    duDoanLai,
  );
}

/* =========================================================
   PHẦN 9 - XUẤT PDF
========================================================= */

const nutXuatPDF =
  document.getElementById(
    "nut-xuat-pdf",
  );

function xuatPDF() {
  window.print();
}

if (
  nutXuatPDF
) {
  nutXuatPDF.addEventListener(
    "click",
    xuatPDF,
  );
}

/* =========================================================
   PHẦN 10 - BIỂU ĐỒ GPA
========================================================= */

const svg =
  document.getElementById(
    "bieu-do-gpa",
  );

const luoiBieuDo =
  document.getElementById(
    "luoi-bieu-do",
  );

const trucBieuDo =
  document.getElementById(
    "truc-bieu-do",
  );

const duongTichLuy =
  document.getElementById(
    "duong-tich-luy",
  );

const duongDuKien =
  document.getElementById(
    "duong-du-kien",
  );

const duongMucTieu =
  document.getElementById(
    "duong-muc-tieu",
  );

const cacDiemTichLuy =
  document.getElementById(
    "cac-diem-tich-luy",
  );

const cacDiemDuKien =
  document.getElementById(
    "cac-diem-du-kien",
  );

const nhanGiaTri =
  document.getElementById(
    "nhan-gia-tri",
  );

const nhanHocKy =
  document.getElementById(
    "nhan-hoc-ky",
  );

const nhanGPA =
  document.getElementById(
    "nhan-gpa",
  );

const tooltip =
  document.getElementById(
    "tooltip-bieu-do",
  );

const tooltipHocKy =
  document.getElementById(
    "tooltip-hoc-ky",
  );

const tooltipGPA =
  document.getElementById(
    "tooltip-gpa",
  );

/* =========================================================
   DỮ LIỆU BIỂU ĐỒ
========================================================= */

const duLieuBieuDo = {
  hocKy: [],

  gpaTichLuy: [],

  gpaDuKien: [],

  mucTieu:
    3.2,
};

/* =========================================================
   TỌA ĐỘ BIỂU ĐỒ
========================================================= */

const trai =
  65;

const phai =
  30;

const tren =
  25;

const duoi =
  55;

const rong =
  900;

const cao =
  340;

function toaDoY(
  gpa,
) {
  return (
    tren +
    ((4 -
      Number(
        gpa,
      )) /
      2) *
      (cao -
        tren -
        duoi)
  );
}

function toaDoX(
  index,
  tongDiem = 8,
) {
  const soKhoang =
    Math.max(
      1,
      tongDiem -
        1,
    );

  return (
    trai +
    index *
      ((rong -
        trai -
        phai) /
        soKhoang)
  );
}

/* =========================================================
   VẼ GRID
========================================================= */

function veGrid() {
  if (
    !luoiBieuDo ||
    !trucBieuDo ||
    !nhanGPA ||
    !nhanHocKy
  ) {
    return;
  }

  luoiBieuDo.innerHTML =
    "";

  trucBieuDo.innerHTML =
    "";

  nhanGPA.innerHTML =
    "";

  nhanHocKy.innerHTML =
    "";

  const moc = [
    4,
    3.5,
    3,
    2.5,
    2,
  ];

  moc.forEach(
    (gpa) => {

      const y =
        toaDoY(
          gpa,
        );

      const line =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );

      line.setAttribute(
        "x1",
        trai,
      );

      line.setAttribute(
        "x2",
        rong -
          phai,
      );

      line.setAttribute(
        "y1",
        y,
      );

      line.setAttribute(
        "y2",
        y,
      );

      line.setAttribute(
        "class",
        "grid-ngang",
      );

      luoiBieuDo.appendChild(
        line,
      );

      const text =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );

      text.setAttribute(
        "x",
        45,
      );

      text.setAttribute(
        "y",
        y + 4,
      );

      text.setAttribute(
        "class",
        "nhan-gpa",
      );

      text.textContent =
        gpa.toFixed(
          1,
        );

      nhanGPA.appendChild(
        text,
      );
    },
  );

  const tongDiem =
    Math.max(
      1,
      duLieuBieuDo.gpaTichLuy.length +
        duLieuBieuDo.gpaDuKien.length,
    );

  duLieuBieuDo.hocKy.forEach(
    (
      hk,
      index,
    ) => {

      const x =
        toaDoX(
          index,
          tongDiem,
        );

      hk
        .split(
          "\n",
        )
        .forEach(
          (
            dong,
            i,
          ) => {

            const text =
              document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text",
              );

            text.setAttribute(
              "x",
              x,
            );

            text.setAttribute(
              "y",
              cao -
                20 +
                i *
                  15,
            );

            text.setAttribute(
              "class",
              "nhan-hoc-ky",
            );

            text.setAttribute(
              "text-anchor",
              "middle",
            );

            text.textContent =
              dong;

            nhanHocKy.appendChild(
              text,
            );
          },
        );
    },
  );
}

/* =========================================================
   TẠO PATH
========================================================= */

function taoPath(
  ds,
  batDau,
) {
  if (
    !Array.isArray(
      ds,
    ) ||
    ds.length ===
      0
  ) {
    return "";
  }

  const tongDiem =
    Math.max(
      1,
      duLieuBieuDo.gpaTichLuy.length +
        duLieuBieuDo.gpaDuKien.length,
    );

  let path =
    "";

  ds.forEach(
    (
      gpa,
      i,
    ) => {

      const x =
        toaDoX(
          i +
            batDau,
          tongDiem,
        );

      const y =
        toaDoY(
          gpa,
        );

      path +=
        (i ===
        0
          ? "M"
          : "L") +
        x +
        " " +
        y +
        " ";
    },
  );

  return path;
}

/* =========================================================
   VẼ BIỂU ĐỒ
========================================================= */

function veBieuDo() {
  if (
    !duongTichLuy ||
    !duongDuKien ||
    !duongMucTieu
  ) {
    return;
  }

  duongTichLuy.setAttribute(
    "d",
    taoPath(
      duLieuBieuDo.gpaTichLuy,
      0,
    ),
  );

  duongDuKien.setAttribute(
    "d",
    taoPath(
      duLieuBieuDo.gpaDuKien,
      duLieuBieuDo.gpaTichLuy.length,
    ),
  );

  const yMucTieu =
    toaDoY(
      duLieuBieuDo.mucTieu,
    );

  duongMucTieu.setAttribute(
    "d",
    `
      M ${trai} ${yMucTieu}
      L ${rong - phai} ${yMucTieu}
    `,
  );
}

/* =========================================================
   VẼ ĐIỂM + TOOLTIP
========================================================= */

function veDiem(
  ds,
  batDau,
  mau,
  khung,
) {
  if (
    !khung ||
    !Array.isArray(
      ds,
    )
  ) {
    return;
  }

  const tongDiem =
    Math.max(
      1,
      duLieuBieuDo.gpaTichLuy.length +
        duLieuBieuDo.gpaDuKien.length,
    );

  ds.forEach(
    (
      gpa,
      i,
    ) => {

      const x =
        toaDoX(
          i +
            batDau,
          tongDiem,
        );

      const y =
        toaDoY(
          gpa,
        );

      const circle =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );

      circle.setAttribute(
        "cx",
        x,
      );

      circle.setAttribute(
        "cy",
        y,
      );

      circle.setAttribute(
        "r",
        5,
      );

      circle.setAttribute(
        "class",
        mau,
      );

      circle.addEventListener(
        "mousemove",
        (
          e,
        ) => {

          if (!tooltip) {
            return;
          }

          tooltip.style.display =
            "block";

          tooltip.style.left =
            e.pageX +
            12 +
            "px";

          tooltip.style.top =
            e.pageY -
            45 +
            "px";

          if (
            tooltipHocKy
          ) {
            tooltipHocKy.textContent =
              "HK" +
              (
                i +
                batDau +
                1
              );
          }

          if (
            tooltipGPA
          ) {
            tooltipGPA.textContent =
              Number(
                gpa,
              ).toFixed(
                2,
              );
          }
        },
      );

      circle.addEventListener(
        "mouseleave",
        () => {
          if (
            tooltip
          ) {
            tooltip.style.display =
              "none";
          }
        },
      );

      khung.appendChild(
        circle,
      );

      if (
        nhanGiaTri
      ) {

        const text =
          document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text",
          );

        text.setAttribute(
          "x",
          x,
        );

        text.setAttribute(
          "y",
          y -
            12,
        );

        text.setAttribute(
          "text-anchor",
          "middle",
        );

        text.setAttribute(
          "class",
          mau ===
            "diem-xanh-la"
            ? "gia-tri-xanh"
            : "gia-tri-duong",
        );

        text.textContent =
          Number(
            gpa,
          ).toFixed(
            2,
          );

        nhanGiaTri.appendChild(
          text,
        );
      }
    },
  );
}

/* =========================================================
   KHỞI TẠO BIỂU ĐỒ
========================================================= */

veGrid();

veBieuDo();

veDiem(
  duLieuBieuDo.gpaTichLuy,
  0,
  "diem-xanh-la",
  cacDiemTichLuy,
);

veDiem(
  duLieuBieuDo.gpaDuKien,
  duLieuBieuDo.gpaTichLuy.length,
  "diem-xanh-duong",
  cacDiemDuKien,
);
