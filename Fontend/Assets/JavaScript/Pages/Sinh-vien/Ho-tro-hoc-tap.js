/* =========================================================
   STUDYAI - HỖ TRỢ HỌC TẬP
   API:
   GET /api/tai-nguyen
   GET /api/tai-nguyen/thong-ke

   Giữ nguyên giao diện HTML/CSS hiện tại.
   Chỉ thay dữ liệu tĩnh bằng dữ liệu từ backend.
========================================================= */

const modalChung = document.getElementById("modal-chung");
const lopPhuModal = document.getElementById("lop-phu-modal");
const nutDongModal = document.getElementById("nut-dong-modal");
const noiDungModal = document.getElementById("noi-dung-modal");

const API_BASE_URL = "http://localhost:3000";

const API_HO_TRO_HOC_TAP = `${API_BASE_URL}/api/tai-nguyen`;

const API_THONG_KE = `${API_BASE_URL}/api/tai-nguyen/thong-ke`;

// ============================================================
// CHUYỂN ĐƯỜNG DẪN FILE BACKEND THÀNH URL ĐẦY ĐỦ
// ============================================================

function taoURLTaiNguyen(duongDan) {
  if (!duongDan) {
    return "";
  }

  const url = String(duongDan).trim();

  // Website bên ngoài
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // File nằm trên Backend
  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
}

/* =========================================================
   CẤU HÌNH
========================================================= */

const SO_TAI_LIEU_MOI_TRANG = 12;
const SO_VIDEO_MOI_TRANG = 16;
const SO_WEBSITE_MOI_TRANG = 24;

let trangTaiLieuHienTai = 1;
let trangVideoHienTai = 1;
let trangWebsiteHienTai = 1;

let loaiTaiNguyenDangChon = "tat-ca";
let kieuSapXepDangChon = "moi-nhat";

/* =========================================================
   DỮ LIỆU
========================================================= */

const duLieuHoTroHocTap = {
  tatCa: [],
  taiLieu: [],
  video: [],
  website: [],
  noiBat: [],
  monHoc: [],

  thongKe: {
    taiLieu: 0,
    video: 0,
    website: 0,
    noiBat: 0,
  },
};

/* =========================================================
   DOM DANH SÁCH
========================================================= */

const danhSachTaiLieu = document.getElementById("danh-sach-tai-lieu");

const danhSachVideo = document.getElementById("danh-sach-video");

const danhSachWebsite = document.getElementById("danh-sach-website");

const danhSachTaiNguyen = document.getElementById("danh-sach-tai-nguyen");

const danhSachMonHoc = document.getElementById("danh-sach-mon-hoc");

/* =========================================================
   TOKEN
========================================================= */

function layTokenHoTroHocTap() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/* =========================================================
   FORMAT SỐ
========================================================= */

function dinhDangSo(giaTri) {
  const so = Number(giaTri);

  if (!Number.isFinite(so)) {
    return "0";
  }

  return so.toLocaleString("vi-VN");
}

/* =========================================================
   FORMAT NGÀY
========================================================= */

function dinhDangNgay(giaTri) {
  if (!giaTri) {
    return "Chưa cập nhật";
  }

  const ngay = new Date(giaTri);

  if (Number.isNaN(ngay.getTime())) {
    return "Chưa cập nhật";
  }

  return ngay.toLocaleDateString("vi-VN");
}

/* =========================================================
   FORMAT THỜI LƯỢNG
========================================================= */

function dinhDangThoiLuong(soGiay) {
  const giay = Number(soGiay);

  if (!Number.isFinite(giay) || giay < 0) {
    return "00:00";
  }

  const gio = Math.floor(giay / 3600);

  const phut = Math.floor((giay % 3600) / 60);

  const giayCon = Math.floor(giay % 60);

  if (gio > 0) {
    return (
      `${String(gio).padStart(2, "0")}:` +
      `${String(phut).padStart(2, "0")}:` +
      `${String(giayCon).padStart(2, "0")}`
    );
  }

  return (
    `${String(phut).padStart(2, "0")}:` + `${String(giayCon).padStart(2, "0")}`
  );
}

/* =========================================================
   CHUẨN HÓA CHUỖI
========================================================= */

