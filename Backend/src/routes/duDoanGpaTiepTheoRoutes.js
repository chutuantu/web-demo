const express = require("express");
const axios = require("axios");
const { sql, layPool } = require("../config/database");
const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

const ML_API_URL = "http://127.0.0.1:5000/du-doan-gpa-hoc-ky-tiep-theo";

/* ============================================================
   TÍNH XU HƯỚNG GPA
============================================================ */

function tinhXuHuongGPA(danhSachGPA) {
  const n = danhSachGPA.length;

  if (n < 2) {
    return 0;
  }

  const x = danhSachGPA.map((_, index) => index + 1);

  const trungBinhX = x.reduce((tong, giaTri) => tong + giaTri, 0) / n;

  const trungBinhY = danhSachGPA.reduce((tong, giaTri) => tong + giaTri, 0) / n;

  let tuSo = 0;
  let mauSo = 0;

  for (let i = 0; i < n; i++) {
    tuSo += (x[i] - trungBinhX) * (danhSachGPA[i] - trungBinhY);

    mauSo += (x[i] - trungBinhX) ** 2;
  }

  if (mauSo === 0) {
    return 0;
  }

  return tuSo / mauSo;
}

/* ============================================================
   XẾP LOẠI GPA
============================================================ */

function xepLoaiGPA(gpa) {
  if (gpa >= 3.6) {
    return "Xuất sắc";
  }

  if (gpa >= 3.2) {
    return "Giỏi";
  }

  if (gpa >= 2.5) {
    return "Khá";
  }

  if (gpa >= 2.0) {
    return "Trung bình";
  }

  return "Yếu";
}

/* ============================================================
   NHẬN ĐỊNH
============================================================ */

function taoNhanDinh({ gpaDuDoan, gpaKyGanNhat, gpaTrungBinh, xuHuongGPA }) {
  const nhanDinh = [];

  const chenhLech = gpaDuDoan - gpaKyGanNhat;

  if (chenhLech > 0.05) {
    nhanDinh.push(
      `GPA dự đoán cao hơn khoảng ${chenhLech.toFixed(
        2,
      )} điểm so với học kỳ gần nhất.`,
    );
  } else if (chenhLech < -0.05) {
    nhanDinh.push(
      `GPA dự đoán thấp hơn khoảng ${Math.abs(chenhLech).toFixed(
        2,
      )} điểm so với học kỳ gần nhất.`,
    );
  } else {
    nhanDinh.push("GPA dự đoán tương đối ổn định so với học kỳ gần nhất.");
  }

  if (xuHuongGPA > 0.03) {
    nhanDinh.push("GPA các học kỳ trước đang có xu hướng tăng.");
  } else if (xuHuongGPA < -0.03) {
    nhanDinh.push("GPA các học kỳ trước đang có xu hướng giảm.");
  } else {
    nhanDinh.push("GPA các học kỳ trước tương đối ổn định.");
  }

  if (gpaDuDoan > gpaTrungBinh + 0.05) {
    nhanDinh.push(
      "GPA dự đoán cao hơn mức GPA trung bình của các học kỳ đã nhập.",
    );
  } else if (gpaDuDoan < gpaTrungBinh - 0.05) {
    nhanDinh.push(
      "GPA dự đoán thấp hơn mức GPA trung bình của các học kỳ đã nhập.",
    );
  } else {
    nhanDinh.push(
      "GPA dự đoán nằm gần mức trung bình kết quả học tập trước đây.",
    );
  }

  return nhanDinh;
}

/* ============================================================
   LỜI KHUYÊN
============================================================ */

function taoLoiKhuyen({
  gpaDuDoan,
  xuHuongGPA,
  gioTuHoc,
  tyLeChuyenCan,
  gioLamThem,
}) {
  const loiKhuyen = [];

  if (gpaDuDoan >= 3.6) {
    loiKhuyen.push(
      "Tiếp tục duy trì phương pháp học tập hiện tại để giữ vững kết quả.",
    );
  } else if (gpaDuDoan >= 3.2) {
    loiKhuyen.push(
      "Tiếp tục duy trì kết quả hiện tại và tập trung cải thiện các học phần còn thấp.",
    );
  } else if (gpaDuDoan >= 2.5) {
    loiKhuyen.push(
      "Nên tăng thời gian tự học và ưu tiên các học phần có mức độ khó cao.",
    );
  } else if (gpaDuDoan >= 2.0) {
    loiKhuyen.push(
      "Nên xây dựng kế hoạch học tập cụ thể và tăng thời gian ôn tập.",
    );
  } else {
    loiKhuyen.push(
      "Cần ưu tiên cải thiện nền tảng học tập và lập kế hoạch học tập rõ ràng.",
    );
  }

  if (xuHuongGPA < -0.03) {
    loiKhuyen.push(
      "GPA đang có xu hướng giảm, nên xem lại nguyên nhân ở các học kỳ gần đây.",
    );
  }

  if (gioTuHoc < 10) {
    loiKhuyen.push("Nên tăng thời gian tự học mỗi tuần.");
  }

  if (tyLeChuyenCan < 85) {
    loiKhuyen.push("Nên cải thiện tỷ lệ chuyên cần để hỗ trợ kết quả học tập.");
  }

  if (gioLamThem > 20) {
    loiKhuyen.push("Nên cân đối thời gian làm thêm với thời gian học tập.");
  }

  return [...new Set(loiKhuyen)];
}

