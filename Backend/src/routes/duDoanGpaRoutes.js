const express = require("express");
const axios = require("axios");

const { sql, layPool } = require("../config/database");

const xacThuc = require("../middleware/xacThuc.js");

const phanQuyen = require("../middleware/phanQuyen.js");

const { phanTichGpaHocKy } = require("../utils/phanTichGpaHocKy.js");

const router = express.Router();

// ============================================================
// ML API CŨ - DỰ ĐOÁN ĐIỂM HỌC PHẦN
// ============================================================

const ML_API_URL = `${process.env.ML_API_URL || "http://127.0.0.1:5000"}/du-doan`;

// ============================================================
// QUY ĐỔI ĐIỂM HỌC PHẦN HỆ 10 → HỆ 4
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
    return 3;
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
// XÁC ĐỊNH HỌC KỲ LIỀN TRƯỚC
//
// Quy ước:
// HK2 → HK1 cùng năm học
// HK3 → HK2 cùng năm học
// HK4 → HK3 cùng năm học
//
// HK1 → học kỳ cuối cùng của năm học trước
//
// Nếu không tồn tại kỳ trước → null
// ============================================================

async function timHocKyTruoc({ pool, idSinhVien, hocKy, namHoc }) {
  const hocKyHienTai = Number(hocKy);

  const namHocHienTai = String(namHoc).trim();

  // ==========================================================
  // HK > 1
  // ==========================================================

  if (hocKyHienTai > 1) {
    const hocKyTruoc = hocKyHienTai - 1;

    const namHocTruoc = namHocHienTai;

    // --------------------------------------------------------
    // Kiểm tra có dự đoán ở kỳ trước không
    // --------------------------------------------------------

    const duDoan = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, idSinhVien)
      .input("HOC_KY_TRUOC", sql.Int, hocKyTruoc)
      .input("NAM_HOC_TRUOC", sql.NVarChar(20), namHocTruoc).query(`
          SELECT TOP 1
              ID_DU_DOAN
          FROM DU_DOAN_HOC_KY
          WHERE
              ID_SINH_VIEN = @ID_SINH_VIEN
              AND HOC_KY = @HOC_KY_TRUOC
              AND NAM_HOC = @NAM_HOC_TRUOC
          ORDER BY ID_DU_DOAN DESC
        `);

    // --------------------------------------------------------
    // Nếu có → kỳ trước tồn tại
    // --------------------------------------------------------

    if (duDoan.recordset.length > 0) {
      return {
        hocKy: hocKyTruoc,
        namHoc: namHocTruoc,
      };
    }

    // --------------------------------------------------------
    // Không có dự đoán → kiểm tra kết quả thực tế
    // --------------------------------------------------------

    const ketQua = await pool
      .request()
      .input("ID_SINH_VIEN", sql.Int, idSinhVien)
      .input("HOC_KY_TRUOC", sql.Int, hocKyTruoc)
      .input("NAM_HOC_TRUOC", sql.NVarChar(20), namHocTruoc).query(`
          SELECT TOP 1
              ID_KET_QUA
          FROM KET_QUA_HOC_KY
          WHERE
              ID_SINH_VIEN = @ID_SINH_VIEN
              AND HOC_KY = @HOC_KY_TRUOC
              AND NAM_HOC = @NAM_HOC_TRUOC
        `);

    if (ketQua.recordset.length > 0) {
      return {
        hocKy: hocKyTruoc,
        namHoc: namHocTruoc,
      };
    }

    // --------------------------------------------------------
    // Không có kỳ trước
    // --------------------------------------------------------

    return null;
  }

  // ==========================================================
  // HK1
  // → tìm kỳ cuối cùng của năm học trước
  // ==========================================================

  const phanNamHoc = namHocHienTai.split("-");

  if (phanNamHoc.length !== 2) {
    return null;
  }

  const namBatDau = Number(phanNamHoc[0]);

  const namKetThuc = Number(phanNamHoc[1]);

  if (!Number.isFinite(namBatDau) || !Number.isFinite(namKetThuc)) {
    return null;
  }

  const namHocTruoc = `${namBatDau - 1}-${namKetThuc - 1}`;

  // ----------------------------------------------------------
  // Tìm học kỳ cuối cùng trong năm học trước
  // Ưu tiên dự đoán
  // ----------------------------------------------------------

  const duDoanCuoi = await pool
    .request()
    .input("ID_SINH_VIEN", sql.Int, idSinhVien)
    .input("NAM_HOC_TRUOC", sql.NVarChar(20), namHocTruoc).query(`
        SELECT TOP 1
            HOC_KY
        FROM DU_DOAN_HOC_KY
        WHERE
            ID_SINH_VIEN = @ID_SINH_VIEN
            AND NAM_HOC = @NAM_HOC_TRUOC
        ORDER BY
            HOC_KY DESC,
            ID_DU_DOAN DESC
      `);

  if (duDoanCuoi.recordset.length > 0) {
    return {
      hocKy: Number(duDoanCuoi.recordset[0].HOC_KY),

      namHoc: namHocTruoc,
    };
  }

  // ----------------------------------------------------------
  // Nếu không có dự đoán → tìm kết quả thực tế
  // ----------------------------------------------------------

  const ketQuaCuoi = await pool
    .request()
    .input("ID_SINH_VIEN", sql.Int, idSinhVien)
    .input("NAM_HOC_TRUOC", sql.NVarChar(20), namHocTruoc).query(`
        SELECT TOP 1
            HOC_KY
        FROM KET_QUA_HOC_KY
        WHERE
            ID_SINH_VIEN = @ID_SINH_VIEN
            AND NAM_HOC = @NAM_HOC_TRUOC
        ORDER BY
            HOC_KY DESC
      `);

  if (ketQuaCuoi.recordset.length > 0) {
    return {
      hocKy: Number(ketQuaCuoi.recordset[0].HOC_KY),

      namHoc: namHocTruoc,
    };
  }

  return null;
}

