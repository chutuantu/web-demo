const express = require("express");

const { sql, layPool } = require("../config/database.js");

const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

/* ============================================================
   HÀM HỖ TRỢ
============================================================ */

function so(value, defaultValue = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : defaultValue;
}

function lamTron(value, digits = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Number(number.toFixed(digits));
}

function parseJSON(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function dinhDangJSONArray(value) {
  const parsed = parseJSON(value, []);

  return Array.isArray(parsed) ? parsed : [];
}

/* ============================================================
   XÁC ĐỊNH NĂM HỌC
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
  const value = Number(gpa);

  if (!Number.isFinite(value)) {
    return "Chưa xác định";
  }

  if (value >= 3.6) {
    return "Xuất sắc";
  }

  if (value >= 3.2) {
    return "Giỏi";
  }

  if (value >= 2.5) {
    return "Khá";
  }

  if (value >= 2.0) {
    return "Trung bình";
  }

  return "Yếu";
}

/* ============================================================
   XÁC ĐỊNH NGUY CƠ
============================================================ */

function xacDinhNguyCo(gpa) {
  const value = Number(gpa);

  if (!Number.isFinite(value)) {
    return "Thấp";
  }

  if (value < 2.0) {
    return "Cao";
  }

  if (value < 2.5) {
    return "Trung bình";
  }

  return "Thấp";
}

/* ============================================================
   TRẠNG THÁI NGUY CƠ
============================================================ */

function layTrangThaiNguyCo(gpa) {
  const value = Number(gpa);

  if (!Number.isFinite(value)) {
    return {
      nguyCo: "Thấp",
      classNguyCo: "thap",
    };
  }

  if (value < 2.0) {
    return {
      nguyCo: "Cao",
      classNguyCo: "cao",
    };
  }

  if (value < 2.5) {
    return {
      nguyCo: "Trung bình",
      classNguyCo: "trung-binh",
    };
  }

  return {
    nguyCo: "Thấp",
    classNguyCo: "thap",
  };
}

/* ============================================================
   AVATAR
============================================================ */

function layChuAvatar(hoTen) {
  const text = String(hoTen || "").trim();

  if (!text) {
    return "?";
  }

  const parts = text.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }

  return (
    parts[0].substring(0, 1).toUpperCase() +
    parts[parts.length - 1].substring(0, 1).toUpperCase()
  );
}

/* ============================================================
   LẤY GIẢNG VIÊN HIỆN TẠI
============================================================ */

async function layGiangVienHienTai(pool, req) {
  const idTaiKhoan = Number(req.taiKhoan?.idTaiKhoan);

  if (!Number.isInteger(idTaiKhoan) || idTaiKhoan <= 0) {
    return null;
  }

  const result = await pool.request().input("ID_TAI_KHOAN", sql.Int, idTaiKhoan)
    .query(`
      SELECT
        ID_GIANG_VIEN,
        ID_TAI_KHOAN,
        MA_GIANG_VIEN,
        HO_TEN,
        EMAIL,
        BO_MON
      FROM GIANG_VIEN
      WHERE
        ID_TAI_KHOAN = @ID_TAI_KHOAN
    `);

  if (result.recordset.length === 0) {
    return null;
  }

  return result.recordset[0];
}

/* ============================================================
   LẤY GPA LỊCH SỬ TỪ GPA_LICH_SU
============================================================ */

function layGPATheoLichSu(value) {
  const parsed = parseJSON(value, []);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map(function (giaTri) {
      return Number(giaTri);
    })
    .filter(function (giaTri) {
      return Number.isFinite(giaTri) && giaTri >= 0 && giaTri <= 4;
    })
    .map(function (giaTri) {
      return Number(giaTri.toFixed(2));
    });
}

/* ============================================================
   XÁC ĐỊNH GPA HIỆN TẠI
============================================================ */

function xacDinhGPAHienTai({
  gpaLichSu = [],
  gpaThucTe = null,
  gpaDuDoanHocKy = null,
  gpaDuDoanTiepTheoGanNhat = null,
}) {
  if (Array.isArray(gpaLichSu) && gpaLichSu.length > 0) {
    return lamTron(gpaLichSu[gpaLichSu.length - 1], 2);
  }

  if (
    gpaDuDoanTiepTheoGanNhat !== null &&
    gpaDuDoanTiepTheoGanNhat !== undefined &&
    Number.isFinite(Number(gpaDuDoanTiepTheoGanNhat))
  ) {
    return lamTron(gpaDuDoanTiepTheoGanNhat, 2);
  }

  if (
    gpaDuDoanHocKy !== null &&
    gpaDuDoanHocKy !== undefined &&
    Number.isFinite(Number(gpaDuDoanHocKy))
  ) {
    return lamTron(gpaDuDoanHocKy, 2);
  }

  if (
    gpaThucTe !== null &&
    gpaThucTe !== undefined &&
    Number.isFinite(Number(gpaThucTe))
  ) {
    return lamTron(gpaThucTe, 2);
  }

  return null;
}

/* ============================================================
   XÁC ĐỊNH HỌC KỲ HIỆN TẠI
============================================================ */

function xacDinhHocKyHienTai({
  gpaLichSu = [],
  hocKyThucTe = null,
  hocKyDuDoan = null,
  hocKyDuDoanTiepTheo = null,
}) {
  if (Array.isArray(gpaLichSu) && gpaLichSu.length > 0) {
    return gpaLichSu.length;
  }

  if (hocKyDuDoanTiepTheo !== null && hocKyDuDoanTiepTheo !== undefined) {
    const hk = Number(hocKyDuDoanTiepTheo);

    if (Number.isInteger(hk) && hk > 0) {
      return hk;
    }
  }

  if (hocKyDuDoan !== null && hocKyDuDoan !== undefined) {
    const hk = Number(hocKyDuDoan);

    if (Number.isInteger(hk) && hk > 0) {
      return hk;
    }
  }

  if (hocKyThucTe !== null && hocKyThucTe !== undefined) {
    const hk = Number(hocKyThucTe);

    if (Number.isInteger(hk) && hk > 0) {
      return hk;
    }
  }

  return null;
}

/* ============================================================
   TẠO DANH SÁCH GPA HIỂN THỊ CHO MODAL
============================================================ */