/* ============================================================
   GET /api/du-doan/gpa-lich-su
============================================================ */

router.get(
  "/gpa-lich-su",
  xacThuc,
  phanQuyen("SINH_VIEN"),
  async (req, res) => {
    try {
      const idTaiKhoan = req.taiKhoan.idTaiKhoan;

      if (!idTaiKhoan) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản đăng nhập.",
        });
      }

      const pool = layPool();

      const sinhVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, idTaiKhoan).query(`
            SELECT
              ID_SINH_VIEN,
              MA_SINH_VIEN,
              HO_TEN
            FROM SINH_VIEN
            WHERE
              ID_TAI_KHOAN = @ID_TAI_KHOAN
          `);

      if (sinhVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy sinh viên.",
        });
      }

      const sinhVien = sinhVienResult.recordset[0];

      const result = await pool
        .request()
        .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN).query(`
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
              HOC_KY ASC,
              ID_KET_QUA ASC
          `);

      return res.json({
        thanhCong: true,

        sinhVien: {
          idSinhVien: sinhVien.ID_SINH_VIEN,

          maSinhVien: sinhVien.MA_SINH_VIEN,

          hoTen: sinhVien.HO_TEN,
        },

        gpa: result.recordset.map((item) => ({
          hocKy: Number(item.HOC_KY),

          namHoc: item.NAM_HOC,

          gpa: Number(item.GPA),

          tongTinChi: Number(item.TONG_TIN_CHI),
        })),
      });
    } catch (error) {
      console.error("Lỗi lấy GPA lịch sử:", error);

      return res.status(500).json({
        thanhCong: false,
        thongBao: "Không thể lấy GPA các học kỳ.",
      });
    }
  },
);

/* ============================================================
   POST /api/du-doan/gpa-hoc-ky-tiep-theo
============================================================ */

