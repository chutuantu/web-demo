const path = require("path");
const fs = require("fs");
const express = require("express");

const uploadThayFileTaiNguyen = require("../middleware/uploadThayFileTaiNguyen.js");
const xacDinhTaiNguyenUpload = require("../middleware/xacDinhTaiNguyenUpload.js");
const { uploadTaiNguyen } = require("../middleware/uploadTaiNguyen.js");

const { sql, layPool } = require("../config/database");

const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

// ============================================================
// BỌC MULTER ĐỂ TRẢ JSON ĐẸP CHO FRONTEND
// ============================================================

function uploadTaiNguyenAnToan(req, res, next) {
  uploadTaiNguyen.single("file")(req, res, function (error) {
    if (error) {
      console.error("LỖI MULTER UPLOAD TÀI NGUYÊN:", error.message);

      if (error?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "File vượt quá dung lượng cho phép (tối đa 500 MB).",
        });
      }

      return res.status(400).json({
        thanhCong: false,
        thongBao: error.message || "File không hợp lệ.",
      });
    }

    next();
  });
}

// ============================================================
// GET /api/giang-vien/tai-nguyen
//
// Lấy tài nguyên của giảng viên đang đăng nhập.
//
// QUY TẮC:
// - TRANG_THAI = 1, DA_XOA = 0
//   → Đã xuất bản
//
// - TRANG_THAI = 0, DA_XOA = 0
//   → Đang ẩn / Chờ xuất bản
//   → Vẫn hiện trong bảng GV
//
// - DA_XOA = 1
//   → Đã xóa
//   → Không trả về
// ============================================================