function taoDanhSachGPAHienThi(gpaLichSu, gpaThucTeList) {
  if (Array.isArray(gpaLichSu) && gpaLichSu.length > 0) {
    return gpaLichSu.map(function (gpa, index) {
      return {
        idKetQua: null,

        hocKy: index + 1,

        namHoc: xacDinhNamHoc(index + 1),

        gpa: lamTron(gpa, 2),

        tongTinChi: null,

        nguon: "du-doan-gpa",
      };
    });
  }

  if (Array.isArray(gpaThucTeList)) {
    return gpaThucTeList.map(function (item) {
      return {
        idKetQua: item.ID_KET_QUA,

        hocKy: Number(item.HOC_KY),

        namHoc: item.NAM_HOC || null,

        gpa: lamTron(item.GPA, 2),

        tongTinChi:
          item.TONG_TIN_CHI === null || item.TONG_TIN_CHI === undefined
            ? null
            : Number(item.TONG_TIN_CHI),

        nguon: "thuc-te",
      };
    });
  }

  return [];
}

/* ============================================================
   LẤY GPA THỰC TẾ CỦA TẤT CẢ SINH VIÊN

   Dùng 1 query thay vì query riêng từng sinh viên.
============================================================ */

async function layDanhSachGPAThucTe(pool) {
  const result = await pool.request().query(`
      SELECT
        ID_KET_QUA,
        ID_SINH_VIEN,
        HOC_KY,
        NAM_HOC,
        GPA,
        TONG_TIN_CHI
      FROM KET_QUA_HOC_KY
      WHERE
        GPA IS NOT NULL
      ORDER BY
        ID_SINH_VIEN ASC,
        HOC_KY ASC,
        ID_KET_QUA ASC
    `);

  const map = new Map();

  result.recordset.forEach(function (item) {
    const idSinhVien = Number(item.ID_SINH_VIEN);

    if (!map.has(idSinhVien)) {
      map.set(idSinhVien, []);
    }

    map.get(idSinhVien).push(item);
  });

  return map;
}

/* ============================================================
   LẤY SINH VIÊN + DỰ ĐOÁN

   ĐÂY LÀ HÀM QUAN TRỌNG NHẤT CỦA HOME.
============================================================ */

