const express = require("express");

const { sql, layPool } = require("../config/database");

const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

// ============================================================
// GET
// /api/home/du-lieu
// ============================================================

router.get("/du-lieu", xacThuc, phanQuyen("SINH_VIEN"), async (req, res) => {
  try {
    // ======================================================
    // 1. LẤY ID TÀI KHOẢN
    // ======================================================

    const idTaiKhoan = req.taiKhoan.idTaiKhoan;

    if (!idTaiKhoan) {
      return res.status(401).json({
        thanhCong: false,
        thongBao: "Không xác định được tài khoản đăng nhập.",
      });
    }

    // ======================================================
    // 2. KẾT NỐI DATABASE
    // ======================================================

    const pool = layPool();

    // ======================================================
    // 3. TÌM SINH VIÊN
    // ======================================================

    const sinhVienResult = await pool
      .request()
      .input("ID_TAI_KHOAN", sql.Int, idTaiKhoan).query(`
            SELECT
                ID_SINH_VIEN,
                MA_SINH_VIEN,
                HO_TEN,
                NGANH_HOC,
                LOP_HOC,
                KHOA_HOC
            FROM SINH_VIEN
            WHERE ID_TAI_KHOAN = @ID_TAI_KHOAN
          `);

    if (sinhVienResult.recordset.length === 0) {
      return res.status(404).json({
        thanhCong: false,
        thongBao: "Không tìm thấy thông tin sinh viên.",
      });
    }

    const sinhVien = sinhVienResult.recordset[0];

    const idSinhVien = sinhVien.ID_SINH_VIEN;

    // ======================================================
    // 4. GPA LỊCH SỬ
    // ======================================================

    const gpaResult = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT
                HOC_KY,
                NAM_HOC,
                GPA,
                TONG_TIN_CHI
            FROM KET_QUA_HOC_KY
            WHERE
                ID_SINH_VIEN = @ID_SINH_VIEN
                AND GPA IS NOT NULL
            ORDER BY
                TRY_CONVERT(
                    INT,
                    LEFT(NAM_HOC, 4)
                ),
                HOC_KY
          `);

    const gpaLichSu = gpaResult.recordset.map((item, index) => ({
      hocKy: index + 1,

      namHoc: item.NAM_HOC,

      gpa: Number(item.GPA),

      tongTinChi: Number(item.TONG_TIN_CHI),
    }));

    // ======================================================
    // 5. DỰ ĐOÁN GPA HỌC KỲ
    // ======================================================

    const gpaHocKyResult = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT TOP 1
                ID_DU_DOAN,
                HOC_KY,
                NAM_HOC,
                GPA_DU_DOAN,
                DIEM_HE_10_DU_DOAN,
                TONG_TIN_CHI,
                XEP_LOAI,
                NGAY_DU_DOAN
            FROM DU_DOAN_HOC_KY
            WHERE
                ID_SINH_VIEN = @ID_SINH_VIEN
            ORDER BY
                NGAY_DU_DOAN DESC,
                ID_DU_DOAN DESC
          `);

    let duDoanGpaHocKy = null;

    if (gpaHocKyResult.recordset.length > 0) {
      const item = gpaHocKyResult.recordset[0];

      duDoanGpaHocKy = {
        idDuDoan: item.ID_DU_DOAN,

        hocKy: Number(item.HOC_KY),

        namHoc: item.NAM_HOC,

        gpaDuDoan: Number(item.GPA_DU_DOAN),

        diemHe10:
          item.DIEM_HE_10_DU_DOAN === null
            ? null
            : Number(item.DIEM_HE_10_DU_DOAN),

        tongTinChi: Number(item.TONG_TIN_CHI),

        xepLoai: item.XEP_LOAI,

        ngayDuDoan: item.NGAY_DU_DOAN,
      };
    }

    // ======================================================
    // 6. DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO
    // ======================================================

    const gpaHocKyTiepTheoResult = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT TOP 1
          ID_DU_DOAN,
          HOC_KY_DU_DOAN,
          NAM_HOC_DU_DOAN,
          GPA_LICH_SU,
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
          NGAY_DU_DOAN
      FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO
      WHERE
          ID_SINH_VIEN = @ID_SINH_VIEN
      ORDER BY
          NGAY_DU_DOAN DESC,
          ID_DU_DOAN DESC
          `);

    let duDoanGpaHocKyTiepTheo = null;

    if (gpaHocKyTiepTheoResult.recordset.length > 0) {
      const item = gpaHocKyTiepTheoResult.recordset[0];

      duDoanGpaHocKyTiepTheo = {
        idDuDoan: item.ID_DU_DOAN,

        hocKyDuDoan: Number(item.HOC_KY_DU_DOAN),

        namHocDuDoan: item.NAM_HOC_DU_DOAN,

        gpaLichSu: parseJsonSafe(item.GPA_LICH_SU),

        gpaKyGanNhat: Number(item.GPA_KY_GAN_NHAT),

        gpaTrungBinhLichSu: Number(item.GPA_TRUNG_BINH_LICH_SU),

        xuHuongGPA:
          item.XU_HUONG_GPA === null ? null : Number(item.XU_HUONG_GPA),

        soHocKyDaHoc: Number(item.SO_HOC_KY_DA_HOC),

        tinChiDangKy:
          item.TIN_CHI_DANG_KY === null ? null : Number(item.TIN_CHI_DANG_KY),

        gioTuHocTuan:
          item.GIO_TU_HOC_TUAN === null ? null : Number(item.GIO_TU_HOC_TUAN),

        tyLeChuyenCan:
          item.TY_LE_CHUYEN_CAN === null ? null : Number(item.TY_LE_CHUYEN_CAN),

        gioLamThemTuan:
          item.GIO_LAM_THEM_TUAN === null
            ? null
            : Number(item.GIO_LAM_THEM_TUAN),

        gpaDuDoan: Number(item.GPA_DU_DOAN),

        diemHe10:
          item.DIEM_HE_10_DU_DOAN === null
            ? null
            : Number(item.DIEM_HE_10_DU_DOAN),

        xepLoai: item.XEP_LOAI,

        nhanDinh: parseJsonSafe(item.NHAN_DINH),

        loiKhuyen: parseJsonSafe(item.LOI_KHUYEN),

        ngayDuDoan: item.NGAY_DU_DOAN,
      };
    }

    // ======================================================
    // 7. DỰ ĐOÁN GPA TỐT NGHIỆP
    // ======================================================

    const gpaTotNghiepResult = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT TOP 1
                ID_DU_DOAN,
                SO_HOC_KY_DA_HOC,
                TIN_CHI_TICH_LUY,
                TIN_CHI_TOAN_KHOA,
                GPA_KY_GAN_NHAT,
                GPA_TRUNG_BINH_LICH_SU,
                XU_HUONG_GPA,
                GPA_MUC_TIEU,
                MUC_DO_CO_GANG,
                KHOANG_CACH_MUC_TIEU,
                GPA_DU_DOAN,
                DIEM_HE_10_DU_DOAN,
                GPA_CAN_DAT,
                XEP_LOAI,
                KHA_NANG_DAT_MUC_TIEU,
                PHAN_TRAM_KHA_NANG,
                NHAN_DINH,
                LOI_KHUYEN,
                SO_SANH_MUC_TIEU,
                NGAY_DU_DOAN
            FROM DU_DOAN_GPA_TOT_NGHIEP
            WHERE
                ID_SINH_VIEN = @ID_SINH_VIEN
            ORDER BY
                NGAY_DU_DOAN DESC,
                ID_DU_DOAN DESC
          `);

    let duDoanGpaTotNghiep = null;

    if (gpaTotNghiepResult.recordset.length > 0) {
      const item = gpaTotNghiepResult.recordset[0];

      duDoanGpaTotNghiep = {
        idDuDoan: item.ID_DU_DOAN,

        soHocKyDaHoc: Number(item.SO_HOC_KY_DA_HOC),

        tinChiTichLuy: Number(item.TIN_CHI_TICH_LUY),

        tinChiToanKhoa: Number(item.TIN_CHI_TOAN_KHOA),

        gpaKyGanNhat: Number(item.GPA_KY_GAN_NHAT),

        gpaTrungBinhLichSu: Number(item.GPA_TRUNG_BINH_LICH_SU),

        xuHuongGPA:
          item.XU_HUONG_GPA === null ? null : Number(item.XU_HUONG_GPA),

        gpaMucTieu: Number(item.GPA_MUC_TIEU),

        mucDoCoGang:
          item.MUC_DO_CO_GANG === null ? null : Number(item.MUC_DO_CO_GANG),

        khoangCachMucTieu:
          item.KHOANG_CACH_MUC_TIEU === null
            ? null
            : Number(item.KHOANG_CACH_MUC_TIEU),

        gpaDuDoan: Number(item.GPA_DU_DOAN),

        diemHe10:
          item.DIEM_HE_10_DU_DOAN === null
            ? null
            : Number(item.DIEM_HE_10_DU_DOAN),

        gpaCanDat: item.GPA_CAN_DAT === null ? null : Number(item.GPA_CAN_DAT),

        xepLoai: item.XEP_LOAI,

        khaNangDatMucTieu: item.KHA_NANG_DAT_MUC_TIEU,

        phanTramKhaNang:
          item.PHAN_TRAM_KHA_NANG === null
            ? null
            : Number(item.PHAN_TRAM_KHA_NANG),

        nhanDinh: parseJsonSafe(item.NHAN_DINH),

        loiKhuyen: parseJsonSafe(item.LOI_KHUYEN),

        soSanhMucTieu: parseJsonSafe(item.SO_SANH_MUC_TIEU),

        ngayDuDoan: item.NGAY_DU_DOAN,
      };
    }

    // ======================================================
    // 8. DỰ ĐOÁN ĐIỂM HỌC PHẦN GẦN NHẤT
    // ======================================================

    const diemHocPhanResult = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, idSinhVien).query(`
            SELECT TOP 1
                D.ID_DU_DOAN,
                D.ID_HOC_PHAN,
                H.MA_HOC_PHAN,
                H.TEN_HOC_PHAN,
                H.SO_TIN_CHI,
                D.DIEM_CHUYEN_CAN,
                D.DIEM_THUONG_XUYEN,
                D.TY_LE_HOAN_THANH_BAI_TAP,
                D.SO_BUOI_NGHI,
                D.DIEM_DU_DOAN,
                D.XEP_LOAI,
                D.NHAN_DINH,
                D.LOI_KHUYEN,
                D.NGAY_DU_DOAN
            FROM DU_DOAN_DIEM_HOC_PHAN D
            INNER JOIN HOC_PHAN H
                ON D.ID_HOC_PHAN = H.ID_HOC_PHAN
            WHERE
                D.ID_SINH_VIEN = @ID_SINH_VIEN
            ORDER BY
                D.NGAY_DU_DOAN DESC,
                D.ID_DU_DOAN DESC
          `);

    let duDoanDiemHocPhan = null;

    if (diemHocPhanResult.recordset.length > 0) {
      const item = diemHocPhanResult.recordset[0];

      duDoanDiemHocPhan = {
        idDuDoan: item.ID_DU_DOAN,

        hocPhan: {
          id: item.ID_HOC_PHAN,

          ma: item.MA_HOC_PHAN,

          ten: item.TEN_HOC_PHAN,

          soTinChi: Number(item.SO_TIN_CHI),
        },

        diemChuyenCan:
          item.DIEM_CHUYEN_CAN === null ? null : Number(item.DIEM_CHUYEN_CAN),

        diemThuongXuyen:
          item.DIEM_THUONG_XUYEN === null
            ? null
            : Number(item.DIEM_THUONG_XUYEN),

        tyLeHoanThanhBaiTap:
          item.TY_LE_HOAN_THANH_BAI_TAP === null
            ? null
            : Number(item.TY_LE_HOAN_THANH_BAI_TAP),

        soBuoiNghi:
          item.SO_BUOI_NGHI === null ? null : Number(item.SO_BUOI_NGHI),

        diemDuDoan: Number(item.DIEM_DU_DOAN),

        xepLoai: item.XEP_LOAI,

        nhanDinh: parseJsonSafe(item.NHAN_DINH),

        loiKhuyen: parseJsonSafe(item.LOI_KHUYEN),

        ngayDuDoan: item.NGAY_DU_DOAN,
      };
    }

    // ======================================================
    // 9. RADAR
    // ======================================================

    let radar = {
      xuatSac: 0,

      gioi: 0,

      kha: 0,

      trungBinh: 0,

      yeu: 0,
    };

    if (duDoanGpaTotNghiep && Array.isArray(duDoanGpaTotNghiep.soSanhMucTieu)) {
      duDoanGpaTotNghiep.soSanhMucTieu.forEach((item) => {
        const phanTram = Number(item.phanTramKhaNang);

        if (!Number.isFinite(phanTram)) {
          return;
        }

        switch (item.ten) {
          case "Xuất sắc":
            radar.xuatSac = phanTram;

            break;

          case "Giỏi":
            radar.gioi = phanTram;

            break;

          case "Khá":
            radar.kha = phanTram;

            break;

          case "Trung bình":
            radar.trungBinh = phanTram;

            break;

          case "Yếu":
            radar.yeu = phanTram;

            break;
        }
      });
    }

    // ======================================================
    // 10. NHẬN ĐỊNH
    // ======================================================

    let nhanDinh = [];

    if (duDoanGpaTotNghiep && Array.isArray(duDoanGpaTotNghiep.nhanDinh)) {
      nhanDinh = duDoanGpaTotNghiep.nhanDinh;
    } else if (
      duDoanGpaHocKyTiepTheo &&
      Array.isArray(duDoanGpaHocKyTiepTheo.nhanDinh)
    ) {
      nhanDinh = duDoanGpaHocKyTiepTheo.nhanDinh;
    }

    // ======================================================
    // 11. GỢI Ý
    // ======================================================

    let goiY = [];

    if (duDoanGpaTotNghiep && Array.isArray(duDoanGpaTotNghiep.loiKhuyen)) {
      goiY = duDoanGpaTotNghiep.loiKhuyen;
    } else if (
      duDoanGpaHocKyTiepTheo &&
      Array.isArray(duDoanGpaHocKyTiepTheo.loiKhuyen)
    ) {
      goiY = duDoanGpaHocKyTiepTheo.loiKhuyen;
    }

    // ======================================================
    // 12. THỐNG KÊ HỆ THỐNG
    // ======================================================

    const thongKeResult = await pool.request().query(`
            SELECT

              (
                SELECT COUNT(*)
                FROM SINH_VIEN
              ) AS TONG_SINH_VIEN,

              (
                SELECT COUNT(*)
                FROM GIANG_VIEN
              ) AS TONG_GIANG_VIEN,

              (
                SELECT COUNT(*)
                FROM DU_DOAN_HOC_KY
              )
              +
              (
                SELECT COUNT(*)
                FROM DU_DOAN_DIEM_HOC_PHAN
              )
              +
              (
                SELECT COUNT(*)
                FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO
              )
              +
              (
                SELECT COUNT(*)
                FROM DU_DOAN_GPA_TOT_NGHIEP
              ) AS TONG_LUOT_DU_DOAN
          `);

    const thongKe = thongKeResult.recordset[0];

    // ======================================================
    // 13. TRẢ RESPONSE
    // ======================================================

    return res.json({
      thanhCong: true,

      sinhVien: {
        idSinhVien: sinhVien.ID_SINH_VIEN,

        maSinhVien: sinhVien.MA_SINH_VIEN,

        hoTen: sinhVien.HO_TEN,

        nganhHoc: sinhVien.NGANH_HOC,

        lopHoc: sinhVien.LOP_HOC,

        khoaHoc: sinhVien.KHOA_HOC,
      },

      gpaLichSu: gpaLichSu,

      duDoan: {
        diemHocPhan: duDoanDiemHocPhan,

        gpaHocKy: duDoanGpaHocKy,

        gpaHocKyTiepTheo: duDoanGpaHocKyTiepTheo,

        gpaTotNghiep: duDoanGpaTotNghiep,
      },

      radar: radar,

      nhanDinh: nhanDinh,

      goiY: goiY,

      thongKe: {
        tongSinhVien: Number(thongKe.TONG_SINH_VIEN),

        tongGiangVien: Number(thongKe.TONG_GIANG_VIEN),

        tongLuotDuDoan: Number(thongKe.TONG_LUOT_DU_DOAN),

        doChinhXac: null,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Home:", error);

    return res.status(500).json({
      thanhCong: false,

      thongBao: "Không thể tải dữ liệu trang chủ.",

      error: error.message,
    });
  }
});

// ============================================================
// HÀM PARSE JSON AN TOÀN
// ============================================================

function parseJsonSafe(giaTri) {
  if (!giaTri) {
    return [];
  }

  if (Array.isArray(giaTri)) {
    return giaTri;
  }

  try {
    const ketQua = JSON.parse(giaTri);

    return Array.isArray(ketQua) ? ketQua : [];
  } catch (error) {
    console.warn("Không thể parse JSON Home:", error);

    return [];
  }
}

module.exports = router;