function chuanHoaChuoi(chuoi) {
  return String(chuoi ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(giaTri) {
  return String(giaTri ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   TÌM TÀI NGUYÊN THEO ID
========================================================= */

function timTaiNguyenTheoId(id) {
  const idCanTim = Number(id);

  if (!Number.isInteger(idCanTim)) {
    return null;
  }

  return (
    duLieuHoTroHocTap.tatCa.find(function (item) {
      return Number(item.idTaiNguyen) === idCanTim;
    }) || null
  );
}

/* =========================================================
   LẤY ĐUÔI FILE
========================================================= */

function layDuoiFile(taiNguyen) {
  let duoi = taiNguyen?.duoiFile || "";

  if (!duoi && taiNguyen?.duongDanFile) {
    const url = taiNguyen.duongDanFile.split("?")[0].split("#")[0];

    duoi = url.split(".").pop();
  }

  return String(duoi || "")
    .toLowerCase()
    .replace(/^\./, "")
    .trim();
}

/* =========================================================
   THUMBNAIL TÀI LIỆU
========================================================= */

function layThongTinThumbnailTaiLieu(taiLieu) {
  const duoi = layDuoiFile(taiLieu);

  if (duoi === "pdf") {
    return {
      nhan: "PDF",

      classNhan: "pdf",

      classMinhHoa: "file-pdf",

      icon: "fa-solid fa-file-pdf",
    };
  }

  if (duoi === "doc" || duoi === "docx") {
    return {
      nhan: duoi.toUpperCase(),

      classNhan: "docx",

      classMinhHoa: "file-word",

      icon: "fa-solid fa-file-word",
    };
  }

  if (duoi === "ppt" || duoi === "pptx") {
    return {
      nhan: duoi.toUpperCase(),

      classNhan: "ppt",

      classMinhHoa: "file-powerpoint",

      icon: "fa-solid fa-file-powerpoint",
    };
  }

  if (duoi === "xls" || duoi === "xlsx") {
    return {
      nhan: duoi.toUpperCase(),

      classNhan: "xls",

      classMinhHoa: "file-excel",

      icon: "fa-solid fa-file-excel",
    };
  }

  return {
    nhan: duoi ? duoi.toUpperCase() : "FILE",

    classNhan: "docx",

    classMinhHoa: "file-khac",

    icon: "fa-solid fa-file",
  };
}

/* =========================================================
   API - TẢI DỮ LIỆU
========================================================= */

async function taiDuLieuHoTroHocTap() {
  const token = layTokenHoTroHocTap();

  if (!token) {
    console.warn("[Hỗ trợ học tập] Không có token đăng nhập.");

    return false;
  }

  try {
    const response = await fetch(API_HO_TRO_HOC_TAP, {
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
      throw new Error("API hỗ trợ học tập không trả về JSON hợp lệ.");
    }

    if (!response.ok || !data?.thanhCong) {
      throw new Error(
        data?.thongBao || "Không thể tải dữ liệu hỗ trợ học tập.",
      );
    }

    const tatCa = Array.isArray(data.taiNguyen) ? data.taiNguyen : [];

    duLieuHoTroHocTap.tatCa = tatCa;

    duLieuHoTroHocTap.taiLieu = tatCa.filter(function (item) {
      return String(item.loaiTaiNguyen || "").toUpperCase() === "TAI_LIEU";
    });

    duLieuHoTroHocTap.video = tatCa.filter(function (item) {
      return String(item.loaiTaiNguyen || "").toUpperCase() === "VIDEO";
    });

    duLieuHoTroHocTap.website = tatCa.filter(function (item) {
      return String(item.loaiTaiNguyen || "").toUpperCase() === "WEBSITE";
    });

    duLieuHoTroHocTap.noiBat = tatCa.filter(function (item) {
      return Boolean(item.noiBat);
    });

    /* =====================================================
       TẠO DANH SÁCH MÔN HỌC
    ===================================================== */

    const mapMonHoc = new Map();

    tatCa.forEach(function (item) {
      const hocPhan = item?.hocPhan;

      if (!hocPhan?.idHocPhan) {
        return;
      }

      const idHocPhan = Number(hocPhan.idHocPhan);

      if (!Number.isInteger(idHocPhan)) {
        return;
      }

      if (!mapMonHoc.has(idHocPhan)) {
        mapMonHoc.set(idHocPhan, {
          idHocPhan: idHocPhan,

          maHocPhan: hocPhan.maHocPhan || "",

          tenHocPhan: hocPhan.tenHocPhan || "",

          soTinChi: Number(hocPhan.soTinChi || 0),

          khoiMon: hocPhan.khoiMon || "khac",

          soTaiNguyen: 0,

          soVideo: 0,
        });
      }

      const mon = mapMonHoc.get(idHocPhan);

      mon.soTaiNguyen++;

      if (String(item.loaiTaiNguyen || "").toUpperCase() === "VIDEO") {
        mon.soVideo++;
      }
    });

    duLieuHoTroHocTap.monHoc = Array.from(mapMonHoc.values());

    /* =====================================================
       THỐNG KÊ
    ===================================================== */

    duLieuHoTroHocTap.thongKe = {
      taiLieu: duLieuHoTroHocTap.taiLieu.length,

      video: duLieuHoTroHocTap.video.length,

      website: duLieuHoTroHocTap.website.length,

      noiBat: duLieuHoTroHocTap.noiBat.length,
    };

    console.log("[Hỗ trợ học tập] Dữ liệu API:", duLieuHoTroHocTap);

    return true;
  } catch (error) {
    console.error("[Hỗ trợ học tập] Lỗi API:", error);

    return false;
  }
}

/* =========================================================
   THỐNG KÊ
========================================================= */

function hienThiThongKeTaiNguyen(thongKe = {}) {
  const tongTaiLieu =
    thongKe.tongTaiLieu ?? thongKe.taiLieu ?? duLieuHoTroHocTap.taiLieu.length;

  const tongVideo =
    thongKe.tongVideo ?? thongKe.video ?? duLieuHoTroHocTap.video.length;

  const tongWebsite =
    thongKe.tongWebsite ?? thongKe.website ?? duLieuHoTroHocTap.website.length;

  const tongNoiBat =
    thongKe.tongNoiBat ?? thongKe.noiBat ?? duLieuHoTroHocTap.noiBat.length;

  function ganSo(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = dinhDangSo(value);
    }
  }

  /* Hỗ trợ cả ID lẫn class */

  ganSo("#tong-tai-lieu, .tong-tai-lieu", tongTaiLieu);

  ganSo("#tong-video, .tong-video", tongVideo);

  ganSo("#tong-website, .tong-website", tongWebsite);

  ganSo("#tong-tai-nguyen-noi-bat, .tong-tai-nguyen-noi-bat", tongNoiBat);

  ganSo(
    "#tong-tai-nguyen, .tong-tai-nguyen",
    thongKe.tongTaiNguyen ?? tongTaiLieu + tongVideo + tongWebsite,
  );
}

/* =========================================================
   API THỐNG KÊ RIÊNG
========================================================= */

async function taiThongKeTaiNguyen() {
  const token = layTokenHoTroHocTap();

  if (!token) {
    return;
  }

  try {
    const response = await fetch(API_THONG_KE, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.thanhCong) {
      throw new Error(data?.thongBao || "Không thể tải thống kê tài nguyên.");
    }

    hienThiThongKeTaiNguyen(data.thongKe || {});
  } catch (error) {
    console.error("[Hỗ trợ học tập] Lỗi thống kê:", error);

    hienThiThongKeTaiNguyen(duLieuHoTroHocTap.thongKe);
  }
}

/* =========================================================
   MODAL CHUNG
========================================================= */

function moModalChung({
  tieuDe = "",
  loai = "",
  monHoc = "",
  moTa = "",
  noiDung = "",
} = {}) {
  if (!modalChung || !noiDungModal) {
    return;
  }

  noiDungModal.innerHTML = `

      <h2 class="tieu-de-modal">
        ${escapeHtml(tieuDe)}
      </h2>


      <div class="thong-tin-modal">

        ${
          loai
            ? `
              <span class="nhan-modal">
                ${escapeHtml(loai)}
              </span>
            `
            : ""
        }


        ${
          monHoc
            ? `
              <span class="nhan-modal">
                ${escapeHtml(monHoc)}
              </span>
            `
            : ""
        }

      </div>


      ${
        moTa
          ? `
            <p class="mo-ta-modal">
              ${escapeHtml(moTa)}
            </p>
          `
          : ""
      }


      <div class="noi-dung-modal-placeholder">

        ${noiDung}

      </div>

    `;

  modalChung.classList.add("dang-mo");

  modalChung.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  noiDungModal.scrollTop = 0;
}

/* =========================================================
   ĐÓNG MODAL
========================================================= */

function dongModalChung() {
  if (!noiDungModal || !modalChung) {
    return;
  }

  const media = noiDungModal.querySelectorAll("video, audio");

  media.forEach(function (element) {
    try {
      element.pause();

      element.currentTime = 0;
    } catch (error) {
      /* bỏ qua */
    }
  });

  noiDungModal.innerHTML = "";

  modalChung.classList.remove("dang-mo");

  modalChung.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

nutDongModal?.addEventListener("click", dongModalChung);

lopPhuModal?.addEventListener("click", dongModalChung);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && modalChung?.classList.contains("dang-mo")) {
    dongModalChung();
  }
});

/* =========================================================
   HEADER THÔNG TIN
========================================================= */

const muiTenThongTin = document.querySelector(".thong-tin");

const khungThongTinChiTiet = document.querySelector(".thong-tin-chi-tiet");

const iconMuiTen = document.querySelector(".thong-tin > i");

if (muiTenThongTin && khungThongTinChiTiet && iconMuiTen) {
  muiTenThongTin.addEventListener("click", function (event) {
    event.stopPropagation();

    khungThongTinChiTiet.classList.toggle("show");

    iconMuiTen.classList.toggle("active");
  });

  khungThongTinChiTiet.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  document.addEventListener("click", function () {
    khungThongTinChiTiet.classList.remove("show");

    iconMuiTen.classList.remove("active");
  });
}

/* =========================================================
   RENDER TÀI LIỆU
========================================================= */

function renderTaiLieuTuAPI() {
  if (!danhSachTaiLieu) {
    return;
  }

  const cardMau = danhSachTaiLieu.querySelector(".the-tai-lieu");

  if (!cardMau) {
    console.warn("Không tìm thấy card tài liệu mẫu.");

    return;
  }

  const template = cardMau.cloneNode(true);

  danhSachTaiLieu.innerHTML = "";

  duLieuHoTroHocTap.taiLieu.forEach(function (item) {
    const card = template.cloneNode(true);

    const id = Number(item.idTaiNguyen);

    card.dataset.id = String(id);

    card.dataset.url = taoURLTaiNguyen(
      item.duongDanFile || item.duongDanUrl || "",
    );

    card.dataset.ngay = item.ngayCapNhat || item.ngayTao || "";

    card.dataset.luotXem = String(item.luotXem ?? 0);

    card.classList.remove("an-ket-qua-tim-kiem");

    card.style.display = "";

    /* ===================================================
         HÌNH ẢNH THEO ĐUÔI
      =================================================== */

    const hinh = card.querySelector(".hinh-tai-lieu");

    if (hinh) {
      const info = layThongTinThumbnailTaiLieu(item);

      hinh.innerHTML = `

            <span
              class="nhan-dang-tai-lieu ${info.classNhan}"
            >
              ${info.nhan}
            </span>


            <div
              class="minh-hoa-tai-lieu ${info.classMinhHoa}"
            >
              <i
                class="${info.icon}"
              ></i>
            </div>

          `;
    }

    /* ===================================================
         TÊN
      =================================================== */

    const ten = card.querySelector(".ten-tai-lieu");

    if (ten) {
      ten.textContent = item.tenTaiNguyen || "Tài liệu";
    }

    /* ===================================================
         MÔN HỌC
      =================================================== */

    const mon = card.querySelector(".mon-hoc-tai-lieu");

    if (mon) {
      mon.textContent = item?.hocPhan?.tenHocPhan || "Tài liệu chung";
    }

    /* ===================================================
         LƯỢT XEM
      =================================================== */

    const xem = card.querySelector(".luot-xem-tai-lieu");

    if (xem) {
      xem.innerHTML = `

            <i class="fa-regular fa-eye"></i>

            ${dinhDangSo(item.luotXem)}

          `;
    }

    /* ===================================================
         NGÀY
      =================================================== */

    const ngay = card.querySelector(".ngay-tai-lieu");

    if (ngay) {
      ngay.innerHTML = `

            <i class="fa-regular fa-calendar"></i>

            ${dinhDangNgay(item.ngayCapNhat || item.ngayTao)}

          `;
    }

    danhSachTaiLieu.appendChild(card);
  });
}

/* =========================================================
   RENDER VIDEO
========================================================= */

function renderVideoTuAPI() {
  if (!danhSachVideo) {
    return;
  }

  const cardMau = danhSachVideo.querySelector(".the-video");

  if (!cardMau) {
    console.warn("Không tìm thấy card video mẫu.");

    return;
  }

  const template = cardMau.cloneNode(true);

  danhSachVideo.innerHTML = "";

  /*
   * Giữ nguyên phong cách nền video
   * của giao diện hiện tại.
   */

  const kieuNenVideo = ["sql-server", "python", "html-css", "ai"];

  duLieuHoTroHocTap.video.forEach(function (item, index) {
    const card = template.cloneNode(true);

    const id = Number(item.idTaiNguyen);

    card.dataset.id = String(id);

    card.dataset.url = taoURLTaiNguyen(
      item.duongDanFile || item.duongDanUrl || "",
    );

    card.dataset.ngay = item.ngayCapNhat || item.ngayTao || "";

    card.dataset.luotXem = String(item.luotXem ?? 0);

    card.classList.remove("an-ket-qua-tim-kiem");

    card.style.display = "";

    /* ===================================================
         NỀN VIDEO
      =================================================== */

    const hinh = card.querySelector(".hinh-video");

    if (hinh) {
      const kieu = kieuNenVideo[index % kieuNenVideo.length];

      hinh.classList.add(kieu);

      const nen = hinh.querySelector(".nen-video");

      if (nen) {
        nen.className = `nen-video ${kieu}`;
      }

      const nutPlay = hinh.querySelector(".nut-phat-video");

      if (nutPlay) {
        nutPlay.dataset.id = String(id);
      }

      const thoiLuong = hinh.querySelector(".thoi-luong-video");

      if (thoiLuong) {
        if (
          item.thoiLuongGiay !== null &&
          item.thoiLuongGiay !== undefined &&
          Number.isFinite(Number(item.thoiLuongGiay))
        ) {
          thoiLuong.textContent = dinhDangThoiLuong(item.thoiLuongGiay);

          thoiLuong.style.display = "";
        } else {
          thoiLuong.textContent = "";

          thoiLuong.style.display = "none";
        }
      }
    }

    /* ===================================================
         TÊN
      =================================================== */

    const ten = card.querySelector(".ten-video");

    if (ten) {
      ten.textContent = item.tenTaiNguyen || "Video bài giảng";
    }

    /* ===================================================
         MÔ TẢ
      =================================================== */

    const moTa = card.querySelector(".mon-hoc-video");

    if (moTa) {
      moTa.textContent =
        item.moTa || item?.hocPhan?.tenHocPhan || "Video bài giảng";

      moTa.title = item.moTa || "";
    }

    /* ===================================================
         LƯỢT XEM + NGÀY
      =================================================== */

    const thongTin = card.querySelector(".thong-tin-video");

    if (thongTin) {
      thongTin.innerHTML = `

            <span
              class="luot-xem-video"
            >

              <i
                class="fa-regular fa-eye"
              ></i>

              ${dinhDangSo(item.luotXem)}

            </span>


            <span
              class="ngay-video"
            >

              <i
                class="fa-regular fa-calendar"
              ></i>

              ${dinhDangNgay(item.ngayCapNhat || item.ngayTao)}

            </span>

          `;
    }

    danhSachVideo.appendChild(card);
  });
}

/* =========================================================
   RENDER WEBSITE
========================================================= */

function renderWebsiteTuAPI() {
  if (!danhSachWebsite) {
    return;
  }

  const cardMau = danhSachWebsite.querySelector(".the-website");

  if (!cardMau) {
    console.warn("Không tìm thấy card website mẫu.");

    return;
  }

  const template = cardMau.cloneNode(true);

  danhSachWebsite.innerHTML = "";

  duLieuHoTroHocTap.website.forEach(function (item) {
    const card = template.cloneNode(true);

    const id = Number(item.idTaiNguyen);

    card.dataset.id = String(id);

    card.dataset.url = item.duongDanUrl || "";

    card.dataset.ngay = item.ngayCapNhat || item.ngayTao || "";

    card.dataset.luotXem = String(item.luotXem ?? 0);

    card.classList.remove("an-ket-qua-tim-kiem");

    card.style.display = "";

    /* ===================================================
         ICON QUẢ CẦU CHUNG
      =================================================== */

    const logo = card.querySelector(".logo-website");

    if (logo) {
      logo.className = "logo-website mdn";

      logo.innerHTML = `

            <i
              class="fa-solid fa-globe"
            ></i>

          `;
    }

    /* ===================================================
         TÊN
      =================================================== */

    const ten = card.querySelector(".ten-website");

    if (ten) {
      ten.textContent = item.tenTaiNguyen || "Website";
    }

    /* ===================================================
         MÔ TẢ
      =================================================== */

    const moTa = card.querySelector(".mo-ta-website");

    if (moTa) {
      moTa.textContent = item.moTa || "Website tham khảo";
    }

    /* ===================================================
         THÔNG TIN
      =================================================== */

    const thongTin = card.querySelector(".thong-tin-website");

    if (thongTin) {
      const nutCu = thongTin.querySelector(".nut-truy-cap-website");

      thongTin.innerHTML = `

            <span
              class="luot-xem-website"
            >

              <i
                class="fa-regular fa-eye"
              ></i>

              ${dinhDangSo(item.luotXem)}

            </span>


            <span
              class="ngay-website"
            >

              <i
                class="fa-regular fa-calendar"
              ></i>

              ${dinhDangNgay(item.ngayCapNhat || item.ngayTao)}

            </span>

          `;

      if (nutCu) {
        thongTin.appendChild(nutCu);
      } else {
        const nutMoi = document.createElement("button");

        nutMoi.type = "button";

        nutMoi.className = "nut-truy-cap-website";

        nutMoi.dataset.id = String(id);

        nutMoi.innerHTML = `

              Truy cập

              <i
                class="fa-solid fa-arrow-up-right-from-square"
              ></i>

            `;

        thongTin.appendChild(nutMoi);
      }
    }

    danhSachWebsite.appendChild(card);
  });
}

/* =========================================================
   RENDER TÀI NGUYÊN NỔI BẬT
========================================================= */

function renderTaiNguyenNoiBatTuAPI() {
  if (!danhSachTaiNguyen) {
    return;
  }

  const cardMau = danhSachTaiNguyen.querySelector(".the-tai-nguyen");

  if (!cardMau) {
    console.warn("Không tìm thấy card tài nguyên nổi bật mẫu.");

    return;
  }

  const template = cardMau.cloneNode(true);

  danhSachTaiNguyen.innerHTML = "";

  duLieuHoTroHocTap.noiBat.forEach(function (item) {
    const card = template.cloneNode(true);

    const id = Number(item.idTaiNguyen);

    card.dataset.id = String(id);

    card.dataset.url = item.duongDanUrl || item.duongDanFile || "";

    card.dataset.luotXem = String(item.luotXem ?? 0);

    card.dataset.ngay = item.ngayCapNhat || item.ngayTao || "";

    card.classList.remove("an-ket-qua-tim-kiem");

    card.style.display = "";

    /* ===================================================
         ICON
         QUAN TRỌNG:
         KHÔNG thay class của div ngoài
         để giữ nguyên màu CSS hiện tại.
      =================================================== */

    const khungIcon = card.querySelector(".bieu-tuong-tai-nguyen");

    if (khungIcon) {
      /* Tìm thẻ <i> bên trong */

      let icon = khungIcon.querySelector("i");

      /* Nếu chưa có <i> thì tạo */

      if (!icon) {
        icon = document.createElement("i");

        khungIcon.appendChild(icon);
      }

      const loai = String(item.loaiTaiNguyen || "").toUpperCase();

      const duoi = layDuoiFile(item);

      /* =================================================
           TÀI LIỆU
        ================================================= */

      if (loai === "TAI_LIEU") {
        if (duoi === "pdf") {
          icon.className = "fa-solid fa-file-pdf";
        } else if (duoi === "doc" || duoi === "docx") {
          icon.className = "fa-solid fa-file-word";
        } else if (duoi === "ppt" || duoi === "pptx") {
          icon.className = "fa-solid fa-file-powerpoint";
        } else if (duoi === "xls" || duoi === "xlsx") {
          icon.className = "fa-solid fa-file-excel";
        } else {
          icon.className = "fa-solid fa-file";
        }
      } else if (loai === "VIDEO") {
        /* =================================================
           VIDEO
        ================================================= */
        icon.className = "fa-solid fa-play";
      } else if (loai === "WEBSITE") {
        /* =================================================
           WEBSITE
        ================================================= */
        icon.className = "fa-solid fa-link";
      } else {
        /* =================================================
           KHÁC
        ================================================= */
        icon.className = "fa-solid fa-file";
      }
    }

    /* ===================================================
         TÊN
      =================================================== */

    const ten = card.querySelector(".ten-tai-nguyen");

    if (ten) {
      ten.textContent = item.tenTaiNguyen || "Tài nguyên";
    }

    /* ===================================================
         MÔ TẢ
      =================================================== */

    const moTa = card.querySelector(".mo-ta-tai-nguyen");

    if (moTa) {
      moTa.textContent = item.moTa || "";
    }

    /* ===================================================
         LOẠI
      =================================================== */

    const loai = card.querySelector(".loai-tai-nguyen");

    if (loai) {
      loai.textContent = item.loaiTaiNguyen || "";
    }

    /* ===================================================
         THÔNG TIN
      =================================================== */

    const thongTin = card.querySelector(".thong-tin-tai-nguyen");

    if (thongTin) {
      thongTin.innerHTML = `
          <span>

            <i
              class="fa-regular fa-eye"
            ></i>

            ${dinhDangSo(item.luotXem)}

          </span>
        `;
    }

    /* ===================================================
         NÚT MỞ
      =================================================== */

    const nut = card.querySelector(".nut-mo-tai-nguyen");

    if (nut) {
      nut.dataset.id = String(id);
    }

    danhSachTaiNguyen.appendChild(card);
  });
}

/* =========================================================
   RENDER DANH MỤC MÔN HỌC
========================================================= */

function renderMonHocTuAPI() {
  if (!danhSachMonHoc) {
    return;
  }

  const cardMau = danhSachMonHoc.querySelector(".the-mon-hoc");

  if (!cardMau) {
    console.warn("Không tìm thấy card môn học mẫu.");

    return;
  }

  const template = cardMau.cloneNode(true);

  danhSachMonHoc.innerHTML = "";

  duLieuHoTroHocTap.monHoc.forEach(function (item) {
    const card = template.cloneNode(true);

    const id = Number(item.idHocPhan);

    card.dataset.id = String(id);

    card.dataset.khoiMon = item.khoiMon || "khac";

    card.style.display = "flex";

    card.classList.remove("an-ket-qua-tim-kiem");

    const icon = card.querySelector(".bieu-tuong-mon-hoc");

    if (icon) {
      icon.className = "bieu-tuong-mon-hoc co-so";

      icon.innerHTML = `

            <i
              class="fa-solid fa-book-open"
            ></i>

          `;
    }

    const ten = card.querySelector(".ten-mon-hoc");

    if (ten) {
      ten.textContent = item.tenHocPhan || "Môn học";
    }

    const ma = card.querySelector(".ma-mon-hoc");

    if (ma) {
      ma.textContent = item.maHocPhan || "";
    }

    const thongTin = card.querySelector(".thong-tin-mon-hoc");

    if (thongTin) {
      thongTin.innerHTML = `

            <span>

              <i
                class="fa-regular fa-file-lines"
              ></i>

              ${dinhDangSo(item.soTaiNguyen)}

              tài nguyên

            </span>


            <span>

              <i
                class="fa-solid fa-video"
              ></i>

              ${dinhDangSo(item.soVideo)}

              video

            </span>

          `;
    }

    const nut = card.querySelector(".nut-mo-mon-hoc");

    if (nut) {
      nut.dataset.id = String(id);
    }

    danhSachMonHoc.appendChild(card);
  });
}

/* =========================================================
   MỞ TÀI LIỆU TRONG MODAL
========================================================= */

function moTaiLieuTrongModal(ten, mon, url) {
  if (!url) {
    moModalChung({
      tieuDe: ten,

      loai: "TÀI LIỆU",

      monHoc: mon,

      moTa: "Tài liệu này chưa có đường dẫn.",

      noiDung: "Chưa có file để xem.",
    });

    return;
  }

  const ext = url.split("?")[0].split("#")[0].split(".").pop().toLowerCase();

  /* =======================================================
     PDF
  ======================================================= */

  if (ext === "pdf") {
    moModalChung({
      tieuDe: ten,

      loai: "TÀI LIỆU PDF",

      monHoc: mon,

      noiDung: `

          <div
            class="khung-xem-tai-lieu"
          >

            <iframe
              src="${escapeHtml(url)}"
              class="iframe-tai-lieu"
              title="${escapeHtml(ten)}"
            ></iframe>

          </div>

        `,
    });

    return;
  }

  /* =======================================================
     WORD / POWERPOINT / KHÁC
  ======================================================= */

  let icon = "fa-solid fa-file";

  if (ext === "doc" || ext === "docx") {
    icon = "fa-solid fa-file-word";
  }

  if (ext === "ppt" || ext === "pptx") {
    icon = "fa-solid fa-file-powerpoint";
  }

  if (ext === "xls" || ext === "xlsx") {
    icon = "fa-solid fa-file-excel";
  }

  moModalChung({
    tieuDe: ten,

    loai: "TÀI LIỆU",

    monHoc: mon,

    moTa: "Định dạng này không hỗ trợ xem trực tiếp trong trình duyệt.",

    noiDung: `

        <div
          class="thong-bao-file-modal"
        >

          <i
            class="${icon}"
          ></i>


          <h3>
            ${escapeHtml(ten)}
          </h3>


          <p>
            Bạn có thể mở hoặc tải file này.
          </p>


          <div
            class="nut-hanh-dong-file-modal"
          >

            <a
              href="${escapeHtml(url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="nut-file-modal nut-mo-file"
            >

              <i
                class="fa-solid fa-arrow-up-right-from-square"
              ></i>

              Mở file

            </a>


            <a
              href="${escapeHtml(url)}"
              download
              class="nut-file-modal nut-tai-file"
            >

              <i
                class="fa-solid fa-download"
              ></i>

              Tải xuống

            </a>

          </div>

        </div>

      `,
  });
}

/* =========================================================
   MỞ VIDEO MODAL
========================================================= */

function moVideoTrongModal(ten, mon, url) {
  if (!url) {
    moModalChung({
      tieuDe: ten,

      loai: "VIDEO",

      monHoc: mon,

      moTa: "Video này chưa có đường dẫn.",

      noiDung: "Chưa có video để phát.",
    });

    return;
  }

  moModalChung({
    tieuDe: ten,

    loai: "VIDEO",

    monHoc: mon,

    moTa: "Phát video bài giảng.",

    noiDung: `

        <div
          class="khung-xem-video-modal"
        >

          <video
            class="video-modal"
            controls
            autoplay
            playsinline
            src="${escapeHtml(url)}"
          ></video>

        </div>

      `,
  });
}

/* =========================================================
   MỞ WEBSITE
========================================================= */

function moWebsite(url) {
  if (!url) {
    alert("Website này chưa có đường dẫn.");

    return;
  }

  let urlMo = String(url).trim();

  if (!/^https?:\/\//i.test(urlMo)) {
    urlMo = `https://${urlMo}`;
  }

  window.open(urlMo, "_blank", "noopener,noreferrer");
}

/* =========================================================
   EVENT DELEGATION
   Dùng cho CARD API tạo động
========================================================= */

document.addEventListener("click", function (event) {
  /* =====================================================
       TÀI LIỆU
    ===================================================== */

  const nutTaiLieu = event.target.closest(".nut-tai-lieu");

  if (nutTaiLieu) {
    const card = nutTaiLieu.closest(".the-tai-lieu");

    if (!card) {
      return;
    }

    const item = timTaiNguyenTheoId(card.dataset.id);

    if (!item) {
      return;
    }

    const ten = item.tenTaiNguyen || "Tài liệu";

    const mon = item?.hocPhan?.tenHocPhan || "Tài liệu chung";

    const url = taoURLTaiNguyen(item.duongDanFile || item.duongDanUrl || "");

    if (nutTaiLieu.classList.contains("xem")) {
      moTaiLieuTrongModal(ten, mon, url);
    }

    if (nutTaiLieu.classList.contains("tai")) {
      if (!url) {
        alert("Tài liệu này chưa có đường dẫn tải.");

        return;
      }

      const a = document.createElement("a");

      a.href = url;

      a.download = "";

      a.target = "_blank";

      document.body.appendChild(a);

      a.click();

      a.remove();
    }

    return;
  }

  /* =====================================================
       VIDEO
    ===================================================== */

  const nutPlay = event.target.closest(".nut-phat-video");

  if (nutPlay) {
    const card = nutPlay.closest(".the-video");

    if (!card) {
      return;
    }

    const id = card.dataset.id || nutPlay.dataset.id;

    const item = timTaiNguyenTheoId(id);

    if (!item) {
      return;
    }

    moVideoTrongModal(
      item.tenTaiNguyen || "Video bài giảng",

      item?.hocPhan?.tenHocPhan || "",

      taoURLTaiNguyen(item.duongDanFile || item.duongDanUrl || ""),
    );

    return;
  }

  /* =====================================================
       WEBSITE
    ===================================================== */

  const nutWebsite = event.target.closest(".nut-truy-cap-website");

  if (nutWebsite) {
    const card = nutWebsite.closest(".the-website");

    if (!card) {
      return;
    }

    const item = timTaiNguyenTheoId(card.dataset.id);

    moWebsite(item?.duongDanUrl || card.dataset.url || "");

    return;
  }

  /* =====================================================
       TÀI NGUYÊN NỔI BẬT
    ===================================================== */

  const nutTaiNguyen = event.target.closest(".nut-mo-tai-nguyen");

  if (nutTaiNguyen) {
    const card = nutTaiNguyen.closest(".the-tai-nguyen");

    if (!card) {
      return;
    }

    const item = timTaiNguyenTheoId(card.dataset.id);

    if (!item) {
      return;
    }

    moModalChung({
      tieuDe: item.tenTaiNguyen || "Tài nguyên",

      loai: "TÀI NGUYÊN NỔI BẬT",

      monHoc: item.loaiTaiNguyen || "",

      moTa: item.moTa || "Thông tin chi tiết tài nguyên.",

      noiDung: `

            <div
              class="chi-tiet-tai-nguyen-modal"
            >

              <div
                class="dong-thong-tin-tai-nguyen-modal"
              >

                <i
                  class="fa-regular fa-eye"
                ></i>


                <div>

                  <span>
                    Lượt xem
                  </span>


                  <strong>
                    ${dinhDangSo(item.luotXem)}
                  </strong>

                </div>

              </div>

            </div>

          `,
    });

    return;
  }

  /* =====================================================
       MÔN HỌC
    ===================================================== */

  const nutMonHoc = event.target.closest(".nut-mo-mon-hoc");

  if (nutMonHoc) {
    const card = nutMonHoc.closest(".the-mon-hoc");

    if (!card) {
      return;
    }

    const id = Number(card.dataset.id);

    const item = duLieuHoTroHocTap.monHoc.find(function (mon) {
      return Number(mon.idHocPhan) === id;
    });

    if (!item) {
      return;
    }

    moModalChung({
      tieuDe: item.tenHocPhan || "Môn học",

      loai: "MÔN HỌC",

      monHoc: item.maHocPhan || "",

      moTa: "Thông tin chi tiết môn học.",

      noiDung: `

            <div
              class="chi-tiet-mon-hoc-modal"
            >

              <div
                class="dong-thong-tin-mon-hoc-modal"
              >

                <i
                  class="fa-solid fa-book-open"
                ></i>


                <div>

                  <span
                    class="nhan-thong-tin-modal"
                  >
                    Mã môn
                  </span>


                  <strong>
                    ${escapeHtml(item.maHocPhan || "Chưa có")}
                  </strong>

                </div>

              </div>


              <div
                class="dong-thong-tin-mon-hoc-modal"
              >

                <i
                  class="fa-regular fa-file-lines"
                ></i>


                <div>

                  <span
                    class="nhan-thong-tin-modal"
                  >
                    Tài nguyên
                  </span>


                  <strong>
                    ${dinhDangSo(item.soTaiNguyen)}
                  </strong>

                </div>

              </div>


              <div
                class="dong-thong-tin-mon-hoc-modal"
              >

                <i
                  class="fa-solid fa-video"
                ></i>


                <div>

                  <span
                    class="nhan-thong-tin-modal"
                  >
                    Video
                  </span>


                  <strong>
                    ${dinhDangSo(item.soVideo)}
                  </strong>

                </div>

              </div>

            </div>

          `,
    });
  }
});

/* =========================================================
   MODAL - XEM TẤT CẢ TÀI LIỆU
========================================================= */

function moDanhSachModalTaiLieu() {
  const items = duLieuHoTroHocTap.taiLieu;

  const html = items
    .map(function (item) {
      return `

            <div
              class="item-modal"
            >

              <div
                class="icon-item-modal"
              >

                <i
                  class="fa-regular fa-file-lines"
                ></i>

              </div>


              <div
                class="thong-tin-item-modal"
              >

                <h3
                  class="ten-item-modal"
                >
                  ${escapeHtml(item.tenTaiNguyen || "Tài liệu")}
                </h3>


                <p
                  class="mon-item-modal"
                >
                  ${escapeHtml(item?.hocPhan?.tenHocPhan || "Tài liệu chung")}
                </p>

              </div>


              <button
                type="button"
                class="nut-mo-item-modal"
                data-id="${Number(item.idTaiNguyen)}"
              >

                <i
                  class="fa-solid fa-arrow-right"
                ></i>

              </button>

            </div>

          `;
    })
    .join("");

  moModalChung({
    tieuDe: "Tất cả tài liệu",

    loai: `${items.length} tài liệu`,

    noiDung: `

        <div
          class="danh-sach-modal"
        >
          ${html}
        </div>

      `,
  });
}

/* =========================================================
   MODAL - XEM TẤT CẢ VIDEO
========================================================= */

function moDanhSachModalVideo() {
  const items = duLieuHoTroHocTap.video;

  const html = items
    .map(function (item) {
      return `

            <div
              class="item-video-modal"
            >

              <div
                class="icon-video-modal"
              >

                <i
                  class="fa-solid fa-circle-play"
                ></i>

              </div>


              <div
                class="thong-tin-video-modal"
              >

                <h3
                  class="ten-video-modal"
                >
                  ${escapeHtml(item.tenTaiNguyen || "Video")}
                </h3>


                <p
                  class="mon-video-modal"
                >

                  ${escapeHtml(item?.hocPhan?.tenHocPhan || "")}

                  ${
                    item.thoiLuongGiay != null
                      ? ` • ${dinhDangThoiLuong(item.thoiLuongGiay)}`
                      : ""
                  }

                </p>

              </div>


              <button
                type="button"
                class="nut-mo-video-modal"
                data-id="${Number(item.idTaiNguyen)}"
              >

                <i
                  class="fa-solid fa-arrow-right"
                ></i>

              </button>

            </div>

          `;
    })
    .join("");

  moModalChung({
    tieuDe: "Tất cả video bài giảng",

    loai: `${items.length} video`,

    noiDung: `

        <div
          class="danh-sach-modal"
        >
          ${html}
        </div>

      `,
  });
}

/* =========================================================
   MODAL - XEM TẤT CẢ WEBSITE
========================================================= */

function moDanhSachModalWebsite() {
  const items = duLieuHoTroHocTap.website;

  const html = items
    .map(function (item) {
      return `

            <div
              class="item-website-modal"
            >

              <div
                class="icon-website-modal"
              >

                <i
                  class="fa-solid fa-globe"
                ></i>

              </div>


              <div
                class="thong-tin-website-modal"
              >

                <h3
                  class="ten-website-modal"
                >
                  ${escapeHtml(item.tenTaiNguyen || "Website")}
                </h3>


                <p
                  class="mo-ta-website-modal"
                >
                  ${escapeHtml(item.moTa || "")}
                </p>

              </div>


              <button
                type="button"
                class="nut-mo-website-modal"
                data-id="${Number(item.idTaiNguyen)}"
              >

                <i
                  class="fa-solid fa-arrow-right"
                ></i>

              </button>

            </div>

          `;
    })
    .join("");

  moModalChung({
    tieuDe: "Tất cả website tham khảo",

    loai: `${items.length} website`,

    noiDung: `

        <div
          class="danh-sach-modal"
        >
          ${html}
        </div>

      `,
  });
}

/* =========================================================
   MODAL - TẤT CẢ TÀI NGUYÊN NỔI BẬT
========================================================= */

function moDanhSachModalTaiNguyen() {
  const items = duLieuHoTroHocTap.noiBat;

  const html = items
    .map(function (item) {
      return `

            <div
              class="item-tai-nguyen-modal"
            >

              <div
                class="icon-tai-nguyen-modal"
              >

                <i
                  class="fa-solid fa-star"
                ></i>

              </div>


              <div
                class="thong-tin-tai-nguyen-modal"
              >

                <h3
                  class="ten-tai-nguyen-modal"
                >
                  ${escapeHtml(item.tenTaiNguyen || "Tài nguyên")}
                </h3>


                <p
                  class="mo-ta-tai-nguyen-modal"
                >
                  ${escapeHtml(item.moTa || "")}
                </p>

              </div>


              <button
                type="button"
                class="nut-mo-tai-nguyen-modal"
                data-id="${Number(item.idTaiNguyen)}"
              >

                <i
                  class="fa-solid fa-arrow-right"
                ></i>

              </button>

            </div>

          `;
    })
    .join("");

  moModalChung({
    tieuDe: "Tất cả tài nguyên nổi bật",

    loai: `${items.length} tài nguyên`,

    noiDung: `

        <div
          class="danh-sach-modal"
        >
          ${html}
        </div>

      `,
  });
}

/* =========================================================
   MODAL - TẤT CẢ MÔN HỌC
========================================================= */

function moDanhSachModalMonHoc() {
  const items = duLieuHoTroHocTap.monHoc;

  const html = items
    .map(function (item) {
      return `

            <div
              class="item-mon-hoc-modal"
            >

              <div
                class="icon-mon-hoc-modal"
              >

                <i
                  class="fa-solid fa-book-open"
                ></i>

              </div>


              <div
                class="thong-tin-mon-hoc-modal"
              >

                <h3
                  class="ten-mon-hoc-modal"
                >
                  ${escapeHtml(item.tenHocPhan || "Môn học")}
                </h3>


                <p
                  class="nhom-mon-hoc-modal"
                >

                  ${escapeHtml(item.khoiMon || "Khác")}

                  •
                  ${escapeHtml(item.maHocPhan || "")}

                </p>

              </div>


              <button
                type="button"
                class="nut-mo-mon-hoc-modal"
                data-id="${Number(item.idHocPhan)}"
              >

                <i
                  class="fa-solid fa-arrow-right"
                ></i>

              </button>

            </div>

          `;
    })
    .join("");

  moModalChung({
    tieuDe: "Danh mục môn học",

    loai: `${items.length} môn học`,

    noiDung: `

        <div
          class="danh-sach-modal"
        >
          ${html}
        </div>

      `,
  });
}

/* =========================================================
   EVENT MODAL ĐỘNG
========================================================= */

document.addEventListener("click", function (event) {
  const nut = event.target.closest(
    ".nut-mo-item-modal, " +
      ".nut-mo-video-modal, " +
      ".nut-mo-website-modal, " +
      ".nut-mo-tai-nguyen-modal, " +
      ".nut-mo-mon-hoc-modal",
  );

  if (!nut) {
    return;
  }

  const id = Number(nut.dataset.id);

  /* =====================================================
       TÀI LIỆU
    ===================================================== */

  if (nut.classList.contains("nut-mo-item-modal")) {
    const item = timTaiNguyenTheoId(id);

    if (!item) {
      return;
    }

    moTaiLieuTrongModal(
      item.tenTaiNguyen || "Tài liệu",

      item?.hocPhan?.tenHocPhan || "",

      taoURLTaiNguyen(item.duongDanFile || item.duongDanUrl || ""),
    );

    return;
  }

  /* =====================================================
       VIDEO
    ===================================================== */

  if (nut.classList.contains("nut-mo-video-modal")) {
    const item = timTaiNguyenTheoId(id);

    if (!item) {
      return;
    }

    moVideoTrongModal(
      item.tenTaiNguyen || "Video",

      item?.hocPhan?.tenHocPhan || "",

      taoURLTaiNguyen(item.duongDanFile || item.duongDanUrl || ""),
    );

    return;
  }

  /* =====================================================
       WEBSITE
    ===================================================== */

  if (nut.classList.contains("nut-mo-website-modal")) {
    const item = timTaiNguyenTheoId(id);

    moWebsite(item?.duongDanUrl || "");

    return;
  }

  /* =====================================================
       TÀI NGUYÊN
    ===================================================== */

  if (nut.classList.contains("nut-mo-tai-nguyen-modal")) {
    const item = timTaiNguyenTheoId(id);

    if (!item) {
      return;
    }

    moModalChung({
      tieuDe: item.tenTaiNguyen || "Tài nguyên",

      loai: "TÀI NGUYÊN NỔI BẬT",

      monHoc: item.loaiTaiNguyen || "",

      moTa: item.moTa || "",

      noiDung: `

            <div
              class="chi-tiet-tai-nguyen-modal"
            >

              <div
                class="dong-thong-tin-tai-nguyen-modal"
              >

                <i
                  class="fa-regular fa-eye"
                ></i>


                <div>

                  <span>
                    Lượt xem
                  </span>


                  <strong>
                    ${dinhDangSo(item.luotXem)}
                  </strong>

                </div>

              </div>

            </div>

          `,
    });

    return;
  }

  /* =====================================================
       MÔN HỌC
    ===================================================== */

  if (nut.classList.contains("nut-mo-mon-hoc-modal")) {
    const item = duLieuHoTroHocTap.monHoc.find(function (mon) {
      return Number(mon.idHocPhan) === id;
    });

    if (!item) {
      return;
    }

    moModalChung({
      tieuDe: item.tenHocPhan || "Môn học",

      loai: "MÔN HỌC",

      monHoc: item.maHocPhan || "",

      moTa: "Thông tin chi tiết môn học.",

      noiDung: `

            <div
              class="chi-tiet-mon-hoc-modal"
            >

              <div
                class="dong-thong-tin-mon-hoc-modal"
              >

                <i
                  class="fa-solid fa-book-open"
                ></i>


                <div>

                  <span
                    class="nhan-thong-tin-modal"
                  >
                    Mã môn
                  </span>


                  <strong>
                    ${escapeHtml(item.maHocPhan || "Chưa có")}
                  </strong>

                </div>

              </div>


              <div
                class="dong-thong-tin-mon-hoc-modal"
              >

                <i
                  class="fa-regular fa-file-lines"
                ></i>


                <div>

                  <span
                    class="nhan-thong-tin-modal"
                  >
                    Tài nguyên
                  </span>


                  <strong>
                    ${dinhDangSo(item.soTaiNguyen)}
                  </strong>

                </div>

              </div>


              <div
                class="dong-thong-tin-mon-hoc-modal"
              >

                <i
                  class="fa-solid fa-video"
                ></i>


                <div>

                  <span
                    class="nhan-thong-tin-modal"
                  >
                    Video
                  </span>


                  <strong>
                    ${dinhDangSo(item.soVideo)}
                  </strong>

                </div>

              </div>

            </div>

          `,
    });
  }
});

/* =========================================================
   CAROUSEL
========================================================= */

// =========================================================
// CAROUSEL
// =========================================================

const danhSachHamCapNhatMuiTen = [];

function ganCarousel(danhSach, nutTrai, nutPhai, selectorItem) {
  if (!danhSach || !nutTrai || !nutPhai) {
    return;
  }

  function capNhatMuiTen() {
    const maxScroll = Math.max(0, danhSach.scrollWidth - danhSach.clientWidth);

    const oDau = danhSach.scrollLeft <= 1;

    const oCuoi = danhSach.scrollLeft >= maxScroll - 1;

    // Không có nội dung để cuộn
    if (maxScroll <= 1) {
      nutTrai.style.opacity = "0";
      nutTrai.style.pointerEvents = "none";

      nutPhai.style.opacity = "0";
      nutPhai.style.pointerEvents = "none";

      return;
    }

    // Có nội dung
    nutTrai.style.opacity = oDau ? "0" : "1";

    nutTrai.style.pointerEvents = oDau ? "none" : "auto";

    nutPhai.style.opacity = oCuoi ? "0" : "1";

    nutPhai.style.pointerEvents = oCuoi ? "none" : "auto";
  }

  function layKhoangMotCard() {
    const card = danhSach.querySelector(selectorItem);

    if (!card) {
      return 0;
    }

    const style = window.getComputedStyle(danhSach);

    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;

    return card.offsetWidth + gap;
  }

  nutTrai.addEventListener("click", function () {
    const khoang = layKhoangMotCard();

    if (khoang <= 0) {
      return;
    }

    danhSach.scrollBy({
      left: -khoang,
      behavior: "smooth",
    });
  });

  nutPhai.addEventListener("click", function () {
    const khoang = layKhoangMotCard();

    if (khoang <= 0) {
      return;
    }

    danhSach.scrollBy({
      left: khoang,
      behavior: "smooth",
    });
  });

  danhSach.addEventListener("scroll", capNhatMuiTen, { passive: true });

  window.addEventListener("resize", capNhatMuiTen);

  danhSachHamCapNhatMuiTen.push(capNhatMuiTen);

  requestAnimationFrame(capNhatMuiTen);
}

// =========================================================
// CẬP NHẬT TOÀN BỘ MŨI TÊN SAU KHI API RENDER
// =========================================================

function capNhatTatCaMuiTenCarousel() {
  requestAnimationFrame(function () {
    danhSachHamCapNhatMuiTen.forEach(function (ham) {
      try {
        ham();
      } catch (error) {
        console.warn("Không thể cập nhật carousel:", error);
      }
    });
  });
}

ganCarousel(
  danhSachTaiLieu,

  document.getElementById("nut-tai-lieu-trai"),

  document.getElementById("nut-tai-lieu-phai"),

  ".the-tai-lieu",
);

ganCarousel(
  danhSachVideo,

  document.getElementById("nut-video-trai"),

  document.getElementById("nut-video-phai"),

  ".the-video",
);

ganCarousel(
  danhSachWebsite,

  document.getElementById("nut-website-trai"),

  document.getElementById("nut-website-phai"),

  ".the-website",
);

/* =========================================================
   PHÂN TRANG
========================================================= */

function taoPhanTrang({
  id,

  className,

  tongSoTrang,

  trangHienTai,

  onChange,

  selectorKhung,
}) {
  let khung = document.getElementById(id);

  if (!tongSoTrang) {
    khung?.remove();

    return;
  }

  if (!khung) {
    khung = document.createElement("div");

    khung.id = id;

    khung.className = className;

    document.querySelector(selectorKhung)?.appendChild(khung);
  }

  khung.innerHTML = "";

  for (let i = 1; i <= tongSoTrang; i++) {
    const nut = document.createElement("button");

    nut.type = "button";

    nut.className = className.replace("phan-trang", "nut-trang");

    nut.textContent = i;

    if (i === trangHienTai) {
      nut.classList.add("dang-chon");
    }

    nut.addEventListener("click", function () {
      onChange(i);

      document.querySelector(selectorKhung)?.scrollIntoView({
        behavior: "smooth",

        block: "start",
      });
    });

    khung.appendChild(nut);
  }
}

/* =========================================================
   LẤY ITEM KHÔNG BỊ TÌM KIẾM ẨN
========================================================= */

function layTaiLieuKhongBiAn() {
  return Array.from(document.querySelectorAll(".the-tai-lieu")).filter(
    function (item) {
      return !item.classList.contains("an-ket-qua-tim-kiem");
    },
  );
}

function layVideoKhongBiAn() {
  return Array.from(document.querySelectorAll(".the-video")).filter(
    function (item) {
      return !item.classList.contains("an-ket-qua-tim-kiem");
    },
  );
}

function layWebsiteKhongBiAn() {
  return Array.from(document.querySelectorAll(".the-website")).filter(
    function (item) {
      return !item.classList.contains("an-ket-qua-tim-kiem");
    },
  );
}

/* =========================================================
   HIỆN TRANG TÀI LIỆU
========================================================= */

function hienTrangTaiLieu() {
  if (!danhSachTaiLieu) {
    return;
  }

  const items = layTaiLieuKhongBiAn();

  const batDau = (trangTaiLieuHienTai - 1) * SO_TAI_LIEU_MOI_TRANG;

  const ketThuc = batDau + SO_TAI_LIEU_MOI_TRANG;

  document.querySelectorAll(".the-tai-lieu").forEach(function (item) {
    item.style.display = "none";
  });

  items.forEach(function (item, index) {
    if (index >= batDau && index < ketThuc) {
      item.style.display = "block";
    }
  });

  const tongSoTrang = Math.ceil(items.length / SO_TAI_LIEU_MOI_TRANG);

  if (tongSoTrang > 0 && trangTaiLieuHienTai > tongSoTrang) {
    trangTaiLieuHienTai = tongSoTrang;

    hienTrangTaiLieu();

    return;
  }

  taoPhanTrang({
    id: "phan-trang-tai-lieu",

    className: "phan-trang-tai-lieu",

    tongSoTrang: tongSoTrang,

    trangHienTai: trangTaiLieuHienTai,

    onChange: function (i) {
      trangTaiLieuHienTai = i;

      hienTrangTaiLieu();
    },

    selectorKhung: ".khung-danh-sach-tai-lieu",
  });
}

/* =========================================================
   HIỆN TRANG VIDEO
========================================================= */

function hienTrangVideo() {
  if (!danhSachVideo) {
    return;
  }

  const items = layVideoKhongBiAn();

  const batDau = (trangVideoHienTai - 1) * SO_VIDEO_MOI_TRANG;

  const ketThuc = batDau + SO_VIDEO_MOI_TRANG;

  document.querySelectorAll(".the-video").forEach(function (item) {
    item.style.display = "none";
  });

  items.forEach(function (item, index) {
    if (index >= batDau && index < ketThuc) {
      item.style.display = "";
    }
  });

  const tongSoTrang = Math.ceil(items.length / SO_VIDEO_MOI_TRANG);

  if (tongSoTrang > 0 && trangVideoHienTai > tongSoTrang) {
    trangVideoHienTai = tongSoTrang;

    hienTrangVideo();

    return;
  }

  taoPhanTrang({
    id: "phan-trang-video",

    className: "phan-trang-video",

    tongSoTrang: tongSoTrang,

    trangHienTai: trangVideoHienTai,

    onChange: function (i) {
      trangVideoHienTai = i;

      hienTrangVideo();
    },

    selectorKhung: ".khung-danh-sach-video",
  });
}

/* =========================================================
   HIỆN TRANG WEBSITE
========================================================= */

function hienTrangWebsite() {
  if (!danhSachWebsite) {
    return;
  }

  const items = layWebsiteKhongBiAn();

  const batDau = (trangWebsiteHienTai - 1) * SO_WEBSITE_MOI_TRANG;

  const ketThuc = batDau + SO_WEBSITE_MOI_TRANG;

  document.querySelectorAll(".the-website").forEach(function (item) {
    item.style.display = "none";
  });

  items.forEach(function (item, index) {
    if (index >= batDau && index < ketThuc) {
      item.style.display = "";
    }
  });

  const tongSoTrang = Math.ceil(items.length / SO_WEBSITE_MOI_TRANG);

  if (tongSoTrang > 0 && trangWebsiteHienTai > tongSoTrang) {
    trangWebsiteHienTai = tongSoTrang;

    hienTrangWebsite();

    return;
  }

  taoPhanTrang({
    id: "phan-trang-website",

    className: "phan-trang-website",

    tongSoTrang: tongSoTrang,

    trangHienTai: trangWebsiteHienTai,

    onChange: function (i) {
      trangWebsiteHienTai = i;

      hienTrangWebsite();
    },

    selectorKhung: ".khung-danh-sach-website",
  });
}

/* =========================================================
   BẬT PHÂN TRANG TÀI LIỆU
========================================================= */

function batCheDoPhanTrangTaiLieu() {
  document.querySelectorAll(".khu-vuc-tai-lieu").forEach(function (item) {
    item.style.display = "";
  });

  document
    .querySelectorAll(".khu-vuc-video, .khu-vuc-website")
    .forEach(function (item) {
      item.style.display = "none";
    });

  danhSachTaiLieu?.classList.add("chuyen-sang-phan-trang");

  document
    .getElementById("nut-tai-lieu-trai")
    ?.style.setProperty("display", "none");

  document
    .getElementById("nut-tai-lieu-phai")
    ?.style.setProperty("display", "none");

  trangTaiLieuHienTai = 1;

  hienTrangTaiLieu();
}

/* =========================================================
   TẮT PHÂN TRANG TÀI LIỆU
========================================================= */

function tatCheDoPhanTrangTaiLieu() {
  danhSachTaiLieu?.classList.remove("chuyen-sang-phan-trang");

  document.getElementById("nut-tai-lieu-trai")?.style.removeProperty("display");

  document.getElementById("nut-tai-lieu-phai")?.style.removeProperty("display");

  document.querySelectorAll(".the-tai-lieu").forEach(function (item) {
    item.style.display = "";
  });

  document.getElementById("phan-trang-tai-lieu")?.remove();
}

/* =========================================================
   BẬT PHÂN TRANG VIDEO
========================================================= */

function batCheDoPhanTrangVideo() {
  document
    .querySelectorAll(".khu-vuc-tai-lieu, .khu-vuc-website")
    .forEach(function (item) {
      item.style.display = "none";
    });

  document.querySelectorAll(".khu-vuc-video").forEach(function (item) {
    item.style.display = "";
  });

  danhSachVideo?.classList.add("chuyen-video-sang-phan-trang");

  document
    .getElementById("nut-video-trai")
    ?.style.setProperty("display", "none");

  document
    .getElementById("nut-video-phai")
    ?.style.setProperty("display", "none");

  trangVideoHienTai = 1;

  hienTrangVideo();
}

/* =========================================================
   TẮT PHÂN TRANG VIDEO
========================================================= */

function tatCheDoPhanTrangVideo() {
  danhSachVideo?.classList.remove("chuyen-video-sang-phan-trang");

  document.getElementById("nut-video-trai")?.style.removeProperty("display");

  document.getElementById("nut-video-phai")?.style.removeProperty("display");

  document.querySelectorAll(".the-video").forEach(function (item) {
    item.style.display = "";
  });

  document.getElementById("phan-trang-video")?.remove();
}

/* =========================================================
   BẬT PHÂN TRANG WEBSITE
========================================================= */

function batCheDoPhanTrangWebsite() {
  document
    .querySelectorAll(".khu-vuc-tai-lieu, .khu-vuc-video")
    .forEach(function (item) {
      item.style.display = "none";
    });

  document.querySelectorAll(".khu-vuc-website").forEach(function (item) {
    item.style.display = "";
  });

  danhSachWebsite?.classList.add("chuyen-website-sang-phan-trang");

  document
    .getElementById("nut-website-trai")
    ?.style.setProperty("display", "none");

  document
    .getElementById("nut-website-phai")
    ?.style.setProperty("display", "none");

  trangWebsiteHienTai = 1;

  hienTrangWebsite();
}

/* =========================================================
   TẮT PHÂN TRANG WEBSITE
========================================================= */

function tatCheDoPhanTrangWebsite() {
  danhSachWebsite?.classList.remove("chuyen-website-sang-phan-trang");

  document.getElementById("nut-website-trai")?.style.removeProperty("display");

  document.getElementById("nut-website-phai")?.style.removeProperty("display");

  document.querySelectorAll(".the-website").forEach(function (item) {
    item.style.display = "";
  });

  document.getElementById("phan-trang-website")?.remove();
}

/* =========================================================
   BỘ LỌC LOẠI
========================================================= */

function locTheoLoai(giaTri) {
  loaiTaiNguyenDangChon = giaTri;

  if (giaTri === "tat-ca") {
    tatCheDoPhanTrangTaiLieu();

    tatCheDoPhanTrangVideo();

    tatCheDoPhanTrangWebsite();

    document
      .querySelectorAll(
        ".khu-vuc-tai-lieu, " + ".khu-vuc-video, " + ".khu-vuc-website",
      )
      .forEach(function (item) {
        item.style.display = "";
      });

    return;
  }

  if (giaTri === "tai-lieu") {
    batCheDoPhanTrangTaiLieu();

    return;
  }

  if (giaTri === "video") {
    batCheDoPhanTrangVideo();

    return;
  }

  if (giaTri === "website") {
    batCheDoPhanTrangWebsite();

    return;
  }
}

/* =========================================================
   LẤY TÊN CARD
========================================================= */

function layTenCard(item) {
  return chuanHoaChuoi(
    item.querySelector(".ten-tai-lieu, " + ".ten-video, " + ".ten-website")
      ?.textContent || "",
  );
}

/* =========================================================
   SẮP XẾP MỘT DANH SÁCH
========================================================= */

function sapXepDanhSach(
  danhSach,

  selector,

  kieu,
) {
  if (!danhSach) {
    return;
  }

  const items = Array.from(danhSach.querySelectorAll(selector));

  if (kieu === "moi-nhat") {
    items.sort(function (a, b) {
      return (b.dataset.ngay || "").localeCompare(a.dataset.ngay || "");
    });
  } else if (kieu === "xem-nhieu") {
    items.sort(function (a, b) {
      const xemA = Number(
        a.dataset.luotXem ||
          a
            .querySelector(
              ".luot-xem-tai-lieu, " +
                ".luot-xem-video, " +
                ".luot-xem-website",
            )
            ?.textContent.replace(/[^0-9]/g, "") ||
          0,
      );

      const xemB = Number(
        b.dataset.luotXem ||
          b
            .querySelector(
              ".luot-xem-tai-lieu, " +
                ".luot-xem-video, " +
                ".luot-xem-website",
            )
            ?.textContent.replace(/[^0-9]/g, "") ||
          0,
      );

      return xemB - xemA;
    });
  } else if (kieu === "a-z") {
    items.sort(function (a, b) {
      return layTenCard(a).localeCompare(layTenCard(b), "vi");
    });
  } else if (kieu === "z-a") {
    items.sort(function (a, b) {
      return layTenCard(b).localeCompare(layTenCard(a), "vi");
    });
  }

  items.forEach(function (item) {
    danhSach.appendChild(item);
  });
}

/* =========================================================
   SẮP XẾP TÀI NGUYÊN
========================================================= */

function sapXepTaiNguyen(kieuSapXep) {
  kieuSapXepDangChon = kieuSapXep;

  sapXepDanhSach(
    danhSachTaiLieu,

    ".the-tai-lieu",

    kieuSapXep,
  );

  sapXepDanhSach(
    danhSachVideo,

    ".the-video",

    kieuSapXep,
  );

  sapXepDanhSach(
    danhSachWebsite,

    ".the-website",

    kieuSapXep,
  );

  if (danhSachTaiLieu?.classList.contains("chuyen-sang-phan-trang")) {
    trangTaiLieuHienTai = 1;

    hienTrangTaiLieu();
  }

  if (danhSachVideo?.classList.contains("chuyen-video-sang-phan-trang")) {
    trangVideoHienTai = 1;

    hienTrangVideo();
  }

  if (danhSachWebsite?.classList.contains("chuyen-website-sang-phan-trang")) {
    trangWebsiteHienTai = 1;

    hienTrangWebsite();
  }

  if (loaiTaiNguyenDangChon === "tat-ca") {
    danhSachTaiLieu?.scrollTo({
      left: 0,

      behavior: "smooth",
    });

    danhSachVideo?.scrollTo({
      left: 0,

      behavior: "smooth",
    });

    danhSachWebsite?.scrollTo({
      left: 0,

      behavior: "smooth",
    });
  }
}

/* =========================================================
   TÌM KIẾM
========================================================= */

function timKiemTaiNguyen() {
  const oNhapTimKiem = document.getElementById("o-nhap-tim-kiem");

  const tuKhoa = chuanHoaChuoi(oNhapTimKiem?.value || "");

  function kiemTra(
    selector,

    layNoiDung,
  ) {
    document.querySelectorAll(selector).forEach(function (item) {
      if (!tuKhoa) {
        item.classList.remove("an-ket-qua-tim-kiem");

        return;
      }

      const noiDung = chuanHoaChuoi(layNoiDung(item));

      item.classList.toggle(
        "an-ket-qua-tim-kiem",

        !noiDung.includes(tuKhoa),
      );
    });
  }

  kiemTra(
    ".the-tai-lieu",

    function (item) {
      return (
        `${item.querySelector(".ten-tai-lieu")?.textContent || ""} ` +
        `${item.querySelector(".mon-hoc-tai-lieu")?.textContent || ""}`
      );
    },
  );

  kiemTra(
    ".the-video",

    function (item) {
      return (
        `${item.querySelector(".ten-video")?.textContent || ""} ` +
        `${item.querySelector(".mon-hoc-video")?.textContent || ""}`
      );
    },
  );

  kiemTra(
    ".the-website",

    function (item) {
      return (
        `${item.querySelector(".ten-website")?.textContent || ""} ` +
        `${item.querySelector(".mo-ta-website")?.textContent || ""}`
      );
    },
  );

  kiemTra(
    ".the-mon-hoc",

    function (item) {
      return (
        `${item.querySelector(".ten-mon-hoc")?.textContent || ""} ` +
        `${item.querySelector(".ma-mon-hoc")?.textContent || ""}`
      );
    },
  );

  capNhatKhuVucSauKhiTimKiem();

  if (danhSachTaiLieu?.classList.contains("chuyen-sang-phan-trang")) {
    trangTaiLieuHienTai = 1;

    hienTrangTaiLieu();
  }

  if (danhSachVideo?.classList.contains("chuyen-video-sang-phan-trang")) {
    trangVideoHienTai = 1;

    hienTrangVideo();
  }

  if (danhSachWebsite?.classList.contains("chuyen-website-sang-phan-trang")) {
    trangWebsiteHienTai = 1;

    hienTrangWebsite();
  }
}

/* =========================================================
   CẬP NHẬT KHU VỰC SAU TÌM KIẾM
========================================================= */

function capNhatKhuVucSauKhiTimKiem() {
  function coKetQua(selector) {
    return Array.from(document.querySelectorAll(selector)).some(
      function (item) {
        return !item.classList.contains("an-ket-qua-tim-kiem");
      },
    );
  }

  const coTaiLieu = coKetQua(".the-tai-lieu");

  const coVideo = coKetQua(".the-video");

  const coWebsite = coKetQua(".the-website");

  function hien(selector, hienThi) {
    document.querySelectorAll(selector).forEach(function (item) {
      item.style.display = hienThi ? "" : "none";
    });
  }

  if (loaiTaiNguyenDangChon === "tat-ca") {
    hien(".khu-vuc-tai-lieu", coTaiLieu);

    hien(".khu-vuc-video", coVideo);

    hien(".khu-vuc-website", coWebsite);

    return;
  }

  hien(
    ".khu-vuc-tai-lieu",

    loaiTaiNguyenDangChon === "tai-lieu" && coTaiLieu,
  );

  hien(
    ".khu-vuc-video",

    loaiTaiNguyenDangChon === "video" && coVideo,
  );

  hien(
    ".khu-vuc-website",

    loaiTaiNguyenDangChon === "website" && coWebsite,
  );
}

/* =========================================================
   GÁN BỘ LỌC
========================================================= */

function ganSuKienBoLoc() {
  document.querySelectorAll(".bo-loc").forEach(function (boLoc) {
    const nut = boLoc.querySelector(".nut-bo-loc");

    const danhSach = boLoc.querySelector(".danh-sach-lua-chon");

    const ten = boLoc.querySelector(".ten-bo-loc");

    if (!nut || !danhSach || !ten) {
      return;
    }

    nut.addEventListener("click", function (event) {
      event.stopPropagation();

      document.querySelectorAll(".bo-loc").forEach(function (item) {
        if (item !== boLoc) {
          item.classList.remove("dang-mo");
        }
      });

      boLoc.classList.toggle("dang-mo");
    });

    danhSach.querySelectorAll(".lua-chon-bo-loc").forEach(function (luaChon) {
      luaChon.addEventListener("click", function (event) {
        event.stopPropagation();

        const giaTri = luaChon.dataset.giaTri;

        ten.textContent = luaChon.textContent.trim();

        boLoc.classList.remove("dang-mo");

        boLoc.dataset.giaTri = giaTri;

        if (nut.dataset.boLoc === "loai") {
          locTheoLoai(giaTri);
        }

        if (nut.dataset.boLoc === "sap-xep") {
          sapXepTaiNguyen(giaTri);
        }
      });
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".bo-loc").forEach(function (item) {
      item.classList.remove("dang-mo");
    });
  });
}

/* =========================================================
   GÁN LỌC MÔN HỌC
========================================================= */

function ganSuKienLocMonHoc() {
  document.querySelectorAll(".nut-loc-mon-hoc").forEach(function (nut) {
    nut.addEventListener("click", function () {
      document.querySelectorAll(".nut-loc-mon-hoc").forEach(function (item) {
        item.classList.remove("dang-chon");
      });

      nut.classList.add("dang-chon");

      const khoiMon = nut.dataset.khoiMon || "tat-ca";

      document.querySelectorAll(".the-mon-hoc").forEach(function (monHoc) {
        const loai = monHoc.dataset.khoiMon || "khac";

        monHoc.style.display =
          khoiMon === "tat-ca" || loai === khoiMon ? "flex" : "none";
      });
    });
  });
}

/* =========================================================
   GÁN TÌM KIẾM
========================================================= */

function ganSuKienTimKiem() {
  const input = document.getElementById("o-nhap-tim-kiem");

  const nut = document.getElementById("nut-tim-kiem");

  nut?.addEventListener("click", timKiemTaiNguyen);

  input?.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      timKiemTaiNguyen();
    }
  });
}

