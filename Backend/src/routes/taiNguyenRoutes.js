const express = require("express");
const path = require("path");
const fs = require("fs");

const { sql, layPool } = require("../config/database");
const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

/* =========================================================
   HÀM CHUYỂN DỮ LIỆU TÀI NGUYÊN
========================================================= */

function chuyenTaiNguyen(item) {
  if (!item) {
    return null;
  }

  return {
    idTaiNguyen: Number(item.ID_TAI_NGUYEN),

    tenTaiNguyen: item.TEN_TAI_NGUYEN,

    loaiTaiNguyen: item.LOAI_TAI_NGUYEN,

    moTa: item.MO_TA || null,

    duongDanFile: item.DUONG_DAN_FILE || null,

    duongDanUrl: item.DUONG_DAN_URL || null,

    duoiFile: item.DUOI_FILE || null,

    kichThuocFile:
      item.KICH_THUOC_FILE === null ? null : Number(item.KICH_THUOC_FILE),

    thoiLuongGiay:
      item.THOI_LUONG_GIAY === null ? null : Number(item.THOI_LUONG_GIAY),

    luotXem: Number(item.LUOT_XEM || 0),

    luotTai: Number(item.LUOT_TAI || 0),

    diemDanhGia:
      item.DIEM_DANH_GIA === null ? null : Number(item.DIEM_DANH_GIA),

    soLuotDanhGia: Number(item.SO_LUOT_DANH_GIA || 0),

    noiBat: Boolean(item.NOI_BAT),

    trangThai: Boolean(item.TRANG_THAI),

    ngayTao: item.NGAY_TAO,

    ngayCapNhat: item.NGAY_CAP_NHAT,

    hocPhan: item.ID_HOC_PHAN
      ? {
          idHocPhan: Number(item.ID_HOC_PHAN),

          maHocPhan: item.MA_HOC_PHAN,

          tenHocPhan: item.TEN_HOC_PHAN,

          soTinChi: Number(item.SO_TIN_CHI),

          khoiMon: item.KHOI_MON || null,
        }
      : null,

    giangVien: item.ID_GIANG_VIEN
      ? {
          idGiangVien: Number(item.ID_GIANG_VIEN),

          maGiangVien: item.MA_GIANG_VIEN || null,

          hoTen: item.HO_TEN_GIANG_VIEN || null,
        }
      : null,
  };
}

function idHocPhanHopLe(giaTri) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return false;
  }

  const id = Number(giaTri);

  return Number.isInteger(id) && id > 0;
}

/* =========================================================
   GET /api/tai-nguyen

   Query:
   ?trang=1
   ?soLuong=12
   ?sapXep=moi-nhat
========================================================= */

router.get("/", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    /* =====================================================
         1. TRANG
      ===================================================== */

    let trang = Number(req.query.trang);

    if (!Number.isInteger(trang) || trang < 1) {
      trang = 1;
    }

    /* =====================================================
         2. SỐ LƯỢNG / TRANG
      ===================================================== */

    let soLuong = Number(req.query.soLuong);

    if (!Number.isInteger(soLuong) || soLuong < 1) {
      soLuong = 12;
    }

    /* Không cho frontend yêu cầu quá lớn */

    soLuong = Math.min(soLuong, 50);

    /* =====================================================
         3. SẮP XẾP
      ===================================================== */

    const danhSachSapXepHopLe = [
      "moi-nhat",
      "cu-nhat",
      "luot-xem",
      "luot-tai",
      "danh-gia",
      "noi-bat",
    ];

    let sapXep = String(req.query.sapXep || "moi-nhat")
      .trim()
      .toLowerCase();

    if (!danhSachSapXepHopLe.includes(sapXep)) {
      sapXep = "moi-nhat";
    }

    /* =====================================================
         4. OFFSET
      ===================================================== */

    const offset = (trang - 1) * soLuong;

    const pool = layPool();

    /* =====================================================
         5. ORDER BY AN TOÀN

         Không đưa trực tiếp req.query
         vào SQL.
      ===================================================== */

    let orderBy = `
        T.NGAY_CAP_NHAT DESC,
        T.ID_TAI_NGUYEN DESC
      `;

    switch (sapXep) {
      case "cu-nhat":
        orderBy = `
            T.NGAY_TAO ASC,
            T.ID_TAI_NGUYEN ASC
          `;
        break;

      case "luot-xem":
        orderBy = `
            T.LUOT_XEM DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;

      case "luot-tai":
        orderBy = `
            T.LUOT_TAI DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;

      case "danh-gia":
        orderBy = `
            CASE
              WHEN T.DIEM_DANH_GIA IS NULL
              THEN 0
              ELSE T.DIEM_DANH_GIA
            END DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;

      case "noi-bat":
        orderBy = `
            T.NOI_BAT DESC,
            T.NGAY_CAP_NHAT DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;
    }

    /* =====================================================
         6. TỔNG SỐ
      ===================================================== */

    const tongResult = await pool.request().query(`
            SELECT COUNT(*) AS TONG_SO
            FROM TAI_NGUYEN_HOC_TAP T
            WHERE
              T.TRANG_THAI = 1
          `);

    const tongSo = Number(tongResult.recordset[0].TONG_SO);

    /* =====================================================
         7. LẤY DỮ LIỆU
      ===================================================== */

    const result = await pool
      .request()
      .input("OFFSET", sql.Int, offset)
      .input("SO_LUONG", sql.Int, soLuong).query(`
            SELECT

                T.ID_TAI_NGUYEN,
                T.ID_HOC_PHAN,
                T.ID_GIANG_VIEN,

                T.TEN_TAI_NGUYEN,
                T.LOAI_TAI_NGUYEN,
                T.MO_TA,

                T.DUONG_DAN_FILE,
                T.DUONG_DAN_URL,
                T.DUOI_FILE,

                T.KICH_THUOC_FILE,
                T.THOI_LUONG_GIAY,

                T.LUOT_XEM,
                T.LUOT_TAI,

                T.DIEM_DANH_GIA,
                T.SO_LUOT_DANH_GIA,

                T.NOI_BAT,
                T.TRANG_THAI,

                T.NGAY_TAO,
                T.NGAY_CAP_NHAT,

                H.MA_HOC_PHAN,
                H.TEN_HOC_PHAN,
                H.SO_TIN_CHI,
                H.KHOI_MON,

                G.MA_GIANG_VIEN,
                G.HO_TEN AS HO_TEN_GIANG_VIEN,
                G.EMAIL AS EMAIL_GIANG_VIEN,
                G.BO_MON

            FROM TAI_NGUYEN_HOC_TAP T

            LEFT JOIN HOC_PHAN H
                ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

            LEFT JOIN GIANG_VIEN G
                ON T.ID_GIANG_VIEN =
                   G.ID_GIANG_VIEN

            WHERE
                T.TRANG_THAI = 1

            ORDER BY
                ${orderBy}

            OFFSET @OFFSET ROWS
            FETCH NEXT @SO_LUONG ROWS ONLY
          `);

    const danhSach = result.recordset.map(chuyenTaiNguyen).filter(Boolean);

    const tongTrang = tongSo === 0 ? 0 : Math.ceil(tongSo / soLuong);

    return res.json({
      thanhCong: true,

      phanTrang: {
        trang,
        soLuong,
        tongSo,
        tongTrang,

        coTrangTruoc: trang > 1,

        coTrangSau: trang < tongTrang,
      },

      sapXep,

      taiNguyen: danhSach,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách tài nguyên:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Không thể lấy danh sách tài nguyên.",
    });
  }
});

