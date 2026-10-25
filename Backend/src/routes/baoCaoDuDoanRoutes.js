const express = require("express");
const ExcelJS = require("exceljs");

const { sql, layPool } = require("../config/database");
const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

// ============================================================
// GET /api/bao-cao/du-doan-hoc-ky/:idDuDoan
// Tải báo cáo Excel của một lần dự đoán
// ============================================================

router.get(
  "/du-doan-hoc-ky/:idDuDoan",
  xacThuc,
  phanQuyen("SINH_VIEN"),
  async (req, res) => {
    try {
      const idTaiKhoan = req.taiKhoan.idTaiKhoan;

      const idDuDoan = Number(req.params.idDuDoan);

      if (!Number.isInteger(idDuDoan)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "ID dự đoán không hợp lệ.",
        });
      }

      const pool = layPool();

      // ========================================================
      // 1. LẤY THÔNG TIN SINH VIÊN
      // ========================================================

      const sinhVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, idTaiKhoan).query(`
            SELECT
                ID_SINH_VIEN,
                MA_SINH_VIEN,
                HO_TEN
            FROM SINH_VIEN
            WHERE ID_TAI_KHOAN = @ID_TAI_KHOAN
          `);

      if (sinhVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy sinh viên.",
        });
      }

      const sinhVien = sinhVienResult.recordset[0];

      // ========================================================
      // 2. LẤY KẾT QUẢ DỰ ĐOÁN
      // ========================================================

      const duDoanResult = await pool
        .request()
        .input("ID_DU_DOAN", sql.Int, idDuDoan)
        .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN).query(`
            SELECT
                ID_DU_DOAN,
                HOC_KY,
                NAM_HOC,
                GPA_DU_DOAN,
                DIEM_HE_10_DU_DOAN,
                TONG_TIN_CHI,
                XEP_LOAI,
                NGAY_DU_DOAN
            FROM DU_DOAN_HOC_KY
            WHERE ID_DU_DOAN = @ID_DU_DOAN
              AND ID_SINH_VIEN = @ID_SINH_VIEN
          `);

      if (duDoanResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy kết quả dự đoán.",
        });
      }

      const duDoan = duDoanResult.recordset[0];

      // ========================================================
      // 3. LẤY CHI TIẾT HỌC PHẦN
      // ========================================================

      const chiTietResult = await pool
        .request()
        .input("ID_DU_DOAN", sql.Int, idDuDoan).query(`
            SELECT
                HP.MA_HOC_PHAN,
                HP.TEN_HOC_PHAN,
                HP.SO_TIN_CHI,

                CT.DIEM_CHUYEN_CAN,
                CT.DIEM_THUONG_XUYEN,
                CT.DIEM_THI,

                CT.DIEM_HOC_PHAN_HE_10,
                CT.DIEM_HOC_PHAN_HE_4

            FROM CHI_TIET_DU_DOAN_HOC_KY CT

            INNER JOIN HOC_PHAN HP
                ON CT.ID_HOC_PHAN = HP.ID_HOC_PHAN

            WHERE
                CT.ID_DU_DOAN = @ID_DU_DOAN

            ORDER BY
                HP.MA_HOC_PHAN
          `);

      const chiTiet = chiTietResult.recordset;

      // ========================================================
      // 4. LẤY NHẬN ĐỊNH / GỢI Ý
      // ========================================================
      //
      // Hiện tại nhận định + gợi ý chưa được lưu trong DB.
      // Chúng sẽ được lấy từ dữ liệu của lần dự đoán.
      //
      // Bước này tạm thời để trống.
      //
      // Khi cần lưu lâu dài, có thể tạo thêm bảng riêng.
      //

      // ========================================================
      // 5. TẠO FILE EXCEL
      // ========================================================

      const workbook = new ExcelJS.Workbook();

      workbook.creator = "EduPredict AI";

      workbook.created = new Date();

      // ========================================================
      // SHEET 1 - TỔNG QUAN
      // ========================================================

      const sheetTongQuan = workbook.addWorksheet("TongQuan");

      sheetTongQuan.columns = [
        {
          header: "Thông tin",
          key: "thongTin",
          width: 28,
        },
        {
          header: "Giá trị",
          key: "giaTri",
          width: 35,
        },
      ];

      const tongQuan = [
        ["Họ và tên", sinhVien.HO_TEN],

        ["Mã sinh viên", sinhVien.MA_SINH_VIEN],

        ["Học kỳ", `HK ${duDoan.HOC_KY}`],

        ["Năm học", duDoan.NAM_HOC],

        ["GPA dự đoán", Number(duDoan.GPA_DU_DOAN)],

        ["Điểm hệ 10 dự đoán", Number(duDoan.DIEM_HE_10_DU_DOAN)],

        ["Tổng tín chỉ", Number(duDoan.TONG_TIN_CHI)],

        ["Xếp loại", duDoan.XEP_LOAI],

        ["Ngày dự đoán", duDoan.NGAY_DU_DOAN],
      ];

      tongQuan.forEach((dong) => {
        sheetTongQuan.addRow(dong);
      });

      // ========================================================
      // SHEET 2 - CHI TIẾT HỌC PHẦN
      // ========================================================

      const sheetChiTiet = workbook.addWorksheet("ChiTietHocPhan");

      sheetChiTiet.columns = [
        {
          header: "Mã học phần",
          key: "ma",
          width: 18,
        },

        {
          header: "Tên học phần",
          key: "ten",
          width: 35,
        },

        {
          header: "Tín chỉ",
          key: "tinChi",
          width: 12,
        },

        {
          header: "Chuyên cần",
          key: "chuyenCan",
          width: 15,
        },

        {
          header: "Thường xuyên",
          key: "thuongXuyen",
          width: 17,
        },

        {
          header: "Điểm thi",
          key: "diemThi",
          width: 15,
        },

        {
          header: "Điểm HP hệ 10",
          key: "diem10",
          width: 18,
        },

        {
          header: "Điểm HP hệ 4",
          key: "diem4",
          width: 18,
        },
      ];

      chiTiet.forEach((mon) => {
        sheetChiTiet.addRow({
          ma: mon.MA_HOC_PHAN,

          ten: mon.TEN_HOC_PHAN,

          tinChi: mon.SO_TIN_CHI,

          chuyenCan: mon.DIEM_CHUYEN_CAN ?? "",

          thuongXuyen: mon.DIEM_THUONG_XUYEN ?? "",

          diemThi: mon.DIEM_THI ?? "",

          diem10: mon.DIEM_HOC_PHAN_HE_10,

          diem4: mon.DIEM_HOC_PHAN_HE_4,
        });
      });

      // ========================================================
      // ĐỊNH DẠNG HEADER
      // ========================================================

      [sheetTongQuan, sheetChiTiet].forEach((sheet) => {
        const header = sheet.getRow(1);

        header.font = {
          bold: true,
        };

        header.alignment = {
          vertical: "middle",
        };
      });

      // ========================================================
      // 6. TÊN FILE
      // ========================================================

      const tenFile = `Bao_cao_du_doan_${sinhVien.MA_SINH_VIEN}_HK${duDoan.HOC_KY}_${duDoan.NAM_HOC}.xlsx`;

      // ========================================================
      // 7. TRẢ FILE CHO TRÌNH DUYỆT
      // ========================================================

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(tenFile)}"`,
      );

      await workbook.xlsx.write(res);

      res.end();
    } catch (error) {
      console.error("Lỗi tạo báo cáo Excel:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể tạo báo cáo Excel.",
      });
    }
  },
);

module.exports = router;