router.get(
  "/tai-nguyen",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. LẤY ID TÀI KHOẢN TỪ JWT
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 2. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 3. TÌM GIẢNG VIÊN
      // ======================================================

      const giangVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
          SELECT
            ID_GIANG_VIEN,
            MA_GIANG_VIEN,
            HO_TEN,
            EMAIL,
            BO_MON
          FROM GIANG_VIEN
          WHERE
            ID_TAI_KHOAN = @ID_TAI_KHOAN
        `);

      if (giangVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const giangVien = giangVienResult.recordset[0];

      const idGiangVien = Number(giangVien.ID_GIANG_VIEN);

      // ======================================================
      // 4. LẤY TÀI NGUYÊN
      //
      // QUAN TRỌNG:
      // Chỉ loại bản ghi đã XÓA:
      //
      // DA_XOA = 1 → không lấy
      //
      // DA_XOA = 0 → vẫn lấy dù TRANG_THAI = 0 hay 1
      // ======================================================

      const taiNguyenResult = await pool
        .request()
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
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

            T.DA_XOA,

            T.NGAY_TAO,

            T.NGAY_CAP_NHAT,

            H.MA_HOC_PHAN,

            H.TEN_HOC_PHAN,

            H.SO_TIN_CHI,

            H.KHOI_MON

          FROM TAI_NGUYEN_HOC_TAP T

          LEFT JOIN HOC_PHAN H
            ON T.ID_HOC_PHAN = H.ID_HOC_PHAN

          WHERE
            T.ID_GIANG_VIEN = @ID_GIANG_VIEN

            AND T.DA_XOA = 0

          ORDER BY
            T.NGAY_CAP_NHAT DESC,
            T.ID_TAI_NGUYEN DESC
        `);

      // ======================================================
      // 5. CHUYỂN DỮ LIỆU
      // ======================================================

      const taiNguyen = taiNguyenResult.recordset.map((item) => ({
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

        daXoa: Boolean(item.DA_XOA),

        ngayTao: item.NGAY_TAO,

        ngayCapNhat: item.NGAY_CAP_NHAT,

        hocPhan:
          item.ID_HOC_PHAN === null
            ? null
            : {
                idHocPhan: Number(item.ID_HOC_PHAN),

                maHocPhan: item.MA_HOC_PHAN,

                tenHocPhan: item.TEN_HOC_PHAN,

                soTinChi: Number(item.SO_TIN_CHI || 0),

                khoiMon: item.KHOI_MON || null,
              },
      }));

      // ======================================================
      // 6. THỐNG KÊ
      //
      // CHỈ TÍNH TÀI NGUYÊN:
      //
      // TRANG_THAI = 1
      // DA_XOA = 0
      //
      // Tài nguyên ẩn không tính.
      // Tài nguyên đã xóa không tính.
      // ======================================================

      const thongKeResult = await pool
        .request()
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
          SELECT

            COUNT(*) AS TONG_TAI_NGUYEN,

            SUM(
              CASE
                WHEN LOAI_TAI_NGUYEN = 'TAI_LIEU'
                THEN 1
                ELSE 0
              END
            ) AS TONG_TAI_LIEU,

            SUM(
              CASE
                WHEN LOAI_TAI_NGUYEN = 'VIDEO'
                THEN 1
                ELSE 0
              END
            ) AS TONG_VIDEO,

            SUM(
              CASE
                WHEN LOAI_TAI_NGUYEN = 'WEBSITE'
                THEN 1
                ELSE 0
              END
            ) AS TONG_WEBSITE,

            SUM(
              CASE
                WHEN NOI_BAT = 1
                THEN 1
                ELSE 0
              END
            ) AS TONG_NOI_BAT,

            COALESCE(
              SUM(LUOT_XEM),
              0
            ) AS TONG_LUOT_XEM,

            COALESCE(
              SUM(LUOT_TAI),
              0
            ) AS TONG_LUOT_TAI

          FROM TAI_NGUYEN_HOC_TAP

          WHERE
            ID_GIANG_VIEN = @ID_GIANG_VIEN

            AND TRANG_THAI = 1

            AND DA_XOA = 0
        `);

      const thongKe = thongKeResult.recordset[0];

      // ======================================================
      // 7. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        giangVien: {
          idGiangVien: idGiangVien,

          maGiangVien: giangVien.MA_GIANG_VIEN,

          hoTen: giangVien.HO_TEN,

          email: giangVien.EMAIL,

          boMon: giangVien.BO_MON,
        },

        tongSo: taiNguyen.length,

        taiNguyen,

        thongKe: {
          tongTaiNguyen: Number(thongKe.TONG_TAI_NGUYEN || 0),

          tongTaiLieu: Number(thongKe.TONG_TAI_LIEU || 0),

          tongVideo: Number(thongKe.TONG_VIDEO || 0),

          tongWebsite: Number(thongKe.TONG_WEBSITE || 0),

          tongNoiBat: Number(thongKe.TONG_NOI_BAT || 0),

          tongLuotXem: Number(thongKe.TONG_LUOT_XEM || 0),

          tongLuotTai: Number(thongKe.TONG_LUOT_TAI || 0),
        },
      });
    } catch (error) {
      console.error("LỖI LẤY TÀI NGUYÊN GIẢNG VIÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể lấy tài nguyên của giảng viên.",
      });
    }
  },
);

// ============================================================
// PATCH /api/giang-vien/tai-nguyen/:id/trang-thai
//
// BẬT / ẨN TÀI NGUYÊN
//
// true  -> Đã xuất bản
// false -> Chờ xuất bản
//
// KHÔNG thay đổi DA_XOA.
//
// Chỉ tài nguyên:
// DA_XOA = 0
// mới được thay đổi trạng thái.
// ============================================================

router.patch(
  "/tai-nguyen/:id/trang-thai",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. ID
      // ======================================================

      const idTaiNguyen = Number(req.params.id);

      if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 2. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 3. BODY
      // ======================================================

      if (typeof req.body?.trangThai !== "boolean") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Trường trangThai phải là true hoặc false.",
        });
      }

      const trangThai = req.body.trangThai;

      // ======================================================
      // 4. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 5. TÌM GIẢNG VIÊN
      // ======================================================

      const giangVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN = @ID_TAI_KHOAN
          `);

      if (giangVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const idGiangVien = Number(giangVienResult.recordset[0].ID_GIANG_VIEN);

      // ======================================================
      // 6. KIỂM TRA TÀI NGUYÊN
      // ======================================================

      const taiNguyenResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              TRANG_THAI,
              DA_XOA
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN
              AND
              ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (taiNguyenResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao:
            "Không tìm thấy tài nguyên hoặc tài nguyên không thuộc giảng viên đang đăng nhập.",
        });
      }

      const taiNguyenCu = taiNguyenResult.recordset[0];

      // ======================================================
      // 7. KHÔNG CHO SỬA TÀI NGUYÊN ĐÃ XÓA
      // ======================================================

      if (Boolean(taiNguyenCu.DA_XOA)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tài nguyên đã bị xóa, không thể thay đổi trạng thái.",
        });
      }

      // ======================================================
      // 8. UPDATE
      // ======================================================

      const updateResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien)
        .input("TRANG_THAI", sql.Bit, trangThai).query(`
            UPDATE TAI_NGUYEN_HOC_TAP

            SET
              TRANG_THAI =
                @TRANG_THAI,

              NGAY_CAP_NHAT =
                SYSDATETIME()

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN

              AND DA_XOA = 0;

            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              TRANG_THAI,
              DA_XOA,
              NGAY_CAP_NHAT

            FROM TAI_NGUYEN_HOC_TAP

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (updateResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không thể cập nhật tài nguyên.",
        });
      }

      const taiNguyen = updateResult.recordset[0];

      // ======================================================
      // 9. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        thongBao: trangThai ? "Đã bật tài nguyên." : "Đã ẩn tài nguyên.",

        taiNguyen: {
          idTaiNguyen: Number(taiNguyen.ID_TAI_NGUYEN),

          tenTaiNguyen: taiNguyen.TEN_TAI_NGUYEN,

          trangThai: Boolean(taiNguyen.TRANG_THAI),

          daXoa: Boolean(taiNguyen.DA_XOA),

          ngayCapNhat: taiNguyen.NGAY_CAP_NHAT,
        },
      });
    } catch (error) {
      console.error("LỖI CẬP NHẬT TRẠNG THÁI TÀI NGUYÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể cập nhật trạng thái tài nguyên.",
      });
    }
  },
);

// ============================================================
// POST /api/giang-vien/tai-nguyen
//
// Tạo WEBSITE.
// ============================================================

router.post(
  "/tai-nguyen",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 2. BODY
      // ======================================================

      const { idHocPhan, tenTaiNguyen, loaiTaiNguyen, moTa, duongDanUrl } =
        req.body || {};

      // ======================================================
      // 3. CHUẨN HÓA
      // ======================================================

      const ten = String(tenTaiNguyen ?? "").trim();

      const loai = String(loaiTaiNguyen ?? "")
        .trim()
        .toUpperCase();

      const moTaChuanHoa =
        moTa === null || moTa === undefined ? null : String(moTa).trim();

      const url =
        duongDanUrl === null ||
        duongDanUrl === undefined ||
        String(duongDanUrl).trim() === ""
          ? null
          : String(duongDanUrl).trim();

      const idHocPhanChuan =
        idHocPhan === null ||
        idHocPhan === undefined ||
        String(idHocPhan).trim() === ""
          ? null
          : Number(idHocPhan);

      // ======================================================
      // 4. VALIDATE TÊN
      // ======================================================

      if (!ten) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tên tài nguyên không được để trống.",
        });
      }

      if (ten.length > 200) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tên tài nguyên không được vượt quá 200 ký tự.",
        });
      }

      // ======================================================
      // 5. LOẠI
      // ======================================================

      const cacLoaiHopLe = ["TAI_LIEU", "VIDEO", "WEBSITE"];

      if (!cacLoaiHopLe.includes(loai)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Loại tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 6. HỌC PHẦN
      // ======================================================

      if (
        idHocPhanChuan !== null &&
        (!Number.isInteger(idHocPhanChuan) || idHocPhanChuan <= 0)
      ) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID học phần không hợp lệ.",
        });
      }

      const pool = layPool();

      // ======================================================
      // 7. KIỂM TRA HỌC PHẦN
      // ======================================================

      if (idHocPhanChuan !== null) {
        const hocPhanResult = await pool
          .request()
          .input("ID_HOC_PHAN", sql.Int, idHocPhanChuan).query(`
              SELECT
                ID_HOC_PHAN
              FROM HOC_PHAN
              WHERE
                ID_HOC_PHAN =
                  @ID_HOC_PHAN
                AND TRANG_THAI = 1
            `);

        if (hocPhanResult.recordset.length === 0) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: "Học phần không tồn tại hoặc đã bị khóa.",
          });
        }
      }

      // ======================================================
      // 8. WEBSITE BẮT BUỘC URL
      // ======================================================

      if (loai === "WEBSITE") {
        if (!url) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: "Tài nguyên WEBSITE bắt buộc phải có URL.",
          });
        }

        if (!/^https?:\/\//i.test(url)) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: "URL website phải bắt đầu bằng http:// hoặc https://.",
          });
        }
      }

      // ======================================================
      // 9. TÀI LIỆU / VIDEO KHÔNG DÙNG URL
      // ======================================================

      if (loai !== "WEBSITE" && url) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "TAI_LIEU và VIDEO không sử dụng URL website.",
        });
      }

      // ======================================================
      // 10. TÌM GV
      // ======================================================

      const gvResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN,
              MA_GIANG_VIEN,
              HO_TEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN =
                @ID_TAI_KHOAN
          `);

      if (gvResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const giangVien = gvResult.recordset[0];

      const idGiangVien = Number(giangVien.ID_GIANG_VIEN);

      // ======================================================
      // 11. INSERT
      // ======================================================

      const insertResult = await pool
        .request()
        .input("ID_HOC_PHAN", sql.Int, idHocPhanChuan)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien)
        .input("TEN_TAI_NGUYEN", sql.NVarChar(200), ten)
        .input("LOAI_TAI_NGUYEN", sql.VarChar(20), loai)
        .input("MO_TA", sql.NVarChar(1000), moTaChuanHoa)
        .input("DUONG_DAN_URL", sql.NVarChar(1000), url).query(`
            INSERT INTO TAI_NGUYEN_HOC_TAP (
              ID_HOC_PHAN,
              ID_GIANG_VIEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              MO_TA,
              DUONG_DAN_FILE,
              DUONG_DAN_URL,
              DUOI_FILE,
              KICH_THUOC_FILE,
              THOI_LUONG_GIAY,
              LUOT_XEM,
              LUOT_TAI,
              DIEM_DANH_GIA,
              SO_LUOT_DANH_GIA,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA,
              NGAY_TAO,
              NGAY_CAP_NHAT
            )

            OUTPUT
              INSERTED.ID_TAI_NGUYEN,
              INSERTED.TEN_TAI_NGUYEN,
              INSERTED.LOAI_TAI_NGUYEN,
              INSERTED.ID_HOC_PHAN,
              INSERTED.ID_GIANG_VIEN,
              INSERTED.MO_TA,
              INSERTED.DUONG_DAN_URL,
              INSERTED.NOI_BAT,
              INSERTED.TRANG_THAI,
              INSERTED.DA_XOA,
              INSERTED.NGAY_TAO,
              INSERTED.NGAY_CAP_NHAT

            VALUES (
              @ID_HOC_PHAN,
              @ID_GIANG_VIEN,
              @TEN_TAI_NGUYEN,
              @LOAI_TAI_NGUYEN,
              @MO_TA,
              NULL,
              @DUONG_DAN_URL,
              NULL,
              NULL,
              NULL,
              0,
              0,
              NULL,
              0,
              0,
              1,
              0,
              SYSDATETIME(),
              SYSDATETIME()
            )
          `);

      const taiNguyen = insertResult.recordset[0];

      // ======================================================
      // 12. RESPONSE
      // ======================================================

      return res.status(201).json({
        thanhCong: true,

        thongBao: "Tạo tài nguyên thành công.",

        taiNguyen: {
          idTaiNguyen: Number(taiNguyen.ID_TAI_NGUYEN),

          tenTaiNguyen: taiNguyen.TEN_TAI_NGUYEN,

          loaiTaiNguyen: taiNguyen.LOAI_TAI_NGUYEN,

          idHocPhan:
            taiNguyen.ID_HOC_PHAN === null
              ? null
              : Number(taiNguyen.ID_HOC_PHAN),

          idGiangVien: Number(taiNguyen.ID_GIANG_VIEN),

          moTa: taiNguyen.MO_TA || null,

          duongDanUrl: taiNguyen.DUONG_DAN_URL || null,

          noiBat: Boolean(taiNguyen.NOI_BAT),

          trangThai: Boolean(taiNguyen.TRANG_THAI),

          daXoa: Boolean(taiNguyen.DA_XOA),

          ngayTao: taiNguyen.NGAY_TAO,

          ngayCapNhat: taiNguyen.NGAY_CAP_NHAT,
        },
      });
    } catch (error) {
      console.error("LỖI TẠO TÀI NGUYÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể tạo tài nguyên.",
      });
    }
  },
);