router.post(
  "/gpa-hoc-ky-tiep-theo",
  xacThuc,
  phanQuyen("SINH_VIEN"),
  async (req, res) => {
    try {
      /* ======================================================
         1. LẤY TÀI KHOẢN
      ====================================================== */

      const idTaiKhoan = req.taiKhoan.idTaiKhoan;

      if (!idTaiKhoan) {
        return res.status(401).json({
          thanhCong: false,
          thongBao: "Không xác định được tài khoản đăng nhập.",
        });
      }

      const pool = layPool();

      const sinhVienResult = await pool
        .request()
        .input("ID_TAI_KHOAN", sql.Int, idTaiKhoan).query(`
            SELECT
              ID_SINH_VIEN,
              MA_SINH_VIEN,
              HO_TEN
            FROM SINH_VIEN
            WHERE
              ID_TAI_KHOAN = @ID_TAI_KHOAN
          `);

      if (sinhVienResult.recordset.length === 0) {
        return res.status(404).json({
          thanhCong: false,
          thongBao: "Không tìm thấy sinh viên.",
        });
      }

      const sinhVien = sinhVienResult.recordset[0];

      /* ======================================================
         2. LẤY DỮ LIỆU FRONTEND
      ====================================================== */

      const {
        hocKyGanNhat,
        gpaLichSu,
        tongTinChiKyToi,
        gioTuHocTuan,
        tyLeChuyenCan,
        gioLamThemTuan,
      } = req.body;

      /* ======================================================
         3. KIỂM TRA HỌC KỲ
      ====================================================== */

      const hocKy = Number(hocKyGanNhat);

      if (!Number.isInteger(hocKy) || hocKy < 1 || hocKy > 8) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Học kỳ gần nhất phải từ 1 đến 8.",
        });
      }

      /* ======================================================
         4. KIỂM TRA GPA LỊCH SỬ
      ====================================================== */

      if (!Array.isArray(gpaLichSu)) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Danh sách GPA lịch sử không hợp lệ.",
        });
      }

      if (gpaLichSu.length === 0) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Vui lòng nhập ít nhất một GPA học kỳ.",
        });
      }

      if (gpaLichSu.length > 8) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Sinh viên chỉ có tối đa 8 học kỳ.",
        });
      }

      if (gpaLichSu.length !== hocKy) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: `Bạn đã chọn HK${hocKy} nhưng chưa nhập đủ GPA từ HK1 đến HK${hocKy}.`,
        });
      }

      /* ======================================================
         5. CHUẨN HÓA GPA
      ====================================================== */

      const danhSachGPA = [];

      for (let i = 0; i < gpaLichSu.length; i++) {
        const gpa = Number(gpaLichSu[i]);

        if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
          return res.status(400).json({
            thanhCong: false,
            thongBao: `GPA HK${i + 1} phải nằm trong khoảng 0 đến 4.`,
          });
        }

        danhSachGPA.push(Number(gpa.toFixed(2)));
      }

      /* ======================================================
         6. XÁC ĐỊNH DỮ LIỆU HIỆN TẠI
      ====================================================== */

      const soHocKyDaHoc = danhSachGPA.length;

      const gpaKyGanNhat = danhSachGPA[danhSachGPA.length - 1];

      const gpaLichSuLuu = JSON.stringify(danhSachGPA);

      /* ======================================================
         7. HỌC KỲ DỰ ĐOÁN
      ====================================================== */

      const hocKyDuDoan = hocKy + 1;

      if (hocKyDuDoan > 8) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Sinh viên đã hoàn thành 8 học kỳ, không thể dự đoán thêm.",
        });
      }

      /* ======================================================
         8. GPA TRUNG BÌNH
      ====================================================== */

      const gpaTrungBinh =
        danhSachGPA.reduce((tong, gpa) => tong + gpa, 0) / danhSachGPA.length;

      /* ======================================================
         9. XU HƯỚNG
      ====================================================== */

      const xuHuongGPA = tinhXuHuongGPA(danhSachGPA);

      /* ======================================================
         10. XÁC ĐỊNH NĂM HỌC DỰ ĐOÁN
      ====================================================== */

      const ketQuaHocKyMoiNhat = await pool
        .request()
        .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN).query(`
            SELECT TOP 1
              HOC_KY,
              NAM_HOC
            FROM KET_QUA_HOC_KY
            WHERE
              ID_SINH_VIEN = @ID_SINH_VIEN
              AND GPA IS NOT NULL
            ORDER BY
              HOC_KY DESC,
              ID_KET_QUA DESC
          `);

      let namHocDuDoan = null;

      if (ketQuaHocKyMoiNhat.recordset.length > 0) {
        const namHocCuoi = String(
          ketQuaHocKyMoiNhat.recordset[0].NAM_HOC || "",
        );

        const match = namHocCuoi.match(/^(\d{4})-(\d{4})$/);

        if (match) {
          const namBatDau = Number(match[1]);

          if (hocKy % 2 === 0) {
            namHocDuDoan = `${namBatDau + 1}-${namBatDau + 2}`;
          } else {
            namHocDuDoan = namHocCuoi;
          }
        } else {
          namHocDuDoan = namHocCuoi || null;
        }
      }

      /* ======================================================
         11. DỮ LIỆU KỲ TIẾP THEO
      ====================================================== */

      const tongTinChi = Number(tongTinChiKyToi);

      const gioTuHoc = Number(gioTuHocTuan);

      const chuyenCan = Number(tyLeChuyenCan);

      const gioLamThem = Number(gioLamThemTuan);

      /* ======================================================
         12. VALIDATE TÍN CHỈ
      ====================================================== */

      if (!Number.isFinite(tongTinChi) || tongTinChi < 1 || tongTinChi > 30) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tổng số tín chỉ học kỳ tiếp theo phải từ 1 đến 30.",
        });
      }

      /* ======================================================
         13. VALIDATE TỰ HỌC
      ====================================================== */

      if (!Number.isFinite(gioTuHoc) || gioTuHoc < 0 || gioTuHoc > 168) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Số giờ tự học phải từ 0 đến 168 giờ/tuần.",
        });
      }

      /* ======================================================
         14. VALIDATE CHUYÊN CẦN
      ====================================================== */

      if (!Number.isFinite(chuyenCan) || chuyenCan < 0 || chuyenCan > 100) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Tỷ lệ chuyên cần phải từ 0 đến 100%.",
        });
      }

      /* ======================================================
         15. VALIDATE LÀM THÊM
      ====================================================== */

      if (!Number.isFinite(gioLamThem) || gioLamThem < 0 || gioLamThem > 168) {
        return res.status(400).json({
          thanhCong: false,
          thongBao: "Số giờ làm thêm phải từ 0 đến 168 giờ/tuần.",
        });
      }

      /* ======================================================
         16. DỮ LIỆU GỬI FLASK
      ====================================================== */

      const duLieuML = {
        gpa_ky_gan_nhat: Number(gpaKyGanNhat.toFixed(2)),

        gpa_trung_binh_lich_su: Number(gpaTrungBinh.toFixed(4)),

        xu_huong_gpa: Number(xuHuongGPA.toFixed(4)),

        so_hoc_ky_da_hoc: soHocKyDaHoc,

        tong_tin_chi_ky_toi: tongTinChi,

        gio_tu_hoc_tuan: gioTuHoc,

        ty_le_chuyen_can: chuyenCan,

        gio_lam_them_tuan: gioLamThem,
      };

      console.log("DỮ LIỆU GỬI SANG ML:", duLieuML);

      /* ======================================================
         17. GỌI FLASK
      ====================================================== */

      let mlResponse;

      try {
        mlResponse = await axios.post(ML_API_URL, duLieuML, {
          timeout: 10000,
        });
      } catch (error) {
        console.error("Lỗi gọi ML GPA học kỳ tiếp theo:", error.message);

        return res.status(500).json({
          thanhCong: false,
          thongBao: "Không thể kết nối đến mô hình GPA học kỳ tiếp theo.",
        });
      }

      /* ======================================================
         18. KIỂM TRA FLASK
      ====================================================== */

      if (!mlResponse.data?.thanh_cong || !mlResponse.data?.ket_qua) {
        console.error("Response ML không hợp lệ:", mlResponse.data);

        return res.status(500).json({
          thanhCong: false,
          thongBao: "Mô hình GPA học kỳ tiếp theo không trả kết quả hợp lệ.",
        });
      }

      /* ======================================================
         19. GPA DỰ ĐOÁN
      ====================================================== */

      const gpaDuDoan = Number(mlResponse.data.ket_qua.gpa_du_doan);

      if (!Number.isFinite(gpaDuDoan)) {
        return res.status(500).json({
          thanhCong: false,
          thongBao: "GPA dự đoán không hợp lệ.",
        });
      }

      const gpaLamTron = Number(Math.max(0, Math.min(4, gpaDuDoan)).toFixed(2));

      /* ======================================================
         20. QUY ĐỔI HỆ 10
      ====================================================== */

      const diemHe10 = Number((gpaLamTron * 2.5).toFixed(2));

      /* ======================================================
         21. XẾP LOẠI
      ====================================================== */

      const xepLoai = xepLoaiGPA(gpaLamTron);

      /* ======================================================
         22. CHÊNH LỆCH GPA
      ====================================================== */

      const chenhLechGPA = Number((gpaLamTron - gpaKyGanNhat).toFixed(2));

      /* ======================================================
         23. CHÊNH LỆCH HỆ 10
      ====================================================== */

      const diemHe10KyGanNhat = Number((gpaKyGanNhat * 2.5).toFixed(2));

      const chenhLechHe10 = Number((diemHe10 - diemHe10KyGanNhat).toFixed(2));

      /* ======================================================
         24. NHẬN ĐỊNH
      ====================================================== */

      const nhanDinh = taoNhanDinh({
        gpaDuDoan: gpaLamTron,

        gpaKyGanNhat: gpaKyGanNhat,

        gpaTrungBinh: gpaTrungBinh,

        xuHuongGPA: xuHuongGPA,
      });

      /* ======================================================
         25. LỜI KHUYÊN
      ====================================================== */

      const loiKhuyen = taoLoiKhuyen({
        gpaDuDoan: gpaLamTron,

        xuHuongGPA: xuHuongGPA,

        gioTuHoc: gioTuHoc,

        tyLeChuyenCan: chuyenCan,

        gioLamThem: gioLamThem,
      });

      /* ======================================================
         26. LƯU DATABASE
      ====================================================== */

      const ketQuaLuu = await pool
        .request()

        .input("ID_SINH_VIEN", sql.Int, sinhVien.ID_SINH_VIEN)

        .input("HOC_KY_DU_DOAN", sql.Int, hocKyDuDoan)

        .input("NAM_HOC_DU_DOAN", sql.NVarChar(20), namHocDuDoan)

        .input("GPA_KY_GAN_NHAT", sql.Decimal(3, 2), gpaKyGanNhat)

        .input(
          "GPA_TRUNG_BINH_LICH_SU",
          sql.Decimal(3, 2),
          Number(gpaTrungBinh.toFixed(2)),
        )

        .input("XU_HUONG_GPA", sql.Decimal(5, 3), Number(xuHuongGPA.toFixed(3)))

        .input("SO_HOC_KY_DA_HOC", sql.Int, soHocKyDaHoc)

        .input("TIN_CHI_DANG_KY", sql.Int, tongTinChi)

        .input("GIO_TU_HOC_TUAN", sql.Decimal(5, 2), gioTuHoc)

        .input("TY_LE_CHUYEN_CAN", sql.Decimal(5, 2), chuyenCan)

        .input("GIO_LAM_THEM_TUAN", sql.Decimal(5, 2), gioLamThem)

        .input("GPA_DU_DOAN", sql.Decimal(3, 2), gpaLamTron)

        .input("DIEM_HE_10_DU_DOAN", sql.Decimal(4, 2), diemHe10)

        .input("XEP_LOAI", sql.NVarChar(30), xepLoai)

        .input("NHAN_DINH", sql.NVarChar(sql.MAX), JSON.stringify(nhanDinh))

        .input("LOI_KHUYEN", sql.NVarChar(sql.MAX), JSON.stringify(loiKhuyen))

        .input("GPA_LICH_SU", sql.NVarChar(sql.MAX), gpaLichSuLuu).query(`
            INSERT INTO DU_DOAN_GPA_HOC_KY_TIEP_THEO (
              ID_SINH_VIEN,
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
              GPA_LICH_SU
            )
            VALUES (
              @ID_SINH_VIEN,
              @HOC_KY_DU_DOAN,
              @NAM_HOC_DU_DOAN,
              @GPA_KY_GAN_NHAT,
              @GPA_TRUNG_BINH_LICH_SU,
              @XU_HUONG_GPA,
              @SO_HOC_KY_DA_HOC,
              @TIN_CHI_DANG_KY,
              @GIO_TU_HOC_TUAN,
              @TY_LE_CHUYEN_CAN,
              @GIO_LAM_THEM_TUAN,
              @GPA_DU_DOAN,
              @DIEM_HE_10_DU_DOAN,
              @XEP_LOAI,
              @NHAN_DINH,
              @LOI_KHUYEN,
              @GPA_LICH_SU
            )
          `);

      /* ======================================================
         27. RESPONSE
      ====================================================== */

      return res.json({
        thanhCong: true,

        sinhVien: {
          idTaiKhoan: idTaiKhoan,

          maDangNhap: req.taiKhoan.maDangNhap,

          vaiTro: req.taiKhoan.vaiTro,
        },

        duLieuDauVao: {
          hocKyGanNhat: hocKy,

          gpaLichSu: danhSachGPA,

          gpaKyGanNhat: Number(gpaKyGanNhat.toFixed(2)),

          gpaTrungBinhLichSu: Number(gpaTrungBinh.toFixed(2)),

          xuHuongGPA: Number(xuHuongGPA.toFixed(4)),

          soHocKyDaHoc: soHocKyDaHoc,

          tongTinChiKyToi: tongTinChi,

          gioTuHocTuan: gioTuHoc,

          tyLeChuyenCan: chuyenCan,

          gioLamThemTuan: gioLamThem,
        },

        ketQua: {
          hocKyDuDoan: hocKyDuDoan,

          namHocDuDoan: namHocDuDoan,

          gpaDuDoan: gpaLamTron,

          diemHe10: diemHe10,

          xepLoai: xepLoai,

          chenhLechGPA: chenhLechGPA,

          chenhLechHe10: chenhLechHe10,

          nhanDinh: nhanDinh,

          loiKhuyen: loiKhuyen,
        },

        idDuDoan: ketQuaLuu.recordset?.[0]?.ID_DU_DOAN || null,
      });
    } catch (error) {
      console.error("Lỗi dự đoán GPA học kỳ tiếp theo:", error);

      const laLoiGPA = error?.message?.startsWith("GPA HK");

      return res.status(laLoiGPA ? 400 : 500).json({
        thanhCong: false,

        thongBao: laLoiGPA
          ? error.message
          : "Không thể dự đoán GPA học kỳ tiếp theo.",
      });
    }
  },
);

module.exports = router;
