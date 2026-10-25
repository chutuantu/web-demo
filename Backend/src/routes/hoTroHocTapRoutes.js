const express = require("express");

const { sql, layPool } = require("../config/database");

const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

/* =========================================================
   GET /api/ho-tro-hoc-tap
========================================================= */

router.get("/", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    const pool = layPool();

    /* =====================================================
         1. TÀI LIỆU
      ===================================================== */

    const taiLieuResult = await pool.request().query(`
        SELECT
            T.ID_TAI_LIEU,
            T.TEN_TAI_LIEU,
            T.MO_TA,
            T.LOAI_FILE,
            T.DUONG_DAN_FILE,
            T.LUOT_XEM,
            T.NGAY_TAI_LEN,

            H.ID_HOC_PHAN,
            H.MA_HOC_PHAN,
            H.TEN_HOC_PHAN

        FROM TAI_LIEU T

        LEFT JOIN HOC_PHAN H
            ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

        WHERE T.TRANG_THAI = 1

        ORDER BY
            T.NGAY_TAI_LEN DESC,
            T.ID_TAI_LIEU DESC
      `);

    /* =====================================================
         2. VIDEO
      ===================================================== */

    const videoResult = await pool.request().query(`
        SELECT
            V.ID_VIDEO,
            V.TEN_VIDEO,
            V.MO_TA,
            V.DUONG_DAN_VIDEO,
            V.THOI_LUONG,
            V.LUOT_XEM,
            V.DIEM_DANH_GIA,
            V.NGAY_TAO,

            H.ID_HOC_PHAN,
            H.MA_HOC_PHAN,
            H.TEN_HOC_PHAN

        FROM VIDEO_BAI_GIANG V

        LEFT JOIN HOC_PHAN H
            ON V.ID_HOC_PHAN = H.ID_HOC_PHAN

        WHERE V.TRANG_THAI = 1

        ORDER BY
            V.NGAY_TAO DESC,
            V.ID_VIDEO DESC
      `);

    /* =====================================================
         3. WEBSITE
      ===================================================== */

    const websiteResult = await pool.request().query(`
        SELECT
            W.ID_WEBSITE,
            W.TEN_WEBSITE,
            W.MO_TA,
            W.URL,
            W.LUOT_TRUY_CAP,
            W.NGAY_TAO,

            H.ID_HOC_PHAN,
            H.MA_HOC_PHAN,
            H.TEN_HOC_PHAN

        FROM WEBSITE_THAM_KHAO W

        LEFT JOIN HOC_PHAN H
            ON W.ID_HOC_PHAN = H.ID_HOC_PHAN

        WHERE W.TRANG_THAI = 1

        ORDER BY
            W.NGAY_TAO DESC,
            W.ID_WEBSITE DESC
      `);

    /* =====================================================
         4. TÀI NGUYÊN NỔI BẬT
      ===================================================== */

    const taiNguyenResult = await pool.request().query(`
        SELECT
            T.ID_TAI_NGUYEN,
            T.TEN_TAI_NGUYEN,
            T.MO_TA,
            T.LOAI_TAI_NGUYEN,
            T.URL,
            T.DIEM_DANH_GIA,
            T.LUOT_XEM,
            T.NGAY_TAO,

            H.ID_HOC_PHAN,
            H.MA_HOC_PHAN,
            H.TEN_HOC_PHAN

        FROM TAI_NGUYEN_NOI_BAT T

        LEFT JOIN HOC_PHAN H
            ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

        WHERE T.TRANG_THAI = 1

        ORDER BY
            T.DIEM_DANH_GIA DESC,
            T.LUOT_XEM DESC,
            T.NGAY_TAO DESC
      `);

    /* =====================================================
         5. MÔN HỌC
      ===================================================== */

    const monHocResult = await pool.request().query(`
        SELECT
            H.ID_HOC_PHAN,
            H.MA_HOC_PHAN,
            H.TEN_HOC_PHAN,
            H.SO_TIN_CHI,

            (
                SELECT COUNT(*)
                FROM TAI_LIEU T
                WHERE
                    T.ID_HOC_PHAN = H.ID_HOC_PHAN
                    AND T.TRANG_THAI = 1
            ) AS SO_TAI_LIEU,

            (
                SELECT COUNT(*)
                FROM VIDEO_BAI_GIANG V
                WHERE
                    V.ID_HOC_PHAN = H.ID_HOC_PHAN
                    AND V.TRANG_THAI = 1
            ) AS SO_VIDEO

        FROM HOC_PHAN H

        WHERE H.TRANG_THAI = 1

        ORDER BY
            H.MA_HOC_PHAN
      `);

    /* =====================================================
         6. FORMAT TÀI LIỆU
      ===================================================== */

    const taiLieu = taiLieuResult.recordset.map((item) => ({
      id: Number(item.ID_TAI_LIEU),

      ten: item.TEN_TAI_LIEU,

      moTa: item.MO_TA,

      loaiFile: item.LOAI_FILE,

      url: item.DUONG_DAN_FILE,

      luotXem: Number(item.LUOT_XEM),

      ngay: item.NGAY_TAI_LEN,

      hocPhan: item.ID_HOC_PHAN
        ? {
            id: Number(item.ID_HOC_PHAN),
            ma: item.MA_HOC_PHAN,
            ten: item.TEN_HOC_PHAN,
          }
        : null,
    }));

    /* =====================================================
         7. FORMAT VIDEO
      ===================================================== */

    const video = videoResult.recordset.map((item) => ({
      id: Number(item.ID_VIDEO),

      ten: item.TEN_VIDEO,

      moTa: item.MO_TA,

      url: item.DUONG_DAN_VIDEO,

      thoiLuong: item.THOI_LUONG,

      luotXem: Number(item.LUOT_XEM),

      diemDanhGia:
        item.DIEM_DANH_GIA === null ? null : Number(item.DIEM_DANH_GIA),

      ngay: item.NGAY_TAO,

      hocPhan: item.ID_HOC_PHAN
        ? {
            id: Number(item.ID_HOC_PHAN),
            ma: item.MA_HOC_PHAN,
            ten: item.TEN_HOC_PHAN,
          }
        : null,
    }));

    /* =====================================================
         8. FORMAT WEBSITE
      ===================================================== */

    const website = websiteResult.recordset.map((item) => ({
      id: Number(item.ID_WEBSITE),

      ten: item.TEN_WEBSITE,

      moTa: item.MO_TA,

      url: item.URL,

      luotTruyCap: Number(item.LUOT_TRUY_CAP),

      ngay: item.NGAY_TAO,

      hocPhan: item.ID_HOC_PHAN
        ? {
            id: Number(item.ID_HOC_PHAN),
            ma: item.MA_HOC_PHAN,
            ten: item.TEN_HOC_PHAN,
          }
        : null,
    }));

    /* =====================================================
         9. FORMAT TÀI NGUYÊN
      ===================================================== */

    const noiBat = taiNguyenResult.recordset.map((item) => ({
      id: Number(item.ID_TAI_NGUYEN),

      ten: item.TEN_TAI_NGUYEN,

      moTa: item.MO_TA,

      loai: item.LOAI_TAI_NGUYEN,

      url: item.URL,

      diemDanhGia:
        item.DIEM_DANH_GIA === null ? null : Number(item.DIEM_DANH_GIA),

      luotXem: Number(item.LUOT_XEM),

      ngay: item.NGAY_TAO,

      hocPhan: item.ID_HOC_PHAN
        ? {
            id: Number(item.ID_HOC_PHAN),
            ma: item.MA_HOC_PHAN,
            ten: item.TEN_HOC_PHAN,
          }
        : null,
    }));

    /* =====================================================
         10. FORMAT MÔN HỌC
      ===================================================== */

    const monHoc = monHocResult.recordset.map((item) => ({
      id: Number(item.ID_HOC_PHAN),

      ma: item.MA_HOC_PHAN,

      ten: item.TEN_HOC_PHAN,

      soTinChi: Number(item.SO_TIN_CHI),

      soTaiLieu: Number(item.SO_TAI_LIEU),

      soVideo: Number(item.SO_VIDEO),
    }));

    /* =====================================================
         11. TRẢ RESPONSE
      ===================================================== */

    return res.json({
      thanhCong: true,

      taiNguyen: {
        taiLieu,

        video,

        website,

        noiBat,

        tatCa: [
          ...taiLieu.map((item) => ({
            ...item,
            loai: "tai-lieu",
          })),

          ...video.map((item) => ({
            ...item,
            loai: "video",
          })),

          ...website.map((item) => ({
            ...item,
            loai: "website",
          })),
        ],
      },

      monHoc,

      thongKe: {
        taiLieu: taiLieu.length,

        video: video.length,

        website: website.length,

        noiBat: noiBat.length,
      },
    });
  } catch (error) {
    console.error("Lỗi API hỗ trợ học tập:", error);

    return res.status(500).json({
      thanhCong: false,

      thongBao: "Không thể tải dữ liệu hỗ trợ học tập.",
    });
  }
});

module.exports = router;