// ============================================================
// PUT /api/giang-vien/tai-nguyen/:id
//
// Sửa thông tin tài nguyên.
//
// Không cho sửa tài nguyên đã xóa.
// ============================================================

router.put(
  "/tai-nguyen/:id",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. ID
      // ======================================================

      const idTaiNguyen = Number(req.params.id);

      if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 2. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 3. BODY
      // ======================================================

      const { idHocPhan, tenTaiNguyen, moTa, duongDanUrl } = req.body || {};

      const ten = String(tenTaiNguyen ?? "").trim();

      const moTaChuan =
        moTa === null || moTa === undefined ? null : String(moTa).trim();

      const idHocPhanChuan =
        idHocPhan === null ||
        idHocPhan === undefined ||
        String(idHocPhan).trim() === ""
          ? null
          : Number(idHocPhan);

      const url =
        duongDanUrl === null ||
        duongDanUrl === undefined ||
        String(duongDanUrl).trim() === ""
          ? null
          : String(duongDanUrl).trim();

      // ======================================================
      // 4. VALIDATE
      // ======================================================

      if (!ten) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tên tài nguyên không được để trống.",
        });
      }

      if (ten.length > 200) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tên tài nguyên không được vượt quá 200 ký tự.",
        });
      }

      if (
        idHocPhanChuan !== null &&
        (!Number.isInteger(idHocPhanChuan) || idHocPhanChuan <= 0)
      ) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID học phần không hợp lệ.",
        });
      }

      // ======================================================
      // 5. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 6. GIẢNG VIÊN
      // ======================================================

      const giangVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN =
                @ID_TAI_KHOAN
          `);

      if (giangVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const idGiangVien = Number(giangVienResult.recordset[0].ID_GIANG_VIEN);

      // ======================================================
      // 7. LẤY TÀI NGUYÊN
      // ======================================================

      const taiNguyenResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
            SELECT
              ID_TAI_NGUYEN,
              ID_HOC_PHAN,
              ID_GIANG_VIEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              MO_TA,
              DUONG_DAN_FILE,
              DUONG_DAN_URL,
              DUOI_FILE,
              KICH_THUOC_FILE,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA,
              NGAY_TAO,
              NGAY_CAP_NHAT
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN
              AND
              ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (taiNguyenResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao:
            "Không tìm thấy tài nguyên hoặc tài nguyên không thuộc giảng viên đang đăng nhập.",
        });
      }

      const taiNguyenCu = taiNguyenResult.recordset[0];

      // ======================================================
      // 8. KHÔNG CHO SỬA ĐÃ XÓA
      // ======================================================

      if (Boolean(taiNguyenCu.DA_XOA)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tài nguyên đã bị xóa, không thể sửa.",
        });
      }

      const loai = String(taiNguyenCu.LOAI_TAI_NGUYEN || "")
        .trim()
        .toUpperCase();

      // ======================================================
      // 9. KIỂM TRA HỌC PHẦN
      // ======================================================

      if (idHocPhanChuan !== null) {
        const hocPhanResult = await pool
          .request()
          .input("ID_HOC_PHAN", sql.Int, idHocPhanChuan).query(`
              SELECT
                ID_HOC_PHAN
              FROM HOC_PHAN
              WHERE
                ID_HOC_PHAN =
                  @ID_HOC_PHAN
                AND TRANG_THAI = 1
            `);

        if (hocPhanResult.recordset.length === 0) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: "Học phần không tồn tại hoặc đã bị khóa.",
          });
        }
      }

      // ======================================================
      // 10. WEBSITE
      // ======================================================

      if (loai === "WEBSITE") {
        if (!url) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: "Tài nguyên WEBSITE bắt buộc phải có URL.",
          });
        }

        if (!/^https?:\/\//i.test(url)) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: "URL website phải bắt đầu bằng http:// hoặc https://.",
          });
        }
      }

      // ======================================================
      // 11. TÀI LIỆU / VIDEO
      // ======================================================

      if (loai !== "WEBSITE" && url) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "TAI_LIEU và VIDEO không sử dụng URL website.",
        });
      }

      const urlMoi = loai === "WEBSITE" ? url : null;

      // ======================================================
      // 12. UPDATE
      // ======================================================

      const updateResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien)
        .input("ID_HOC_PHAN", sql.Int, idHocPhanChuan)
        .input("TEN_TAI_NGUYEN", sql.NVarChar(200), ten)
        .input("MO_TA", sql.NVarChar(1000), moTaChuan)
        .input("DUONG_DAN_URL", sql.NVarChar(1000), urlMoi).query(`
            UPDATE TAI_NGUYEN_HOC_TAP
            SET
              ID_HOC_PHAN =
                @ID_HOC_PHAN,

              TEN_TAI_NGUYEN =
                @TEN_TAI_NGUYEN,

              MO_TA =
                @MO_TA,

              DUONG_DAN_URL =
                @DUONG_DAN_URL,

              NGAY_CAP_NHAT =
                SYSDATETIME()

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN

              AND DA_XOA = 0;

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
              T.DA_XOA,
              T.NGAY_TAO,
              T.NGAY_CAP_NHAT,

              H.MA_HOC_PHAN,
              H.TEN_HOC_PHAN,
              H.SO_TIN_CHI,
              H.KHOI_MON

            FROM TAI_NGUYEN_HOC_TAP T

            LEFT JOIN HOC_PHAN H
              ON T.ID_HOC_PHAN =
                 H.ID_HOC_PHAN

            WHERE
              T.ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND T.ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (updateResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không thể cập nhật tài nguyên.",
        });
      }

      const item = updateResult.recordset[0];

      // ======================================================
      // 13. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        thongBao: "Cập nhật tài nguyên thành công.",

        taiNguyen: {
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

          daXoa: Boolean(item.DA_XOA),

          ngayTao: item.NGAY_TAO,

          ngayCapNhat: item.NGAY_CAP_NHAT,

          hocPhan:
            item.ID_HOC_PHAN === null
              ? null
              : {
                  idHocPhan: Number(item.ID_HOC_PHAN),

                  maHocPhan: item.MA_HOC_PHAN,

                  tenHocPhan: item.TEN_HOC_PHAN,

                  soTinChi: Number(item.SO_TIN_CHI || 0),

                  khoiMon: item.KHOI_MON || null,
                },
        },
      });
    } catch (error) {
      console.error("LỖI SỬA TÀI NGUYÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể sửa tài nguyên.",
      });
    }
  },
);