// ============================================================
// LẤY KẾT QUẢ CỦA HỌC KỲ TRƯỚC
//
// Ưu tiên:
// 1. Kết quả dự đoán
// 2. Kết quả thực tế
// ============================================================

async function laySoSanhKyTruoc({
  pool,
  idSinhVien,
  hocKyTruoc,
  namHocTruoc,
  gpaHienTai,
  diemHe10HienTai,
}) {
  // ==========================================================
  // 1. TÌM DỰ ĐOÁN CŨ
  // ==========================================================

  const duDoan = await pool
    .request()
    .input("ID_SINH_VIEN", sql.Int, idSinhVien)
    .input("HOC_KY", sql.Int, hocKyTruoc)
    .input("NAM_HOC", sql.NVarChar(20), namHocTruoc).query(`
        SELECT TOP 1
            GPA_DU_DOAN,
            DIEM_HE_10_DU_DOAN
        FROM DU_DOAN_HOC_KY
        WHERE
            ID_SINH_VIEN = @ID_SINH_VIEN
            AND HOC_KY = @HOC_KY
            AND NAM_HOC = @NAM_HOC
        ORDER BY
            ID_DU_DOAN DESC
      `);

  if (duDoan.recordset.length > 0) {
    const duDoanCu = duDoan.recordset[0];

    const gpaKyTruoc = Number(duDoanCu.GPA_DU_DOAN);

    const diemHe10KyTruoc = Number(duDoanCu.DIEM_HE_10_DU_DOAN);

    return {
      hocKy: hocKyTruoc,

      namHoc: namHocTruoc,

      gpaKyTruoc: Number(gpaKyTruoc.toFixed(2)),

      diemHe10KyTruoc: Number(diemHe10KyTruoc.toFixed(2)),

      chenhLechGpa: Number((gpaHienTai - gpaKyTruoc).toFixed(2)),

      chenhLechHe10: Number((diemHe10HienTai - diemHe10KyTruoc).toFixed(2)),
    };
  }

  // ==========================================================
  // 2. KHÔNG CÓ DỰ ĐOÁN → LẤY KẾT QUẢ THỰC TẾ
  // ==========================================================

  const ketQua = await pool
    .request()
    .input("ID_SINH_VIEN", sql.Int, idSinhVien)
    .input("HOC_KY", sql.Int, hocKyTruoc)
    .input("NAM_HOC", sql.NVarChar(20), namHocTruoc).query(`
        SELECT TOP 1
            GPA
        FROM KET_QUA_HOC_KY
        WHERE
            ID_SINH_VIEN = @ID_SINH_VIEN
            AND HOC_KY = @HOC_KY
            AND NAM_HOC = @NAM_HOC
      `);

  let gpaKyTruoc = null;

  if (ketQua.recordset.length > 0) {
    gpaKyTruoc = Number(ketQua.recordset[0].GPA);
  }

  // ==========================================================
  // LẤY ĐIỂM HỆ 10 THỰC TẾ
  // ==========================================================

  const diemHe10 = await pool
    .request()
    .input("ID_SINH_VIEN", sql.Int, idSinhVien)
    .input("HOC_KY", sql.Int, hocKyTruoc)
    .input("NAM_HOC", sql.NVarChar(20), namHocTruoc).query(`
        SELECT
            SUM(
                KQ.DIEM_HOC_PHAN
                * HP.SO_TIN_CHI
            )
            /
            NULLIF(
                SUM(HP.SO_TIN_CHI),
                0
            ) AS DIEM_HE_10

        FROM KET_QUA_HOC_PHAN KQ

        INNER JOIN HOC_PHAN HP
            ON KQ.ID_HOC_PHAN =
               HP.ID_HOC_PHAN

        WHERE
            KQ.ID_SINH_VIEN =
                @ID_SINH_VIEN

            AND KQ.HOC_KY =
                @HOC_KY

            AND KQ.NAM_HOC =
                @NAM_HOC

            AND KQ.DIEM_HOC_PHAN
                IS NOT NULL
      `);

  let diemHe10KyTruoc = null;

  if (
    diemHe10.recordset.length > 0 &&
    diemHe10.recordset[0].DIEM_HE_10 !== null
  ) {
    diemHe10KyTruoc = Number(diemHe10.recordset[0].DIEM_HE_10);
  }

  return {
    hocKy: hocKyTruoc,

    namHoc: namHocTruoc,

    gpaKyTruoc: gpaKyTruoc !== null ? Number(gpaKyTruoc.toFixed(2)) : null,

    diemHe10KyTruoc:
      diemHe10KyTruoc !== null ? Number(diemHe10KyTruoc.toFixed(2)) : null,

    chenhLechGpa:
      gpaKyTruoc !== null ? Number((gpaHienTai - gpaKyTruoc).toFixed(2)) : null,

    chenhLechHe10:
      diemHe10KyTruoc !== null
        ? Number((diemHe10HienTai - diemHe10KyTruoc).toFixed(2))
        : null,
  };
}

