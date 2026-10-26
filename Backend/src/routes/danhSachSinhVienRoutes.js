const express = require("express");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const { sql, layPool } = require("../config/database.js");

const xacThuc = require("../middleware/xacThuc.js");
const phanQuyen = require("../middleware/phanQuyen.js");

const router = express.Router();

/* ============================================================
   XÁC ĐỊNH NĂM SINH VIÊN
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
   CLASS TRẠNG THÁI
============================================================ */

function layClassTrangThai(trangThai) {
  switch (trangThai) {
    case "Xuất sắc":
    case "Giỏi":
    case "Khá":
      return "trang-thai-kha";

    case "Trung bình khá":
      return "trang-thai-trung-binh-kha";

    case "Trung bình":
      return "trang-thai-trung-binh";

    case "Cảnh báo":
      return "trang-thai-canh-bao";

    default:
      return "trang-thai-trung-binh";
  }
}

/* ============================================================
   CHUẨN HÓA CHUỖI
============================================================ */

function chuanHoaChuoi(giaTri) {
  return String(giaTri ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

/* ============================================================
   ĐỌC GPA_LICH_SU AN TOÀN
============================================================ */

function docGPALichSu(giaTri) {
  if (!giaTri) {
    return [];
  }

  try {
    const parsed =
      typeof giaTri === "string"
        ? JSON.parse(giaTri)
        : giaTri;

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
  } catch (error) {
    console.warn(
      "Không thể đọc GPA_LICH_SU:",
      error.message,
    );

    return [];
  }
}

/* ============================================================
   HÀM LẤY TOÀN BỘ DỮ LIỆU DÙNG CHO XUẤT BÁO CÁO
============================================================ */

async function layDuLieuXuatBaoCao({
  tuKhoa = "",
  khoa = "",
  lop = "",
  nganh = "",
  trangThai = "",
} = {}) {
  const pool = layPool();

  const ketQua = await pool.request().query(`
    SELECT
        SV.ID_SINH_VIEN,
        SV.MA_SINH_VIEN,
        SV.HO_TEN,
        SV.NGAY_SINH,
        SV.GIOI_TINH,
        SV.NGANH_HOC,
        SV.LOP_HOC,
        SV.KHOA_HOC,

        COALESCE(
            GPA_LICH_SU_CUOI.GPA_CUOI,
            KQ.GPA_HIEN_TAI
        ) AS GPA_HIEN_TAI,

        COALESCE(
            GPA_LICH_SU_CUOI.HOC_KY_CUOI,
            KQ.HOC_KY_GAN_NHAT,
            DDHK.HOC_KY_DU_DOAN,
            DDHKTT.HOC_KY_DU_DOAN_TIEP_THEO
        ) AS HOC_KY_HIEN_TAI

    FROM SINH_VIEN SV

    OUTER APPLY (
        SELECT TOP 1
            DD.GPA_LICH_SU
        FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DD
        WHERE
            DD.ID_SINH_VIEN = SV.ID_SINH_VIEN
        ORDER BY
            DD.NGAY_DU_DOAN DESC,
            DD.ID_DU_DOAN DESC
    ) DU_DOAN_GPA

    OUTER APPLY (
        SELECT TOP 1
            TRY_CONVERT(
                DECIMAL(3,2),
                [value]
            ) AS GPA_CUOI,

            TRY_CONVERT(
                INT,
                [key]
            ) + 1 AS HOC_KY_CUOI

        FROM OPENJSON(
            DU_DOAN_GPA.GPA_LICH_SU
        )

        ORDER BY
            TRY_CONVERT(
                INT,
                [key]
            ) DESC
    ) GPA_LICH_SU_CUOI

    OUTER APPLY (
        SELECT TOP 1
            KQ1.HOC_KY_GLOBAL
                AS HOC_KY_GAN_NHAT,
            KQ1.GPA AS GPA_HIEN_TAI

        FROM (
            SELECT
                KQ2.GPA,

                ROW_NUMBER() OVER (
                    ORDER BY
                        ISNULL(
                            TRY_CONVERT(
                                INT,
                                LEFT(KQ2.NAM_HOC, 4)
                            ),
                            0
                        ) ASC,

                        KQ2.HOC_KY ASC,

                        KQ2.ID_KET_QUA ASC
                ) AS HOC_KY_GLOBAL

            FROM KET_QUA_HOC_KY KQ2

            WHERE
                KQ2.ID_SINH_VIEN = SV.ID_SINH_VIEN
                AND KQ2.GPA IS NOT NULL
        ) KQ1

        ORDER BY
            KQ1.HOC_KY_GLOBAL DESC
    ) KQ

    OUTER APPLY (
        SELECT TOP 1
            DD1.HOC_KY AS HOC_KY_DU_DOAN

        FROM DU_DOAN_HOC_KY DD1

        WHERE
            DD1.ID_SINH_VIEN = SV.ID_SINH_VIEN

        ORDER BY
            DD1.HOC_KY DESC,
            DD1.NGAY_DU_DOAN DESC,
            DD1.ID_DU_DOAN DESC
    ) DDHK

    OUTER APPLY (
        SELECT TOP 1
            DD2.HOC_KY_DU_DOAN AS HOC_KY_DU_DOAN_TIEP_THEO

        FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DD2

        WHERE
            DD2.ID_SINH_VIEN = SV.ID_SINH_VIEN

        ORDER BY
            DD2.NGAY_DU_DOAN DESC,
            DD2.ID_DU_DOAN DESC
    ) DDHKTT

    WHERE
        DDHK.HOC_KY_DU_DOAN IS NOT NULL

        OR

        DDHKTT.HOC_KY_DU_DOAN_TIEP_THEO IS NOT NULL
  `);

  let danhSach = ketQua.recordset.map(function (sv) {
    const hocKy =
      sv.HOC_KY_HIEN_TAI !== null &&
      sv.HOC_KY_HIEN_TAI !== undefined
        ? Number(sv.HOC_KY_HIEN_TAI)
        : null;

    const gpa =
      sv.GPA_HIEN_TAI !== null &&
      sv.GPA_HIEN_TAI !== undefined
        ? Number(Number(sv.GPA_HIEN_TAI).toFixed(2))
        : null;

    return {
      idSinhVien: sv.ID_SINH_VIEN,

      maSinhVien: sv.MA_SINH_VIEN,

      hoTen: sv.HO_TEN,

      lopHoc: sv.LOP_HOC,

      khoaHoc: sv.KHOA_HOC,

      nganhHoc: sv.NGANH_HOC,

      hocKyHienTai: hocKy,

      gpaHienTai: gpa,

      namHoc: xacDinhNamHoc(hocKy),

      trangThai: xepLoaiGPA(gpa),
    };
  });

  /* ==========================================================
     TÌM KIẾM
  ========================================================== */

  if (tuKhoa) {
    const cacTuKhoa = chuanHoaChuoi(tuKhoa)
      .split(/\s+/)
      .filter(Boolean);

    danhSach = danhSach.filter(function (sv) {
      const noiDung = chuanHoaChuoi(
        [
          sv.maSinhVien,
          sv.hoTen,
          sv.lopHoc,
          sv.khoaHoc,
          sv.nganhHoc,
        ]
          .filter(function (giaTri) {
            return giaTri !== null && giaTri !== undefined;
          })
          .join(" "),
      );

      return cacTuKhoa.every(function (tu) {
        return noiDung.includes(tu);
      });
    });
  }

  /* ==========================================================
     LỌC KHÓA
  ========================================================== */

  if (khoa) {
    danhSach = danhSach.filter(function (sv) {
      return (
        String(sv.khoaHoc ?? "") ===
        String(khoa)
      );
    });
  }

  /* ==========================================================
     LỌC LỚP
  ========================================================== */

  if (lop) {
    danhSach = danhSach.filter(function (sv) {
      return (
        String(sv.lopHoc ?? "").toLowerCase() ===
        String(lop).toLowerCase()
      );
    });
  }

  /* ==========================================================
     LỌC NGÀNH
  ========================================================== */

  if (nganh) {
    const nganhChuanHoa = chuanHoaChuoi(nganh);

    danhSach = danhSach.filter(function (sv) {
      const giaTri = chuanHoaChuoi(
        sv.nganhHoc,
      );

      if (nganhChuanHoa === "cntt") {
        return (
          giaTri.includes(
            "cong nghe thong tin",
          ) ||
          giaTri === "cntt"
        );
      }

      if (nganhChuanHoa === "kt") {
        return (
          giaTri.includes("ke toan") ||
          giaTri === "kt"
        );
      }

      return giaTri === nganhChuanHoa;
    });
  }

  /* ==========================================================
     LỌC TRẠNG THÁI
  ========================================================== */

  if (trangThai) {
    danhSach = danhSach.filter(function (sv) {
      if (trangThai === "dang-hoat-dong") {
        return sv.trangThai !== "Cảnh báo";
      }

      if (trangThai === "canh-bao") {
        return sv.trangThai === "Cảnh báo";
      }

      return true;
    });
  }

  return danhSach;
}

/* ============================================================
   LẤY TOÀN BỘ SINH VIÊN ĐÃ TỪNG DỰ ĐOÁN
============================================================ */

async function laySinhVienTheoDuDoan(pool) {
  const ketQua = await pool.request().query(`
    SELECT
      SV.ID_SINH_VIEN,
      SV.MA_SINH_VIEN,
      SV.HO_TEN,
      SV.NGAY_SINH,
      SV.GIOI_TINH,
      SV.NGANH_HOC,
      SV.LOP_HOC,
      SV.KHOA_HOC,

      COALESCE(
        GPA_LICH_SU_CUOI.HOC_KY_CUOI,
        KQ.HOC_KY_GAN_NHAT
      ) AS HOC_KY_HIEN_TAI,

      COALESCE(
        GPA_LICH_SU_CUOI.GPA_CUOI,
        KQ.GPA_HIEN_TAI
      ) AS GPA_HIEN_TAI,

      DDHK.HOC_KY_DU_DOAN,
      DDHK.GPA_DU_DOAN_HOC_KY,
      DDHK.XEP_LOAI_DU_DOAN_HOC_KY,

      DDHKTT.HOC_KY_DU_DOAN_TIEP_THEO,
      DDHKTT.GPA_DU_DOAN_TIEP_THEO,
      DDHKTT.XEP_LOAI_DU_DOAN_TIEP_THEO

    FROM SINH_VIEN SV

    OUTER APPLY (
      SELECT TOP 1
        DD.GPA_LICH_SU
      FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DD
      WHERE
        DD.ID_SINH_VIEN =
        SV.ID_SINH_VIEN
      ORDER BY
        DD.NGAY_DU_DOAN DESC,
        DD.ID_DU_DOAN DESC
    ) DU_DOAN_GPA

    OUTER APPLY (
      SELECT TOP 1
        TRY_CONVERT(
          DECIMAL(3,2),
          [value]
        ) AS GPA_CUOI,

        TRY_CONVERT(
          INT,
          [key]
        ) + 1 AS HOC_KY_CUOI

      FROM OPENJSON(
        DU_DOAN_GPA.GPA_LICH_SU
      )

      ORDER BY
        TRY_CONVERT(
          INT,
          [key]
        ) DESC
    ) GPA_LICH_SU_CUOI

    OUTER APPLY (
      SELECT TOP 1
        KQ1.HOC_KY_GLOBAL
          AS HOC_KY_GAN_NHAT,

        KQ1.GPA
          AS GPA_HIEN_TAI

      FROM (
        SELECT
          KQ2.GPA,

          ROW_NUMBER() OVER (
            ORDER BY
              ISNULL(
                TRY_CONVERT(
                  INT,
                  LEFT(KQ2.NAM_HOC, 4)
                ),
                0
              ) ASC,

              KQ2.HOC_KY ASC,

              KQ2.ID_KET_QUA ASC
          ) AS HOC_KY_GLOBAL

        FROM KET_QUA_HOC_KY KQ2

        WHERE
          KQ2.ID_SINH_VIEN =
          SV.ID_SINH_VIEN

          AND

          KQ2.GPA IS NOT NULL
      ) KQ1

      ORDER BY
        KQ1.HOC_KY_GLOBAL DESC
    ) KQ

    OUTER APPLY (
      SELECT TOP 1
        DD1.HOC_KY
          AS HOC_KY_DU_DOAN,

        DD1.GPA_DU_DOAN
          AS GPA_DU_DOAN_HOC_KY,

        DD1.XEP_LOAI
          AS XEP_LOAI_DU_DOAN_HOC_KY

      FROM DU_DOAN_HOC_KY DD1

      WHERE
        DD1.ID_SINH_VIEN =
        SV.ID_SINH_VIEN

      ORDER BY
        DD1.NGAY_DU_DOAN DESC,
        DD1.ID_DU_DOAN DESC
    ) DDHK

    OUTER APPLY (
      SELECT TOP 1
        DD2.HOC_KY_DU_DOAN
          AS HOC_KY_DU_DOAN_TIEP_THEO,

        DD2.GPA_DU_DOAN
          AS GPA_DU_DOAN_TIEP_THEO,

        DD2.XEP_LOAI
          AS XEP_LOAI_DU_DOAN_TIEP_THEO

      FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DD2

      WHERE
        DD2.ID_SINH_VIEN =
        SV.ID_SINH_VIEN

      ORDER BY
        DD2.NGAY_DU_DOAN DESC,
        DD2.ID_DU_DOAN DESC
    ) DDHKTT

    WHERE
      DDHK.HOC_KY_DU_DOAN IS NOT NULL

      OR

      DDHKTT.HOC_KY_DU_DOAN_TIEP_THEO IS NOT NULL
  `);

  return ketQua.recordset;
}

/* ============================================================
   XUẤT EXCEL
============================================================ */

router.get(
  "/danh-sach-sinh-vien/xuat-excel",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const danhSach =
        await layDuLieuXuatBaoCao({
          tuKhoa:
            typeof req.query.tuKhoa === "string"
              ? req.query.tuKhoa.trim()
              : "",

          khoa:
            typeof req.query.khoa === "string"
              ? req.query.khoa.trim()
              : "",

          lop:
            typeof req.query.lop === "string"
              ? req.query.lop.trim()
              : "",

          nganh:
            typeof req.query.nganh === "string"
              ? req.query.nganh.trim()
              : "",

          trangThai:
            typeof req.query.trangThai ===
            "string"
              ? req.query.trangThai.trim()
              : "",
        });

      const workbook =
        new ExcelJS.Workbook();

      workbook.creator = "STUDYAI";

      workbook.created = new Date();

      workbook.modified = new Date();

      const worksheet =
        workbook.addWorksheet(
          "Danh sách sinh viên",
        );

      worksheet.mergeCells("A1:H1");

      const tieuDe =
        worksheet.getCell("A1");

      tieuDe.value =
        "DANH SÁCH SINH VIÊN";

      tieuDe.font = {
        bold: true,
        size: 16,
      };

      tieuDe.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.getRow(1).height =
        28;

      worksheet.mergeCells("A2:H2");

      const thoiGian =
        worksheet.getCell("A2");

      thoiGian.value =
        `Thời gian xuất: ${new Date().toLocaleString(
          "vi-VN",
        )}`;

      thoiGian.alignment = {
        horizontal: "center",
      };

      worksheet.mergeCells("A3:H3");

      const thongTinLoc =
        worksheet.getCell("A3");

      const locText = [
        req.query.tuKhoa
          ? `Từ khóa: ${req.query.tuKhoa}`
          : null,

        req.query.khoa
          ? `Khóa: ${req.query.khoa}`
          : null,

        req.query.lop
          ? `Lớp: ${req.query.lop}`
          : null,

        req.query.nganh
          ? `Ngành: ${req.query.nganh}`
          : null,

        req.query.trangThai
          ? `Trạng thái: ${req.query.trangThai}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      thongTinLoc.value =
        locText ||
        "Không áp dụng bộ lọc";

      worksheet.addRow([
        "STT",
        "MSSV",
        "Họ và tên",
        "Lớp",
        "Khóa",
        "Ngành học",
        "GPA hiện tại",
        "Trạng thái",
      ]);

      const dongHeader =
        worksheet.getRow(4);

      dongHeader.font = {
        bold: true,
      };

      dongHeader.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      danhSach.forEach(
        function (sv, index) {
          worksheet.addRow([
            index + 1,

            sv.maSinhVien || "",

            sv.hoTen || "",

            sv.lopHoc || "",

            sv.khoaHoc || "",

            sv.nganhHoc || "",

            sv.gpaHienTai !== null
              ? Number(
                  sv.gpaHienTai,
                ).toFixed(2)
              : "",

            sv.trangThai ||
              "Chưa xác định",
          ]);
        },
      );

      worksheet.columns = [
        {
          key: "stt",
          width: 8,
        },

        {
          key: "mssv",
          width: 18,
        },

        {
          key: "hoTen",
          width: 28,
        },

        {
          key: "lop",
          width: 18,
        },

        {
          key: "khoa",
          width: 12,
        },

        {
          key: "nganh",
          width: 30,
        },

        {
          key: "gpa",
          width: 16,
        },

        {
          key: "trangThai",
          width: 20,
        },
      ];

      for (
        let i = 5;
        i <= worksheet.rowCount;
        i++
      ) {
        const row =
          worksheet.getRow(i);

        row.alignment = {
          vertical: "middle",
        };

        row.getCell(1).alignment = {
          horizontal: "center",
        };

        row.getCell(7).alignment = {
          horizontal: "center",
        };

        row.getCell(8).alignment = {
          horizontal: "center",
        };
      }

      for (
        let row = 4;
        row <= worksheet.rowCount;
        row++
      ) {
        for (
          let col = 1;
          col <= 8;
          col++
        ) {
          worksheet.getCell(
            row,
            col,
          ).border = {
            top: {
              style: "thin",
            },

            left: {
              style: "thin",
            },

            bottom: {
              style: "thin",
            },

            right: {
              style: "thin",
            },
          };
        }
      }

      worksheet.views = [
        {
          state: "frozen",
          ySplit: 4,
        },
      ];

      const tenFile =
        `danh-sach-sinh-vien-${Date.now()}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${tenFile}"`,
      );

      await workbook.xlsx.write(
        res,
      );

      res.end();
    } catch (error) {
      console.error(
        "Lỗi xuất Excel:",
        error,
      );

      if (!res.headersSent) {
        return res.status(500).json({
          thanhCong: false,

          thongBao:
            "Không thể xuất file Excel.",
        });
      }
    }
  },
);