// ============================================================
// PATCH /api/giang-vien/tai-nguyen/:id/noi-bat
//
// BẬT / TẮT NỔI BẬT.
//
// Quy tắc:
// - DA_XOA = 1 → không thao tác được.
// - TRANG_THAI = 0 → không được bật nổi bật.
// ============================================================

router.patch(
  "/tai-nguyen/:id/noi-bat",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. ID
      // ======================================================

      const idTaiNguyen = Number(req.params.id);

      if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 2. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 3. BODY
      // ======================================================

      if (typeof req.body?.noiBat !== "boolean") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Trường noiBat phải là true hoặc false.",
        });
      }

      const noiBat = req.body.noiBat;

      // ======================================================
      // 4. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 5. GV
      // ======================================================

      const giangVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN =
                @ID_TAI_KHOAN
          `);

      if (giangVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const idGiangVien = Number(giangVienResult.recordset[0].ID_GIANG_VIEN);

      // ======================================================
      // 6. TÀI NGUYÊN
      // ======================================================

      const taiNguyenResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN
              AND
              ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (taiNguyenResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao:
            "Không tìm thấy tài nguyên hoặc tài nguyên không thuộc giảng viên đang đăng nhập.",
        });
      }

      const taiNguyenCu = taiNguyenResult.recordset[0];

      // ======================================================
      // 7. ĐÃ XÓA
      // ======================================================

      if (Boolean(taiNguyenCu.DA_XOA)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tài nguyên đã bị xóa.",
        });
      }

      // ======================================================
      // 8. ĐANG ẨN + MUỐN BẬT NỔI BẬT
      // ======================================================

      if (!Boolean(taiNguyenCu.TRANG_THAI) && noiBat === true) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Không thể đánh dấu nổi bật cho tài nguyên đang bị ẩn.",
        });
      }

      // ======================================================
      // 9. UPDATE
      // ======================================================

      const updateResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien)
        .input("NOI_BAT", sql.Bit, noiBat).query(`
            UPDATE TAI_NGUYEN_HOC_TAP

            SET
              NOI_BAT =
                @NOI_BAT,

              NGAY_CAP_NHAT =
                SYSDATETIME()

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN

              AND DA_XOA = 0;

            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA,
              NGAY_CAP_NHAT
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (updateResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không thể cập nhật trạng thái nổi bật.",
        });
      }

      const taiNguyen = updateResult.recordset[0];

      // ======================================================
      // 10. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        thongBao: noiBat
          ? "Đã đánh dấu tài nguyên nổi bật."
          : "Đã bỏ trạng thái nổi bật.",

        taiNguyen: {
          idTaiNguyen: Number(taiNguyen.ID_TAI_NGUYEN),

          tenTaiNguyen: taiNguyen.TEN_TAI_NGUYEN,

          loaiTaiNguyen: taiNguyen.LOAI_TAI_NGUYEN,

          noiBat: Boolean(taiNguyen.NOI_BAT),

          trangThai: Boolean(taiNguyen.TRANG_THAI),

          daXoa: Boolean(taiNguyen.DA_XOA),

          ngayCapNhat: taiNguyen.NGAY_CAP_NHAT,
        },
      });
    } catch (error) {
      console.error("LỖI CẬP NHẬT NỔI BẬT TÀI NGUYÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể cập nhật trạng thái nổi bật.",
      });
    }
  },
);

// ============================================================
// POST /api/giang-vien/tai-nguyen/upload
//
// Upload:
// - TAI_LIEU
// - VIDEO
//
// WEBSITE không upload file.
// ============================================================