// ============================================================
// POST /api/du-doan/gpa-hoc-ky
// ============================================================

router.post(
  "/gpa-hoc-ky",
  xacThuc,
  phanQuyen("SINH_VIEN"),

  async (req, res) => {
    try {
      // ========================================================
      // 1. LẤY TÀI KHOẢN
      // ========================================================

      const idTaiKhoan = req.taiKhoan.idTaiKhoan;

      if (!idTaiKhoan) {
        return res.status(401).json({
          thanhCong: false,

          thongBao: "Không xác định được tài khoản đăng nhập.",
        });
      }

      const pool = layPool();

      // ========================================================
      // 2. LẤY SINH VIÊN
      // ========================================================

      const ketQuaSinhVien = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, idTaiKhoan).query(`
            SELECT
                ID_SINH_VIEN,
                MA_SINH_VIEN,
                HO_TEN
            FROM SINH_VIEN
            WHERE
                ID_TAI_KHOAN =
                    @ID_TAI_KHOAN
          `);

      if (ketQuaSinhVien.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,

          thongBao: "Không tìm thấy sinh viên.",
        });
      }

      const sinhVien = ketQuaSinhVien.recordset[0];

      // ========================================================
      // 3. NHẬN DỮ LIỆU
      // ========================================================

      const { hocKy, namHoc, hocPhan } = req.body;

      const hocKyNumber = Number(hocKy);

      const namHocString = String(namHoc || "")
      .trim()
      .replace(/\s*-\s*/g, "-");

      if (!Number.isInteger(hocKyNumber) || hocKyNumber <= 0) {
        return res.status(400).json({
          thanhCong: false,

          thongBao: "Học kỳ không hợp lệ.",
        });
      }

      if (!namHocString || !Array.isArray(hocPhan) || hocPhan.length === 0) {
        return res.status(400).json({
          thanhCong: false,

          thongBao: "Dữ liệu học kỳ không hợp lệ.",
        });
      }

      // ========================================================
      // 4. XỬ LÝ CÁC HỌC PHẦN
      // ========================================================

      const ketQua = [];

      let tongTinChi = 0;

      let tongDiemHe4 = 0;

      for (const mon of hocPhan) {
        const maHocPhan = String(mon.ma_hoc_phan || "")
          .trim()
          .toUpperCase();

        if (!maHocPhan) {
          return res.status(400).json({
            thanhCong: false,

            thongBao: "Có học phần thiếu mã học phần.",
          });
        }

        // ======================================================
        // 4.1. TÌM HỌC PHẦN
        // ======================================================

        const resultHP = await pool
          .request()
          .input("MA_HOC_PHAN", sql.VarChar(30), maHocPhan).query(`
              SELECT
                  ID_HOC_PHAN,
                  MA_HOC_PHAN,
                  TEN_HOC_PHAN,
                  SO_TIN_CHI
              FROM HOC_PHAN
              WHERE
                  MA_HOC_PHAN =
                      @MA_HOC_PHAN
                  AND TRANG_THAI = 1
            `);

        if (resultHP.recordset.length === 0) {
          return res.status(404).json({
            thanhCong: false,

            thongBao: `Không tìm thấy học phần ${maHocPhan}.`,
          });
        }

        const hp = resultHP.recordset[0];

        const soTinChi = Number(hp.SO_TIN_CHI);

        // ======================================================
        // 4.2. LẤY ĐIỂM ĐẦU VÀO
        // ======================================================

        const diemChuyenCanNhap = Number(mon.diem_chuyen_can);

        const diemThuongXuyenNhap = Number(mon.diem_thuong_xuyen);

        if (
          !Number.isFinite(diemChuyenCanNhap) ||
          diemChuyenCanNhap < 0 ||
          diemChuyenCanNhap > 10
        ) {
          return res.status(400).json({
            thanhCong: false,

            thongBao: `Điểm chuyên cần của ${maHocPhan} không hợp lệ.`,
          });
        }

        if (
          !Number.isFinite(diemThuongXuyenNhap) ||
          diemThuongXuyenNhap < 0 ||
          diemThuongXuyenNhap > 10
        ) {
          return res.status(400).json({
            thanhCong: false,

            thongBao: `Điểm thường xuyên của ${maHocPhan} không hợp lệ.`,
          });
        }

        // ======================================================
        // 4.3. KIỂM TRA ĐIỂM THI
        // ======================================================

        const coDiemThi =
          mon.diem_thi !== null &&
          mon.diem_thi !== undefined &&
          String(mon.diem_thi).trim() !== "";

        let diemHocPhanHe10;

        let nguonDiem;

        let diemChuyenCanLuu = diemChuyenCanNhap;

        let diemThuongXuyenLuu = diemThuongXuyenNhap;

        let diemThiLuu = null;

        // ======================================================
        // 4.4. CÓ ĐIỂM THI
        // ======================================================

        if (coDiemThi) {
          const diemThi = Number(mon.diem_thi);

          if (!Number.isFinite(diemThi) || diemThi < 0 || diemThi > 10) {
            return res.status(400).json({
              thanhCong: false,

              thongBao: `Điểm thi của ${maHocPhan} không hợp lệ.`,
            });
          }

          diemHocPhanHe10 =
            diemChuyenCanNhap * 0.1 + diemThuongXuyenNhap * 0.3 + diemThi * 0.6;

          nguonDiem = "DIEM_THI";

          diemThiLuu = diemThi;
        } else {
          // ======================================================
          // 4.5. KHÔNG CÓ ĐIỂM THI → GỌI ML CŨ
          // ======================================================

          const resultDuLieu = await pool
            .request()
            .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN)
            .input("ID_HOC_PHAN", sql.Int, hp.ID_HOC_PHAN)
            .input("HOC_KY", sql.Int, hocKyNumber)
            .input("NAM_HOC", sql.NVarChar(20), namHocString).query(`
    SELECT
        TY_LE_HOAN_THANH_BAI_TAP,
        SO_BUOI_NGHI
    FROM KET_QUA_HOC_PHAN
    WHERE
        ID_SINH_VIEN = @ID_SINH_VIEN
        AND ID_HOC_PHAN = @ID_HOC_PHAN
        AND HOC_KY = @HOC_KY
        AND NAM_HOC = @NAM_HOC
  `);

          let duLieu = resultDuLieu.recordset[0] || null;

          if (!duLieu) {
            // ======================================================
            // FALLBACK: lấy dữ liệu học tập gần nhất của cùng học phần
            // (học kỳ khác) để dự đoán vẫn chạy được
            // ======================================================

            const resultFallback = await pool
              .request()
              .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN)
              .input("ID_HOC_PHAN", sql.Int, hp.ID_HOC_PHAN).query(`
    SELECT TOP 1
        TY_LE_HOAN_THANH_BAI_TAP,
        SO_BUOI_NGHI,
        HOC_KY,
        NAM_HOC
    FROM KET_QUA_HOC_PHAN
    WHERE
        ID_SINH_VIEN = @ID_SINH_VIEN
        AND ID_HOC_PHAN = @ID_HOC_PHAN
    ORDER BY
        NAM_HOC DESC,
        HOC_KY DESC
  `);

            if (resultFallback.recordset.length > 0) {
              duLieu = resultFallback.recordset[0];
            } else {
              return res.status(404).json({
                thanhCong: false,

                thongBao: `Chưa có dữ liệu học tập của ${maHocPhan} trong CSDL cho học kỳ ${hocKyNumber} năm học ${namHocString}. Hãy nhập điểm thi cho học phần này hoặc chọn học kỳ khác.`,
              });
            }
          }

          // ----------------------------------------------------
          // Chỉ kiểm tra 2 dữ liệu ML còn cần lấy từ CSDL
          // ----------------------------------------------------

          if (
            duLieu.TY_LE_HOAN_THANH_BAI_TAP === null ||
            duLieu.SO_BUOI_NGHI === null
          ) {
            return res.status(400).json({
              thanhCong: false,

              thongBao: `Dữ liệu học tập của ${maHocPhan} chưa đầy đủ để dự đoán.`,
            });
          }

          // ----------------------------------------------------
          // CHUYÊN CẦN + THƯỜNG XUYÊN
          // Lấy trực tiếp từ frontend
          // ----------------------------------------------------

          diemChuyenCanLuu = diemChuyenCanNhap;

          diemThuongXuyenLuu = diemThuongXuyenNhap;

          // ----------------------------------------------------
          // Dữ liệu đưa vào ML
          // ----------------------------------------------------

          const duLieuML = {
            ma_hoc_phan: hp.MA_HOC_PHAN,

            so_tin_chi: soTinChi,

            diem_chuyen_can: diemChuyenCanNhap,

            diem_thuong_xuyen: diemThuongXuyenNhap,

            ty_le_hoan_thanh_bai_tap: Number(duLieu.TY_LE_HOAN_THANH_BAI_TAP),

            so_buoi_nghi: Number(duLieu.SO_BUOI_NGHI),
          };

          let mlResponse;

          try {
            mlResponse = await axios.post(ML_API_URL, duLieuML, {
              timeout: 10000,
            });
          } catch (error) {
            console.error(`Lỗi gọi ML ${maHocPhan}:`, error.message);

            return res.status(500).json({
              thanhCong: false,

              thongBao: `Không thể gọi mô hình ML cho ${maHocPhan}.`,
            });
          }

          if (
            !mlResponse.data ||
            !mlResponse.data.thanh_cong ||
            !mlResponse.data.ket_qua
          ) {
            return res.status(500).json({
              thanhCong: false,

              thongBao: `Mô hình ML không trả kết quả hợp lệ cho ${maHocPhan}.`,
            });
          }

          diemHocPhanHe10 = Number(mlResponse.data.ket_qua.diem_du_doan);

          if (!Number.isFinite(diemHocPhanHe10)) {
            return res.status(500).json({
              thanhCong: false,

              thongBao: `Điểm dự đoán ML của ${maHocPhan} không hợp lệ.`,
            });
          }

          nguonDiem = "ML_DIEM_HOC_PHAN";
        }

        // ======================================================
        // 4.6. GIỚI HẠN 0–10
        // ======================================================

        diemHocPhanHe10 = Math.max(0, Math.min(10, Number(diemHocPhanHe10)));

        diemHocPhanHe10 = Number(diemHocPhanHe10.toFixed(2));

        // ======================================================
        // 4.7. QUY ĐỔI SANG HỆ 4
        // ======================================================

        const diemHocPhanHe4 = quyDoiThang4(diemHocPhanHe10);

        // ======================================================
        // 4.8. CỘNG GPA
        // ======================================================

        tongTinChi += soTinChi;

        tongDiemHe4 += diemHocPhanHe4 * soTinChi;

        // ======================================================
        // 4.9. LƯU KẾT QUẢ TẠM
        // ======================================================

        ketQua.push({
          ma_hoc_phan: hp.MA_HOC_PHAN,

          ten_hoc_phan: hp.TEN_HOC_PHAN,

          so_tin_chi: soTinChi,

          diem_chuyen_can: diemChuyenCanLuu,

          diem_thuong_xuyen: diemThuongXuyenLuu,

          diem_thi: diemThiLuu,

          diem_hoc_phan_he_10: diemHocPhanHe10,

          diem_hoc_phan_he_4: diemHocPhanHe4,

          nguon: nguonDiem,
        });
      }

      // ========================================================
      // 5. TÍNH GPA HỌC KỲ
      // ========================================================

      const gpa = tongTinChi > 0 ? tongDiemHe4 / tongTinChi : 0;

      const gpaLamTron = Number(gpa.toFixed(2));

      // ========================================================
      // 6. TÍNH ĐIỂM HỆ 10 TRUNG BÌNH
      // ========================================================

      let tongDiemHe10 = 0;

      for (const mon of ketQua) {
        tongDiemHe10 +=
          Number(mon.diem_hoc_phan_he_10) * Number(mon.so_tin_chi);
      }

      const diemHe10 = tongTinChi > 0 ? tongDiemHe10 / tongTinChi : 0;

      const diemHe10LamTron = Number(diemHe10.toFixed(2));

      // ========================================================
      // 7. XẾP LOẠI
      // ========================================================

      let xepLoai;

      if (gpaLamTron >= 3.6) {
        xepLoai = "Xuất sắc";
      } else if (gpaLamTron >= 3.2) {
        xepLoai = "Giỏi";
      } else if (gpaLamTron >= 2.5) {
        xepLoai = "Khá";
      } else if (gpaLamTron >= 2.0) {
        xepLoai = "Trung bình";
      } else {
        xepLoai = "Yếu";
      }

      // ========================================================
      // 8. TÌM HỌC KỲ LIỀN TRƯỚC
      // ========================================================

      const kyTruoc = await timHocKyTruoc({
        pool,
        idSinhVien: sinhVien.ID_SINH_VIEN,
        hocKy: hocKyNumber,
        namHoc: namHocString,
      });

      let soSanhKyTruoc = null;

      if (kyTruoc) {
        soSanhKyTruoc = await laySoSanhKyTruoc({
          pool,

          idSinhVien: sinhVien.ID_SINH_VIEN,

          hocKyTruoc: kyTruoc.hocKy,

          namHocTruoc: kyTruoc.namHoc,

          gpaHienTai: gpaLamTron,

          diemHe10HienTai: diemHe10LamTron,
        });
      }

      // ========================================================
      // 9. NHẬN ĐỊNH + LỜI KHUYÊN
      // ========================================================

      const phanTich = phanTichGpaHocKy({
        gpa: gpaLamTron,

        xepLoai: xepLoai,

        hocPhan: ketQua,
      });

      // ========================================================
      // 10. LƯU KẾT QUẢ
      // ========================================================

      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        // ======================================================
        // 10.1. LƯU BẢN GHI TỔNG
        // ======================================================

        const ketQuaLuu = await new sql.Request(transaction)
          .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN)
          .input("HOC_KY", sql.Int, hocKyNumber)
          .input("NAM_HOC", sql.NVarChar(20), namHocString)
          .input("GPA_DU_DOAN", sql.Decimal(3, 2), gpaLamTron)
          .input("DIEM_HE_10_DU_DOAN", sql.Decimal(4, 2), diemHe10LamTron)
          .input("TONG_TIN_CHI", sql.Int, tongTinChi)
          .input("XEP_LOAI", sql.NVarChar(30), xepLoai).query(`
              INSERT INTO DU_DOAN_HOC_KY (
                  ID_SINH_VIEN,
                  HOC_KY,
                  NAM_HOC,
                  GPA_DU_DOAN,
                  DIEM_HE_10_DU_DOAN,
                  TONG_TIN_CHI,
                  XEP_LOAI
              )

              OUTPUT INSERTED.ID_DU_DOAN

              VALUES (
                  @ID_SINH_VIEN,
                  @HOC_KY,
                  @NAM_HOC,
                  @GPA_DU_DOAN,
                  @DIEM_HE_10_DU_DOAN,
                  @TONG_TIN_CHI,
                  @XEP_LOAI
              )
            `);

        const idDuDoan = ketQuaLuu.recordset[0].ID_DU_DOAN;

        // ======================================================
        // 10.2. LƯU CHI TIẾT TỪNG HỌC PHẦN
        // ======================================================

        for (const mon of ketQua) {
          const hocPhanDb = await new sql.Request(transaction).input(
            "MA_HOC_PHAN",
            sql.VarChar(30),
            mon.ma_hoc_phan,
          ).query(`
                SELECT
                    ID_HOC_PHAN
                FROM HOC_PHAN
                WHERE
                    MA_HOC_PHAN =
                        @MA_HOC_PHAN
              `);

          if (hocPhanDb.recordset.length === 0) {
            throw new Error(`Không tìm thấy học phần ${mon.ma_hoc_phan}`);
          }

          const idHocPhan = hocPhanDb.recordset[0].ID_HOC_PHAN;

          await new sql.Request(transaction)
            .input("ID_DU_DOAN", sql.Int, idDuDoan)
            .input("ID_HOC_PHAN", sql.Int, idHocPhan)
            .input("DIEM_CHUYEN_CAN", sql.Decimal(4, 2), mon.diem_chuyen_can)
            .input(
              "DIEM_THUONG_XUYEN",
              sql.Decimal(4, 2),
              mon.diem_thuong_xuyen,
            )
            .input("DIEM_THI", sql.Decimal(4, 2), mon.diem_thi)
            .input(
              "DIEM_HOC_PHAN_HE_10",
              sql.Decimal(4, 2),
              mon.diem_hoc_phan_he_10,
            )
            .input(
              "DIEM_HOC_PHAN_HE_4",
              sql.Decimal(3, 2),
              mon.diem_hoc_phan_he_4,
            )
            .input("NGUON_DIEM", sql.NVarChar(30), mon.nguon).query(`
              INSERT INTO CHI_TIET_DU_DOAN_HOC_KY (
                  ID_DU_DOAN,
                  ID_HOC_PHAN,
                  DIEM_CHUYEN_CAN,
                  DIEM_THUONG_XUYEN,
                  DIEM_THI,
                  DIEM_HOC_PHAN_HE_10,
                  DIEM_HOC_PHAN_HE_4,
                  NGUON_DIEM
              )

              VALUES (
                  @ID_DU_DOAN,
                  @ID_HOC_PHAN,
                  @DIEM_CHUYEN_CAN,
                  @DIEM_THUONG_XUYEN,
                  @DIEM_THI,
                  @DIEM_HOC_PHAN_HE_10,
                  @DIEM_HOC_PHAN_HE_4,
                  @NGUON_DIEM
              )
            `);
        }

        await transaction.commit();

        // ======================================================
        // 11. TRẢ KẾT QUẢ
        // ======================================================

        return res.json({
          thanhCong: true,

          sinhVien: {
            idSinhVien: sinhVien.ID_SINH_VIEN,

            maSinhVien: sinhVien.MA_SINH_VIEN,

            hoTen: sinhVien.HO_TEN,
          },

          ketQua: {
            idDuDoan: idDuDoan,

            gpa: gpaLamTron,

            diemHe10: diemHe10LamTron,

            tongTinChi: tongTinChi,

            xepLoai: xepLoai,

            hocPhan: ketQua,

            soSanhKyTruoc: soSanhKyTruoc,

            nhanDinh: phanTich.nhanDinh,

            loiKhuyen: phanTich.loiKhuyen,
          },
        });
      } catch (errorLuu) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error("Lỗi rollback:", rollbackError);
        }

        throw errorLuu;
      }
    } catch (error) {
      console.error("Lỗi dự đoán GPA học kỳ:", error);

      return res.status(500).json({
        thanhCong: false,

        thongBao: "Không thể dự đoán GPA học kỳ.",

        error: error.message,
      });
    }
  },
);

module.exports = router;