/* ============================================================
   XUẤT PDF
============================================================ */

router.get(
  "/danh-sach-sinh-vien/xuat-pdf",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const danhSach =
        await layDuLieuXuatBaoCao({
          tuKhoa:
            typeof req.query.tuKhoa === "string"
              ? req.query.tuKhoa.trim()
              : "",

          khoa:
            typeof req.query.khoa === "string"
              ? req.query.khoa.trim()
              : "",

          lop:
            typeof req.query.lop === "string"
              ? req.query.lop.trim()
              : "",

          nganh:
            typeof req.query.nganh === "string"
              ? req.query.nganh.trim()
              : "",

          trangThai:
            typeof req.query.trangThai ===
            "string"
              ? req.query.trangThai.trim()
              : "",
        });

      const cacFontCoTheDung = [
        "C:\\Windows\\Fonts\\arial.ttf",

        "C:\\Windows\\Fonts\\times.ttf",

        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",

        "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
      ];

      const fontTiengViet =
        cacFontCoTheDung.find(
          function (duongDan) {
            return fs.existsSync(
              duongDan,
            );
          },
        );

      if (!fontTiengViet) {
        return res.status(500).json({
          thanhCong: false,

          thongBao:
            "Không tìm thấy font hỗ trợ tiếng Việt để tạo PDF.",
        });
      }

      const doc =
        new PDFDocument({
          size: "A4",

          layout: "landscape",

          margins: {
            top: 35,
            bottom: 35,
            left: 30,
            right: 30,
          },

          bufferPages: true,
        });

      const tenFile =
        `danh-sach-sinh-vien-${Date.now()}.pdf`;

      res.setHeader(
        "Content-Type",
        "application/pdf",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${tenFile}"`,
      );

      doc.pipe(res);

      doc.registerFont(
        "VietFont",
        fontTiengViet,
      );

      doc.font("VietFont");

      doc.fontSize(18).text(
        "DANH SÁCH SINH VIÊN",
        {
          align: "center",
        },
      );

      doc.moveDown(0.4);

      doc
        .fontSize(9)
        .text(
          `Thời gian xuất: ${new Date().toLocaleString(
            "vi-VN",
          )}`,
          {
            align: "center",
          },
        );

      doc.moveDown(0.7);

      const locText = [
        req.query.tuKhoa
          ? `Từ khóa: ${req.query.tuKhoa}`
          : null,

        req.query.khoa
          ? `Khóa: ${req.query.khoa}`
          : null,

        req.query.lop
          ? `Lớp: ${req.query.lop}`
          : null,

        req.query.nganh
          ? `Ngành: ${req.query.nganh}`
          : null,

        req.query.trangThai
          ? `Trạng thái: ${req.query.trangThai}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      doc
        .fontSize(9)
        .text(
          locText ||
            "Không áp dụng bộ lọc",
          {
            align: "left",
          },
        );

      doc.moveDown(0.7);

      const xBatDau = 30;

      const yBatDau = doc.y;

      const chieuCaoDong = 24;

      const chieuRongCot = [
        35,
        75,
        125,
        65,
        45,
        120,
        65,
        90,
      ];

      const tieuDeCot = [
        "STT",
        "MSSV",
        "Họ và tên",
        "Lớp",
        "Khóa",
        "Ngành học",
        "GPA",
        "Trạng thái",
      ];

      let y = yBatDau;

      function veDongHeader() {
        let x = xBatDau;

        doc
          .fontSize(8)
          .font("VietFont");

        for (
          let i = 0;
          i < tieuDeCot.length;
          i++
        ) {
          doc
            .rect(
              x,
              y,
              chieuRongCot[i],
              chieuCaoDong,
            )
            .stroke();

          doc.text(
            tieuDeCot[i],
            x + 3,
            y + 7,
            {
              width:
                chieuRongCot[i] - 6,

              align: "center",
            },
          );

          x += chieuRongCot[i];
        }

        y += chieuCaoDong;
      }

      function veDongDuLieu(
        sv,
        index,
      ) {
        let x = xBatDau;

        const giaTri = [
          String(index + 1),

          String(
            sv.maSinhVien || "",
          ),

          String(sv.hoTen || ""),

          String(sv.lopHoc || ""),

          String(sv.khoaHoc || ""),

          String(sv.nganhHoc || ""),

          sv.gpaHienTai !== null
            ? Number(
                sv.gpaHienTai,
              ).toFixed(2)
            : "-",

          String(
            sv.trangThai ||
              "Chưa xác định",
          ),
        ];

        const xuongDong = [];

        for (
          let i = 0;
          i < giaTri.length;
          i++
        ) {
          const doCao =
            doc.heightOfString(
              giaTri[i],
              {
                width:
                  chieuRongCot[i] - 6,

                align: "left",
              },
            );

          xuongDong.push(doCao);
        }

        const caoDong = Math.max(
          chieuCaoDong,
          Math.max(...xuongDong) +
            8,
        );

        if (
          y + caoDong >
          doc.page.height - 40
        ) {
          doc.addPage();

          y = 35;

          veDongHeader();
        }

        x = xBatDau;

        for (
          let i = 0;
          i < giaTri.length;
          i++
        ) {
          doc
            .rect(
              x,
              y,
              chieuRongCot[i],
              caoDong,
            )
            .stroke();

          const canGiua =
            i === 0 ||
            i === 1 ||
            i === 3 ||
            i === 4 ||
            i === 6 ||
            i === 7;

          doc
            .fontSize(7.5)
            .font("VietFont")
            .text(
              giaTri[i],
              x + 3,
              y + 6,
              {
                width:
                  chieuRongCot[i] - 6,

                align: canGiua
                  ? "center"
                  : "left",

                height:
                  caoDong - 8,
              },
            );

          x += chieuRongCot[i];
        }

        y += caoDong;
      }

      veDongHeader();

      danhSach.forEach(
        function (sv, index) {
          veDongDuLieu(
            sv,
            index,
          );
        },
      );

      const pages =
        doc.bufferedPageRange();

      for (
        let i = pages.start;
        i < pages.start + pages.count;
        i++
      ) {
        doc.switchToPage(i);

        doc
          .fontSize(7)
          .text(
            `STUDYAI - Danh sách sinh viên | Trang ${
              i + 1
            }/${pages.count}`,
            30,
            doc.page.height - 25,
            {
              width:
                doc.page.width - 60,

              align: "center",
            },
          );
      }

      doc.end();
    } catch (error) {
      console.error(
        "Lỗi xuất PDF:",
        error,
      );

      if (!res.headersSent) {
        return res.status(500).json({
          thanhCong: false,

          thongBao:
            "Không thể xuất file PDF.",
        });
      }
    }
  },
);

/* ============================================================
   GET /api/giang-vien/danh-sach-sinh-vien
============================================================ */

router.get(
  "/danh-sach-sinh-vien",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      const tuKhoa =
        typeof req.query.tuKhoa ===
        "string"
          ? req.query.tuKhoa.trim()
          : "";

      const khoa =
        typeof req.query.khoa ===
        "string"
          ? req.query.khoa.trim()
          : "";

      const lop =
        typeof req.query.lop ===
        "string"
          ? req.query.lop.trim()
          : "";

      const nganh =
        typeof req.query.nganh ===
        "string"
          ? req.query.nganh.trim()
          : "";

      const trangThai =
        typeof req.query.trangThai ===
        "string"
          ? req.query.trangThai.trim()
          : "";

      let trang =
        Number(req.query.trang) ||
        1;

      let soBanGhi =
        Number(
          req.query.soBanGhi,
        ) || 10;

      if (
        !Number.isInteger(trang) ||
        trang < 1
      ) {
        trang = 1;
      }

      if (
        ![
          5,
          10,
          20,
          50,
        ].includes(soBanGhi)
      ) {
        soBanGhi = 10;
      }

      /* =====================================================
         LẤY DỮ LIỆU
      ===================================================== */

      let danhSachSinhVien =
        (
          await laySinhVienTheoDuDoan(
            pool,
          )
        ).map(function (sv) {
          const gpaHienTai =
            sv.GPA_HIEN_TAI !==
              null &&
            sv.GPA_HIEN_TAI !==
              undefined
              ? Number(
                  Number(
                    sv.GPA_HIEN_TAI,
                  ).toFixed(2),
                )
              : null;

          const hocKyHienTai =
            sv.HOC_KY_HIEN_TAI !==
              null &&
            sv.HOC_KY_HIEN_TAI !==
              undefined
              ? Number(
                  sv.HOC_KY_HIEN_TAI,
                )
              : null;

          const namHoc =
            xacDinhNamHoc(
              hocKyHienTai,
            );

          const trangThai =
            xepLoaiGPA(
              gpaHienTai,
            );

          return {
            idSinhVien:
              sv.ID_SINH_VIEN,

            maSinhVien:
              sv.MA_SINH_VIEN,

            hoTen:
              sv.HO_TEN,

            ngaySinh:
              sv.NGAY_SINH,

            gioiTinh:
              sv.GIOI_TINH,

            lopHoc:
              sv.LOP_HOC,

            khoaHoc:
              sv.KHOA_HOC,

            nganhHoc:
              sv.NGANH_HOC,

            hocKyHienTai,

            namHoc,

            gpaHienTai,

            duDoanHocKy:
              sv.HOC_KY_DU_DOAN !==
                null &&
              sv.HOC_KY_DU_DOAN !==
                undefined
                ? {
                    hocKy:
                      Number(
                        sv.HOC_KY_DU_DOAN,
                      ),

                    gpa:
                      Number(
                        Number(
                          sv.GPA_DU_DOAN_HOC_KY,
                        ).toFixed(2),
                      ),

                    xepLoai:
                      sv.XEP_LOAI_DU_DOAN_HOC_KY ||
                      null,
                  }
                : null,

            duDoanHocKyTiepTheo:
              sv.HOC_KY_DU_DOAN_TIEP_THEO !==
                null &&
              sv.HOC_KY_DU_DOAN_TIEP_THEO !==
                undefined
                ? {
                    hocKy:
                      Number(
                        sv.HOC_KY_DU_DOAN_TIEP_THEO,
                      ),

                    gpa:
                      Number(
                        Number(
                          sv.GPA_DU_DOAN_TIEP_THEO,
                        ).toFixed(2),
                      ),

                    xepLoai:
                      sv.XEP_LOAI_DU_DOAN_TIEP_THEO ||
                      null,
                  }
                : null,

            trangThai,

            classTrangThai:
              layClassTrangThai(
                trangThai,
              ),

            daDuDoanHocKy:
              sv.HOC_KY_DU_DOAN !==
                null &&
              sv.HOC_KY_DU_DOAN !==
                undefined,

            daDuDoanHocKyTiepTheo:
              sv.HOC_KY_DU_DOAN_TIEP_THEO !==
                null &&
              sv.HOC_KY_DU_DOAN_TIEP_THEO !==
                undefined,
          };
        });

      /* =====================================================
         TÌM KIẾM
      ===================================================== */

      if (tuKhoa) {
        const cacTuKhoa =
          chuanHoaChuoi(
            tuKhoa,
          )
            .split(/\s+/)
            .filter(Boolean);

        danhSachSinhVien =
          danhSachSinhVien.filter(
            function (sv) {
              const noiDung = chuanHoaChuoi(
                [
                  sv.maSinhVien,
                  sv.hoTen,
                  sv.lopHoc,
                  sv.khoaHoc,
                  sv.nganhHoc,
                ]
                  .filter(
                    function (
                      giaTri,
                    ) {
                      return (
                        giaTri !== null &&
                        giaTri !==
                          undefined
                      );
                    },
                  )
                  .join(" "),
              );

              return cacTuKhoa.every(
                function (tu) {
                  return noiDung.includes(tu);
                },
              );
            },
          );
      }

      /* =====================================================
         LỌC KHÓA
      ===================================================== */

      if (khoa) {
        danhSachSinhVien =
          danhSachSinhVien.filter(
            function (sv) {
              return (
                String(
                  sv.khoaHoc ?? "",
                ).toLowerCase() ===
                khoa.toLowerCase()
              );
            },
          );
      }

      /* =====================================================
         LỌC LỚP
      ===================================================== */

      if (lop) {
        danhSachSinhVien =
          danhSachSinhVien.filter(
            function (sv) {
              return (
                String(
                  sv.lopHoc ?? "",
                ).toLowerCase() ===
                lop.toLowerCase()
              );
            },
          );
      }

      /* =====================================================
         LỌC NGÀNH
      ===================================================== */

      if (nganh) {
        const q =
          chuanHoaChuoi(
            nganh,
          );

        danhSachSinhVien =
          danhSachSinhVien.filter(
            function (sv) {
              const giaTri =
                chuanHoaChuoi(
                  sv.nganhHoc,
                );

              if (
                q === "cntt"
              ) {
                return (
                  giaTri.includes(
                    "cong nghe thong tin",
                  ) ||
                  giaTri ===
                    "cntt"
                );
              }

              if (
                q === "kt"
              ) {
                return (
                  giaTri.includes(
                    "ke toan",
                  ) ||
                  giaTri ===
                    "kt"
                );
              }

              return (
                giaTri === q
              );
            },
          );
      }

      /* =====================================================
         LỌC TRẠNG THÁI
      ===================================================== */

      if (trangThai) {
        danhSachSinhVien =
          danhSachSinhVien.filter(
            function (sv) {
              if (
                trangThai ===
                "dang-hoat-dong"
              ) {
                return (
                  sv.trangThai !==
                  "Cảnh báo"
                );
              }

              if (
                trangThai ===
                "canh-bao"
              ) {
                return (
                  sv.trangThai ===
                  "Cảnh báo"
                );
              }

              return true;
            },
          );
      }

      /* =====================================================
         PHÂN TRANG
      ===================================================== */

      const tongSo =
        danhSachSinhVien.length;

      const tongSoTrang =
        Math.ceil(
          tongSo / soBanGhi,
        );

      if (
        tongSoTrang > 0 &&
        trang >
          tongSoTrang
      ) {
        trang =
          tongSoTrang;
      }

      const batDau =
        (trang - 1) *
        soBanGhi;

      const ketThuc =
        batDau +
        soBanGhi;

      const sinhVienHienThi =
        danhSachSinhVien.slice(
          batDau,
          ketThuc,
        );

      /* =====================================================
         THỐNG KÊ THEO NĂM
      ===================================================== */

      const thongKeNam = {
        nam1: 0,
        nam2: 0,
        nam3: 0,
        nam4: 0,
      };

      danhSachSinhVien.forEach(
        function (sv) {
          if (
            sv.namHoc === 1
          ) {
            thongKeNam.nam1++;
          } else if (
            sv.namHoc === 2
          ) {
            thongKeNam.nam2++;
          } else if (
            sv.namHoc === 3
          ) {
            thongKeNam.nam3++;
          } else if (
            sv.namHoc === 4
          ) {
            thongKeNam.nam4++;
          }
        },
      );

      return res.json({
        thanhCong: true,

        boLoc: {
          tuKhoa:
            tuKhoa || null,

          khoa:
            khoa || null,

          lop:
            lop || null,

          nganh:
            nganh || null,

          trangThai:
            trangThai || null,
        },

        phanTrang: {
          trangHienTai:
            trang,

          soBanGhiMoiTrang:
            soBanGhi,

          tongSo,

          tongSoTrang,

          tu:
            tongSo === 0
              ? 0
              : batDau + 1,

          den:
            Math.min(
              ketThuc,
              tongSo,
            ),
        },

        thongKe: {
          tongSinhVien:
            tongSo,

          sinhVienNam1:
            thongKeNam.nam1,

          sinhVienNam2:
            thongKeNam.nam2,

          sinhVienNam3:
            thongKeNam.nam3,

          sinhVienNam4:
            thongKeNam.nam4,
        },

        sinhVien:
          sinhVienHienThi,
      });
    } catch (error) {
      console.error(
        "Lỗi API danh sách sinh viên:",
        error,
      );

      return res.status(500).json({
        thanhCong: false,

        thongBao:
          "Không thể tải danh sách sinh viên.",
      });
    }
  },
);

/* ============================================================
   GET /api/giang-vien/danh-sach-sinh-vien/bo-loc
   ============================================================ */

router.get(
  "/danh-sach-sinh-vien/bo-loc",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      const ketQua =
        await pool.request().query(`
          SELECT DISTINCT
            SV.KHOA_HOC,
            SV.LOP_HOC,
            SV.NGANH_HOC
          FROM SINH_VIEN SV
          WHERE
            SV.KHOA_HOC IS NOT NULL
            AND SV.KHOA_HOC <> ''
        `);

      const khoa = new Set();

      const lop = new Set();

      const nganh = new Set();

      ketQua.recordset.forEach(function (item) {
        if (item.KHOA_HOC) {
          khoa.add(String(item.KHOA_HOC).trim());
        }

        if (item.LOP_HOC) {
          lop.add(String(item.LOP_HOC).trim());
        }

        if (item.NGANH_HOC) {
          nganh.add(String(item.NGANH_HOC).trim());
        }
      });

      return res.json({
        thanhCong: true,

        khoa: Array.from(khoa).sort(),

        lop: Array.from(lop).sort(),

        nganh: Array.from(nganh).sort(),
      });
    } catch (error) {
      console.error(
        "Lỗi API bộ lọc danh sách sinh viên:",
        error,
      );

      return res.status(500).json({
        thanhCong: false,

        thongBao:
          "Không thể tải dữ liệu bộ lọc.",
      });
    }
  },
);

/* ============================================================
   GET /api/giang-vien/danh-sach-sinh-vien/thong-ke
   ============================================================ */

router.get(
  "/danh-sach-sinh-vien/thong-ke",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      const pool = layPool();

      const ketQua =
        await pool.request().query(`
          SELECT
            SV.ID_SINH_VIEN,

            COALESCE(
              GPA_LICH_SU_HIEN_TAI.HOC_KY_CUOI,
              KQ.HOC_KY_GAN_NHAT,
              DDHKTT.HOC_KY_DU_DOAN_TIEP_THEO - 1,
              DDHKG.HOC_KY_GLOBAL
            ) AS HOC_KY

          FROM SINH_VIEN SV

          OUTER APPLY (
            SELECT TOP 1
              DD.GPA_LICH_SU
            FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DD
            WHERE
              DD.ID_SINH_VIEN =
              SV.ID_SINH_VIEN
            ORDER BY
              DD.NGAY_DU_DOAN DESC,
              DD.ID_DU_DOAN DESC
          ) DU_DOAN_GPA_HIEN_TAI

          OUTER APPLY (
            SELECT TOP 1
              TRY_CONVERT(
                INT,
                [key]
              ) + 1 AS HOC_KY_CUOI

            FROM OPENJSON(
              DU_DOAN_GPA_HIEN_TAI.GPA_LICH_SU
            )

            ORDER BY
              TRY_CONVERT(
                INT,
                [key]
              ) DESC
          ) GPA_LICH_SU_HIEN_TAI

          OUTER APPLY (
            SELECT TOP 1
              KQ1.HOC_KY_GLOBAL
                AS HOC_KY_GAN_NHAT

            FROM (
              SELECT
                ROW_NUMBER() OVER (
                  ORDER BY
                    ISNULL(
                      TRY_CONVERT(
                        INT,
                        LEFT(KQ2.NAM_HOC, 4)
                      ),
                      0
                    ) ASC,

                    KQ2.HOC_KY ASC,

                    KQ2.ID_KET_QUA ASC
                ) AS HOC_KY_GLOBAL

              FROM KET_QUA_HOC_KY KQ2

              WHERE
                KQ2.ID_SINH_VIEN =
                SV.ID_SINH_VIEN

                AND

                KQ2.GPA IS NOT NULL
            ) KQ1

            ORDER BY
              KQ1.HOC_KY_GLOBAL DESC
          ) KQ

          OUTER APPLY (
            SELECT TOP 1
              DD1.HOC_KY
                AS HOC_KY_DU_DOAN

            FROM DU_DOAN_HOC_KY DD1

            WHERE
              DD1.ID_SINH_VIEN =
              SV.ID_SINH_VIEN

            ORDER BY
              DD1.HOC_KY DESC,
              DD1.NGAY_DU_DOAN DESC,
              DD1.ID_DU_DOAN DESC
          ) DDHK

          OUTER APPLY (
            SELECT TOP 1
              DD2.HOC_KY_DU_DOAN
                AS HOC_KY_DU_DOAN_TIEP_THEO

            FROM DU_DOAN_GPA_HOC_KY_TIEP_THEO DD2

            WHERE
              DD2.ID_SINH_VIEN =
              SV.ID_SINH_VIEN

            ORDER BY
              DD2.NGAY_DU_DOAN DESC,
              DD2.ID_DU_DOAN DESC
          ) DDHKTT

          OUTER APPLY (
            SELECT TOP 1
              HK.HOC_KY_GLOBAL

            FROM DU_DOAN_HOC_KY DD3

            INNER JOIN (
              SELECT
                KQ3.ID_SINH_VIEN,
                KQ3.NAM_HOC,
                KQ3.HOC_KY,

                ROW_NUMBER() OVER (
                  PARTITION BY
                    KQ3.ID_SINH_VIEN

                  ORDER BY
                    ISNULL(
                      TRY_CONVERT(
                        INT,
                        LEFT(KQ3.NAM_HOC, 4)
                      ),
                      0
                    ) ASC,

                    KQ3.HOC_KY ASC,

                    KQ3.ID_KET_QUA ASC
                ) AS HOC_KY_GLOBAL
              FROM KET_QUA_HOC_KY KQ3
            ) HK
              ON
                HK.ID_SINH_VIEN =
                  DD3.ID_SINH_VIEN

                AND
                HK.NAM_HOC =
                  DD3.NAM_HOC

                AND
                HK.HOC_KY =
                  DD3.HOC_KY

            WHERE
              DD3.ID_SINH_VIEN =
                SV.ID_SINH_VIEN

            ORDER BY
              HK.HOC_KY_GLOBAL DESC
          ) DDHKG

          WHERE
            DDHK.HOC_KY_DU_DOAN IS NOT NULL

            OR

            DDHKTT.HOC_KY_DU_DOAN_TIEP_THEO IS NOT NULL
        `);

      const thongKe = {
        tongSinhVien: 0,

        sinhVienNam1: 0,

        sinhVienNam2: 0,

        sinhVienNam3: 0,

        sinhVienNam4: 0,
      };

      ketQua.recordset.forEach(
        function (sv) {
          const nam =
            xacDinhNamHoc(
              sv.HOC_KY,
            );

          if (!nam) {
            return;
          }

          thongKe.tongSinhVien++;

          if (nam === 1) {
            thongKe.sinhVienNam1++;
          } else if (
            nam === 2
          ) {
            thongKe.sinhVienNam2++;
          } else if (
            nam === 3
          ) {
            thongKe.sinhVienNam3++;
          } else if (
            nam === 4
          ) {
            thongKe.sinhVienNam4++;
          }
        },
      );

      return res.json({
        thanhCong: true,

        thongKe,
      });
    } catch (error) {
      console.error(
        "Lỗi thống kê danh sách sinh viên:",
        error,
      );

      return res.status(500).json({
        thanhCong: false,

        thongBao:
          "Không thể tải thống kê sinh viên.",
      });
    }
  },
);

/* ============================================================
   GET /api/giang-vien/sinh-vien/:id
   CHI TIẾT SINH VIÊN

   QUAN TRỌNG:
   - GPA các học kỳ ưu tiên GPA_LICH_SU
     của lần dự đoán mới nhất.
   - Nếu chưa từng dự đoán thì fallback
     về KET_QUA_HOC_KY.
============================================================ */

router.get(
  "/sinh-vien/:id",
  xacThuc,
  phanQuyen("GIANG_VIEN"),
  async function (req, res) {
    try {
      /* ======================================================
         1. KIỂM TRA ID
      ====================================================== */

      const idSinhVien =
        Number(req.params.id);

      if (
        !Number.isInteger(
          idSinhVien,
        ) ||
        idSinhVien <= 0
      ) {
        return res.status(400).json({
          thanhCong: false,

          thongBao:
            "ID sinh viên không hợp lệ.",
        });
      }

      const pool = layPool();

      /* ======================================================
         2. THÔNG TIN SINH VIÊN
      ====================================================== */

      const ketQuaSinhVien =
        await pool
          .request()
          .input(
            "ID_SINH_VIEN",
            sql.Int,
            idSinhVien,
          )
          .query(`
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

      if (
        ketQuaSinhVien.recordset.length ===
        0
      ) {
        return res.status(404).json({
          thanhCong: false,

          thongBao:
            "Không tìm thấy sinh viên.",
        });
      }

      const sv =
        ketQuaSinhVien.recordset[0];

      /* ======================================================
         3. GPA THỰC TẾ
         FALLBACK
      ====================================================== */

      const ketQuaGPA =
        await pool
          .request()
          .input(
            "ID_SINH_VIEN",
            sql.Int,
            idSinhVien,
          )
          .query(`
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

              AND

              GPA IS NOT NULL

            ORDER BY
              NAM_HOC ASC,
              HOC_KY ASC,
              ID_KET_QUA ASC
          `);

      const gpaHocKyThucTe =
        ketQuaGPA.recordset.map(
          function (item, index) {
            return {
              idKetQua:
                item.ID_KET_QUA,

              hocKy:
                index + 1,

              namHoc:
                item.NAM_HOC,

              gpa:
                Number(
                  Number(
                    item.GPA,
                  ).toFixed(2),
                ),

              tongTinChi:
                item.TONG_TIN_CHI ===
                null
                  ? null
                  : Number(
                      item.TONG_TIN_CHI,
                    ),
            };
          },
        );

      /* ======================================================
         4. DỰ ĐOÁN GPA HỌC KỲ TIẾP THEO MỚI NHẤT
      ====================================================== */

      const ketQuaDuDoanTiepTheo =
        await pool
          .request()
          .input(
            "ID_SINH_VIEN",
            sql.Int,
            idSinhVien,
          )
          .query(`
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

      let duDoanHocKyTiepTheo =
        null;

      let gpaLichSuMoiNhat = [];

      /* ======================================================
         4A. ĐỌC GPA_LICH_SU
      ====================================================== */

      if (
        ketQuaDuDoanTiepTheo.recordset
          .length > 0
      ) {
        const item =
          ketQuaDuDoanTiepTheo
            .recordset[0];

        gpaLichSuMoiNhat =
          docGPALichSu(
            item.GPA_LICH_SU,
          );

        /* ==================================================
           NHẬN ĐỊNH
        ================================================== */

        let nhanDinh = [];

        if (item.NHAN_DINH) {
          try {
            const parsed =
              JSON.parse(
                item.NHAN_DINH,
              );

            nhanDinh =
              Array.isArray(parsed)
                ? parsed
                : [];
          } catch {
            nhanDinh = [
              String(
                item.NHAN_DINH,
              ),
            ];
          }
        }

        /* ==================================================
           LỜI KHUYÊN
        ================================================== */

        let loiKhuyen = [];

        if (item.LOI_KHUYEN) {
          try {
            const parsed =
              JSON.parse(
                item.LOI_KHUYEN,
              );

            loiKhuyen =
              Array.isArray(parsed)
                ? parsed
                : [];
          } catch {
            loiKhuyen = [
              String(
                item.LOI_KHUYEN,
              ),
            ];
          }
        }

        /* ==================================================
           DỰ ĐOÁN
        ================================================== */

        duDoanHocKyTiepTheo =
          {
            idDuDoan:
              item.ID_DU_DOAN,

            hocKy:
              Number(
                item.HOC_KY_DU_DOAN,
              ),

            namHoc:
              item.NAM_HOC_DU_DOAN,

            gpaKyGanNhat:
              item.GPA_KY_GAN_NHAT ===
                null
                ? null
                : Number(
                    Number(
                      item.GPA_KY_GAN_NHAT,
                    ).toFixed(2),
                  ),

            gpaTrungBinhLichSu:
              item.GPA_TRUNG_BINH_LICH_SU ===
                null
                ? null
                : Number(
                    Number(
                      item.GPA_TRUNG_BINH_LICH_SU,
                    ).toFixed(2),
                  ),

            xuHuongGPA:
              item.XU_HUONG_GPA ===
                null
                ? null
                : Number(
                    Number(
                      item.XU_HUONG_GPA,
                    ).toFixed(3),
                  ),

            soHocKyDaHoc:
              item.SO_HOC_KY_DA_HOC ===
                null
                ? null
                : Number(
                    item.SO_HOC_KY_DA_HOC,
                  ),

            tinChiDangKy:
              item.TIN_CHI_DANG_KY ===
                null
                ? null
                : Number(
                    item.TIN_CHI_DANG_KY,
                  ),

            gioTuHocTuan:
              item.GIO_TU_HOC_TUAN ===
                null
                ? null
                : Number(
                    Number(
                      item.GIO_TU_HOC_TUAN,
                    ).toFixed(2),
                  ),

            tyLeChuyenCan:
              item.TY_LE_CHUYEN_CAN ===
                null
                ? null
                : Number(
                    Number(
                      item.TY_LE_CHUYEN_CAN,
                    ).toFixed(2),
                  ),

            gioLamThemTuan:
              item.GIO_LAM_THEM_TUAN ===
                null
                ? null
                : Number(
                    Number(
                      item.GIO_LAM_THEM_TUAN,
                    ).toFixed(2),
                  ),

            gpa:
              item.GPA_DU_DOAN ===
                null
                ? null
                : Number(
                    Number(
                      item.GPA_DU_DOAN,
                    ).toFixed(2),
                  ),

            diemHe10:
              item.DIEM_HE_10_DU_DOAN ===
                null
                ? null
                : Number(
                    Number(
                      item.DIEM_HE_10_DU_DOAN,
                    ).toFixed(2),
                  ),

            xepLoai:
              item.XEP_LOAI ||
              null,

            nhanDinh,

            loiKhuyen,

            gpaLichSu:
              gpaLichSuMoiNhat,

            ngayDuDoan:
              item.NGAY_DU_DOAN,
          };
      }

      /* ======================================================
         5. QUAN TRỌNG NHẤT:
            TẠO GPA CÁC HỌC KỲ CHO MODAL
      ====================================================== */

      let gpaHocKy = [];

      /*
       * Nếu sinh viên đã có lần dự đoán
       * GPA học kỳ tiếp theo mới nhất
       * thì GPA_LICH_SU chính là dữ liệu
       * mà sinh viên vừa nhập.
       */

      if (
        gpaLichSuMoiNhat.length > 0
      ) {
        gpaHocKy =
          gpaLichSuMoiNhat.map(
            function (
              gpa,
              index,
            ) {
              return {
                idKetQua:
                  null,

                hocKy:
                  index + 1,

                namHoc:
                  null,

                gpa:
                  Number(
                    Number(
                      gpa,
                    ).toFixed(2),
                  ),

                tongTinChi:
                  null,
              };
            },
          );
      } else {
        /*
         * Nếu chưa từng dự đoán
         * thì dùng dữ liệu GPA thực tế.
         */

        gpaHocKy =
          gpaHocKyThucTe;
      }

      /* ======================================================
         6. GPA HIỆN TẠI
         ƯU TIÊN GPA CUỐI TRONG GPA_LICH_SU
      ====================================================== */

      let gpaHienTai = null;

      let hocKyGanNhat = null;

      if (
        gpaHocKy.length > 0
      ) {
        const cuoi =
          gpaHocKy[
            gpaHocKy.length - 1
          ];

        gpaHienTai =
          cuoi.gpa;

        hocKyGanNhat =
          cuoi.hocKy;
      }

      /* ======================================================
         7. DỰ ĐOÁN GPA HỌC KỲ
      ====================================================== */

      const ketQuaDuDoanHocKy =
        await pool
          .request()
          .input(
            "ID_SINH_VIEN",
            sql.Int,
            idSinhVien,
          )
          .query(`
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
              ID_SINH_VIEN =
              @ID_SINH_VIEN

            ORDER BY
              NGAY_DU_DOAN DESC,
              ID_DU_DOAN DESC
          `);

      let duDoanHocKy =
        null;

      if (
        ketQuaDuDoanHocKy.recordset
          .length > 0
      ) {
        const item =
          ketQuaDuDoanHocKy
            .recordset[0];

        duDoanHocKy = {
          idDuDoan:
            item.ID_DU_DOAN,

          hocKy:
            Number(
              item.HOC_KY,
            ),

          namHoc:
            item.NAM_HOC,

          gpa:
            Number(
              Number(
                item.GPA_DU_DOAN,
              ).toFixed(2),
            ),

          diemHe10:
            item.DIEM_HE_10_DU_DOAN ===
              null
              ? null
              : Number(
                  Number(
                    item.DIEM_HE_10_DU_DOAN,
                  ).toFixed(2),
                ),

          tongTinChi:
            item.TONG_TIN_CHI ===
              null
              ? null
              : Number(
                  item.TONG_TIN_CHI,
                ),

          xepLoai:
            item.XEP_LOAI ||
            null,

          ngayDuDoan:
            item.NGAY_DU_DOAN,
        };
      }

      /* ======================================================
         8. NĂM HỌC
      ====================================================== */

      const namHoc =
        xacDinhNamHoc(
          hocKyGanNhat,
        );

      /* ======================================================
         9. TRẠNG THÁI
      ====================================================== */

      const trangThai =
        xepLoaiGPA(
          gpaHienTai,
        );

      /* ======================================================
         10. NGUY CƠ
      ====================================================== */

      let nguyCo =
        "Bình thường";

      let classNguyCo =
        "binh-thuong";

      if (
        gpaHienTai !== null
      ) {
        if (
          gpaHienTai < 2
        ) {
          nguyCo =
            "Nguy cơ cao";

          classNguyCo =
            "nguy-co-cao";
        } else if (
          gpaHienTai < 2.5
        ) {
          nguyCo =
            "Cần chú ý";

          classNguyCo =
            "can-chu-y";
        }
      }

      /* ======================================================
         11. RESPONSE
      ====================================================== */

      return res.json({
        thanhCong: true,

        sinhVien: {
          idSinhVien:
            sv.ID_SINH_VIEN,

          maSinhVien:
            sv.MA_SINH_VIEN,

          hoTen:
            sv.HO_TEN,

          ngaySinh:
            sv.NGAY_SINH,

          gioiTinh:
            sv.GIOI_TINH,

          lopHoc:
            sv.LOP_HOC,

          khoaHoc:
            sv.KHOA_HOC,

          nganhHoc:
            sv.NGANH_HOC,

          namHoc,

          hocKyGanNhat,

          gpaHienTai,

          xepLoai:
            trangThai,

          trangThai,

          nguyCo,

          classNguyCo,

          /*
           * ĐÂY LÀ DANH SÁCH GPA
           * MODAL HOME.JS SẼ DÙNG.
           *
           * Nó giờ ưu tiên:
           * GPA_LICH_SU mới nhất.
           */
          gpaHocKy,

          /*
           * Giữ lại tương thích
           * với code cũ.
           */
          gpaLichSuMoiNhat,

          duDoanHocKy,

          duDoanHocKyTiepTheo,
        },
      });
    } catch (error) {
      console.error(
        "Lỗi API chi tiết sinh viên:",
        error,
      );

      return res.status(500).json({
        thanhCong: false,

        thongBao:
          "Không thể tải chi tiết sinh viên.",
      });
    }
  },
);

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;