router.post(
  "/tai-nguyen/upload",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  uploadTaiNguyenAnToan,
  async (req, res) => {
    try {
      // ======================================================
      // 1. FILE
      // ======================================================

      if (!req.file) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Bạn chưa chọn file để tải lên.",
        });
      }

      // ======================================================
      // 2. BODY
      // ======================================================

      const { idHocPhan, tenTaiNguyen, loaiTaiNguyen, moTa } = req.body || {};

      // ======================================================
      // 3. CHUẨN HÓA
      // ======================================================

      const ten = String(tenTaiNguyen ?? "").trim();

      const loaiYeuCau = String(loaiTaiNguyen ?? "")
        .trim()
        .toUpperCase();

      let loai = loaiYeuCau;

      if (req.file && loai !== "TAI_LIEU" && loai !== "VIDEO") {
        const { xacDinhLoaiFile } = require("../middleware/uploadTaiNguyen.js");

        loai = xacDinhLoaiFile(req.file) || "";
      }

      const moTaChuan =
        moTa === null || moTa === undefined ? null : String(moTa).trim();

      const idHocPhanChuan =
        idHocPhan === null ||
        idHocPhan === undefined ||
        String(idHocPhan).trim() === ""
          ? null
          : Number(idHocPhan);

      // ======================================================
      // 4. VALIDATE TÊN
      // ======================================================

      if (!ten) {
        await fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tên tài nguyên không được để trống.",
        });
      }

      if (ten.length > 200) {
        await fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tên tài nguyên không được vượt quá 200 ký tự.",
        });
      }

      // ======================================================
      // 5. LOẠI
      // ======================================================

      if (loai !== "TAI_LIEU" && loai !== "VIDEO") {
        await fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(400).json({
          thanhCong: false,
          thongBao: "Chỉ TAI_LIEU và VIDEO được upload file.",
        });
      }

      // ======================================================
      // 6. HỌC PHẦN
      // ======================================================

      if (
        idHocPhanChuan !== null &&
        (!Number.isInteger(idHocPhanChuan) || idHocPhanChuan <= 0)
      ) {
        await fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID học phần không hợp lệ.",
        });
      }

      const pool = layPool();

      // ======================================================
      // 7. KIỂM TRA HỌC PHẦN
      // ======================================================

      if (idHocPhanChuan !== null) {
        const hocPhanResult = await pool
          .request()
          .input("ID_HOC_PHAN", sql.Int, idHocPhanChuan).query(`
              SELECT
                ID_HOC_PHAN
              FROM HOC_PHAN
              WHERE
                ID_HOC_PHAN =
                  @ID_HOC_PHAN
                AND TRANG_THAI = 1
            `);

        if (hocPhanResult.recordset.length === 0) {
          await fs.promises.unlink(req.file.path).catch(() => {});

          return res.status(400).json({
            thanhCong: false,
            thongBao: "Học phần không tồn tại hoặc đã bị khóa.",
          });
        }
      }

      // ======================================================
      // 8. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!idTaiKhoan) {
        await fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 9. GIẢNG VIÊN
      // ======================================================

      const gvResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN,
              MA_GIANG_VIEN,
              HO_TEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN =
                @ID_TAI_KHOAN
          `);

      if (gvResult.recordset.length === 0) {
        await fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const idGiangVien = Number(gvResult.recordset[0].ID_GIANG_VIEN);

      // ======================================================
      // 10. ĐƯỜNG DẪN
      // ======================================================

      const thuMuc = loai === "TAI_LIEU" ? "tai-lieu" : "video";

      const duongDanFile = `/uploads/${thuMuc}/${req.file.filename}`;

      // ======================================================
      // 11. ĐUÔI FILE
      // ======================================================

      const duoiFile = path
        .extname(req.file.originalname)
        .toLowerCase()
        .replace(".", "");

      // ======================================================
      // 12. INSERT
      // ======================================================

      let insertResult;

      try {
        insertResult = await pool
          .request()
          .input("ID_HOC_PHAN", sql.Int, idHocPhanChuan)
          .input("ID_GIANG_VIEN", sql.Int, idGiangVien)
          .input("TEN_TAI_NGUYEN", sql.NVarChar(200), ten)
          .input("LOAI_TAI_NGUYEN", sql.VarChar(20), loai)
          .input("MO_TA", sql.NVarChar(1000), moTaChuan)
          .input("DUONG_DAN_FILE", sql.NVarChar(500), duongDanFile)
          .input("DUOI_FILE", sql.VarChar(20), duoiFile)
          .input("KICH_THUOC_FILE", sql.BigInt, req.file.size).query(`
              INSERT INTO TAI_NGUYEN_HOC_TAP (
                ID_HOC_PHAN,
                ID_GIANG_VIEN,
                TEN_TAI_NGUYEN,
                LOAI_TAI_NGUYEN,
                MO_TA,
                DUONG_DAN_FILE,
                DUONG_DAN_URL,
                DUOI_FILE,
                KICH_THUOC_FILE,
                THOI_LUONG_GIAY,
                LUOT_XEM,
                LUOT_TAI,
                DIEM_DANH_GIA,
                SO_LUOT_DANH_GIA,
                NOI_BAT,
                TRANG_THAI,
                DA_XOA,
                NGAY_TAO,
                NGAY_CAP_NHAT
              )

              OUTPUT
                INSERTED.ID_TAI_NGUYEN,
                INSERTED.ID_HOC_PHAN,
                INSERTED.ID_GIANG_VIEN,
                INSERTED.TEN_TAI_NGUYEN,
                INSERTED.LOAI_TAI_NGUYEN,
                INSERTED.MO_TA,
                INSERTED.DUONG_DAN_FILE,
                INSERTED.DUONG_DAN_URL,
                INSERTED.DUOI_FILE,
                INSERTED.KICH_THUOC_FILE,
                INSERTED.LUOT_XEM,
                INSERTED.LUOT_TAI,
                INSERTED.NOI_BAT,
                INSERTED.TRANG_THAI,
                INSERTED.DA_XOA,
                INSERTED.NGAY_TAO,
                INSERTED.NGAY_CAP_NHAT

              VALUES (
                @ID_HOC_PHAN,
                @ID_GIANG_VIEN,
                @TEN_TAI_NGUYEN,
                @LOAI_TAI_NGUYEN,
                @MO_TA,
                @DUONG_DAN_FILE,
                NULL,
                @DUOI_FILE,
                @KICH_THUOC_FILE,
                NULL,
                0,
                0,
                NULL,
                0,
                0,
                1,
                0,
                SYSDATETIME(),
                SYSDATETIME()
              )
            `);
      } catch (dbError) {
        await fs.promises.unlink(req.file.path).catch(() => {});

        throw dbError;
      }

      const item = insertResult.recordset[0];

      // ======================================================
      // 13. RESPONSE
      // ======================================================

      return res.status(201).json({
        thanhCong: true,

        thongBao: "Upload tài nguyên thành công.",

        taiNguyen: {
          idTaiNguyen: Number(item.ID_TAI_NGUYEN),

          tenTaiNguyen: item.TEN_TAI_NGUYEN,

          loaiTaiNguyen: item.LOAI_TAI_NGUYEN,

          moTa: item.MO_TA || null,

          duongDanFile: item.DUONG_DAN_FILE,

          duongDanUrl: item.DUONG_DAN_URL || null,

          duoiFile: item.DUOI_FILE,

          kichThuocFile: Number(item.KICH_THUOC_FILE),

          luotXem: Number(item.LUOT_XEM || 0),

          luotTai: Number(item.LUOT_TAI || 0),

          noiBat: Boolean(item.NOI_BAT),

          trangThai: Boolean(item.TRANG_THAI),

          daXoa: Boolean(item.DA_XOA),

          ngayTao: item.NGAY_TAO,

          ngayCapNhat: item.NGAY_CAP_NHAT,
        },
      });
    } catch (error) {
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path).catch(() => {});
      }

      console.error("LỖI UPLOAD TÀI NGUYÊN:", error);

      if (error?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "File vượt quá dung lượng cho phép.",
        });
      }

      return res.status(500).json({
        thanhCong: false,
        thongBao: error?.message || "Không thể upload tài nguyên.",
      });
    }
  },
);

// ============================================================
// POST /api/giang-vien/tai-nguyen/:id/thay-file
//
// Thay file TAI_LIEU / VIDEO.
//
// Không cho thay file tài nguyên đã xóa.
// ============================================================

router.post(
  "/tai-nguyen/:id/thay-file",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  xacDinhTaiNguyenUpload,
  uploadThayFileTaiNguyen.single("file"),
  async (req, res) => {
    let fileMoiPath = req.file?.path || null;

    try {
      // ======================================================
      // 1. FILE
      // ======================================================

      if (!req.file) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Bạn chưa chọn file mới.",
        });
      }

      // ======================================================
      // 2. THÔNG TIN TỪ MIDDLEWARE
      // ======================================================

      const idTaiNguyen = req.idTaiNguyenUpload;

      const idGiangVien = req.idGiangVienUpload;

      const loai = req.loaiTaiNguyen;

      const duongDanFileCu = req.duongDanFileCu;

      // ======================================================
      // 3. KIỂM TRA ID
      // ======================================================

      if (!Number.isInteger(Number(idTaiNguyen)) || Number(idTaiNguyen) <= 0) {
        if (fileMoiPath) {
          await fs.promises.unlink(fileMoiPath).catch(() => {});
        }

        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 4. ĐƯỜNG DẪN FILE
      // ======================================================

      const thuMuc = loai === "TAI_LIEU" ? "tai-lieu" : "video";

      const duongDanFileMoi = `/uploads/${thuMuc}/${req.file.filename}`;

      // ======================================================
      // 5. ĐUÔI FILE
      // ======================================================

      const duoiFileMoi = path
        .extname(req.file.originalname)
        .toLowerCase()
        .replace(".", "");

      // ======================================================
      // 6. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 7. UPDATE
      // ======================================================

      let updateResult;

      try {
        updateResult = await pool
          .request()
          .input("ID_TAI_NGUYEN", sql.Int, Number(idTaiNguyen))
          .input("ID_GIANG_VIEN", sql.Int, Number(idGiangVien))
          .input("DUONG_DAN_FILE", sql.NVarChar(500), duongDanFileMoi)
          .input("DUONG_DAN_URL", sql.NVarChar(1000), null)
          .input("DUOI_FILE", sql.VarChar(20), duoiFileMoi)
          .input("KICH_THUOC_FILE", sql.BigInt, req.file.size).query(`
              UPDATE TAI_NGUYEN_HOC_TAP

              SET
                DUONG_DAN_FILE =
                  @DUONG_DAN_FILE,

                DUONG_DAN_URL =
                  @DUONG_DAN_URL,

                DUOI_FILE =
                  @DUOI_FILE,

                KICH_THUOC_FILE =
                  @KICH_THUOC_FILE,

                NGAY_CAP_NHAT =
                  SYSDATETIME()

              WHERE
                ID_TAI_NGUYEN =
                  @ID_TAI_NGUYEN

                AND ID_GIANG_VIEN =
                  @ID_GIANG_VIEN

                AND DA_XOA = 0;

              SELECT
                ID_TAI_NGUYEN,
                TEN_TAI_NGUYEN,
                LOAI_TAI_NGUYEN,
                DUONG_DAN_FILE,
                DUONG_DAN_URL,
                DUOI_FILE,
                KICH_THUOC_FILE,
                LUOT_XEM,
                LUOT_TAI,
                NOI_BAT,
                TRANG_THAI,
                DA_XOA,
                NGAY_TAO,
                NGAY_CAP_NHAT

              FROM TAI_NGUYEN_HOC_TAP

              WHERE
                ID_TAI_NGUYEN =
                  @ID_TAI_NGUYEN

                AND ID_GIANG_VIEN =
                  @ID_GIANG_VIEN
            `);
      } catch (dbError) {
        if (fileMoiPath) {
          await fs.promises.unlink(fileMoiPath).catch(() => {});
        }

        fileMoiPath = null;

        throw dbError;
      }

      // ======================================================
      // 8. KIỂM TRA
      // ======================================================

      if (updateResult.recordset.length === 0) {
        if (fileMoiPath) {
          await fs.promises.unlink(fileMoiPath).catch(() => {});
        }

        fileMoiPath = null;

        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không thể cập nhật file mới.",
        });
      }

      const item = updateResult.recordset[0];

      // ======================================================
      // 9. XÓA FILE CŨ
      // ======================================================

      if (duongDanFileCu) {
        const fileCuPath = path.join(
          __dirname,
          "..",
          duongDanFileCu.replace(/^\/+/, ""),
        );

        if (fileCuPath !== fileMoiPath) {
          await fs.promises.unlink(fileCuPath).catch((error) => {
            console.warn("Không thể xóa file cũ:", fileCuPath, error.message);
          });
        }
      }

      fileMoiPath = null;

      // ======================================================
      // 10. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        thongBao: "Đã thay file thành công.",

        taiNguyen: {
          idTaiNguyen: Number(item.ID_TAI_NGUYEN),

          tenTaiNguyen: item.TEN_TAI_NGUYEN,

          loaiTaiNguyen: item.LOAI_TAI_NGUYEN,

          duongDanFile: item.DUONG_DAN_FILE,

          duongDanUrl: item.DUONG_DAN_URL || null,

          duoiFile: item.DUOI_FILE,

          kichThuocFile:
            item.KICH_THUOC_FILE === null ? null : Number(item.KICH_THUOC_FILE),

          luotXem: Number(item.LUOT_XEM || 0),

          luotTai: Number(item.LUOT_TAI || 0),

          noiBat: Boolean(item.NOI_BAT),

          trangThai: Boolean(item.TRANG_THAI),

          daXoa: Boolean(item.DA_XOA),

          ngayTao: item.NGAY_TAO,

          ngayCapNhat: item.NGAY_CAP_NHAT,
        },
      });
    } catch (error) {
      if (fileMoiPath) {
        await fs.promises.unlink(fileMoiPath).catch(() => {});
      }

      console.error("LỖI THAY FILE TÀI NGUYÊN:", error);

      if (error?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "File mới vượt quá dung lượng cho phép.",
        });
      }

      return res.status(500).json({
        thanhCong: false,
        thongBao: error?.message || "Không thể thay file tài nguyên.",
      });
    }
  },
);

// ============================================================
// DELETE /api/giang-vien/tai-nguyen/:id
//
// XÓA TÀI NGUYÊN.
//
// Đây là "xóa" thực sự khỏi danh sách hoạt động:
//
// TRANG_THAI = 0
// NOI_BAT = 0
// DA_XOA = 1
//
// Record SQL vẫn giữ lại.
//
// Nếu là TAI_LIEU / VIDEO:
// → xóa file vật lý.
//
// Nếu là WEBSITE:
// → không có file vật lý.
// ============================================================

router.delete(
  "/tai-nguyen/:id",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. ID
      // ======================================================

      const idTaiNguyen = Number(req.params.id);

      if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 2. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 3. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 4. GIẢNG VIÊN
      // ======================================================

      const giangVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN =
                @ID_TAI_KHOAN
          `);

      if (giangVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const idGiangVien = Number(giangVienResult.recordset[0].ID_GIANG_VIEN);

      // ======================================================
      // 5. LẤY TÀI NGUYÊN
      // ======================================================

      const taiNguyenResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              DUONG_DAN_FILE,
              DUONG_DAN_URL,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA
            FROM TAI_NGUYEN_HOC_TAP
            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (taiNguyenResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao:
            "Không tìm thấy tài nguyên hoặc tài nguyên không thuộc giảng viên đang đăng nhập.",
        });
      }

      const taiNguyen = taiNguyenResult.recordset[0];

      // ======================================================
      // 6. ĐÃ XÓA TRƯỚC ĐÓ
      // ======================================================

      if (Boolean(taiNguyen.DA_XOA)) {
        return res.status(200).json({
          thanhCong: true,

          thongBao: "Tài nguyên đã được xóa trước đó.",

          taiNguyen: {
            idTaiNguyen: Number(taiNguyen.ID_TAI_NGUYEN),

            tenTaiNguyen: taiNguyen.TEN_TAI_NGUYEN,

            trangThai: false,

            daXoa: true,

            noiBat: false,
          },
        });
      }

      // ======================================================
      // 7. FILE VẬT LÝ
      // ======================================================

      let filePath = null;

      if (taiNguyen.DUONG_DAN_FILE) {
        filePath = path.join(
          __dirname,
          "..",
          taiNguyen.DUONG_DAN_FILE.replace(/^\/+/, ""),
        );
      }

      // ======================================================
      // 8. UPDATE DATABASE
      //
      // KHÁC VỚI "ẨN":
      //
      // ẨN:
      //   TRANG_THAI = 0
      //   DA_XOA = 0
      //
      // XÓA:
      //   TRANG_THAI = 0
      //   DA_XOA = 1
      // ======================================================

      const updateResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
            UPDATE TAI_NGUYEN_HOC_TAP

            SET
              TRANG_THAI = 0,

              NOI_BAT = 0,

              DA_XOA = 1,

              NGAY_CAP_NHAT =
                SYSDATETIME()

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN

              AND DA_XOA = 0;

            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA,
              NGAY_CAP_NHAT

            FROM TAI_NGUYEN_HOC_TAP

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (updateResult.recordset.length === 0) {
        return res.status(500).json({
          thanhCong: false,
          thongBao: "Không thể xóa tài nguyên.",
        });
      }

      const item = updateResult.recordset[0];

      // ======================================================
      // 9. XÓA FILE VẬT LÝ
      // ======================================================

      let fileDaXoa = false;

      let fileKhongTonTai = false;

      let loiXoaFile = null;

      if (filePath) {
        try {
          await fs.promises.unlink(filePath);

          fileDaXoa = true;
        } catch (fileError) {
          if (fileError.code === "ENOENT") {
            fileKhongTonTai = true;
          } else {
            loiXoaFile = fileError.message;

            console.warn("Không thể xóa file vật lý:", filePath, fileError);
          }
        }
      }

      // ======================================================
      // 10. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        thongBao: "Đã xóa tài nguyên.",

        taiNguyen: {
          idTaiNguyen: Number(item.ID_TAI_NGUYEN),

          tenTaiNguyen: item.TEN_TAI_NGUYEN,

          loaiTaiNguyen: item.LOAI_TAI_NGUYEN,

          trangThai: false,

          daXoa: true,

          noiBat: false,

          fileDaXoa,

          fileKhongTonTai,

          canKiemTraFile: Boolean(loiXoaFile),

          ngayCapNhat: item.NGAY_CAP_NHAT,
        },

        canhBao: loiXoaFile
          ? "Tài nguyên đã được xóa khỏi danh sách nhưng file vật lý chưa thể xóa. Cần kiểm tra thư mục uploads."
          : null,
      });
    } catch (error) {
      console.error("LỖI XÓA TÀI NGUYÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể xóa tài nguyên.",
      });
    }
  },
);