/* =========================================================
   GET /api/tai-nguyen/hoc-phan
   LẤY DANH SÁCH HỌC PHẦN CÓ TÀI NGUYÊN
========================================================= */

router.get("/hoc-phan", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    const pool = layPool();

    const ketQua = await pool.request().query(`
        SELECT
            H.ID_HOC_PHAN,
            H.MA_HOC_PHAN,
            H.TEN_HOC_PHAN,
            H.SO_TIN_CHI,
            H.KHOI_MON,

            COUNT(T.ID_TAI_NGUYEN) AS SO_TAI_NGUYEN,

            SUM(
              CASE
                WHEN T.LOAI_TAI_NGUYEN = 'VIDEO'
                THEN 1
                ELSE 0
              END
            ) AS SO_VIDEO

        FROM HOC_PHAN H

        LEFT JOIN TAI_NGUYEN_HOC_TAP T
            ON H.ID_HOC_PHAN = T.ID_HOC_PHAN
            AND T.TRANG_THAI = 1

        WHERE H.TRANG_THAI = 1

        GROUP BY
            H.ID_HOC_PHAN,
            H.MA_HOC_PHAN,
            H.TEN_HOC_PHAN,
            H.SO_TIN_CHI,
            H.KHOI_MON

        ORDER BY
            H.MA_HOC_PHAN
      `);

    const hocPhan = ketQua.recordset.map((item) => ({
      idHocPhan: Number(item.ID_HOC_PHAN),

      maHocPhan: item.MA_HOC_PHAN,

      tenHocPhan: item.TEN_HOC_PHAN,

      soTinChi: Number(item.SO_TIN_CHI),

      khoiMon: item.KHOI_MON || null,

      soTaiNguyen: Number(item.SO_TAI_NGUYEN || 0),

      soVideo: Number(item.SO_VIDEO || 0),
    }));

    return res.json({
      thanhCong: true,

      hocPhan,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách học phần:", error);

    return res.status(500).json({
      thanhCong: false,

      thongBao: "Không thể tải danh sách học phần.",
    });
  }
});

/* =========================================================
   GET /api/tai-nguyen/thong-ke

   Thống kê tài nguyên học tập đang hoạt động.

   Trả về:
   - Tổng tài liệu
   - Tổng video
   - Tổng website
   - Tổng tài nguyên nổi bật
   - Tổng lượt xem
   - Tổng lượt tải
========================================================= */

