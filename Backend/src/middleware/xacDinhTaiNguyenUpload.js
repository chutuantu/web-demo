const { sql, layPool } = require("../config/database");


// ============================================================
// XÁC ĐỊNH TÀI NGUYÊN TRƯỚC KHI MULTER CHẠY
// ============================================================

async function xacDinhTaiNguyenUpload(
  req,
  res,
  next
) {

  try {

    // ========================================================
    // 1. ID TÀI NGUYÊN
    // ========================================================

    const idTaiNguyen =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(idTaiNguyen) ||
      idTaiNguyen <= 0
    ) {

      return res.status(400).json({
        thanhCong: false,
        thongBao:
          "ID tài nguyên không hợp lệ.",
      });
    }


    // ========================================================
    // 2. ID TÀI KHOẢN
    // ========================================================

    const idTaiKhoan =
      req.taiKhoan?.idTaiKhoan;

    if (
      !Number.isInteger(
        Number(idTaiKhoan)
      ) ||
      Number(idTaiKhoan) <= 0
    ) {

      return res.status(401).json({
        thanhCong: false,
        thongBao:
          "Không xác định được tài khoản giảng viên.",
      });
    }


    // ========================================================
    // 3. DATABASE
    // ========================================================

    const pool =
      layPool();


    // ========================================================
    // 4. TÌM GIẢNG VIÊN
    // ========================================================

    const gvResult =
      await pool
        .request()
        .input(
          "ID_TAI_KHOAN",
          sql.Int,
          Number(
            idTaiKhoan
          )
        )
        .query(`
          SELECT
              ID_GIANG_VIEN
          FROM GIANG_VIEN
          WHERE
              ID_TAI_KHOAN =
              @ID_TAI_KHOAN
        `);


    if (
      gvResult.recordset.length === 0
    ) {

      return res.status(404).json({
        thanhCong: false,
        thongBao:
          "Không tìm thấy thông tin giảng viên.",
      });
    }


    const idGiangVien =
      Number(
        gvResult.recordset[0]
          .ID_GIANG_VIEN
      );


    // ========================================================
    // 5. TÌM TÀI NGUYÊN THUỘC GV
    // ========================================================

    const taiNguyenResult =
      await pool
        .request()
        .input(
          "ID_TAI_NGUYEN",
          sql.Int,
          idTaiNguyen
        )
        .input(
          "ID_GIANG_VIEN",
          sql.Int,
          idGiangVien
        )
        .query(`
          SELECT
              ID_TAI_NGUYEN,
              LOAI_TAI_NGUYEN,
              DUONG_DAN_FILE,
              DUOI_FILE,
              KICH_THUOC_FILE

          FROM TAI_NGUYEN_HOC_TAP

          WHERE
              ID_TAI_NGUYEN =
              @ID_TAI_NGUYEN

              AND

              ID_GIANG_VIEN =
              @ID_GIANG_VIEN
        `);


    if (
      taiNguyenResult.recordset.length === 0
    ) {

      return res.status(404).json({
        thanhCong: false,
        thongBao:
          "Không tìm thấy tài nguyên hoặc tài nguyên không thuộc giảng viên đang đăng nhập.",
      });
    }


    const taiNguyen =
      taiNguyenResult.recordset[0];


    const loai =
      String(
        taiNguyen.LOAI_TAI_NGUYEN || ""
      )
        .trim()
        .toUpperCase();


    // ========================================================
    // 6. WEBSITE KHÔNG CÓ FILE
    // ========================================================

    if (
      loai === "WEBSITE"
    ) {

      return res.status(400).json({
        thanhCong: false,
        thongBao:
          "Tài nguyên WEBSITE không có file để thay.",
      });
    }


    // ========================================================
    // 7. LOẠI KHÔNG HỢP LỆ
    // ========================================================

    if (
      loai !== "TAI_LIEU" &&
      loai !== "VIDEO"
    ) {

      return res.status(400).json({
        thanhCong: false,
        thongBao:
          "Loại tài nguyên không hỗ trợ thay file.",
      });
    }


    // ========================================================
    // 8. GẮN THÔNG TIN CHO REQUEST
    // ========================================================

    req.idTaiNguyenUpload =
      idTaiNguyen;

    req.idGiangVienUpload =
      idGiangVien;

    req.loaiTaiNguyen =
      loai;

    req.duongDanFileCu =
      taiNguyen.DUONG_DAN_FILE ||
      null;

    req.duoiFileCu =
      taiNguyen.DUOI_FILE ||
      null;

    req.kichThuocFileCu =
      taiNguyen.KICH_THUOC_FILE === null
        ? null
        : Number(
            taiNguyen.KICH_THUOC_FILE
          );


    // ========================================================
    // 9. CHO PHÉP MULTER CHẠY
    // ========================================================

    next();

  } catch (error) {

    console.error(
      "LỖI XÁC ĐỊNH TÀI NGUYÊN UPLOAD:",
      error
    );

    return res.status(500).json({
      thanhCong: false,
      thongBao:
        "Không thể xác định tài nguyên cần thay file.",
    });
  }
}


module.exports =
  xacDinhTaiNguyenUpload;