// ============================================================
// DELETE /api/giang-vien/tai-nguyen
//
// XÓA NHIỀU.
//
// Có thể xóa:
// - tài nguyên đang xuất bản
// - tài nguyên đang ẩn
//
// Không xóa lại:
// - DA_XOA = 1
// ============================================================

router.delete(
  "/tai-nguyen",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 2. IDS
      // ======================================================

      const ids = req.body?.ids;

      if (!Array.isArray(ids)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Trường ids phải là một mảng.",
        });
      }

      const danhSachId = [
        ...new Set(
          ids
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      if (danhSachId.length === 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Chưa có tài nguyên hợp lệ để xóa.",
        });
      }

      // ======================================================
      // 3. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 4. GV
      // ======================================================

      const giangVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN =
                @ID_TAI_KHOAN
          `);

      if (giangVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const idGiangVien = Number(giangVienResult.recordset[0].ID_GIANG_VIEN);

      // ======================================================
      // 5. QUERY IDS
      // ======================================================

      const requestLayTaiNguyen = pool.request();

      requestLayTaiNguyen.input("ID_GIANG_VIEN", sql.Int, idGiangVien);

      const placeholders = danhSachId.map((_, index) => `@ID_${index}`);

      danhSachId.forEach((id, index) => {
        requestLayTaiNguyen.input(`ID_${index}`, sql.Int, id);
      });

      const taiNguyenResult = await requestLayTaiNguyen.query(`
          SELECT
            ID_TAI_NGUYEN,
            TEN_TAI_NGUYEN,
            LOAI_TAI_NGUYEN,
            DUONG_DAN_FILE,
            NOI_BAT,
            TRANG_THAI,
            DA_XOA
          FROM TAI_NGUYEN_HOC_TAP
          WHERE
            ID_GIANG_VIEN =
              @ID_GIANG_VIEN

            AND ID_TAI_NGUYEN IN (
              ${placeholders.join(", ")}
            )
        `);

      const taiNguyenThuocGiangVien = taiNguyenResult.recordset;

      // ======================================================
      // 6. ID KHÔNG HỢP LỆ
      // ======================================================

      const tapIdHopLe = new Set(
        taiNguyenThuocGiangVien.map((item) => Number(item.ID_TAI_NGUYEN)),
      );

      const idKhongThuocGiangVien = danhSachId.filter(
        (id) => !tapIdHopLe.has(id),
      );

      if (taiNguyenThuocGiangVien.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao:
            "Không tìm thấy tài nguyên nào thuộc giảng viên đang đăng nhập.",
          idKhongHopLe: idKhongThuocGiangVien,
        });
      }

      // ======================================================
      // 7. KẾT QUẢ
      // ======================================================

      const daXoa = [];

      const daXoaTruocDo = [];

      const loiFile = [];

      // ======================================================
      // 8. XỬ LÝ TỪNG TÀI NGUYÊN
      // ======================================================

      for (const taiNguyen of taiNguyenThuocGiangVien) {
        const idTaiNguyen = Number(taiNguyen.ID_TAI_NGUYEN);

        // ----------------------------------------------------
        // ĐÃ XÓA TRƯỚC ĐÓ
        // ----------------------------------------------------

        if (Boolean(taiNguyen.DA_XOA)) {
          daXoaTruocDo.push({
            idTaiNguyen,

            tenTaiNguyen: taiNguyen.TEN_TAI_NGUYEN,
          });

          continue;
        }

        // ----------------------------------------------------
        // FILE
        // ----------------------------------------------------

        let filePath = null;

        if (taiNguyen.DUONG_DAN_FILE) {
          filePath = path.join(
            __dirname,
            "..",
            taiNguyen.DUONG_DAN_FILE.replace(/^\/+/, ""),
          );
        }

        // ----------------------------------------------------
        // UPDATE
        // ----------------------------------------------------

        const updateResult = await pool
          .request()
          .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
          .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
              UPDATE TAI_NGUYEN_HOC_TAP

              SET
                TRANG_THAI = 0,

                NOI_BAT = 0,

                DA_XOA = 1,

                NGAY_CAP_NHAT =
                  SYSDATETIME()

              WHERE
                ID_TAI_NGUYEN =
                  @ID_TAI_NGUYEN

                AND ID_GIANG_VIEN =
                  @ID_GIANG_VIEN

                AND DA_XOA = 0;

              SELECT
                ID_TAI_NGUYEN,
                TEN_TAI_NGUYEN,
                LOAI_TAI_NGUYEN,
                TRANG_THAI,
                NOI_BAT,
                DA_XOA,
                NGAY_CAP_NHAT

              FROM TAI_NGUYEN_HOC_TAP

              WHERE
                ID_TAI_NGUYEN =
                  @ID_TAI_NGUYEN

                AND ID_GIANG_VIEN =
                  @ID_GIANG_VIEN
            `);

        if (updateResult.recordset.length === 0) {
          continue;
        }

        const item = updateResult.recordset[0];

        // ----------------------------------------------------
        // XÓA FILE
        // ----------------------------------------------------

        let fileDaXoa = false;

        let fileKhongTonTai = false;

        if (filePath) {
          try {
            await fs.promises.unlink(filePath);

            fileDaXoa = true;
          } catch (fileError) {
            if (fileError.code === "ENOENT") {
              fileKhongTonTai = true;
            } else {
              loiFile.push({
                idTaiNguyen,

                tenTaiNguyen: taiNguyen.TEN_TAI_NGUYEN,

                loi: fileError.message,
              });

              console.warn("Không thể xóa file vật lý:", filePath, fileError);
            }
          }
        }

        // ----------------------------------------------------
        // LƯU KẾT QUẢ
        // ----------------------------------------------------

        daXoa.push({
          idTaiNguyen: Number(item.ID_TAI_NGUYEN),

          tenTaiNguyen: item.TEN_TAI_NGUYEN,

          loaiTaiNguyen: item.LOAI_TAI_NGUYEN,

          trangThai: false,

          daXoa: true,

          noiBat: false,

          fileDaXoa,

          fileKhongTonTai,

          ngayCapNhat: item.NGAY_CAP_NHAT,
        });
      }

      // ======================================================
      // 9. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        thongBao:
          daXoa.length > 0
            ? `Đã xóa ${daXoa.length} tài nguyên.`
            : "Không có tài nguyên mới nào được xóa.",

        tongYeuCau: danhSachId.length,

        tongDaXoa: daXoa.length,

        tongDaXoaTruocDo: daXoaTruocDo.length,

        tongKhongThuocGiangVien: idKhongThuocGiangVien.length,

        daXoa,

        daXoaTruocDo,

        idKhongThuocGiangVien,

        loiFile,
      });
    } catch (error) {
      console.error("LỖI XÓA NHIỀU TÀI NGUYÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể xóa các tài nguyên đã chọn.",
      });
    }
  },
);