/* =========================================================
   NÚT XEM TẤT CẢ
========================================================= */

document
  .getElementById("nut-xem-tat-ca-tai-lieu")
  ?.addEventListener("click", moDanhSachModalTaiLieu);

document
  .getElementById("nut-xem-tat-ca-video")
  ?.addEventListener("click", moDanhSachModalVideo);

document
  .getElementById("nut-xem-tat-ca-website")
  ?.addEventListener("click", moDanhSachModalWebsite);

document
  .getElementById("nut-xem-tat-ca-tai-nguyen")
  ?.addEventListener("click", moDanhSachModalTaiNguyen);

document
  .getElementById("nut-xem-tat-ca-mon-hoc")
  ?.addEventListener("click", moDanhSachModalMonHoc);

/* =========================================================
   NÚT XEM THÊM
========================================================= */

function ganNutXemThem(idNut, idDanhSach, textMoRong) {
  const nut = document.getElementById(idNut);

  const danhSach = document.getElementById(idDanhSach);

  if (!nut || !danhSach) {
    return;
  }

  nut.addEventListener("click", function () {
    const dangMo = danhSach.classList.toggle("dang-mo-rong");

    nut.innerHTML = dangMo
      ? `
              Thu gọn
              <i
                class="fa-solid fa-chevron-up"
              ></i>
            `
      : `
              ${textMoRong}
              <i
                class="fa-solid fa-chevron-down"
              ></i>
            `;
  });
}

