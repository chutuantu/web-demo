const express = require("express");

const { sql, layPool } = require("../config/database.js");

const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

/* ============================================================
   CẤU HÌNH
============================================================ */

const SO_BAN_GHI_MAC_DINH = 5;

const CAC_SO_BAN_GHI_CHO_PHEP = [5, 10];

/* ============================================================
   HÀM HỖ TRỢ CHUNG
============================================================ */

function so(value, defaultValue = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : defaultValue;
}

function lamTron(value, digits = 2) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(number.toFixed(digits));
}

function parseJSONArray(value) {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const ketQua = typeof value === "string" ? JSON.parse(value) : value;

    return Array.isArray(ketQua) ? ketQua : [];
  } catch (error) {
    return [];
  }
}

/* ============================================================
   ĐỌC GPA_LICH_SU AN TOÀN
============================================================ */

function docGPALichSu(giaTri) {
  if (giaTri === null || giaTri === undefined || giaTri === "") {
    return [];
  }

  let parsed;

  try {
    parsed = typeof giaTri === "string" ? JSON.parse(giaTri) : giaTri;
  } catch (error) {
    console.warn("Không thể đọc GPA_LICH_SU:", error.message);

    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map(function (item) {
      return Number(item);
    })
    .filter(function (item) {
      return Number.isFinite(item) && item >= 0 && item <= 4;
    })
    .map(function (item) {
      return Number(item.toFixed(2));
    });
}

/* ============================================================
   XÁC ĐỊNH NĂM HỌC

   HK1, HK2 -> năm 1
   HK3, HK4 -> năm 2
   HK5, HK6 -> năm 3
   HK7, HK8 -> năm 4
============================================================ */

function xacDinhNamHoc(hocKy) {
  const hk = Number(hocKy);

  if (!Number.isInteger(hk) || hk <= 0) {
    return null;
  }

  if (hk <= 2) {
    return 1;
  }

  if (hk <= 4) {
    return 2;
  }

  if (hk <= 6) {
    return 3;
  }

  return 4;
}

/* ============================================================
   XẾP LOẠI GPA
============================================================ */

function xepLoaiGPA(gpa) {
  const giaTri = Number(gpa);

  if (!Number.isFinite(giaTri)) {
    return "Chưa xác định";
  }

  if (giaTri >= 3.6) {
    return "Xuất sắc";
  }

  if (giaTri >= 3.2) {
    return "Giỏi";
  }

  if (giaTri >= 2.5) {
    return "Khá";
  }

  if (giaTri >= 2.0) {
    return "Trung bình";
  }

  return "Cảnh báo";
}

/* ============================================================
   XÁC ĐỊNH MỨC NGUY CƠ

   GPA < 2.00       -> Cao
   GPA 2.00 - <2.50 -> Trung bình
   GPA >= 2.50      -> Thấp
============================================================ */

function xacDinhMucNguyCo(gpa) {
  const giaTri = Number(gpa);

  if (!Number.isFinite(giaTri)) {
    return {
      mucDo: "Thấp",
      classNguyCo: "level-green",
    };
  }

  if (giaTri < 2.0) {
    return {
      mucDo: "Cao",
      classNguyCo: "level-red",
    };
  }

  if (giaTri < 2.5) {
    return {
      mucDo: "Trung bình",
      classNguyCo: "level-yellow",
    };
  }

  return {
    mucDo: "Thấp",
    classNguyCo: "level-green",
  };
}

/* ============================================================
   CHUẨN HÓA TÌM KIẾM TIẾNG VIỆT
============================================================ */

function chuanHoaTimKiem(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ============================================================
   TỶ LỆ NGUYÊN NHÂN
============================================================ */

function tinhTyLeNguyenNhan(danhSach) {
  const macDinh = [
    {
      ten: "Điểm chuyên cần thấp",
      phanTram: 0,
      className: "danger",
    },
    {
      ten: "Kết quả học tập giảm sút",
      phanTram: 0,
      className: "warning",
    },
    {
      ten: "Thiếu thời gian học tập",
      phanTram: 0,
      className: "warning",
    },
    {
      ten: "Khác",
      phanTram: 0,
      className: "success",
    },
  ];

  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    return macDinh;
  }

  let chuyenCanThap = 0;

  let gpaGiam = 0;

  let thieuThoiGian = 0;

  let khac = 0;

  danhSach.forEach(function (item) {
    const chuyenCan = Number(item.tyLeChuyenCan);

    const xuHuong = Number(item.xuHuongGPA);

    const gioTuHoc = Number(item.gioTuHocTuan);

    const gioLamThem = Number(item.gioLamThemTuan);

    if (Number.isFinite(chuyenCan) && chuyenCan < 85) {
      chuyenCanThap++;
      return;
    }

    if (Number.isFinite(xuHuong) && xuHuong < -0.03) {
      gpaGiam++;
      return;
    }

    if (
      (Number.isFinite(gioTuHoc) && gioTuHoc < 10) ||
      (Number.isFinite(gioLamThem) && gioLamThem > 20)
    ) {
      thieuThoiGian++;
      return;
    }

    khac++;
  });

  const tong = chuyenCanThap + gpaGiam + thieuThoiGian + khac;

  if (tong <= 0) {
    return macDinh;
  }

  const p1 = Math.round((chuyenCanThap / tong) * 100);

  const p2 = Math.round((gpaGiam / tong) * 100);

  const p3 = Math.round((thieuThoiGian / tong) * 100);

  let p4 = 100 - p1 - p2 - p3;

  if (p4 < 0) {
    p4 = 0;
  }

  return [
    {
      ten: "Điểm chuyên cần thấp",
      phanTram: p1,
      className: "danger",
    },
    {
      ten: "Kết quả học tập giảm sút",
      phanTram: p2,
      className: "warning",
    },
    {
      ten: "Thiếu thời gian học tập",
      phanTram: p3,
      className: "warning",
    },
    {
      ten: "Khác",
      phanTram: p4,
      className: "success",
    },
  ];
}

/* ============================================================
   LẤY GIẢNG VIÊN HIỆN TẠI
============================================================ */

async function layGiangVien(req, pool) {
  const idTaiKhoan = Number(req.taiKhoan?.idTaiKhoan);

  if (!Number.isInteger(idTaiKhoan) || idTaiKhoan <= 0) {
    return null;
  }

  const ketQua = await pool.request().input("ID_TAI_KHOAN", sql.Int, idTaiKhoan)
    .query(`
        SELECT
          ID_GIANG_VIEN,
          ID_TAI_KHOAN,
          MA_GIANG_VIEN,
          HO_TEN
        FROM GIANG_VIEN
        WHERE
          ID_TAI_KHOAN =
            @ID_TAI_KHOAN
      `);

  if (ketQua.recordset.length === 0) {
    return null;
  }

  return ketQua.recordset[0];
}

/* ============================================================
   LẤY TOÀN BỘ DỮ LIỆU PHỤ CHO CẢNH BÁO

   MỤC TIÊU:
   Không query từng sinh viên.

   Trả về:
   - GPA thực tế mới nhất
   - dự đoán học kỳ mới nhất
   - dự đoán HK tiếp theo mới nhất
============================================================ */

async function layDuLieuCanhBao(pool) {
  const sinhVienResult = await pool.request().query(`
        SELECT
          SV.ID_SINH_VIEN,
          SV.MA_SINH_VIEN,
          SV.HO_TEN,
          SV.NGAY_SINH,
          SV.GIOI_TINH,
          SV.NGANH_HOC,
          SV.LOP_HOC,
          SV.KHOA_HOC
        FROM SINH_VIEN SV
        WHERE
          EXISTS (
            SELECT 1
            FROM DU_DOAN_HOC_KY DDHK
            WHERE
              DDHK.ID_SINH_VIEN =
                SV.ID_SINH_VIEN
          )
          OR EXISTS (
            SELECT 1
            FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DDTT
            WHERE
              DDTT.ID_SINH_VIEN =
                SV.ID_SINH_VIEN
          )
        ORDER BY
          SV.HO_TEN ASC,
          SV.ID_SINH_VIEN ASC
      `);

  const danhSachSinhVien = sinhVienResult.recordset;

  if (danhSachSinhVien.length === 0) {
    return [];
  }

  /* ==========================================================
     GPA THỰC TẾ MỚI NHẤT CỦA TẤT CẢ SINH VIÊN
  ========================================================== */

  const gpaResult = await pool.request().query(`
        SELECT
          KQ.ID_SINH_VIEN,
          KQ.HOC_KY,
          KQ.NAM_HOC,
          KQ.GPA,
          KQ.TONG_TIN_CHI
        FROM KET_QUA_HOC_KY KQ
        INNER JOIN (
          SELECT
            ID_SINH_VIEN,
            MAX(
              CONCAT(
                RIGHT(
                  '0000' +
                  CAST(
                    HOC_KY
                    AS VARCHAR(4)
                  ),
                  4
                ),
                RIGHT(
                  '0000000000' +
                  CAST(
                    ID_KET_QUA
                    AS VARCHAR(10)
                  ),
                  10
                )
              )
            ) AS MAX_KEY
          FROM KET_QUA_HOC_KY
          WHERE
            GPA IS NOT NULL
          GROUP BY
            ID_SINH_VIEN
        ) M
          ON M.ID_SINH_VIEN =
             KQ.ID_SINH_VIEN
         AND M.MAX_KEY =
             CONCAT(
               RIGHT(
                 '0000' +
                 CAST(
                   KQ.HOC_KY
                   AS VARCHAR(4)
                 ),
                 4
               ),
               RIGHT(
                 '0000000000' +
                 CAST(
                   KQ.ID_KET_QUA
                   AS VARCHAR(10)
                 ),
                 10
               )
             )
        WHERE
          KQ.GPA IS NOT NULL
      `);

  const mapGPA = new Map();

  gpaResult.recordset.forEach(function (item) {
    mapGPA.set(Number(item.ID_SINH_VIEN), item);
  });

  /* ==========================================================
     DỰ ĐOÁN HỌC KỲ MỚI NHẤT
  ========================================================== */

  const duDoanHocKyResult = await pool.request().query(`
        SELECT
          D.ID_SINH_VIEN,
          D.ID_DU_DOAN,
          D.HOC_KY,
          D.NAM_HOC,
          D.GPA_DU_DOAN,
          D.DIEM_HE_10_DU_DOAN,
          D.XEP_LOAI,
          D.NGAY_DU_DOAN
        FROM DU_DOAN_HOC_KY D
        INNER JOIN (
          SELECT
            ID_SINH_VIEN,
            MAX(
              CONCAT(
                RIGHT(
                  '0000' +
                  CAST(
                    HOC_KY
                    AS VARCHAR(4)
                  ),
                  4
                ),
                CONVERT(
                  VARCHAR(30),
                  NGAY_DU_DOAN,
                  121
                ),
                RIGHT(
                  '0000000000' +
                  CAST(
                    ID_DU_DOAN
                    AS VARCHAR(10)
                  ),
                  10
                )
              )
            ) AS MAX_KEY
          FROM DU_DOAN_HOC_KY
          GROUP BY
            ID_SINH_VIEN
        ) M
          ON M.ID_SINH_VIEN =
             D.ID_SINH_VIEN
         AND M.MAX_KEY =
             CONCAT(
               RIGHT(
                 '0000' +
                 CAST(
                   D.HOC_KY
                   AS VARCHAR(4)
                 ),
                 4
               ),
               CONVERT(
                 VARCHAR(30),
                 D.NGAY_DU_DOAN,
                 121
               ),
               RIGHT(
                 '0000000000' +
                 CAST(
                   D.ID_DU_DOAN
                   AS VARCHAR(10)
                 ),
                 10
               )
             )
      `);

  const mapDuDoanHocKy = new Map();

  duDoanHocKyResult.recordset.forEach(function (item) {
    mapDuDoanHocKy.set(Number(item.ID_SINH_VIEN), item);
  });

  /* ==========================================================
     DỰ ĐOÁN GPA HK TIẾP THEO
  ========================================================== */

  const duDoanTiepTheoResult = await pool.request().query(`
        SELECT
          D.ID_SINH_VIEN,
          D.ID_DU_DOAN,
          D.HOC_KY_DU_DOAN,
          D.NAM_HOC_DU_DOAN,
          D.GPA_KY_GAN_NHAT,
          D.GPA_TRUNG_BINH_LICH_SU,
          D.XU_HUONG_GPA,
          D.SO_HOC_KY_DA_HOC,
          D.TIN_CHI_DANG_KY,
          D.GIO_TU_HOC_TUAN,
          D.TY_LE_CHUYEN_CAN,
          D.GIO_LAM_THEM_TUAN,
          D.GPA_DU_DOAN,
          D.DIEM_HE_10_DU_DOAN,
          D.XEP_LOAI,
          D.NHAN_DINH,
          D.LOI_KHUYEN,
          D.GPA_LICH_SU,
          D.NGAY_DU_DOAN
        FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO D
        INNER JOIN (
          SELECT
            ID_SINH_VIEN,
            MAX(
              CONCAT(
                CONVERT(
                  VARCHAR(30),
                  NGAY_DU_DOAN,
                  121
                ),
                RIGHT(
                  '0000000000' +
                  CAST(
                    ID_DU_DOAN
                    AS VARCHAR(10)
                  ),
                  10
                )
              )
            ) AS MAX_KEY
          FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO
          GROUP BY
            ID_SINH_VIEN
        ) M
          ON M.ID_SINH_VIEN =
             D.ID_SINH_VIEN
         AND M.MAX_KEY =
             CONCAT(
               CONVERT(
                 VARCHAR(30),
                 D.NGAY_DU_DOAN,
                 121
               ),
               RIGHT(
                 '0000000000' +
                 CAST(
                   D.ID_DU_DOAN
                   AS VARCHAR(10)
                 ),
                 10
               )
             )
      `);

  const mapDuDoanTiepTheo = new Map();

  duDoanTiepTheoResult.recordset.forEach(function (item) {
    mapDuDoanTiepTheo.set(Number(item.ID_SINH_VIEN), item);
  });

  /* ==========================================================
     GHÉP DỮ LIỆU
  ========================================================== */

  return danhSachSinhVien.map(function (sv) {
    const idSinhVien = Number(sv.ID_SINH_VIEN);

    const gpaRow = mapGPA.get(idSinhVien) || null;

    const hkRow = mapDuDoanHocKy.get(idSinhVien) || null;

    const ttRow = mapDuDoanTiepTheo.get(idSinhVien) || null;

    /* ======================================================
   GPA HIỆN TẠI

   ƯU TIÊN GIỐNG DANH SÁCH SINH VIÊN:

   1. GPA_LICH_SU cuối cùng
   2. KET_QUA_HOC_KY mới nhất
   3. GPA_KY_GAN_NHAT
====================================================== */

    let gpaThucTe = null;

    let hocKyHienTai = null;

    let namHocHienTai = null;

    let nguonGPAHienTai = null;

    /* ======================================================
   ƯU TIÊN GPA_LICH_SU
====================================================== */

    if (
      ttRow &&
      ttRow.GPA_LICH_SU !== null &&
      ttRow.GPA_LICH_SU !== undefined &&
      ttRow.GPA_LICH_SU !== ""
    ) {
      const gpaLichSu = docGPALichSu(ttRow.GPA_LICH_SU);

      if (gpaLichSu.length > 0) {
        gpaThucTe = gpaLichSu[gpaLichSu.length - 1];

        hocKyHienTai = gpaLichSu.length;

        namHocHienTai = ttRow.NAM_HOC_DU_DOAN || null;

        nguonGPAHienTai = "GPA_LICH_SU";
      }
    }

    /* ======================================================
   FALLBACK KET_QUA_HOC_KY
====================================================== */

    if (gpaThucTe === null && gpaRow) {
      gpaThucTe = lamTron(gpaRow.GPA, 2);

      hocKyHienTai = Number(gpaRow.HOC_KY);

      namHocHienTai = gpaRow.NAM_HOC || null;

      nguonGPAHienTai = "KET_QUA_HOC_KY";
    }

    /* ======================================================
   FALLBACK GPA KỲ GẦN NHẤT
====================================================== */

    if (
      gpaThucTe === null &&
      ttRow &&
      ttRow.GPA_KY_GAN_NHAT !== null &&
      ttRow.GPA_KY_GAN_NHAT !== undefined
    ) {
      gpaThucTe = lamTron(ttRow.GPA_KY_GAN_NHAT, 2);

      hocKyHienTai =
        ttRow.SO_HOC_KY_DA_HOC !== null && ttRow.SO_HOC_KY_DA_HOC !== undefined
          ? Number(ttRow.SO_HOC_KY_DA_HOC)
          : null;

      namHocHienTai = ttRow.NAM_HOC_DU_DOAN || null;

      nguonGPAHienTai = "GPA_KY_GAN_NHAT";
    }

    /* ======================================================
         DỰ ĐOÁN HỌC KỲ
      ====================================================== */

    let duDoanHocKy = null;

    if (hkRow) {
      duDoanHocKy = {
        idDuDoan: Number(hkRow.ID_DU_DOAN),

        hocKy: Number(hkRow.HOC_KY),

        namHoc: hkRow.NAM_HOC || null,

        gpa: lamTron(hkRow.GPA_DU_DOAN, 2),

        diemHe10: lamTron(hkRow.DIEM_HE_10_DU_DOAN, 2),

        xepLoai: hkRow.XEP_LOAI || null,

        ngayDuDoan: hkRow.NGAY_DU_DOAN || null,
      };
    }

    /* ======================================================
         DỰ ĐOÁN HK TIẾP THEO
      ====================================================== */

    let duDoanHocKyTiepTheo = null;

    if (ttRow) {
      const gpaLichSu = parseJSONArray(ttRow.GPA_LICH_SU);

      duDoanHocKyTiepTheo = {
        idDuDoan: Number(ttRow.ID_DU_DOAN),

        hocKy: Number(ttRow.HOC_KY_DU_DOAN),

        namHoc: ttRow.NAM_HOC_DU_DOAN || null,

        gpaKyGanNhat: lamTron(ttRow.GPA_KY_GAN_NHAT, 2),

        gpaTrungBinhLichSu: lamTron(ttRow.GPA_TRUNG_BINH_LICH_SU, 2),

        xuHuongGPA: lamTron(ttRow.XU_HUONG_GPA, 3),

        soHocKyDaHoc:
          ttRow.SO_HOC_KY_DA_HOC === null ? 0 : Number(ttRow.SO_HOC_KY_DA_HOC),

        tinChiDangKy:
          ttRow.TIN_CHI_DANG_KY === null ? null : Number(ttRow.TIN_CHI_DANG_KY),

        gioTuHocTuan: lamTron(ttRow.GIO_TU_HOC_TUAN, 2),

        tyLeChuyenCan: lamTron(ttRow.TY_LE_CHUYEN_CAN, 2),

        gioLamThemTuan: lamTron(ttRow.GIO_LAM_THEM_TUAN, 2),

        gpa: lamTron(ttRow.GPA_DU_DOAN, 2),

        diemHe10: lamTron(ttRow.DIEM_HE_10_DU_DOAN, 2),

        xepLoai: ttRow.XEP_LOAI || null,

        nhanDinh: parseJSONArray(ttRow.NHAN_DINH),

        loiKhuyen: parseJSONArray(ttRow.LOI_KHUYEN),

        gpaLichSu,

        ngayDuDoan: ttRow.NGAY_DU_DOAN || null,
      };

      /* ====================================================
           FALLBACK GPA THỰC TẾ
        ==================================================== */

      if (gpaThucTe === null) {
        if (gpaLichSu.length > 0) {
          gpaThucTe = lamTron(gpaLichSu[gpaLichSu.length - 1], 2);

          hocKyHienTai = gpaLichSu.length;
        } else if (
          ttRow.GPA_KY_GAN_NHAT !== null &&
          ttRow.GPA_KY_GAN_NHAT !== undefined
        ) {
          gpaThucTe = lamTron(ttRow.GPA_KY_GAN_NHAT, 2);

          hocKyHienTai = Number(ttRow.SO_HOC_KY_DA_HOC || 0);

          namHocHienTai = ttRow.NAM_HOC_DU_DOAN || null;
        }
      }
    }

    /* ======================================================
         FALLBACK DỰ ĐOÁN HỌC KỲ
      ====================================================== */

    if (gpaThucTe === null && duDoanHocKy) {
      gpaThucTe = duDoanHocKy.gpa;

      hocKyHienTai = duDoanHocKy.hocKy;

      namHocHienTai = duDoanHocKy.namHoc;
    }

    /* ======================================================
         NĂM HỌC
      ====================================================== */

    const namHoc = xacDinhNamHoc(hocKyHienTai);

    /* ======================================================
         GPA NGUY CƠ
      ====================================================== */

    let gpaNguyCo = gpaThucTe;

    let nguonNguyCo = "GPA thực tế";

    if (duDoanHocKyTiepTheo && duDoanHocKyTiepTheo.gpa !== null) {
      gpaNguyCo = duDoanHocKyTiepTheo.gpa;

      nguonNguyCo = "GPA học kỳ tiếp theo";
    } else if (duDoanHocKy && duDoanHocKy.gpa !== null) {
      gpaNguyCo = duDoanHocKy.gpa;

      nguonNguyCo = "GPA học kỳ";
    }

    const mucNguyCo = xacDinhMucNguyCo(gpaNguyCo);

    return {
      idSinhVien,

      maSinhVien: sv.MA_SINH_VIEN,

      hoTen: sv.HO_TEN,

      ngaySinh: sv.NGAY_SINH,

      gioiTinh: sv.GIOI_TINH,

      nganhHoc: sv.NGANH_HOC,

      lopHoc: sv.LOP_HOC,

      khoaHoc: sv.KHOA_HOC,

      hocKyHienTai,

      namHoc,

      namHocHienTai,

      gpaHocKy: gpaThucTe,

      gpaHienTai: gpaThucTe,

      nguonGPAHienTai: nguonGPAHienTai,

      xepLoaiHienTai: xepLoaiGPA(gpaThucTe),

      gpaNguyCo,

      nguonNguyCo,

      nguyCo: mucNguyCo.mucDo,

      classNguyCo: mucNguyCo.classNguyCo,

      duDoanHocKy,

      duDoanHocKyTiepTheo,

      daDuDoanHocKy: Boolean(duDoanHocKy),

      daDuDoanHocKyTiepTheo: Boolean(duDoanHocKyTiepTheo),
    };
  });
}

/* ============================================================
   LỌC THEO TỪ KHÓA
============================================================ */

function locSinhVien(danhSach, tuKhoa) {
  if (!tuKhoa) {
    return [...danhSach];
  }

  const tuKhoaChuanHoa = chuanHoaTimKiem(tuKhoa);

  return danhSach.filter(function (sv) {
    const chuoi = [sv.maSinhVien, sv.hoTen, sv.lopHoc, sv.khoaHoc, sv.nganhHoc]
      .filter(function (giaTri) {
        return giaTri !== null && giaTri !== undefined;
      })
      .join(" ");

    return chuanHoaTimKiem(chuoi).includes(tuKhoaChuanHoa);
  });
}

/* ============================================================
   SẮP XẾP NGUY CƠ
============================================================ */

function sapXepNguyCo(danhSach) {
  const thuTu = {
    Cao: 1,
    "Trung bình": 2,
    Thấp: 3,
  };

  return danhSach.sort(function (a, b) {
    const aLevel = thuTu[a.nguyCo] || 99;

    const bLevel = thuTu[b.nguyCo] || 99;

    if (aLevel !== bLevel) {
      return aLevel - bLevel;
    }

    const gpaA = Number(a.gpaNguyCo);

    const gpaB = Number(b.gpaNguyCo);

    if (Number.isFinite(gpaA) && Number.isFinite(gpaB)) {
      return gpaA - gpaB;
    }

    return String(a.hoTen || "").localeCompare(String(b.hoTen || ""), "vi");
  });
}

// ============================================================
// XU HƯỚNG SINH VIÊN NGUY CƠ CAO
//
// - Đếm SV duy nhất
// - Không đếm số lần dự đoán
// - Hiển thị liên tục HK1 -> HK8
// - HK không có dữ liệu = 0
// ============================================================

async function layXuHuongNguyCo(pool) {
  const ketQua = await pool.request().query(`
        SELECT
          X.HOC_KY,
          COUNT(*) AS SO_LUONG
        FROM
        (
          /* ================================================
             DỰ ĐOÁN HỌC KỲ
          ================================================= */

          SELECT DISTINCT
            DD.ID_SINH_VIEN,
            DD.HOC_KY
          FROM DU_DOAN_HOC_KY DD
          WHERE
            DD.GPA_DU_DOAN < 2.0

          UNION

          /* ================================================
             DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO
          ================================================= */

          SELECT DISTINCT
            DD.ID_SINH_VIEN,
            DD.HOC_KY_DU_DOAN AS HOC_KY
          FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DD
          WHERE
            DD.GPA_DU_DOAN < 2.0

        ) X

        WHERE
          X.HOC_KY IS NOT NULL

        GROUP BY
          X.HOC_KY

        ORDER BY
          X.HOC_KY ASC
      `);

  /* ==========================================================
     MAP DỮ LIỆU
  ========================================================== */

  const map = new Map();

  ketQua.recordset.forEach(function (item) {
    const hocKy = Number(item.HOC_KY);

    const soLuong = Number(item.SO_LUONG);

    map.set(hocKy, soLuong);
  });

  /* ==========================================================
     TẠO HK1 -> HK8
  ========================================================== */

  const xuHuong = [];

  for (let hocKy = 1; hocKy <= 8; hocKy++) {
    xuHuong.push({
      hocKy,

      soLuong: map.get(hocKy) || 0,
    });
  }

  return xuHuong;
}

/* ============================================================
   NGUYÊN NHÂN TỪ TẤT CẢ DỰ ĐOÁN
============================================================ */

function layDuLieuNguyenNhan(danhSach) {
  const ketQua = [];

  danhSach.forEach(function (sv) {
    const duDoan = sv.duDoanHocKyTiepTheo;

    if (!duDoan) {
      return;
    }

    ketQua.push({
      tyLeChuyenCan: duDoan.tyLeChuyenCan,

      xuHuongGPA: duDoan.xuHuongGPA,

      gioTuHocTuan: duDoan.gioTuHocTuan,

      gioLamThemTuan: duDoan.gioLamThemTuan,
    });
  });

  return ketQua;
}

/* ============================================================
   API CHÍNH
   GET /api/giang-vien/canh-bao-nguy-co
============================================================ */

router.get(
  "/canh-bao-nguy-co",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      /* ======================================================
         1. THAM SỐ
      ====================================================== */

      const tuKhoa =
        typeof req.query.tuKhoa === "string" ? req.query.tuKhoa.trim() : "";

      let trang = Number(req.query.trang) || 1;

      let soBanGhi = Number(req.query.soBanGhi) || SO_BAN_GHI_MAC_DINH;

      if (!Number.isInteger(trang) || trang < 1) {
        trang = 1;
      }

      if (!CAC_SO_BAN_GHI_CHO_PHEP.includes(soBanGhi)) {
        soBanGhi = SO_BAN_GHI_MAC_DINH;
      }

      /* ======================================================
         2. KIỂM TRA GIẢNG VIÊN
      ====================================================== */

      const giangVien = await layGiangVien(req, pool);

      if (!giangVien) {
        return res.status(404).json({
          thanhCong: false,

          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      /* ======================================================
         3. LẤY DỮ LIỆU
      ====================================================== */

      const danhSachSinhVien = await layDuLieuCanhBao(pool);

      /* ======================================================
         4. TÌM KIẾM
      ====================================================== */

      let danhSachLoc = locSinhVien(danhSachSinhVien, tuKhoa);

      /* ======================================================
         5. SẮP XẾP
      ====================================================== */

      danhSachLoc = sapXepNguyCo(danhSachLoc);

      /* ======================================================
         6. THỐNG KÊ
      ====================================================== */

      const tong = danhSachLoc.length;

      const nguyCoCao = danhSachLoc.filter(function (sv) {
        return sv.nguyCo === "Cao";
      }).length;

      const nguyCoTrungBinh = danhSachLoc.filter(function (sv) {
        return sv.nguyCo === "Trung bình";
      }).length;

      const nguyCoThap = danhSachLoc.filter(function (sv) {
        return sv.nguyCo === "Thấp";
      }).length;

      /* ======================================================
         7. PHẦN TRĂM
      ====================================================== */

      const phanTramCao =
        tong > 0 ? Number(((nguyCoCao / tong) * 100).toFixed(2)) : 0;

      const phanTramTrungBinh =
        tong > 0 ? Number(((nguyCoTrungBinh / tong) * 100).toFixed(2)) : 0;

      const phanTramThap =
        tong > 0 ? Number(((nguyCoThap / tong) * 100).toFixed(2)) : 0;

      /* ======================================================
         8. PHÂN TRANG
      ====================================================== */

      const tongSoTrang = tong === 0 ? 1 : Math.ceil(tong / soBanGhi);

      if (trang > tongSoTrang) {
        trang = tongSoTrang;
      }

      const batDau = (trang - 1) * soBanGhi;

      const ketThuc = batDau + soBanGhi;

      const sinhVienHienThi = danhSachLoc.slice(batDau, ketThuc);

      /* ======================================================
         9. XU HƯỚNG + NGUYÊN NHÂN

         Chạy song song.
      ====================================================== */

      const [xuHuong, nguyenNhan] = await Promise.all([
        layXuHuongNguyCo(pool),

        Promise.resolve(
          tinhTyLeNguyenNhan(layDuLieuNguyenNhan(danhSachSinhVien)),
        ),
      ]);

      /* ======================================================
         10. RESPONSE
      ====================================================== */

      return res.json({
        thanhCong: true,

        thongBao: "Đã tải dữ liệu cảnh báo nguy cơ.",

        thongKe: {
          tongSinhVien: tong,

          nguyCoCao,

          nguyCoTrungBinh,

          nguyCoThap,

          phanTramCao,

          phanTramTrungBinh,

          phanTramThap,
        },

        donut: {
          cao: nguyCoCao,

          trungBinh: nguyCoTrungBinh,

          thap: nguyCoThap,

          tong,
        },

        xuHuong,

        nguyenNhan,

        phanTrang: {
          trangHienTai: trang,

          soBanGhiMoiTrang: soBanGhi,

          tongSo: tong,

          tongSoTrang,

          tu: tong === 0 ? 0 : batDau + 1,

          den: Math.min(ketThuc, tong),
        },

        sinhVien: sinhVienHienThi,

        capNhatLuc: new Date().toISOString(),

        giangVien: {
          idGiangVien: Number(giangVien.ID_GIANG_VIEN),

          maGiangVien: giangVien.MA_GIANG_VIEN,

          hoTen: giangVien.HO_TEN,
        },
      });
    } catch (error) {
      console.error("LỖI API CẢNH BÁO NGUY CƠ:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể tải dữ liệu cảnh báo nguy cơ.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

/* ============================================================
   API CHI TIẾT
   GET /api/giang-vien/canh-bao-nguy-co/:id

   LOGIC GPA HIỆN TẠI GIỐNG 100% TRANG
   DANH SÁCH SINH VIÊN:

   1. Lấy GPA_LICH_SU của lần dự đoán
      GPA học kỳ tiếp theo mới nhất.

   2. Nếu GPA_LICH_SU có dữ liệu:
      GPA hiện tại = phần tử cuối.

   3. Nếu không có GPA_LICH_SU:
      GPA hiện tại = GPA thực tế học kỳ mới nhất.

   4. Học kỳ hiện tại đi cùng nguồn GPA.
============================================================ */

router.get(
  "/canh-bao-nguy-co/:id",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      /* ======================================================
         1. KIỂM TRA ID
      ====================================================== */

      const idSinhVien = Number(req.params.id);

      if (!Number.isInteger(idSinhVien) || idSinhVien <= 0) {
        return res.status(400).json({
          thanhCong: false,

          thongBao: "ID sinh viên không hợp lệ.",
        });
      }

      const pool = layPool();

      /* ======================================================
         2. THÔNG TIN SINH VIÊN
      ====================================================== */

      const sinhVienResult = await pool
        .request()
        .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT
              ID_SINH_VIEN,
              MA_SINH_VIEN,
              HO_TEN,
              NGAY_SINH,
              GIOI_TINH,
              NGANH_HOC,
              LOP_HOC,
              KHOA_HOC
            FROM SINH_VIEN
            WHERE
              ID_SINH_VIEN =
                @ID_SINH_VIEN
          `);

      if (sinhVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,

          thongBao: "Không tìm thấy sinh viên.",
        });
      }

      const sv = sinhVienResult.recordset[0];

      /* ======================================================
         3. GPA THỰC TẾ

         Đây là FALLBACK giống danh-sach-sinh-vien.js
      ====================================================== */

      const gpaResult = await pool
        .request()
        .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT
              ID_KET_QUA,
              HOC_KY,
              NAM_HOC,
              GPA,
              TONG_TIN_CHI

            FROM KET_QUA_HOC_KY

            WHERE
              ID_SINH_VIEN =
                @ID_SINH_VIEN

              AND GPA IS NOT NULL

            ORDER BY
              HOC_KY ASC,
              ID_KET_QUA ASC
          `);

      const gpaHocKyThucTe = gpaResult.recordset.map(function (item) {
        return {
          idKetQua: Number(item.ID_KET_QUA),

          hocKy: Number(item.HOC_KY),

          namHoc: item.NAM_HOC || null,

          gpa: lamTron(item.GPA, 2),

          tongTinChi:
            item.TONG_TIN_CHI === null || item.TONG_TIN_CHI === undefined
              ? null
              : Number(item.TONG_TIN_CHI),
        };
      });

      /* ======================================================
         4. DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO MỚI NHẤT
      ====================================================== */

      const duDoanTiepTheoResult = await pool
        .request()
        .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT TOP 1

              ID_DU_DOAN,

              HOC_KY_DU_DOAN,

              NAM_HOC_DU_DOAN,

              GPA_KY_GAN_NHAT,

              GPA_TRUNG_BINH_LICH_SU,

              XU_HUONG_GPA,

              SO_HOC_KY_DA_HOC,

              TIN_CHI_DANG_KY,

              GIO_TU_HOC_TUAN,

              TY_LE_CHUYEN_CAN,

              GIO_LAM_THEM_TUAN,

              GPA_DU_DOAN,

              DIEM_HE_10_DU_DOAN,

              XEP_LOAI,

              NHAN_DINH,

              LOI_KHUYEN,

              GPA_LICH_SU,

              NGAY_DU_DOAN

            FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO

            WHERE
              ID_SINH_VIEN =
                @ID_SINH_VIEN

            ORDER BY
              NGAY_DU_DOAN DESC,
              ID_DU_DOAN DESC
          `);

      let duDoanHocKyTiepTheo = null;

      let gpaLichSu = [];

      /* ======================================================
         5. ĐỌC GPA_LICH_SU
      ====================================================== */

      if (duDoanTiepTheoResult.recordset.length > 0) {
        const item = duDoanTiepTheoResult.recordset[0];

        gpaLichSu = docGPALichSu(item.GPA_LICH_SU);

        duDoanHocKyTiepTheo = {
          idDuDoan: Number(item.ID_DU_DOAN),

          hocKy: Number(item.HOC_KY_DU_DOAN),

          namHoc: item.NAM_HOC_DU_DOAN || null,

          gpaKyGanNhat: lamTron(item.GPA_KY_GAN_NHAT, 2),

          gpaTrungBinhLichSu: lamTron(item.GPA_TRUNG_BINH_LICH_SU, 2),

          xuHuongGPA: lamTron(item.XU_HUONG_GPA, 3),

          soHocKyDaHoc:
            item.SO_HOC_KY_DA_HOC === null
              ? null
              : Number(item.SO_HOC_KY_DA_HOC),

          tinChiDangKy:
            item.TIN_CHI_DANG_KY === null ? null : Number(item.TIN_CHI_DANG_KY),

          gioTuHocTuan: lamTron(item.GIO_TU_HOC_TUAN, 2),

          tyLeChuyenCan: lamTron(item.TY_LE_CHUYEN_CAN, 2),

          gioLamThemTuan: lamTron(item.GIO_LAM_THEM_TUAN, 2),

          gpa: lamTron(item.GPA_DU_DOAN, 2),

          diemHe10: lamTron(item.DIEM_HE_10_DU_DOAN, 2),

          xepLoai: item.XEP_LOAI || null,

          nhanDinh: parseJSONArray(item.NHAN_DINH),

          loiKhuyen: parseJSONArray(item.LOI_KHUYEN),

          gpaLichSu,

          ngayDuDoan: item.NGAY_DU_DOAN || null,
        };
      }

      /* ======================================================
         6. GPA HIỆN TẠI

         GIỐNG TRANG DANH SÁCH SINH VIÊN
      ====================================================== */

      let gpaHienTai = null;

      let hocKyHienTai = null;

      let namHocHienTai = null;

      let nguonGPAHienTai = "GPA thực tế";

      /* ======================================================
         ƯU TIÊN GPA_LICH_SU
      ====================================================== */

      if (gpaLichSu.length > 0) {
        const viTriCuoi = gpaLichSu.length - 1;

        gpaHienTai = lamTron(gpaLichSu[viTriCuoi], 2);

        hocKyHienTai = gpaLichSu.length;

        namHocHienTai = xacDinhNamHoc(hocKyHienTai);

        nguonGPAHienTai = "GPA_LICH_SU";
      }

      /* ======================================================
         FALLBACK KET_QUA_HOC_KY

         HOÀN TOÀN GIỐNG DANH SÁCH SINH VIÊN
      ====================================================== */

      if (gpaHienTai === null && gpaHocKyThucTe.length > 0) {
        const cuoi = gpaHocKyThucTe[gpaHocKyThucTe.length - 1];

        gpaHienTai = cuoi.gpa;

        hocKyHienTai = cuoi.hocKy;

        namHocHienTai = cuoi.namHoc || xacDinhNamHoc(hocKyHienTai);

        nguonGPAHienTai = "KET_QUA_HOC_KY";
      }

      /* ======================================================
         FALLBACK CUỐI

         Không có GPA thực tế thì dùng GPA kỳ gần nhất
         từ dự đoán GPA tiếp theo.
      ====================================================== */

      if (gpaHienTai === null && duDoanHocKyTiepTheo) {
        gpaHienTai = duDoanHocKyTiepTheo.gpaKyGanNhat;

        hocKyHienTai = duDoanHocKyTiepTheo.soHocKyDaHoc;

        namHocHienTai =
          duDoanHocKyTiepTheo.namHoc || xacDinhNamHoc(hocKyHienTai);

        nguonGPAHienTai = "GPA_KY_GAN_NHAT";
      }

      /* ======================================================
         7. DỰ ĐOÁN HỌC KỲ
      ====================================================== */

      const duDoanHocKyResult = await pool
        .request()
        .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT TOP 1

              ID_DU_DOAN,

              HOC_KY,

              NAM_HOC,

              GPA_DU_DOAN,

              DIEM_HE_10_DU_DOAN,

              XEP_LOAI,

              NGAY_DU_DOAN

            FROM DU_DOAN_HOC_KY

            WHERE
              ID_SINH_VIEN =
                @ID_SINH_VIEN

            ORDER BY
              NGAY_DU_DOAN DESC,
              ID_DU_DOAN DESC
          `);

      let duDoanHocKy = null;

      if (duDoanHocKyResult.recordset.length > 0) {
        const item = duDoanHocKyResult.recordset[0];

        duDoanHocKy = {
          idDuDoan: Number(item.ID_DU_DOAN),

          hocKy: Number(item.HOC_KY),

          namHoc: item.NAM_HOC || null,

          gpa: lamTron(item.GPA_DU_DOAN, 2),

          diemHe10: lamTron(item.DIEM_HE_10_DU_DOAN, 2),

          xepLoai: item.XEP_LOAI || null,

          ngayDuDoan: item.NGAY_DU_DOAN || null,
        };
      }

      /* ======================================================
         8. XẾP LOẠI HIỆN TẠI
      ====================================================== */

      const xepLoaiHienTai = xepLoaiGPA(gpaHienTai);

      /* ======================================================
         9. GPA NGUY CƠ
      ====================================================== */

      let gpaNguyCo = gpaHienTai;

      let nguonNguyCo = "GPA hiện tại";

      if (duDoanHocKyTiepTheo && duDoanHocKyTiepTheo.gpa !== null) {
        gpaNguyCo = duDoanHocKyTiepTheo.gpa;

        nguonNguyCo = "GPA học kỳ tiếp theo";
      } else if (duDoanHocKy && duDoanHocKy.gpa !== null) {
        gpaNguyCo = duDoanHocKy.gpa;

        nguonNguyCo = "GPA học kỳ";
      }

      const mucNguyCo = xacDinhMucNguyCo(gpaNguyCo);

      /* ======================================================
         10. NGUYÊN NHÂN
      ====================================================== */

      const nguyenNhan = [];

      if (duDoanHocKyTiepTheo) {
        const chuyenCan = Number(duDoanHocKyTiepTheo.tyLeChuyenCan);

        const xuHuong = Number(duDoanHocKyTiepTheo.xuHuongGPA);

        const tuHoc = Number(duDoanHocKyTiepTheo.gioTuHocTuan);

        const lamThem = Number(duDoanHocKyTiepTheo.gioLamThemTuan);

        if (Number.isFinite(chuyenCan) && chuyenCan < 85) {
          nguyenNhan.push("Tỷ lệ chuyên cần thấp.");
        }

        if (Number.isFinite(xuHuong) && xuHuong < -0.03) {
          nguyenNhan.push("GPA đang có xu hướng giảm.");
        }

        if (Number.isFinite(tuHoc) && tuHoc < 10) {
          nguyenNhan.push("Thời gian tự học mỗi tuần còn thấp.");
        }

        if (Number.isFinite(lamThem) && lamThem > 20) {
          nguyenNhan.push("Thời gian làm thêm khá cao.");
        }
      }

      if (nguyenNhan.length === 0) {
        nguyenNhan.push(
          "Chưa ghi nhận nguyên nhân nổi bật từ dữ liệu dự đoán.",
        );
      }

      /* ======================================================
         11. RESPONSE
      ====================================================== */

      return res.json({
        thanhCong: true,

        sinhVien: {
          idSinhVien,

          maSinhVien: sv.MA_SINH_VIEN,

          hoTen: sv.HO_TEN,

          ngaySinh: sv.NGAY_SINH,

          gioiTinh: sv.GIOI_TINH,

          nganhHoc: sv.NGANH_HOC,

          lopHoc: sv.LOP_HOC,

          khoaHoc: sv.KHOA_HOC,

          /* ================================================
             GPA GIỐNG DANH SÁCH SINH VIÊN
          ================================================= */

          gpaHienTai,

          hocKyHienTai,

          namHoc: namHocHienTai,

          nguonGPAHienTai,

          xepLoaiHienTai,

          /* ================================================
             NGUY CƠ
          ================================================= */

          gpaNguyCo,

          nguonNguyCo,

          nguyCo: mucNguyCo.mucDo,

          classNguyCo: mucNguyCo.classNguyCo,

          /* ================================================
             DỰ ĐOÁN
          ================================================= */

          duDoanHocKy,

          duDoanHocKyTiepTheo,

          /* ================================================
             NGUYÊN NHÂN
          ================================================= */

          nguyenNhan,
        },
      });
    } catch (error) {
      console.error("LỖI API CHI TIẾT CẢNH BÁO:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể tải chi tiết sinh viên.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;