// ============================================================
// PATCH /api/giang-vien/tai-nguyen/:id/khoi-phuc
//
// KHÔI PHỤC TÀI NGUYÊN ĐÃ XÓA.
//
// Điều kiện:
//
// DA_XOA = 1
//
// Sau khi khôi phục:
//
// DA_XOA = 0
// TRANG_THAI = 1
// NOI_BAT = 0
//
// Lưu ý:
// TAI_LIEU / VIDEO đã bị xóa file vật lý ở DELETE,
// nên phải còn file vật lý mới khôi phục được.
// ============================================================

router.patch(
  "/tai-nguyen/:id/khoi-phuc",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async (req, res) => {
    try {
      // ======================================================
      // 1. ID
      // ======================================================

      const idTaiNguyen = Number(req.params.id);

      if (!Number.isInteger(idTaiNguyen) || idTaiNguyen <= 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 2. TOKEN
      // ======================================================

      const idTaiKhoan = req.taiKhoan?.idTaiKhoan;

      if (!Number.isInteger(Number(idTaiKhoan)) || Number(idTaiKhoan) <= 0) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản giảng viên.",
        });
      }

      // ======================================================
      // 3. DATABASE
      // ======================================================

      const pool = layPool();

      // ======================================================
      // 4. GV
      // ======================================================

      const giangVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, Number(idTaiKhoan)).query(`
            SELECT
              ID_GIANG_VIEN
            FROM GIANG_VIEN
            WHERE
              ID_TAI_KHOAN =
                @ID_TAI_KHOAN
          `);

      if (giangVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy thông tin giảng viên.",
        });
      }

      const idGiangVien = Number(giangVienResult.recordset[0].ID_GIANG_VIEN);

      // ======================================================
      // 5. TÀI NGUYÊN
      // ======================================================

      const taiNguyenResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              DUONG_DAN_FILE,
              DUONG_DAN_URL,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA,
              NGAY_CAP_NHAT

            FROM TAI_NGUYEN_HOC_TAP

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (taiNguyenResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao:
            "Không tìm thấy tài nguyên hoặc tài nguyên không thuộc giảng viên đang đăng nhập.",
        });
      }

      const taiNguyen = taiNguyenResult.recordset[0];

      // ======================================================
      // 6. CHƯA XÓA
      // ======================================================

      if (!Boolean(taiNguyen.DA_XOA)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tài nguyên này chưa bị xóa.",
        });
      }

      // ======================================================
      // 7. LOẠI
      // ======================================================

      const loai = String(taiNguyen.LOAI_TAI_NGUYEN || "")
        .trim()
        .toUpperCase();

      // ======================================================
      // 8. WEBSITE
      // ======================================================

      if (loai === "WEBSITE") {
        if (!taiNguyen.DUONG_DAN_URL) {
          return res.status(400).json({
            thanhCong: false,
            thongBao:
              "Không thể khôi phục website vì tài nguyên không còn URL.",
          });
        }
      }

      // ======================================================
      // 9. TÀI LIỆU / VIDEO
      // ======================================================

      if (loai === "TAI_LIEU" || loai === "VIDEO") {
        if (!taiNguyen.DUONG_DAN_FILE) {
          return res.status(400).json({
            thanhCong: false,
            thongBao:
              "Không thể khôi phục vì tài nguyên không còn đường dẫn file.",
          });
        }

        const filePath = path.join(
          __dirname,
          "..",
          taiNguyen.DUONG_DAN_FILE.replace(/^\/+/, ""),
        );

        try {
          await fs.promises.access(filePath, fs.constants.F_OK);
        } catch {
          return res.status(400).json({
            thanhCong: false,

            thongBao: "Không thể khôi phục vì file vật lý không còn tồn tại.",

            chiTiet: "Bạn cần upload lại file trước khi khôi phục tài nguyên.",
          });
        }
      }

      // ======================================================
      // 10. LOẠI KHÔNG HỢP LỆ
      // ======================================================

      if (loai !== "TAI_LIEU" && loai !== "VIDEO" && loai !== "WEBSITE") {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Loại tài nguyên không hợp lệ.",
        });
      }

      // ======================================================
      // 11. UPDATE KHÔI PHỤC
      // ======================================================

      const updateResult = await pool
        .request()
        .input("ID_TAI_NGUYEN", sql.Int, idTaiNguyen)
        .input("ID_GIANG_VIEN", sql.Int, idGiangVien).query(`
            UPDATE TAI_NGUYEN_HOC_TAP

            SET
              TRANG_THAI = 1,

              NOI_BAT = 0,

              DA_XOA = 0,

              NGAY_CAP_NHAT =
                SYSDATETIME()

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN

              AND DA_XOA = 1;

            SELECT
              ID_TAI_NGUYEN,
              TEN_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              DUONG_DAN_FILE,
              DUONG_DAN_URL,
              NOI_BAT,
              TRANG_THAI,
              DA_XOA,
              NGAY_CAP_NHAT

            FROM TAI_NGUYEN_HOC_TAP

            WHERE
              ID_TAI_NGUYEN =
                @ID_TAI_NGUYEN

              AND ID_GIANG_VIEN =
                @ID_GIANG_VIEN
          `);

      if (updateResult.recordset.length === 0) {
        return res.status(500).json({
          thanhCong: false,
          thongBao: "Không thể khôi phục tài nguyên.",
        });
      }

      const item = updateResult.recordset[0];

      // ======================================================
      // 12. RESPONSE
      // ======================================================

      return res.json({
        thanhCong: true,

        thongBao: "Khôi phục tài nguyên thành công.",

        taiNguyen: {
          idTaiNguyen: Number(item.ID_TAI_NGUYEN),

          tenTaiNguyen: item.TEN_TAI_NGUYEN,

          loaiTaiNguyen: item.LOAI_TAI_NGUYEN,

          duongDanFile: item.DUONG_DAN_FILE || null,

          duongDanUrl: item.DUONG_DAN_URL || null,

          noiBat: Boolean(item.NOI_BAT),

          trangThai: Boolean(item.TRANG_THAI),

          daXoa: Boolean(item.DA_XOA),

          ngayCapNhat: item.NGAY_CAP_NHAT,
        },
      });
    } catch (error) {
      console.error("LỖI KHÔI PHỤC TÀI NGUYÊN:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể khôi phục tài nguyên.",
      });
    }
  },
);

module.exports = router;