async function layDuLieuSinhVien(pool) {
  const result = await pool.request().query(`
      SELECT

        /* ====================================================
           SINH VIÊN
        ==================================================== */

        SV.ID_SINH_VIEN,
        SV.MA_SINH_VIEN,
        SV.HO_TEN,
        SV.NGAY_SINH,
        SV.GIOI_TINH,
        SV.NGANH_HOC,
        SV.LOP_HOC,
        SV.KHOA_HOC,

        /* ====================================================
           GPA THỰC TẾ GẦN NHẤT
        ==================================================== */

        KQ.HOC_KY
          AS HK_THUC_TE,

        KQ.NAM_HOC
          AS NAM_HOC_THUC_TE,

        KQ.GPA
          AS GPA_THUC_TE,

        /* ====================================================
           DỰ ĐOÁN GPA HỌC KỲ
        ==================================================== */

        DDHK.ID_DU_DOAN
          AS ID_DU_DOAN_HK,

        DDHK.HOC_KY
          AS HK_DU_DOAN_HK,

        DDHK.NAM_HOC
          AS NAM_HOC_DU_DOAN_HK,

        DDHK.GPA_DU_DOAN
          AS GPA_DU_DOAN_HK,

        DDHK.DIEM_HE_10_DU_DOAN
          AS DIEM_HE10_DU_DOAN_HK,

        DDHK.XEP_LOAI
          AS XEP_LOAI_DU_DOAN_HK,

        DDHK.NGAY_DU_DOAN
          AS NGAY_DU_DOAN_HK,

        /* ====================================================
           DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO
        ==================================================== */

        DDTT.ID_DU_DOAN
          AS ID_DU_DOAN_TT,

        DDTT.HOC_KY_DU_DOAN,

        DDTT.NAM_HOC_DU_DOAN,

        DDTT.GPA_KY_GAN_NHAT,

        DDTT.GPA_TRUNG_BINH_LICH_SU,

        DDTT.XU_HUONG_GPA,

        DDTT.SO_HOC_KY_DA_HOC,

        DDTT.TIN_CHI_DANG_KY,

        DDTT.GIO_TU_HOC_TUAN,

        DDTT.TY_LE_CHUYEN_CAN,

        DDTT.GIO_LAM_THEM_TUAN,

        DDTT.GPA_DU_DOAN
          AS GPA_DU_DOAN_TT,

        DDTT.DIEM_HE_10_DU_DOAN
          AS DIEM_HE10_DU_DOAN_TT,

        DDTT.XEP_LOAI
          AS XEP_LOAI_DU_DOAN_TT,

        DDTT.NHAN_DINH,

        DDTT.LOI_KHUYEN,

        DDTT.GPA_LICH_SU,

        DDTT.NGAY_DU_DOAN

      FROM SINH_VIEN SV

      /* ======================================================
         GPA THỰC TẾ MỚI NHẤT
      ====================================================== */

      OUTER APPLY (
        SELECT TOP 1

          KQ1.HOC_KY,

          KQ1.NAM_HOC,

          KQ1.GPA

        FROM KET_QUA_HOC_KY KQ1

        WHERE
          KQ1.ID_SINH_VIEN =
            SV.ID_SINH_VIEN

          AND KQ1.GPA IS NOT NULL

        ORDER BY
          KQ1.HOC_KY DESC,
          KQ1.ID_KET_QUA DESC
      ) KQ

      /* ======================================================
         DỰ ĐOÁN HỌC KỲ MỚI NHẤT
      ====================================================== */

      OUTER APPLY (
        SELECT TOP 1

          D1.ID_DU_DOAN,

          D1.HOC_KY,

          D1.NAM_HOC,

          D1.GPA_DU_DOAN,

          D1.DIEM_HE_10_DU_DOAN,

          D1.XEP_LOAI,

          D1.NGAY_DU_DOAN

        FROM DU_DOAN_HOC_KY D1

        WHERE
          D1.ID_SINH_VIEN =
            SV.ID_SINH_VIEN

        ORDER BY
          D1.HOC_KY DESC,
          D1.NGAY_DU_DOAN DESC,
          D1.ID_DU_DOAN DESC
      ) DDHK

      /* ======================================================
         DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO MỚI NHẤT
      ====================================================== */

      OUTER APPLY (
        SELECT TOP 1

          D2.ID_DU_DOAN,

          D2.HOC_KY_DU_DOAN,

          D2.NAM_HOC_DU_DOAN,

          D2.GPA_KY_GAN_NHAT,

          D2.GPA_TRUNG_BINH_LICH_SU,

          D2.XU_HUONG_GPA,

          D2.SO_HOC_KY_DA_HOC,

          D2.TIN_CHI_DANG_KY,

          D2.GIO_TU_HOC_TUAN,

          D2.TY_LE_CHUYEN_CAN,

          D2.GIO_LAM_THEM_TUAN,

          D2.GPA_DU_DOAN,

          D2.DIEM_HE_10_DU_DOAN,

          D2.XEP_LOAI,

          D2.NHAN_DINH,

          D2.LOI_KHUYEN,

          D2.GPA_LICH_SU,

          D2.NGAY_DU_DOAN

        FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO D2

        WHERE
          D2.ID_SINH_VIEN =
            SV.ID_SINH_VIEN

        ORDER BY
          D2.NGAY_DU_DOAN DESC,
          D2.ID_DU_DOAN DESC
      ) DDTT

      ORDER BY
        SV.HO_TEN ASC,
        SV.ID_SINH_VIEN ASC
    `);

  /* ============================================================
     LẤY GPA THỰC TẾ 1 LẦN
  ============================================================ */

  let mapGPAThucTe = new Map();

  try {
    mapGPAThucTe = await layDanhSachGPAThucTe(pool);
  } catch (error) {
    console.error("Lỗi lấy danh sách GPA thực tế:", error);
  }

  /* ============================================================
     XỬ LÝ DỮ LIỆU

     Không dùng await bên trong map nữa.
  ============================================================ */

  return result.recordset.map(function (item) {
    /* ======================================================
         GPA LỊCH SỬ
      ====================================================== */

    const gpaLichSu = layGPATheoLichSu(item.GPA_LICH_SU);

    /* ======================================================
         GPA THỰC TẾ
      ====================================================== */

    const gpaThucTe =
      item.GPA_THUC_TE !== null && item.GPA_THUC_TE !== undefined
        ? so(item.GPA_THUC_TE)
        : null;

    const hocKyThucTe =
      item.HK_THUC_TE !== null && item.HK_THUC_TE !== undefined
        ? so(item.HK_THUC_TE)
        : null;

    /* ======================================================
         GPA DỰ ĐOÁN HỌC KỲ
      ====================================================== */

    const gpaDuDoanHocKy =
      item.GPA_DU_DOAN_HK !== null && item.GPA_DU_DOAN_HK !== undefined
        ? so(item.GPA_DU_DOAN_HK)
        : null;

    /* ======================================================
         GPA DỰ ĐOÁN HỌC KỲ TIẾP THEO
      ====================================================== */

    const gpaDuDoanTiepTheo =
      item.GPA_DU_DOAN_TT !== null && item.GPA_DU_DOAN_TT !== undefined
        ? so(item.GPA_DU_DOAN_TT)
        : null;

    /* ======================================================
         GPA HIỆN TẠI
      ====================================================== */

    const gpaHienTai = xacDinhGPAHienTai({
      gpaLichSu,

      gpaThucTe,

      gpaDuDoanHocKy,

      gpaDuDoanTiepTheoGanNhat: gpaDuDoanTiepTheo,
    });

    /* ======================================================
         HỌC KỲ HIỆN TẠI
      ====================================================== */

    const hocKyHienTai = xacDinhHocKyHienTai({
      gpaLichSu,

      hocKyThucTe,

      hocKyDuDoan:
        item.HK_DU_DOAN_HK !== null && item.HK_DU_DOAN_HK !== undefined
          ? so(item.HK_DU_DOAN_HK)
          : null,

      hocKyDuDoanTiepTheo:
        item.HOC_KY_DU_DOAN !== null && item.HOC_KY_DU_DOAN !== undefined
          ? so(item.HOC_KY_DU_DOAN)
          : null,
    });

    /* ======================================================
         GPA THỰC TẾ CỦA SINH VIÊN

         Lấy từ Map đã query một lần.
      ====================================================== */

    const gpaThucTeList = mapGPAThucTe.get(Number(item.ID_SINH_VIEN)) || [];

    /* ======================================================
         GPA HIỂN THỊ MODAL
      ====================================================== */

    const gpaHocKy = taoDanhSachGPAHienThi(gpaLichSu, gpaThucTeList);

    /* ======================================================
         NĂM HỌC
      ====================================================== */

    const namHocHienTai = xacDinhNamHoc(hocKyHienTai);

    /* ======================================================
         GPA DÙNG ĐỂ TÍNH NGUY CƠ
      ====================================================== */

    let gpaNguyCo = gpaHienTai;

    let nguonNguyCo = "GPA hiện tại";

    if (gpaDuDoanTiepTheo !== null) {
      gpaNguyCo = gpaDuDoanTiepTheo;

      nguonNguyCo = "GPA dự đoán học kỳ tiếp theo";
    } else if (gpaDuDoanHocKy !== null) {
      gpaNguyCo = gpaDuDoanHocKy;

      nguonNguyCo = "GPA dự đoán học kỳ";
    }

    const trangThaiNguyCo = layTrangThaiNguyCo(gpaNguyCo);

    /* ======================================================
         DỰ ĐOÁN HỌC KỲ
      ====================================================== */

    const duDoanHocKy =
      gpaDuDoanHocKy !== null
        ? {
            idDuDoan: Number(item.ID_DU_DOAN_HK || 0),

            hocKy: Number(item.HK_DU_DOAN_HK || 0),

            namHoc: item.NAM_HOC_DU_DOAN_HK || null,

            gpa: lamTron(item.GPA_DU_DOAN_HK),

            diemHe10:
              item.DIEM_HE10_DU_DOAN_HK === null
                ? null
                : lamTron(item.DIEM_HE10_DU_DOAN_HK),

            xepLoai: item.XEP_LOAI_DU_DOAN_HK || null,

            ngayDuDoan: item.NGAY_DU_DOAN_HK || null,
          }
        : null;

    /* ======================================================
         DỰ ĐOÁN GPA TIẾP THEO
      ====================================================== */

    const duDoanHocKyTiepTheo =
      gpaDuDoanTiepTheo !== null
        ? {
            idDuDoan: Number(item.ID_DU_DOAN_TT || 0),

            hocKy: Number(item.HOC_KY_DU_DOAN || 0),

            namHoc: item.NAM_HOC_DU_DOAN || null,

            gpaKyGanNhat:
              item.GPA_KY_GAN_NHAT === null
                ? null
                : lamTron(item.GPA_KY_GAN_NHAT),

            gpaTrungBinhLichSu:
              item.GPA_TRUNG_BINH_LICH_SU === null
                ? null
                : lamTron(item.GPA_TRUNG_BINH_LICH_SU),

            xuHuongGPA:
              item.XU_HUONG_GPA === null ? null : lamTron(item.XU_HUONG_GPA, 3),

            soHocKyDaHoc: Number(item.SO_HOC_KY_DA_HOC || 0),

            tinChiDangKy:
              item.TIN_CHI_DANG_KY === null
                ? null
                : Number(item.TIN_CHI_DANG_KY),

            gioTuHocTuan:
              item.GIO_TU_HOC_TUAN === null
                ? null
                : lamTron(item.GIO_TU_HOC_TUAN),

            tyLeChuyenCan:
              item.TY_LE_CHUYEN_CAN === null
                ? null
                : lamTron(item.TY_LE_CHUYEN_CAN),

            gioLamThemTuan:
              item.GIO_LAM_THEM_TUAN === null
                ? null
                : lamTron(item.GIO_LAM_THEM_TUAN),

            gpa: lamTron(item.GPA_DU_DOAN),

            diemHe10:
              item.DIEM_HE_10_DU_DOAN === null
                ? null
                : lamTron(item.DIEM_HE_10_DU_DOAN),

            xepLoai: item.XEP_LOAI_DU_DOAN_TT || null,

            nhanDinh: dinhDangJSONArray(item.NHAN_DINH),

            loiKhuyen: dinhDangJSONArray(item.LOI_KHUYEN),

            gpaLichSu,

            ngayDuDoan: item.NGAY_DU_DOAN || null,
          }
        : null;

    /* ======================================================
         RETURN
      ====================================================== */

    return {
      idSinhVien: Number(item.ID_SINH_VIEN),

      maSinhVien: item.MA_SINH_VIEN,

      hoTen: item.HO_TEN,

      ngaySinh: item.NGAY_SINH,

      gioiTinh: item.GIOI_TINH,

      nganhHoc: item.NGANH_HOC,

      lopHoc: item.LOP_HOC,

      khoaHoc: item.KHOA_HOC,

      namHoc: namHocHienTai,

      hocKyHienTai,

      namHocHienTai:
        item.NAM_HOC_DU_DOAN ||
        item.NAM_HOC_DU_DOAN_HK ||
        item.NAM_HOC_THUC_TE ||
        null,

      gpaHienTai,

      xepLoaiHienTai: xepLoaiGPA(gpaHienTai),

      gpaNguyCo: gpaNguyCo !== null ? lamTron(gpaNguyCo, 2) : null,

      nguonNguyCo,

      nguyCo: trangThaiNguyCo.nguyCo,

      classNguyCo: trangThaiNguyCo.classNguyCo,

      gpaHocKy,

      duDoanHocKy,

      duDoanHocKyTiepTheo,
    };
  });
}