router.get("/thong-ke", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    const pool = layPool();

    const result = await pool.request().query(`
          SELECT

            /* Tổng tài nguyên */
            COUNT(*) AS TONG_TAI_NGUYEN,

            /* Tài liệu */
            SUM(
              CASE
                WHEN LOAI_TAI_NGUYEN = 'TAI_LIEU'
                THEN 1
                ELSE 0
              END
            ) AS TONG_TAI_LIEU,

            /* Video */
            SUM(
              CASE
                WHEN LOAI_TAI_NGUYEN = 'VIDEO'
                THEN 1
                ELSE 0
              END
            ) AS TONG_VIDEO,

            /* Website */
            SUM(
              CASE
                WHEN LOAI_TAI_NGUYEN = 'WEBSITE'
                THEN 1
                ELSE 0
              END
            ) AS TONG_WEBSITE,

            /* Nổi bật */
            SUM(
              CASE
                WHEN NOI_BAT = 1
                THEN 1
                ELSE 0
              END
            ) AS TONG_NOI_BAT,

            /* Tổng lượt xem */
            COALESCE(
              SUM(LUOT_XEM),
              0
            ) AS TONG_LUOT_XEM,

            /* Tổng lượt tải */
            COALESCE(
              SUM(LUOT_TAI),
              0
            ) AS TONG_LUOT_TAI

          FROM TAI_NGUYEN_HOC_TAP

          WHERE
            TRANG_THAI = 1
        `);

    const item = result.recordset[0];

    return res.json({
      thanhCong: true,

      thongKe: {
        tongTaiNguyen: Number(item.TONG_TAI_NGUYEN || 0),

        tongTaiLieu: Number(item.TONG_TAI_LIEU || 0),

        tongVideo: Number(item.TONG_VIDEO || 0),

        tongWebsite: Number(item.TONG_WEBSITE || 0),

        tongNoiBat: Number(item.TONG_NOI_BAT || 0),

        tongLuotXem: Number(item.TONG_LUOT_XEM || 0),

        tongLuotTai: Number(item.TONG_LUOT_TAI || 0),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê tài nguyên:", error);

    return res.status(500).json({
      thanhCong: false,

      thongBao: "Không thể lấy thống kê tài nguyên.",
    });
  }
});

/* =========================================================
   GET /api/tai-nguyen/tim-kiem

   Hỗ trợ:
   - Từ khóa
   - Loại tài nguyên
   - Học phần
   - Khối môn
   - Nổi bật
   - Phân trang
   - Sắp xếp
========================================================= */

router.get("/tim-kiem", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    /* =====================================================
         1. ĐỌC QUERY
      ===================================================== */

    const tuKhoa = String(req.query.tuKhoa || "").trim();

    let loai = String(req.query.loai || "")
      .trim()
      .toUpperCase();

    const khoiMon = String(req.query.khoiMon || "").trim();

    const idHocPhan = Number(req.query.idHocPhan);

    const coIdHocPhan = Number.isInteger(idHocPhan) && idHocPhan > 0;

    const noiBatParam = String(req.query.noiBat || "")
      .trim()
      .toLowerCase();

    const locNoiBat = noiBatParam === "1" || noiBatParam === "true";

    /* =====================================================
         2. KIỂM TRA LOẠI
      ===================================================== */

    const loaiHopLe = ["TAI_LIEU", "VIDEO", "WEBSITE"];

    if (loai && !loaiHopLe.includes(loai)) {
      loai = "";
    }

    /* =====================================================
         3. PHÂN TRANG
      ===================================================== */

    let trang = Number(req.query.trang);

    if (!Number.isInteger(trang) || trang < 1) {
      trang = 1;
    }

    let soLuong = Number(req.query.soLuong);

    if (!Number.isInteger(soLuong) || soLuong < 1) {
      soLuong = 12;
    }

    /* Không cho lấy quá nhiều */

    soLuong = Math.min(soLuong, 50);

    const offset = (trang - 1) * soLuong;

    /* =====================================================
         4. SẮP XẾP
      ===================================================== */

    const sapXepHopLe = [
      "moi-nhat",
      "cu-nhat",
      "luot-xem",
      "luot-tai",
      "danh-gia",
      "noi-bat",
    ];

    let sapXep = String(req.query.sapXep || "moi-nhat")
      .trim()
      .toLowerCase();

    if (!sapXepHopLe.includes(sapXep)) {
      sapXep = "moi-nhat";
    }

    let orderBy = `
        T.NGAY_CAP_NHAT DESC,
        T.ID_TAI_NGUYEN DESC
      `;

    switch (sapXep) {
      case "cu-nhat":
        orderBy = `
            T.NGAY_TAO ASC,
            T.ID_TAI_NGUYEN ASC
          `;
        break;

      case "luot-xem":
        orderBy = `
            T.LUOT_XEM DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;

      case "luot-tai":
        orderBy = `
            T.LUOT_TAI DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;

      case "danh-gia":
        orderBy = `
            CASE
              WHEN T.DIEM_DANH_GIA IS NULL
              THEN -1
              ELSE T.DIEM_DANH_GIA
            END DESC,
            T.SO_LUOT_DANH_GIA DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;

      case "noi-bat":
        orderBy = `
            T.NOI_BAT DESC,
            T.NGAY_CAP_NHAT DESC,
            T.ID_TAI_NGUYEN DESC
          `;
        break;
    }

    /* =====================================================
         5. WHERE DÙNG CHUNG
      ===================================================== */

    let dieuKien = `
        T.TRANG_THAI = 1
      `;

    /* =====================================================
         6. TỪ KHÓA
      ===================================================== */

    const requestCount = layPool().request();

    const requestData = layPool().request();

    if (tuKhoa) {
      dieuKien += `
          AND (
            T.TEN_TAI_NGUYEN LIKE @TU_KHOA
            OR T.MO_TA LIKE @TU_KHOA
            OR H.MA_HOC_PHAN LIKE @TU_KHOA
            OR H.TEN_HOC_PHAN LIKE @TU_KHOA
          )
        `;

      requestCount.input("TU_KHOA", sql.NVarChar(500), `%${tuKhoa}%`);

      requestData.input("TU_KHOA", sql.NVarChar(500), `%${tuKhoa}%`);
    }

    /* =====================================================
         7. LOẠI
      ===================================================== */

    if (loai) {
      dieuKien += `
          AND T.LOAI_TAI_NGUYEN = @LOAI
        `;

      requestCount.input("LOAI", sql.VarChar(20), loai);

      requestData.input("LOAI", sql.VarChar(20), loai);
    }

    /* =====================================================
         8. HỌC PHẦN
      ===================================================== */

    if (coIdHocPhan) {
      dieuKien += `
          AND T.ID_HOC_PHAN = @ID_HOC_PHAN
        `;

      requestCount.input("ID_HOC_PHAN", sql.Int, idHocPhan);

      requestData.input("ID_HOC_PHAN", sql.Int, idHocPhan);
    }

    /* =====================================================
         9. KHỐI MÔN
      ===================================================== */

    if (khoiMon) {
      dieuKien += `
          AND H.KHOI_MON = @KHOI_MON
        `;

      requestCount.input("KHOI_MON", sql.VarChar(50), khoiMon);

      requestData.input("KHOI_MON", sql.VarChar(50), khoiMon);
    }

    /* =====================================================
         10. NỔI BẬT
      ===================================================== */

    if (locNoiBat) {
      dieuKien += `
          AND T.NOI_BAT = 1
        `;
    }

    /* =====================================================
         11. TỔNG SỐ KẾT QUẢ
      ===================================================== */

    const countResult = await requestCount.query(`
          SELECT
            COUNT(*) AS TONG_SO

          FROM TAI_NGUYEN_HOC_TAP T

          LEFT JOIN HOC_PHAN H
            ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

          WHERE
            ${dieuKien}
        `);

    const tongSo = Number(countResult.recordset[0]?.TONG_SO || 0);

    /* =====================================================
         12. TRÁNH TRANG VƯỢT QUÁ GIỚI HẠN
      ===================================================== */

    const tongTrang = tongSo === 0 ? 0 : Math.ceil(tongSo / soLuong);

    if (tongTrang > 0 && trang > tongTrang) {
      trang = tongTrang;
    }

    const offsetThucTe = (trang - 1) * soLuong;

    requestData.input("OFFSET", sql.Int, offsetThucTe);

    requestData.input("SO_LUONG", sql.Int, soLuong);

    /* =====================================================
         13. LẤY DỮ LIỆU
      ===================================================== */

    const result = await requestData.query(`
          SELECT

              T.ID_TAI_NGUYEN,
              T.ID_HOC_PHAN,
              T.ID_GIANG_VIEN,

              T.TEN_TAI_NGUYEN,
              T.LOAI_TAI_NGUYEN,
              T.MO_TA,

              T.DUONG_DAN_FILE,
              T.DUONG_DAN_URL,
              T.DUOI_FILE,

              T.KICH_THUOC_FILE,
              T.THOI_LUONG_GIAY,

              T.LUOT_XEM,
              T.LUOT_TAI,

              T.DIEM_DANH_GIA,
              T.SO_LUOT_DANH_GIA,

              T.NOI_BAT,
              T.TRANG_THAI,

              T.NGAY_TAO,
              T.NGAY_CAP_NHAT,

              H.ID_HOC_PHAN AS H_ID_HOC_PHAN,
              H.MA_HOC_PHAN,
              H.TEN_HOC_PHAN,
              H.SO_TIN_CHI,
              H.KHOI_MON,

              G.ID_GIANG_VIEN AS G_ID_GIANG_VIEN,
              G.MA_GIANG_VIEN,
              G.HO_TEN AS HO_TEN_GIANG_VIEN,
              G.EMAIL AS EMAIL_GIANG_VIEN,
              G.BO_MON

          FROM TAI_NGUYEN_HOC_TAP T

          LEFT JOIN HOC_PHAN H
            ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

          LEFT JOIN GIANG_VIEN G
            ON T.ID_GIANG_VIEN =
               G.ID_GIANG_VIEN

          WHERE
            ${dieuKien}

          ORDER BY
            ${orderBy}

          OFFSET @OFFSET ROWS

          FETCH NEXT @SO_LUONG ROWS ONLY
        `);

    const danhSach = result.recordset.map(chuyenTaiNguyen).filter(Boolean);

    /* =====================================================
         14. RESPONSE
      ===================================================== */

    return res.json({
      thanhCong: true,

      boLoc: {
        tuKhoa: tuKhoa || null,

        loai: loai || null,

        idHocPhan: coIdHocPhan ? idHocPhan : null,

        khoiMon: khoiMon || null,

        noiBat: locNoiBat,
      },

      sapXep,

      phanTrang: {
        trang,
        soLuong,
        tongSo,
        tongTrang,

        coTrangTruoc: trang > 1,

        coTrangSau: tongTrang > 0 && trang < tongTrang,
      },

      taiNguyen: danhSach,
    });
  } catch (error) {
    console.error("Lỗi tìm kiếm tài nguyên:", error);

    return res.status(500).json({
      thanhCong: false,

      thongBao: "Không thể tìm kiếm tài nguyên.",
    });
  }
});

/* =========================================================
   GET /api/tai-nguyen/noi-bat
========================================================= */

router.get("/noi-bat", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    const pool = layPool();

    const limit = Number(req.query.limit) || 6;

    const soLuong = Math.max(1, Math.min(limit, 20));

    const ketQua = await pool.request().input("SO_LUONG", sql.Int, soLuong)
      .query(`
          SELECT TOP (@SO_LUONG)

              T.ID_TAI_NGUYEN,
              T.ID_HOC_PHAN,
              T.ID_GIANG_VIEN,

              T.TEN_TAI_NGUYEN,
              T.LOAI_TAI_NGUYEN,
              T.MO_TA,

              T.DUONG_DAN_FILE,
              T.DUONG_DAN_URL,
              T.DUOI_FILE,

              T.KICH_THUOC_FILE,
              T.THOI_LUONG_GIAY,

              T.LUOT_XEM,
              T.LUOT_TAI,

              T.DIEM_DANH_GIA,
              T.SO_LUOT_DANH_GIA,

              T.NOI_BAT,
              T.TRANG_THAI,

              T.NGAY_TAO,
              T.NGAY_CAP_NHAT,

              H.MA_HOC_PHAN,
              H.TEN_HOC_PHAN,
              H.SO_TIN_CHI,
              H.KHOI_MON,

              G.MA_GIANG_VIEN,
              G.HO_TEN AS HO_TEN_GIANG_VIEN

          FROM TAI_NGUYEN_HOC_TAP T

          LEFT JOIN HOC_PHAN H
              ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

          LEFT JOIN GIANG_VIEN G
              ON T.ID_GIANG_VIEN = G.ID_GIANG_VIEN

          WHERE
              T.TRANG_THAI = 1

              AND T.NOI_BAT = 1

          ORDER BY
              T.LUOT_XEM DESC,
              T.NGAY_TAO DESC
        `);

    const danhSach = ketQua.recordset.map(chuyenTaiNguyen).filter(Boolean);

    return res.json({
      thanhCong: true,

      tongSo: danhSach.length,

      taiNguyen: danhSach,
    });
  } catch (error) {
    console.error("Lỗi lấy tài nguyên nổi bật:", error);

    return res.status(500).json({
      thanhCong: false,

      thongBao: "Không thể tải tài nguyên nổi bật.",
    });
  }
});

/* =========================================================
   GET /api/tai-nguyen/hoc-phan/:idHocPhan

   Lấy tài nguyên thuộc một học phần
========================================================= */

router.get(
  "/hoc-phan/:idHocPhan",
  xacThuc,
  phanQuyen("SINH_VIEN"),
  async (req, res) => {
    try {
      const idHocPhan = Number(req.params.idHocPhan);

      if (!Number.isInteger(idHocPhan) || idHocPhan <= 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID học phần không hợp lệ.",
        });
      }

      const pool = layPool();

      /* =====================================================
         KIỂM TRA HỌC PHẦN
      ===================================================== */

      const hocPhanResult = await pool
        .request()
        .input("ID_HOC_PHAN", sql.Int, idHocPhan).query(`
            SELECT
                ID_HOC_PHAN,
                MA_HOC_PHAN,
                TEN_HOC_PHAN,
                SO_TIN_CHI,
                KHOI_MON
            FROM HOC_PHAN
            WHERE
                ID_HOC_PHAN = @ID_HOC_PHAN
                AND TRANG_THAI = 1
          `);

      if (hocPhanResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy học phần.",
        });
      }

      const hocPhan = hocPhanResult.recordset[0];

      /* =====================================================
         LẤY TÀI NGUYÊN
      ===================================================== */

      const taiNguyenResult = await pool
        .request()
        .input("ID_HOC_PHAN", sql.Int, idHocPhan).query(`
            SELECT

                T.ID_TAI_NGUYEN,
                T.ID_HOC_PHAN,
                T.ID_GIANG_VIEN,

                T.TEN_TAI_NGUYEN,
                T.LOAI_TAI_NGUYEN,
                T.MO_TA,

                T.DUONG_DAN_FILE,
                T.DUONG_DAN_URL,
                T.DUOI_FILE,

                T.KICH_THUOC_FILE,
                T.THOI_LUONG_GIAY,

                T.LUOT_XEM,
                T.LUOT_TAI,

                T.DIEM_DANH_GIA,
                T.SO_LUOT_DANH_GIA,

                T.NOI_BAT,
                T.TRANG_THAI,

                T.NGAY_TAO,
                T.NGAY_CAP_NHAT,

                H.MA_HOC_PHAN,
                H.TEN_HOC_PHAN,
                H.SO_TIN_CHI,
                H.KHOI_MON,

                G.MA_GIANG_VIEN,
                G.HO_TEN AS HO_TEN_GIANG_VIEN,
                G.EMAIL AS EMAIL_GIANG_VIEN,
                G.BO_MON

            FROM TAI_NGUYEN_HOC_TAP T

            INNER JOIN HOC_PHAN H
                ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

            LEFT JOIN GIANG_VIEN G
                ON T.ID_GIANG_VIEN = G.ID_GIANG_VIEN

            WHERE
                T.ID_HOC_PHAN = @ID_HOC_PHAN
                AND T.TRANG_THAI = 1

            ORDER BY
                T.NOI_BAT DESC,
                T.NGAY_CAP_NHAT DESC,
                T.ID_TAI_NGUYEN DESC
          `);

      const danhSach = taiNguyenResult.recordset
        .map(chuyenTaiNguyen)
        .filter(Boolean);

      return res.json({
        thanhCong: true,

        hocPhan: {
          idHocPhan: Number(hocPhan.ID_HOC_PHAN),

          maHocPhan: hocPhan.MA_HOC_PHAN,

          tenHocPhan: hocPhan.TEN_HOC_PHAN,

          soTinChi: Number(hocPhan.SO_TIN_CHI),

          khoiMon: hocPhan.KHOI_MON,
        },

        tongSo: danhSach.length,

        taiNguyen: danhSach,
      });
    } catch (error) {
      console.error("Lỗi lấy tài nguyên theo học phần:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể lấy tài nguyên của học phần.",
      });
    }
  },
);

/* =========================================================
   POST /api/tai-nguyen/:id/xem

   Ghi nhận một lượt xem/truy cập tài nguyên.

   Dùng cho:
   - TAI_LIEU
   - VIDEO
   - WEBSITE

   Không dùng để lấy chi tiết tài nguyên.
========================================================= */

router.post("/:id/xem", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    /* =====================================================
         1. KIỂM TRA ID
      ===================================================== */

    const idTaiNguyen = Number(req.params.id);

    if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
      return res.status(400).json({
        thanhCong: false,
        thongBao: "ID tài nguyên không hợp lệ.",
      });
    }

    /* =====================================================
         2. DATABASE
      ===================================================== */

    const pool = layPool();

    /* =====================================================
         3. KIỂM TRA TÀI NGUYÊN
      ===================================================== */

    const result = await pool
      .request()
      .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen).query(`
            SELECT
                ID_TAI_NGUYEN,
                TEN_TAI_NGUYEN,
                LOAI_TAI_NGUYEN,
                LUOT_XEM,
                TRANG_THAI
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
                ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN
          `);

    /* =====================================================
         4. KHÔNG TÌM THẤY
      ===================================================== */

    if (result.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy tài nguyên.",
      });
    }

    const item = result.recordset[0];

    /* =====================================================
         5. KIỂM TRA TRẠNG THÁI
      ===================================================== */

    if (!item.TRANG_THAI) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Tài nguyên hiện không còn khả dụng.",
      });
    }

    /* =====================================================
         6. TĂNG LƯỢT XEM
      ===================================================== */

    const updateResult = await pool
      .request()
      .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen).query(`
            UPDATE TAI_NGUYEN_HOC_TAP
            SET
                LUOT_XEM = LUOT_XEM + 1
            WHERE
                ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN
                AND TRANG_THAI = 1;

            SELECT
                LUOT_XEM
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
                ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN;
          `);

    /* =====================================================
         7. LẤY LƯỢT XEM MỚI
      ===================================================== */

    const luotXem = Number(updateResult.recordset[0]?.LUOT_XEM || 0);

    /* =====================================================
         8. RESPONSE
      ===================================================== */

    return res.json({
      thanhCong: true,

      idTaiNguyen,

      tenTaiNguyen: item.TEN_TAI_NGUYEN,

      loaiTaiNguyen: item.LOAI_TAI_NGUYEN,

      luotXem,
    });
  } catch (error) {
    console.error("Lỗi ghi nhận lượt xem tài nguyên:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Không thể ghi nhận lượt xem tài nguyên.",
    });
  }
});

/* =========================================================
   POST /api/tai-nguyen/:id/tai

   Chỉ cho phép tải:
   - TAI_LIEU

   Không cho:
   - VIDEO
   - WEBSITE
========================================================= */

router.post("/:id/tai", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    /* =====================================================
         1. KIỂM TRA ID
      ===================================================== */

    const idTaiNguyen = Number(req.params.id);

    if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
      return res.status(400).json({
        thanhCong: false,
        thongBao: "ID tài nguyên không hợp lệ.",
      });
    }

    /* =====================================================
         2. DATABASE
      ===================================================== */

    const pool = layPool();

    /* =====================================================
         3. LẤY TÀI NGUYÊN
      ===================================================== */

    const result = await pool
      .request()
      .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen).query(`
            SELECT
                T.ID_TAI_NGUYEN,
                T.TEN_TAI_NGUYEN,
                T.LOAI_TAI_NGUYEN,
                T.DUONG_DAN_FILE,
                T.DUOI_FILE,
                T.LUOT_TAI,
                T.TRANG_THAI

            FROM TAI_NGUYEN_HOC_TAP T

            WHERE
                T.ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN
          `);

    /* =====================================================
         4. KHÔNG TÌM THẤY
      ===================================================== */

    if (result.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy tài nguyên.",
      });
    }

    const item = result.recordset[0];

    /* =====================================================
         5. KIỂM TRA TRẠNG THÁI
      ===================================================== */

    if (!item.TRANG_THAI) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Tài nguyên hiện không còn khả dụng.",
      });
    }

    /* =====================================================
         6. CHỈ CHO TẢI TÀI LIỆU
      ===================================================== */

    const loai = String(item.LOAI_TAI_NGUYEN || "").toUpperCase();

    if (loai !== "TAI_LIEU") {
      if (loai === "VIDEO") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Video không được tải bằng chức năng tải tài liệu.",
        });
      }

      if (loai === "WEBSITE") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Website không có file để tải xuống.",
        });
      }

      return res.status(400).json({
        thanhCong: false,
        thongBao: "Loại tài nguyên không hỗ trợ tải xuống.",
      });
    }

    /* =====================================================
         7. KIỂM TRA ĐƯỜNG DẪN FILE
      ===================================================== */

    if (!item.DUONG_DAN_FILE) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Tài liệu chưa có file tải xuống.",
      });
    }

    /* =====================================================
         8. CHUYỂN ĐƯỜNG DẪN DATABASE
            → ĐƯỜNG DẪN SERVER
      ===================================================== */

    /*
     * Database:
     *
     * /uploads/tai-lieu/python-co-ban.pdf
     *
     * Server:
     *
     * .../backend/uploads/tai-lieu/python-co-ban.pdf
     */

    const duongDanFile = item.DUONG_DAN_FILE.replace(/\//g, path.sep).replace(
      /^[/\\]+/,
      "",
    );

    const filePath = path.join(__dirname, "..", duongDanFile);

    /* =====================================================
         9. KIỂM TRA FILE CÓ THỰC SỰ TỒN TẠI
      ===================================================== */

    if (!fs.existsSync(filePath)) {
      console.error("Không tìm thấy file:", filePath);

      return res.status(404).json({
        thanhCong: false,
        thongBao: "File tài liệu không tồn tại trên máy chủ.",
      });
    }

    /* =====================================================
         10. TĂNG LƯỢT TẢI

         Chỉ tăng khi file thực sự tồn tại.
      ===================================================== */

    await pool.request().input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen).query(`
          UPDATE TAI_NGUYEN_HOC_TAP
          SET
              LUOT_TAI = LUOT_TAI + 1,
              NGAY_CAP_NHAT = SYSDATETIME()
          WHERE
              ID_TAI_NGUYEN =
              @ID_TAI_NGUYEN
              AND TRANG_THAI = 1
        `);

    /* =====================================================
         11. TÊN FILE TẢI XUỐNG
      ===================================================== */

    const tenFile = path.basename(filePath);

    /* =====================================================
         12. TRẢ FILE
      ===================================================== */

    return res.download(filePath, tenFile, (error) => {
      if (error) {
        console.error("Lỗi gửi file:", error);
      }
    });
  } catch (error) {
    console.error("Lỗi tải tài nguyên:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Không thể tải tài liệu.",
    });
  }
});

// ============================================================
// GET /api/tai-nguyen/:id
// Lấy chi tiết một tài nguyên
// Đồng thời ghi nhận 1 lượt xem
// ============================================================

router.get("/:id", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    // ======================================================
    // 1. KIỂM TRA ID
    // ======================================================

    const idTaiNguyen = Number(req.params.id);

    if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
      return res.status(400).json({
        thanhCong: false,
        thongBao: "ID tài nguyên không hợp lệ.",
      });
    }

    // ======================================================
    // 2. DATABASE
    // ======================================================

    const pool = layPool();

    // ======================================================
    // 3. LẤY TÀI NGUYÊN
    // ======================================================

    const result = await pool
      .request()
      .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen).query(`
            SELECT
                T.ID_TAI_NGUYEN,
                T.ID_HOC_PHAN,
                T.ID_GIANG_VIEN,

                T.TEN_TAI_NGUYEN,
                T.LOAI_TAI_NGUYEN,
                T.MO_TA,

                T.DUONG_DAN_FILE,
                T.DUONG_DAN_URL,

                T.DUOI_FILE,
                T.KICH_THUOC_FILE,
                T.THOI_LUONG_GIAY,

                T.LUOT_XEM,
                T.LUOT_TAI,

                T.DIEM_DANH_GIA,
                T.SO_LUOT_DANH_GIA,

                T.NOI_BAT,
                T.TRANG_THAI,

                T.NGAY_TAO,
                T.NGAY_CAP_NHAT,

                H.MA_HOC_PHAN,
                H.TEN_HOC_PHAN,
                H.SO_TIN_CHI,
                H.KHOI_MON,

                G.MA_GIANG_VIEN,
                G.HO_TEN AS HO_TEN_GIANG_VIEN,
                G.EMAIL AS EMAIL_GIANG_VIEN,
                G.BO_MON

            FROM TAI_NGUYEN_HOC_TAP T

            LEFT JOIN HOC_PHAN H
                ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

            LEFT JOIN GIANG_VIEN G
                ON T.ID_GIANG_VIEN = G.ID_GIANG_VIEN

            WHERE
                T.ID_TAI_NGUYEN = @ID_TAI_NGUYEN
          `);

    // ======================================================
    // 4. KHÔNG TÌM THẤY
    // ======================================================

    if (result.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy tài nguyên.",
      });
    }

    const item = result.recordset[0];

    // ======================================================
    // 5. KIỂM TRA TRẠNG THÁI
    // ======================================================

    if (!item.TRANG_THAI) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Tài nguyên hiện không còn khả dụng.",
      });
    }

    // ======================================================
    // 6. KIỂM TRA LOẠI
    // ======================================================

    const loai = String(item.LOAI_TAI_NGUYEN || "")
      .trim()
      .toUpperCase();

    if (!["TAI_LIEU", "VIDEO", "WEBSITE"].includes(loai)) {
      return res.status(500).json({
        thanhCong: false,
        thongBao: "Loại tài nguyên không hợp lệ.",
      });
    }

    // ======================================================
    // 7. KIỂM TRA ĐƯỜNG DẪN
    // ======================================================

    if ((loai === "TAI_LIEU" || loai === "VIDEO") && !item.DUONG_DAN_FILE) {
      return res.status(500).json({
        thanhCong: false,
        thongBao: "Tài nguyên chưa có đường dẫn file.",
      });
    }

    if (loai === "WEBSITE" && !item.DUONG_DAN_URL) {
      return res.status(500).json({
        thanhCong: false,
        thongBao: "Tài nguyên chưa có đường dẫn website.",
      });
    }

    // ======================================================
    // 8. TĂNG LƯỢT XEM
    // ======================================================

    const updateResult = await pool
      .request()
      .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen).query(`
            UPDATE TAI_NGUYEN_HOC_TAP
            SET
                LUOT_XEM = LUOT_XEM + 1,
                NGAY_CAP_NHAT = SYSDATETIME()

            WHERE
                ID_TAI_NGUYEN = @ID_TAI_NGUYEN
                AND TRANG_THAI = 1;

            SELECT
                LUOT_XEM,
                NGAY_CAP_NHAT
            FROM TAI_NGUYEN_HOC_TAP

            WHERE
                ID_TAI_NGUYEN = @ID_TAI_NGUYEN;
          `);

    // ======================================================
    // 9. LẤY LẠI DỮ LIỆU SAU UPDATE
    // ======================================================

    const luotXemMoi = Number(
      updateResult.recordset[0]?.LUOT_XEM ?? item.LUOT_XEM,
    );

    const ngayCapNhatMoi =
      updateResult.recordset[0]?.NGAY_CAP_NHAT ?? item.NGAY_CAP_NHAT;

    // ======================================================
    // 10. CHUYỂN DỮ LIỆU
    // ======================================================

    const taiNguyen = {
      idTaiNguyen: Number(item.ID_TAI_NGUYEN),

      tenTaiNguyen: item.TEN_TAI_NGUYEN,

      loaiTaiNguyen: loai,

      moTa: item.MO_TA || null,

      duongDanFile: item.DUONG_DAN_FILE || null,

      duongDanUrl: item.DUONG_DAN_URL || null,

      duoiFile: item.DUOI_FILE || null,

      kichThuocFile:
        item.KICH_THUOC_FILE === null ? null : Number(item.KICH_THUOC_FILE),

      thoiLuongGiay:
        item.THOI_LUONG_GIAY === null ? null : Number(item.THOI_LUONG_GIAY),

      luotXem: luotXemMoi,

      luotTai: Number(item.LUOT_TAI || 0),

      diemDanhGia:
        item.DIEM_DANH_GIA === null ? null : Number(item.DIEM_DANH_GIA),

      soLuotDanhGia: Number(item.SO_LUOT_DANH_GIA || 0),

      noiBat: Boolean(item.NOI_BAT),

      trangThai: Boolean(item.TRANG_THAI),

      ngayTao: item.NGAY_TAO,

      ngayCapNhat: ngayCapNhatMoi,

      // ====================================================
      // HỌC PHẦN
      // ====================================================

      hocPhan:
        item.ID_HOC_PHAN === null
          ? null
          : {
              idHocPhan: Number(item.ID_HOC_PHAN),

              maHocPhan: item.MA_HOC_PHAN,

              tenHocPhan: item.TEN_HOC_PHAN,

              soTinChi: Number(item.SO_TIN_CHI),

              khoiMon: item.KHOI_MON || null,
            },

      // ====================================================
      // GIẢNG VIÊN
      // ====================================================

      giangVien:
        item.ID_GIANG_VIEN === null
          ? null
          : {
              idGiangVien: Number(item.ID_GIANG_VIEN),

              maGiangVien: item.MA_GIANG_VIEN,

              hoTen: item.HO_TEN_GIANG_VIEN,

              email: item.EMAIL_GIANG_VIEN,

              boMon: item.BO_MON,
            },
    };

    // ======================================================
    // 11. RESPONSE
    // ======================================================

    return res.json({
      thanhCong: true,

      taiNguyen,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết tài nguyên:", error);

    return res.status(500).json({
      thanhCong: false,
      thongBao: "Không thể lấy chi tiết tài nguyên.",
    });
  }
});

module.exports = router;