ganNutXemThem(
  "nut-xem-them-tai-nguyen",

  "danh-sach-tai-nguyen",

  "Xem thêm tài nguyên",
);

ganNutXemThem(
  "nut-xem-them-mon-hoc",

  "danh-sach-mon-hoc",

  "Xem thêm môn học",
);

/* =========================================================
   KHỞI TẠO
========================================================= */

async function khoiTaoHoTroHocTap() {
  console.log("[Hỗ trợ học tập] Bắt đầu tải dữ liệu API...");

  const thanhCong = await taiDuLieuHoTroHocTap();

  if (!thanhCong) {
    console.error("[Hỗ trợ học tập] Không thể tải dữ liệu API.");

    return;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  renderTaiLieuTuAPI();

  renderVideoTuAPI();

  renderWebsiteTuAPI();

  renderTaiNguyenNoiBatTuAPI();

  renderMonHocTuAPI();
  capNhatTatCaMuiTenCarousel();

  /* =======================================================
     THỐNG KÊ
  ======================================================= */

  hienThiThongKeTaiNguyen({
    tongTaiNguyen: duLieuHoTroHocTap.tatCa.length,

    tongTaiLieu: duLieuHoTroHocTap.taiLieu.length,

    tongVideo: duLieuHoTroHocTap.video.length,

    tongWebsite: duLieuHoTroHocTap.website.length,

    tongNoiBat: duLieuHoTroHocTap.noiBat.length,
  });

  /* =======================================================
     GÁN EVENT SAU KHI RENDER CARD
  ======================================================= */

  ganSuKienBoLoc();

  ganSuKienLocMonHoc();

  ganSuKienTimKiem();

  /* =======================================================
     RESET SCROLL
  ======================================================= */

  danhSachTaiLieu?.scrollTo({
    left: 0,

    behavior: "auto",
  });

  danhSachVideo?.scrollTo({
    left: 0,

    behavior: "auto",
  });

  danhSachWebsite?.scrollTo({
    left: 0,

    behavior: "auto",
  });

  console.log("[Hỗ trợ học tập] Đã render dữ liệu API.");
}

/* =========================================================
   DOM READY
========================================================= */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",

    khoiTaoHoTroHocTap,

    {
      once: true,
    },
  );
} else {
  khoiTaoHoTroHocTap();
}