/* ============================================================
   TẠO DỮ LIỆU TREND
============================================================ */

function taoDuLieuXuHuong(danhSachSinhVien, soHocKy = 6) {
  const map = new Map();

  danhSachSinhVien.forEach(function (sv) {
    const duDoan = sv.duDoanHocKyTiepTheo;

    if (!duDoan) {
      return;
    }

    const gpaLichSu = Array.isArray(duDoan.gpaLichSu) ? duDoan.gpaLichSu : [];

    gpaLichSu.forEach(function (gpaRaw, index) {
      const hocKy = index + 1;

      const gpa = Number(gpaRaw);

      if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
        return;
      }

      if (!map.has(hocKy)) {
        map.set(hocKy, {
          hocKy,

          tongSinhVien: 0,

          tongGPA: 0,

          soKhaGioi: 0,

          soNguyCo: 0,
        });
      }

      const item = map.get(hocKy);

      item.tongSinhVien += 1;

      item.tongGPA += gpa;

      if (gpa >= 2.5) {
        item.soKhaGioi += 1;
      } else {
        item.soNguyCo += 1;
      }
    });
  });

  return Array.from(map.values())
    .sort(function (a, b) {
      return a.hocKy - b.hocKy;
    })
    .map(function (item) {
      const gpaTrungBinh =
        item.tongSinhVien > 0 ? item.tongGPA / item.tongSinhVien : 0;

      const tiLeKhaGioi =
        item.tongSinhVien > 0 ? (item.soKhaGioi / item.tongSinhVien) * 100 : 0;

      const tiLeNguyCo =
        item.tongSinhVien > 0 ? (item.soNguyCo / item.tongSinhVien) * 100 : 0;

      return {
        hocKy: item.hocKy,

        nhan: `HK${item.hocKy}`,

        tongSinhVien: item.tongSinhVien,

        gpaTrungBinh: lamTron(gpaTrungBinh, 2),

        tiLeKhaGioi: lamTron(tiLeKhaGioi, 2),

        tiLeNguyCo: lamTron(tiLeNguyCo, 2),
      };
    })
    .slice(-Math.max(1, Number(soHocKy) || 6));
}

/* ============================================================
   PHÂN BỐ XẾP LOẠI
============================================================ */

function taoPhanBoXepLoai(danhSachSinhVien) {
  const ketQua = {
    "Xuất sắc": 0,
    Giỏi: 0,
    Khá: 0,
    "Trung bình": 0,
    Yếu: 0,
  };

  danhSachSinhVien.forEach(function (sv) {
    const gpa = sv.gpaHienTai;

    if (gpa === null || gpa === undefined) {
      return;
    }

    const xepLoai = xepLoaiGPA(gpa);

    if (Object.prototype.hasOwnProperty.call(ketQua, xepLoai)) {
      ketQua[xepLoai]++;
    }
  });

  const tong = Object.values(ketQua).reduce(function (tong, value) {
    return tong + value;
  }, 0);

  return [
    {
      id: "xuat-sac",

      ten: "Xuất sắc",

      soLuong: ketQua["Xuất sắc"],

      phanTram: tong > 0 ? lamTron((ketQua["Xuất sắc"] / tong) * 100, 1) : 0,
    },

    {
      id: "gioi",

      ten: "Giỏi",

      soLuong: ketQua["Giỏi"],

      phanTram: tong > 0 ? lamTron((ketQua["Giỏi"] / tong) * 100, 1) : 0,
    },

    {
      id: "kha",

      ten: "Khá",

      soLuong: ketQua["Khá"],

      phanTram: tong > 0 ? lamTron((ketQua["Khá"] / tong) * 100, 1) : 0,
    },

    {
      id: "trung-binh",

      ten: "Trung bình",

      soLuong: ketQua["Trung bình"],

      phanTram: tong > 0 ? lamTron((ketQua["Trung bình"] / tong) * 100, 1) : 0,
    },

    {
      id: "yeu",

      ten: "Yếu",

      soLuong: ketQua["Yếu"],

      phanTram: tong > 0 ? lamTron((ketQua["Yếu"] / tong) * 100, 1) : 0,
    },
  ];
}

/* ============================================================
   NGUYÊN NHÂN
============================================================ */

function layNguyenNhan(sv) {
  const duDoan = sv.duDoanHocKyTiepTheo;

  if (!duDoan) {
    return "Chưa có dữ liệu dự đoán chi tiết";
  }

  const ketQua = [];

  if (duDoan.tyLeChuyenCan !== null && Number(duDoan.tyLeChuyenCan) < 85) {
    ketQua.push("Chuyên cần thấp");
  }

  if (duDoan.xuHuongGPA !== null && Number(duDoan.xuHuongGPA) < -0.03) {
    ketQua.push("GPA có xu hướng giảm");
  }

  if (duDoan.gioTuHocTuan !== null && Number(duDoan.gioTuHocTuan) < 10) {
    ketQua.push("Thời gian tự học thấp");
  }

  if (duDoan.gioLamThemTuan !== null && Number(duDoan.gioLamThemTuan) > 20) {
    ketQua.push("Thời gian làm thêm cao");
  }

  if (ketQua.length === 0) {
    return "GPA dự đoán thấp";
  }

  return ketQua.join(", ");
}

/* ============================================================
   FORMAT SINH VIÊN HOME
============================================================ */

function formatSinhVienHome(sv) {
  return {
    idSinhVien: sv.idSinhVien,

    maSinhVien: sv.maSinhVien,

    hoTen: sv.hoTen,

    lopHoc: sv.lopHoc,

    khoaHoc: sv.khoaHoc,

    nganhHoc: sv.nganhHoc,

    avatar: layChuAvatar(sv.hoTen),

    gpa: sv.gpaNguyCo !== null ? lamTron(sv.gpaNguyCo, 2) : null,

    gpaHienTai: sv.gpaHienTai,

    xepLoai: sv.xepLoaiHienTai,

    nguyCo: sv.nguyCo,

    phanTramNguyCo:
      sv.gpaNguyCo !== null
        ? lamTron(Math.max(0, Math.min(100, (2.5 - sv.gpaNguyCo) * 40 + 50)), 0)
        : 0,

    nguyenNhan: layNguyenNhan(sv),

    xepLoaiDuDoan:
      sv.duDoanHocKyTiepTheo?.xepLoai || sv.duDoanHocKy?.xepLoai || null,

    duDoanHocKyTiepTheo: sv.duDoanHocKyTiepTheo
      ? {
          hocKy: sv.duDoanHocKyTiepTheo.hocKy,

          gpa: sv.duDoanHocKyTiepTheo.gpa,

          xepLoai: sv.duDoanHocKyTiepTheo.xepLoai,

          gpaLichSu: sv.duDoanHocKyTiepTheo.gpaLichSu,
        }
      : null,
  };
}

/* ============================================================
   API 1
   GET /api/giang-vien/home
============================================================ */

router.get(
  "/home",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      /* ======================================================
         GIẢNG VIÊN
      ====================================================== */

      const giangVien = await layGiangVienHienTai(pool, req);

      if (!giangVien) {
        return res.status(404).json({
          thanhCong: false,

          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      /* ======================================================
         SINH VIÊN
      ====================================================== */

      const danhSachSinhVien = await layDuLieuSinhVien(pool);

      /* ======================================================
         TỔNG SINH VIÊN
      ====================================================== */

      const tongSinhVienResult = await pool.request().query(`
            SELECT
              COUNT(*) AS TONG_SINH_VIEN
            FROM SINH_VIEN
          `);

      const tongSinhVien = Number(
        tongSinhVienResult.recordset[0]?.TONG_SINH_VIEN || 0,
      );

      /* ======================================================
         TỔNG LƯỢT DỰ ĐOÁN
      ====================================================== */

      const tongDuDoanResult = await pool.request().query(`
            SELECT
              (
                SELECT COUNT(*)
                FROM DU_DOAN_DIEM_HOC_PHAN
              )
              +
              (
                SELECT COUNT(*)
                FROM DU_DOAN_HOC_KY
              )
              +
              (
                SELECT COUNT(*)
                FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO
              )
              AS TONG_LUOT_DU_DOAN
          `);

      const tongLuotDuDoan = Number(
        tongDuDoanResult.recordset[0]?.TONG_LUOT_DU_DOAN || 0,
      );

      /* ======================================================
         TÀI LIỆU
      ====================================================== */

      const taiLieuResult = await pool
        .request()
        .input("ID_GIANG_VIEN", sql.Int, Number(giangVien.ID_GIANG_VIEN))
        .query(`
            SELECT
              COUNT(*) AS TONG_TAI_LIEU
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
              ID_GIANG_VIEN =
                @ID_GIANG_VIEN

              AND TRANG_THAI = 1
          `);

      const tongTaiLieu = Number(
        taiLieuResult.recordset[0]?.TONG_TAI_LIEU || 0,
      );

      /* ======================================================
         NGUY CƠ
      ====================================================== */

      const danhSachHome = danhSachSinhVien
        .filter(function (sv) {
          return sv.gpaNguyCo !== null;
        })
        .map(formatSinhVienHome);

      const sinhVienNguyCoCao = danhSachHome.filter(function (sv) {
        return sv.nguyCo === "Cao";
      });

      const sinhVienNguyCoTrungBinh = danhSachHome.filter(function (sv) {
        return sv.nguyCo === "Trung bình";
      });

      const tongNguyCo =
        sinhVienNguyCoCao.length + sinhVienNguyCoTrungBinh.length;

      /* ======================================================
         PHÂN BỐ
      ====================================================== */

      const phanBoXepLoai = taoPhanBoXepLoai(danhSachSinhVien);

      /* ======================================================
         TREND
      ====================================================== */

      const xuHuong = taoDuLieuXuHuong(danhSachSinhVien, 6);

      /* ======================================================
         TRUY CẬP
      ====================================================== */

      const tongTruyCapResult = await pool.request().query(`
            SELECT
              COUNT(*) AS TONG_TRUY_CAP
            FROM LICH_SU_TRUY_CAP
          `);

      const dangOnlineResult = await pool.request().query(`
            SELECT
              COUNT(*) AS DANG_ONLINE
            FROM PHIEN_DANG_NHAP
            WHERE
              DANG_ONLINE = 1
              AND THOI_GIAN_HOAT_DONG_CUOI >=
                  DATEADD(
                    MINUTE,
                    -5,
                    SYSDATETIME()
                  )
          `);

      const tongSinhVienAccountResult = await pool.request().query(`
            SELECT
              COUNT(*) AS SO_LUONG
            FROM TAI_KHOAN
            WHERE
              VAI_TRO = 'SINH_VIEN'
              AND TRANG_THAI = 1
          `);

      const tongGiangVienAccountResult = await pool.request().query(`
            SELECT
              COUNT(*) AS SO_LUONG
            FROM TAI_KHOAN
            WHERE
              VAI_TRO = 'GIANG_VIEN'
              AND TRANG_THAI = 1
          `);

      /* ======================================================
         NHẬT KÝ
      ====================================================== */

      const hoatDong = await layHoatDong(
        pool,
        Number(giangVien.ID_GIANG_VIEN),
        5,
      );

      /* ======================================================
         RESPONSE
      ====================================================== */

      return res.json({
        thanhCong: true,

        giangVien: {
          idGiangVien: Number(giangVien.ID_GIANG_VIEN),

          maGiangVien: giangVien.MA_GIANG_VIEN,

          hoTen: giangVien.HO_TEN,

          email: giangVien.EMAIL,

          boMon: giangVien.BO_MON,
        },

        thongKe: {
          tongSinhVien,

          sinhVienNguyCoCao: sinhVienNguyCoCao.length,

          luotDuDoan: tongLuotDuDoan,

          taiLieuDaDang: tongTaiLieu,

          tongNguyCo,

          tongSinhVienCoDuDoan: danhSachHome.length,

          sinhVienNguyCoTrungBinh: sinhVienNguyCoTrungBinh.length,
        },

        xuHuong,

        phanBoXepLoai,

        sinhVienNguyCoCao: sinhVienNguyCoCao.slice(0, 5),

        sinhVienNguyCoTrungBinh: sinhVienNguyCoTrungBinh.slice(0, 5),

        tongSinhVienNguyCoCao: sinhVienNguyCoCao.length,

        tongSinhVienNguyCoTrungBinh: sinhVienNguyCoTrungBinh.length,

        hoatDong,

        thongKeTruyCap: {
          tongTruyCap: Number(
            tongTruyCapResult.recordset[0]?.TONG_TRUY_CAP || 0,
          ),

          dangOnline: Number(dangOnlineResult.recordset[0]?.DANG_ONLINE || 0),

          sinhVien: Number(
            tongSinhVienAccountResult.recordset[0]?.SO_LUONG || 0,
          ),

          giangVien: Number(
            tongGiangVienAccountResult.recordset[0]?.SO_LUONG || 0,
          ),
        },

        capNhatLuc: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Lỗi API home giảng viên:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể tải dữ liệu trang chủ giảng viên.",

        /* Chỉ dùng khi cần debug.
           Có thể xóa dòng error khi deploy. */
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

/* ============================================================
   API 2
   GET /api/giang-vien/home/xu-huong
============================================================ */

router.get(
  "/home/xu-huong",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      let soHocKy = Number(req.query.soHocKy);

      if (![3, 4, 6].includes(soHocKy)) {
        soHocKy = 6;
      }

      const danhSach = await layDuLieuSinhVien(pool);

      const xuHuong = taoDuLieuXuHuong(danhSach, soHocKy);

      return res.json({
        thanhCong: true,

        soHocKy,

        xuHuong,
      });
    } catch (error) {
      console.error("Lỗi API xu hướng:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể tải xu hướng kết quả học tập.",
      });
    }
  },
);

/* ============================================================
   API 3
   GET /api/giang-vien/home/nguy-co
============================================================ */

router.get(
  "/home/nguy-co",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      const mucDo = String(req.query.mucDo || "cao").toLowerCase();

      const danhSach = await layDuLieuSinhVien(pool);

      let danhSachNguyCo = danhSach
        .filter(function (sv) {
          return sv.nguyCo === "Cao" || sv.nguyCo === "Trung bình";
        })
        .map(formatSinhVienHome);

      if (mucDo === "cao") {
        danhSachNguyCo = danhSachNguyCo.filter(function (sv) {
          return sv.nguyCo === "Cao";
        });
      } else if (mucDo === "trung-binh") {
        danhSachNguyCo = danhSachNguyCo.filter(function (sv) {
          return sv.nguyCo === "Trung bình";
        });
      }

      /* ======================================================
         CAO TRƯỚC
      ====================================================== */

      danhSachNguyCo.sort(function (a, b) {
        const thuTuA = a.nguyCo === "Cao" ? 1 : 2;

        const thuTuB = b.nguyCo === "Cao" ? 1 : 2;

        if (thuTuA !== thuTuB) {
          return thuTuA - thuTuB;
        }

        return Number(a.gpa || 99) - Number(b.gpa || 99);
      });

      return res.json({
        thanhCong: true,

        tongSo: danhSachNguyCo.length,

        sinhVien: danhSachNguyCo,
      });
    } catch (error) {
      console.error("Lỗi API danh sách nguy cơ:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể tải danh sách sinh viên nguy cơ.",
      });
    }
  },
);

/* ============================================================
   API 4
   HÀM LẤY NHẬT KÝ
============================================================ */

async function layHoatDong(pool, idGiangVien, gioiHan = 5) {
  const result = await pool
    .request()
    .input("ID_GIANG_VIEN", sql.Int, idGiangVien)
    .input("GIOI_HAN", sql.Int, gioiHan).query(`
        SELECT TOP (@GIOI_HAN)
          *
        FROM (

          /* ==============================================
             DỰ ĐOÁN ĐIỂM HỌC PHẦN
          ============================================== */

          SELECT

            DD.ID_DU_DOAN
              AS ID_HOAT_DONG,

            'du-doan-diem-hoc-phan'
              AS LOAI_HOAT_DONG,

            N'Dự đoán điểm học phần'
              AS TIEU_DE,

            CONCAT(
              N'Đã thực hiện dự đoán điểm học phần cho sinh viên ',
              SV.HO_TEN
            )
              AS NOI_DUNG,

            DD.NGAY_DU_DOAN
              AS THOI_GIAN,

            SV.HO_TEN
              AS TEN_SINH_VIEN

          FROM DU_DOAN_DIEM_HOC_PHAN DD

          INNER JOIN SINH_VIEN SV
            ON SV.ID_SINH_VIEN =
               DD.ID_SINH_VIEN


          UNION ALL


          /* ==============================================
             DỰ ĐOÁN HỌC KỲ
          ============================================== */

          SELECT

            DDHK.ID_DU_DOAN,

            'du-doan-hoc-ky',

            N'Dự đoán kết quả học tập',

            CONCAT(
              N'Đã thực hiện dự đoán GPA học kỳ ',
              DDHK.HOC_KY,
              N' cho sinh viên ',
              SV.HO_TEN
            ),

            DDHK.NGAY_DU_DOAN,

            SV.HO_TEN

          FROM DU_DOAN_HOC_KY DDHK

          INNER JOIN SINH_VIEN SV
            ON SV.ID_SINH_VIEN =
               DDHK.ID_SINH_VIEN


          UNION ALL


          /* ==============================================
             DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO
          ============================================== */

          SELECT

            DDTT.ID_DU_DOAN,

            'du-doan-gpa',

            N'Dự đoán GPA học kỳ tiếp theo',

            CONCAT(
              N'Dự đoán GPA HK',
              DDTT.HOC_KY_DU_DOAN,
              N' cho sinh viên ',
              SV.HO_TEN
            ),

            DDTT.NGAY_DU_DOAN,

            SV.HO_TEN

          FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DDTT

          INNER JOIN SINH_VIEN SV
            ON SV.ID_SINH_VIEN =
               DDTT.ID_SINH_VIEN


          UNION ALL


          /* ==============================================
             TÀI LIỆU
          ============================================== */

          SELECT

            TN.ID_TAI_NGUYEN,

            'tai-lieu',

            N'Đăng tài liệu',

            CONCAT(
              N'Đã đăng tài liệu "',
              TN.TEN_TAI_NGUYEN,
              N'"'
            ),

            TN.NGAY_TAO,

            NULL

          FROM TAI_NGUYEN_HOC_TAP TN

          WHERE
            TN.ID_GIANG_VIEN =
              @ID_GIANG_VIEN

            AND TN.TRANG_THAI = 1


          UNION ALL


          /* ==============================================
             ĐĂNG NHẬP
          ============================================== */

          SELECT

            LT.ID_TRUY_CAP,

            'dang-nhap',

            N'Đăng nhập hệ thống',

            N'Giảng viên đã đăng nhập hệ thống',

            LT.THOI_GIAN_TRUY_CAP,

            NULL

          FROM LICH_SU_TRUY_CAP LT

          WHERE
            LT.ID_TAI_KHOAN = (
              SELECT TOP 1
                GV.ID_TAI_KHOAN

              FROM GIANG_VIEN GV

              WHERE
                GV.ID_GIANG_VIEN =
                  @ID_GIANG_VIEN
            )

        ) AS HOAT_DONG

        ORDER BY
          THOI_GIAN DESC,
          ID_HOAT_DONG DESC
      `);

  return result.recordset.map(function (item) {
    let icon = "fa-chart-line";

    let classIcon = "du-doan";

    if (item.LOAI_HOAT_DONG === "tai-lieu") {
      icon = "fa-file-lines";

      classIcon = "cap-nhat";
    }

    if (item.LOAI_HOAT_DONG === "dang-nhap") {
      icon = "fa-right-to-bracket";

      classIcon = "sinh-vien";
    }

    return {
      idHoatDong: Number(item.ID_HOAT_DONG),

      loai: item.LOAI_HOAT_DONG,

      tieuDe: item.TIEU_DE,

      noiDung: item.NOI_DUNG,

      thoiGian: item.THOI_GIAN,

      tenSinhVien: item.TEN_SINH_VIEN,

      icon,

      classIcon,
    };
  });
}

/* ============================================================
   API 5
   GET /api/giang-vien/home/hoat-dong
============================================================ */

router.get(
  "/home/hoat-dong",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      const giangVien = await layGiangVienHienTai(pool, req);

      if (!giangVien) {
        return res.status(404).json({
          thanhCong: false,

          thongBao: "Không tìm thấy giảng viên.",
        });
      }

      let gioiHan = Number(req.query.gioiHan);

      if (!Number.isInteger(gioiHan) || gioiHan <= 0) {
        gioiHan = 50;
      }

      if (gioiHan > 100) {
        gioiHan = 100;
      }

      const danhSach = await layHoatDong(
        pool,
        Number(giangVien.ID_GIANG_VIEN),
        gioiHan,
      );

      return res.json({
        thanhCong: true,

        tongSo: danhSach.length,

        hoatDong: danhSach,
      });
    } catch (error) {
      console.error("Lỗi API nhật ký:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể tải nhật ký hoạt động.",
      });
    }
  },
);

/* ============================================================
   API 6
   GET /api/giang-vien/home/sinh-vien/:id

   CHI TIẾT SINH VIÊN CHO MODAL HOME
============================================================ */

router.get(
  "/home/sinh-vien/:id",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      /* ======================================================
         KIỂM TRA ID
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
         THÔNG TIN SINH VIÊN
      ====================================================== */

      const svResult = await pool
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

      if (svResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,

          thongBao: "Không tìm thấy sinh viên.",
        });
      }

      const sv = svResult.recordset[0];

      /* ======================================================
         GPA THỰC TẾ
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

      const gpaThucTe = gpaResult.recordset.map(function (item) {
        return {
          idKetQua: item.ID_KET_QUA,

          hocKy: Number(item.HOC_KY),

          namHoc: item.NAM_HOC,

          gpa: lamTron(item.GPA, 2),

          tongTinChi:
            item.TONG_TIN_CHI === null ? null : Number(item.TONG_TIN_CHI),
        };
      });

      /* ======================================================
         LẤY DỰ ĐOÁN GPA TIẾP THEO MỚI NHẤT
      ====================================================== */

      const duDoanResult = await pool
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

      let duDoan = null;

      let gpaLichSu = [];

      if (duDoanResult.recordset.length > 0) {
        const item = duDoanResult.recordset[0];

        /* ====================================================
           GPA LỊCH SỬ
        ==================================================== */

        gpaLichSu = layGPATheoLichSu(item.GPA_LICH_SU);

        /* ====================================================
           DỰ ĐOÁN
        ==================================================== */

        duDoan = {
          idDuDoan: Number(item.ID_DU_DOAN),

          hocKy: Number(item.HOC_KY_DU_DOAN),

          namHoc: item.NAM_HOC_DU_DOAN,

          gpaKyGanNhat:
            item.GPA_KY_GAN_NHAT === null
              ? null
              : lamTron(item.GPA_KY_GAN_NHAT),

          gpaTrungBinhLichSu:
            item.GPA_TRUNG_BINH_LICH_SU === null
              ? null
              : lamTron(item.GPA_TRUNG_BINH_LICH_SU),

          xuHuongGPA:
            item.XU_HUONG_GPA === null ? null : lamTron(item.XU_HUONG_GPA, 3),

          soHocKyDaHoc: Number(item.SO_HOC_KY_DA_HOC || 0),

          tinChiDangKy:
            item.TIN_CHI_DANG_KY === null ? null : Number(item.TIN_CHI_DANG_KY),

          gioTuHocTuan:
            item.GIO_TU_HOC_TUAN === null
              ? null
              : lamTron(item.GIO_TU_HOC_TUAN),

          tyLeChuyenCan:
            item.TY_LE_CHUYEN_CAN === null
              ? null
              : lamTron(item.TY_LE_CHUYEN_CAN),

          gioLamThemTuan:
            item.GIO_LAM_THEM_TUAN === null
              ? null
              : lamTron(item.GIO_LAM_THEM_TUAN),

          gpa: item.GPA_DU_DOAN === null ? null : lamTron(item.GPA_DU_DOAN),

          diemHe10:
            item.DIEM_HE_10_DU_DOAN === null
              ? null
              : lamTron(item.DIEM_HE_10_DU_DOAN),

          xepLoai: item.XEP_LOAI || null,

          nhanDinh: dinhDangJSONArray(item.NHAN_DINH),

          loiKhuyen: dinhDangJSONArray(item.LOI_KHUYEN),

          gpaLichSu,

          ngayDuDoan: item.NGAY_DU_DOAN,
        };
      }

      /* ======================================================
         GPA HIỂN THỊ MODAL
      ====================================================== */

      const gpaHocKy = taoDanhSachGPAHienThi(gpaLichSu, gpaResult.recordset);

      /* ======================================================
         GPA HIỆN TẠI
      ====================================================== */

      let gpaHienTai = null;

      if (gpaLichSu.length > 0) {
        gpaHienTai = lamTron(gpaLichSu[gpaLichSu.length - 1], 2);
      } else if (gpaThucTe.length > 0) {
        gpaHienTai = gpaThucTe[gpaThucTe.length - 1].gpa;
      } else if (duDoan) {
        gpaHienTai = duDoan.gpaKyGanNhat;
      }

      /* ======================================================
         HỌC KỲ HIỆN TẠI
      ====================================================== */

      let hocKyGanNhat = null;

      if (gpaLichSu.length > 0) {
        hocKyGanNhat = gpaLichSu.length;
      } else if (gpaThucTe.length > 0) {
        hocKyGanNhat = gpaThucTe[gpaThucTe.length - 1].hocKy;
      } else if (duDoan) {
        hocKyGanNhat = duDoan.hocKy;
      }

      /* ======================================================
         NĂM HỌC
      ====================================================== */

      const namHoc = xacDinhNamHoc(hocKyGanNhat);

      /* ======================================================
         XẾP LOẠI
      ====================================================== */

      const xepLoai = xepLoaiGPA(gpaHienTai);

      /* ======================================================
         GPA TÍNH NGUY CƠ
      ====================================================== */

      const gpaNguyCo =
        duDoan && duDoan.gpa !== null && duDoan.gpa !== undefined
          ? duDoan.gpa
          : gpaHienTai;

      const trangThaiNguyCo = layTrangThaiNguyCo(gpaNguyCo);

      /* ======================================================
         NGUYÊN NHÂN
      ====================================================== */

      const nguyenNhan = duDoan
        ? layNguyenNhan({
            duDoanHocKyTiepTheo: duDoan,
          })
        : "Chưa có dữ liệu dự đoán.";

      /* ======================================================
         RESPONSE
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

          namHoc,

          hocKyGanNhat,

          gpaHienTai,

          xepLoaiHienTai: xepLoai,

          trangThai: xepLoai,

          nguyCo: trangThaiNguyCo.nguyCo,

          classNguyCo: trangThaiNguyCo.classNguyCo,

          gpaNguyCo,

          gpaHocKy,

          duDoan,

          nguyenNhan,
        },
      });
    } catch (error) {
      console.error("Lỗi API chi tiết sinh viên home:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể tải chi tiết sinh viên.",
      });
    }
  },
);

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;
