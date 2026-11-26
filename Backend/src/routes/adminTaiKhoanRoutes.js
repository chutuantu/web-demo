const express = require("express");
const bcrypt = require("bcrypt");
const ExcelJS = require("exceljs");
const multer = require("multer");

const { sql, layPool } = require("../config/database");
const xacThuc = require("../middleware/xacThuc");
const phanQuyen = require("../middleware/phanQuyen");

const router = express.Router();
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const tenFileHopLe = /\.xlsx$/i.test(file.originalname || "");
    if (!tenFileHopLe) {
      return callback(new Error("Chỉ hỗ trợ tệp Excel định dạng .xlsx."));
    }
    callback(null, true);
  },
});

// Tất cả API trong router này chỉ dành cho tài khoản có vai trò ADMIN.
router.use(xacThuc, phanQuyen("ADMIN"));
router.use(express.json({ limit: "1mb" }));

const LOAI = {
  SINH_VIEN: "SINH_VIEN",
  GIANG_VIEN: "GIANG_VIEN",
};

function layLoai(raw) {
  const loai = String(raw || "").trim().toUpperCase();
  if (!Object.values(LOAI).includes(loai)) {
    const error = new Error("Loại tài khoản không hợp lệ. Chọn SINH_VIEN hoặc GIANG_VIEN.");
    error.statusCode = 400;
    throw error;
  }
  return loai;
}

function loi(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function chuanHoaChuoi(value) {
  if (value === undefined || value === null) return null;
  const result = String(value).trim();
  return result.length ? result : null;
}

function chuanHoaTrangThai(value, macDinh = true) {
  if (value === undefined || value === null || value === "") return macDinh;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const text = String(value).trim().toLocaleLowerCase("vi-VN");
  return !["0", "false", "khóa", "khoa", "đã khóa", "da khoa", "inactive", "off", "không hoạt động"].includes(text);
}

function kiemTraDuLieu(loai, body, capNhat = false) {
  const duLieu = {
    trangThai: chuanHoaTrangThai(body.trangThai, true),
    matKhau: chuanHoaChuoi(body.matKhau),
  };

  if (loai === LOAI.SINH_VIEN) {
    duLieu.ma = chuanHoaChuoi(body.maSinhVien);
    duLieu.hoTen = chuanHoaChuoi(body.hoTen);
    duLieu.gioiTinh = chuanHoaChuoi(body.gioiTinh);
    duLieu.khoa = chuanHoaChuoi(body.khoa);
    duLieu.nganh = chuanHoaChuoi(body.nganh);
    duLieu.lop = chuanHoaChuoi(body.lop);
    duLieu.nienKhoa = chuanHoaChuoi(body.nienKhoa);

    if (!duLieu.ma || !duLieu.hoTen || !duLieu.khoa || !duLieu.nganh || !duLieu.lop || !duLieu.nienKhoa) {
      throw loi(400, "Vui lòng nhập đầy đủ mã sinh viên, họ tên, khoa, ngành, lớp và niên khóa.");
    }
    if (!capNhat && !duLieu.matKhau) throw loi(400, "Vui lòng nhập mật khẩu cho sinh viên.");
    if (duLieu.ma.length > 30) throw loi(400, "Mã sinh viên không được vượt quá 30 ký tự.");
    if (duLieu.hoTen.length > 100) throw loi(400, "Họ tên không được vượt quá 100 ký tự.");
    if (duLieu.gioiTinh && duLieu.gioiTinh.length > 10) throw loi(400, "Giới tính không hợp lệ.");
  } else {
    duLieu.ma = chuanHoaChuoi(body.maGiangVien);
    duLieu.hoTen = chuanHoaChuoi(body.hoTen);
    duLieu.khoa = chuanHoaChuoi(body.khoa);
    duLieu.nganh = chuanHoaChuoi(body.nganh);
    duLieu.email = chuanHoaChuoi(body.email);

    if (!duLieu.ma || !duLieu.hoTen || !duLieu.khoa || !duLieu.nganh || !duLieu.email) {
      throw loi(400, "Vui lòng nhập đầy đủ mã giảng viên, họ tên, khoa, ngành và email.");
    }
    if (!capNhat && !duLieu.matKhau) throw loi(400, "Vui lòng nhập mật khẩu cho giảng viên.");
    if (duLieu.ma.length > 30) throw loi(400, "Mã giảng viên không được vượt quá 30 ký tự.");
    if (duLieu.hoTen.length > 100) throw loi(400, "Họ tên không được vượt quá 100 ký tự.");
    if (duLieu.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(duLieu.email)) {
      throw loi(400, "Địa chỉ email không hợp lệ.");
    }
  }

  if (duLieu.matKhau && duLieu.matKhau.length < 8) {
    throw loi(400, "Mật khẩu phải có ít nhất 8 ký tự.");
  }
  return duLieu;
}

function xuLyLoiSql(error) {
  if (error && (error.number === 2627 || error.number === 2601)) {
    return loi(409, "Mã đăng nhập hoặc mã hồ sơ đã tồn tại trong hệ thống.");
  }
  return error;
}

async function taoTaiKhoanTrongDb(pool, loai, body) {
  const duLieu = kiemTraDuLieu(loai, body, false);
  const matKhauMaHoa = await bcrypt.hash(duLieu.matKhau, 12);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const taoTaiKhoan = await new sql.Request(transaction)
      .input("maDangNhap", sql.VarChar(30), duLieu.ma)
      .input("matKhau", sql.VarChar(255), matKhauMaHoa)
      .input("vaiTro", sql.VarChar(20), loai)
      .input("trangThai", sql.Bit, duLieu.trangThai)
      .query(`
        INSERT INTO TAI_KHOAN (MA_DANG_NHAP, MAT_KHAU, VAI_TRO, TRANG_THAI)
        OUTPUT INSERTED.ID_TAI_KHOAN
        VALUES (@maDangNhap, @matKhau, @vaiTro, @trangThai);
      `);

    const idTaiKhoan = taoTaiKhoan.recordset[0].ID_TAI_KHOAN;
    const requestHoSo = new sql.Request(transaction)
      .input("idTaiKhoan", sql.Int, idTaiKhoan)
      .input("ma", sql.VarChar(30), duLieu.ma)
      .input("hoTen", sql.NVarChar(100), duLieu.hoTen);

    if (loai === LOAI.SINH_VIEN) {
      requestHoSo
        .input("gioiTinh", sql.NVarChar(10), duLieu.gioiTinh)
        .input("khoa", sql.NVarChar(100), duLieu.khoa)
        .input("nganh", sql.NVarChar(100), duLieu.nganh)
        .input("lop", sql.VarChar(50), duLieu.lop)
        .input("nienKhoa", sql.VarChar(20), duLieu.nienKhoa);

      await requestHoSo.query(`
        INSERT INTO SINH_VIEN
          (ID_TAI_KHOAN, MA_SINH_VIEN, HO_TEN, GIOI_TINH, KHOA, NGANH_HOC, LOP_HOC, KHOA_HOC, NIEN_KHOA)
        VALUES
          (@idTaiKhoan, @ma, @hoTen, @gioiTinh, @khoa, @nganh, @lop, @nienKhoa, @nienKhoa);
      `);
    } else {
      requestHoSo
        .input("khoa", sql.NVarChar(100), duLieu.khoa)
        .input("nganh", sql.NVarChar(100), duLieu.nganh)
        .input("email", sql.VarChar(100), duLieu.email);

      await requestHoSo.query(`
        INSERT INTO GIANG_VIEN
          (ID_TAI_KHOAN, MA_GIANG_VIEN, HO_TEN, EMAIL, BO_MON, KHOA, NGANH)
        VALUES
          (@idTaiKhoan, @ma, @hoTen, @email, @nganh, @khoa, @nganh);
      `);
    }

    await transaction.commit();
    return idTaiKhoan;
  } catch (error) {
    try { await transaction.rollback(); } catch (_) { /* transaction có thể đã rollback */ }
    throw xuLyLoiSql(error);
  }
}

// GET /api/admin/tai-khoan?loai=SINH_VIEN&page=1&limit=10&tuKhoa=
router.get("/", async (req, res) => {
  try {
    const loai = layLoai(req.query.loai);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(5, Number.parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const tuKhoa = String(req.query.tuKhoa || "").trim();
    const pool = layPool();

    const requestDem = pool.request()
      .input("tuKhoa", sql.NVarChar(200), `%${tuKhoa}%`);
    const requestDanhSach = pool.request()
      .input("tuKhoa", sql.NVarChar(200), `%${tuKhoa}%`)
      .input("offset", sql.Int, offset)
      .input("limit", sql.Int, limit);

    let sqlDem;
    let sqlDanhSach;
    if (loai === LOAI.SINH_VIEN) {
      sqlDem = `
        SELECT COUNT(1) AS tongSo
        FROM TAI_KHOAN TK
        INNER JOIN SINH_VIEN SV ON SV.ID_TAI_KHOAN = TK.ID_TAI_KHOAN
        WHERE TK.VAI_TRO = 'SINH_VIEN' AND ISNULL(TK.DA_XOA, 0) = 0
          AND (@tuKhoa = N'%%' OR SV.MA_SINH_VIEN LIKE @tuKhoa OR SV.HO_TEN LIKE @tuKhoa
               OR SV.LOP_HOC LIKE @tuKhoa OR SV.NGANH_HOC LIKE @tuKhoa);
      `;
      sqlDanhSach = `
        SELECT TK.ID_TAI_KHOAN AS id, SV.MA_SINH_VIEN AS ma, SV.HO_TEN AS hoTen,
               SV.LOP_HOC AS lop, SV.NGANH_HOC AS nganh,
               COALESCE(SV.NIEN_KHOA, SV.KHOA_HOC) AS nienKhoa,
               TK.TRANG_THAI AS trangThai, TK.NGAY_TAO AS ngayTao
        FROM TAI_KHOAN TK
        INNER JOIN SINH_VIEN SV ON SV.ID_TAI_KHOAN = TK.ID_TAI_KHOAN
        WHERE TK.VAI_TRO = 'SINH_VIEN' AND ISNULL(TK.DA_XOA, 0) = 0
          AND (@tuKhoa = N'%%' OR SV.MA_SINH_VIEN LIKE @tuKhoa OR SV.HO_TEN LIKE @tuKhoa
               OR SV.LOP_HOC LIKE @tuKhoa OR SV.NGANH_HOC LIKE @tuKhoa)
        ORDER BY TK.NGAY_TAO DESC, TK.ID_TAI_KHOAN DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
      `;
    } else {
      sqlDem = `
        SELECT COUNT(1) AS tongSo
        FROM TAI_KHOAN TK
        INNER JOIN GIANG_VIEN GV ON GV.ID_TAI_KHOAN = TK.ID_TAI_KHOAN
        WHERE TK.VAI_TRO = 'GIANG_VIEN' AND ISNULL(TK.DA_XOA, 0) = 0
          AND (@tuKhoa = N'%%' OR GV.MA_GIANG_VIEN LIKE @tuKhoa OR GV.HO_TEN LIKE @tuKhoa
               OR GV.KHOA LIKE @tuKhoa OR GV.NGANH LIKE @tuKhoa OR GV.EMAIL LIKE @tuKhoa);
      `;
      sqlDanhSach = `
        SELECT TK.ID_TAI_KHOAN AS id, GV.MA_GIANG_VIEN AS ma, GV.HO_TEN AS hoTen,
               GV.KHOA AS khoa, GV.NGANH AS nganh,
               TK.TRANG_THAI AS trangThai, TK.NGAY_TAO AS ngayTao
        FROM TAI_KHOAN TK
        INNER JOIN GIANG_VIEN GV ON GV.ID_TAI_KHOAN = TK.ID_TAI_KHOAN
        WHERE TK.VAI_TRO = 'GIANG_VIEN' AND ISNULL(TK.DA_XOA, 0) = 0
          AND (@tuKhoa = N'%%' OR GV.MA_GIANG_VIEN LIKE @tuKhoa OR GV.HO_TEN LIKE @tuKhoa
               OR GV.KHOA LIKE @tuKhoa OR GV.NGANH LIKE @tuKhoa OR GV.EMAIL LIKE @tuKhoa)
        ORDER BY TK.NGAY_TAO DESC, TK.ID_TAI_KHOAN DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
      `;
    }

    const [dem, danhSach] = await Promise.all([
      requestDem.query(sqlDem),
      requestDanhSach.query(sqlDanhSach),
    ]);
    const tongSo = dem.recordset[0]?.tongSo || 0;

    res.json({
      thanhCong: true,
      duLieu: danhSach.recordset,
      phanTrang: { trangHienTai: page, soBanGhi: limit, tongSo, tongTrang: Math.max(1, Math.ceil(tongSo / limit)) },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách tài khoản admin:", error);
    res.status(error.statusCode || 500).json({ thanhCong: false, thongBao: error.message || "Không thể tải danh sách tài khoản." });
  }
});

// POST /api/admin/tai-khoan
router.post("/", async (req, res) => {
  try {
    const loai = layLoai(req.body.loai);
    const id = await taoTaiKhoanTrongDb(layPool(), loai, req.body);
    res.status(201).json({ thanhCong: true, thongBao: "Tạo tài khoản thành công.", id });
  } catch (error) {
    console.error("Lỗi tạo tài khoản:", error);
    res.status(error.statusCode || 500).json({ thanhCong: false, thongBao: error.message || "Không thể tạo tài khoản." });
  }
});

// GET /api/admin/tai-khoan/mau-excel?loai=SINH_VIEN|GIANG_VIEN
router.get("/mau-excel", async (req, res) => {
  try {
    const loai = layLoai(req.query.loai);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "EduPredict";
    const sheet = workbook.addWorksheet(loai === LOAI.SINH_VIEN ? "Tai khoan sinh vien" : "Tai khoan giang vien");
    const headers = loai === LOAI.SINH_VIEN
      ? ["Mã sinh viên", "Họ và tên", "Giới tính", "Khoa", "Ngành", "Lớp", "Niên khóa", "Mật khẩu", "Trạng thái"]
      : ["Mã giảng viên", "Họ và tên", "Khoa", "Ngành", "Email", "Mật khẩu", "Trạng thái"];
    sheet.addRow(headers);
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF087D48" } };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.columns = headers.map((header) => ({ header, width: Math.max(16, header.length + 8) }));
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="mau-tai-khoan-${loai.toLowerCase()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(error.statusCode || 500).json({ thanhCong: false, thongBao: error.message || "Không thể tạo file mẫu." });
  }
});


// GET /api/admin/tai-khoan/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) throw loi(400, "ID tài khoản không hợp lệ.");
    const pool = layPool();
    const ketQua = await pool.request().input("id", sql.Int, id).query(`
      SELECT TK.ID_TAI_KHOAN AS id, TK.MA_DANG_NHAP AS maDangNhap,
             TK.VAI_TRO AS vaiTro, TK.TRANG_THAI AS trangThai, TK.NGAY_TAO AS ngayTao,
             SV.MA_SINH_VIEN AS maSinhVien, SV.HO_TEN AS hoTen, SV.GIOI_TINH AS gioiTinh,
             SV.KHOA AS khoa, SV.NGANH_HOC AS nganh, SV.LOP_HOC AS lop,
             COALESCE(SV.NIEN_KHOA, SV.KHOA_HOC) AS nienKhoa,
             GV.MA_GIANG_VIEN AS maGiangVien, GV.EMAIL AS email,
             GV.KHOA AS khoaGiangVien, GV.NGANH AS nganhGiangVien
      FROM TAI_KHOAN TK
      LEFT JOIN SINH_VIEN SV ON SV.ID_TAI_KHOAN = TK.ID_TAI_KHOAN
      LEFT JOIN GIANG_VIEN GV ON GV.ID_TAI_KHOAN = TK.ID_TAI_KHOAN
      WHERE TK.ID_TAI_KHOAN = @id AND ISNULL(TK.DA_XOA, 0) = 0
        AND TK.VAI_TRO IN ('SINH_VIEN', 'GIANG_VIEN');
    `);
    if (!ketQua.recordset.length) throw loi(404, "Không tìm thấy tài khoản.");

    const row = ketQua.recordset[0];
    const duLieu = row.vaiTro === LOAI.SINH_VIEN
      ? {
          id: row.id, loai: row.vaiTro, maSinhVien: row.maSinhVien, hoTen: row.hoTen,
          gioiTinh: row.gioiTinh, khoa: row.khoa, nganh: row.nganh, lop: row.lop,
          nienKhoa: row.nienKhoa, trangThai: row.trangThai, ngayTao: row.ngayTao,
        }
      : {
          id: row.id, loai: row.vaiTro, maGiangVien: row.maGiangVien, hoTen: row.hoTen,
          khoa: row.khoaGiangVien, nganh: row.nganhGiangVien, email: row.email,
          trangThai: row.trangThai, ngayTao: row.ngayTao,
        };
    res.json({ thanhCong: true, duLieu });
  } catch (error) {
    res.status(error.statusCode || 500).json({ thanhCong: false, thongBao: error.message || "Không thể xem tài khoản." });
  }
});

// PUT /api/admin/tai-khoan/:id — mật khẩu để trống thì giữ nguyên mật khẩu hiện tại.
router.put("/:id", async (req, res) => {
  let transaction;
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) throw loi(400, "ID tài khoản không hợp lệ.");
    const pool = layPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const tim = await new sql.Request(transaction).input("id", sql.Int, id).query(`
      SELECT VAI_TRO FROM TAI_KHOAN WITH (UPDLOCK, ROWLOCK)
      WHERE ID_TAI_KHOAN = @id AND ISNULL(DA_XOA, 0) = 0;
    `);
    if (!tim.recordset.length) throw loi(404, "Không tìm thấy tài khoản cần sửa.");
    const loai = layLoai(tim.recordset[0].VAI_TRO);
    const duLieu = kiemTraDuLieu(loai, req.body, true);
    const matKhauMaHoa = duLieu.matKhau ? await bcrypt.hash(duLieu.matKhau, 12) : null;

    await new sql.Request(transaction)
      .input("id", sql.Int, id)
      .input("ma", sql.VarChar(30), duLieu.ma)
      .input("matKhau", sql.VarChar(255), matKhauMaHoa)
      .input("trangThai", sql.Bit, duLieu.trangThai)
      .query(`
        UPDATE TAI_KHOAN
        SET MA_DANG_NHAP = @ma,
            MAT_KHAU = CASE WHEN @matKhau IS NULL THEN MAT_KHAU ELSE @matKhau END,
            TRANG_THAI = @trangThai
        WHERE ID_TAI_KHOAN = @id;
      `);

    const requestHoSo = new sql.Request(transaction)
      .input("id", sql.Int, id)
      .input("ma", sql.VarChar(30), duLieu.ma)
      .input("hoTen", sql.NVarChar(100), duLieu.hoTen);

    if (loai === LOAI.SINH_VIEN) {
      requestHoSo
        .input("gioiTinh", sql.NVarChar(10), duLieu.gioiTinh)
        .input("khoa", sql.NVarChar(100), duLieu.khoa)
        .input("nganh", sql.NVarChar(100), duLieu.nganh)
        .input("lop", sql.VarChar(50), duLieu.lop)
        .input("nienKhoa", sql.VarChar(20), duLieu.nienKhoa);
      await requestHoSo.query(`
        UPDATE SINH_VIEN
        SET MA_SINH_VIEN = @ma, HO_TEN = @hoTen, GIOI_TINH = @gioiTinh,
            KHOA = @khoa, NGANH_HOC = @nganh, LOP_HOC = @lop,
            KHOA_HOC = @nienKhoa, NIEN_KHOA = @nienKhoa
        WHERE ID_TAI_KHOAN = @id;
      `);
    } else {
      requestHoSo
        .input("khoa", sql.NVarChar(100), duLieu.khoa)
        .input("nganh", sql.NVarChar(100), duLieu.nganh)
        .input("email", sql.VarChar(100), duLieu.email);
      await requestHoSo.query(`
        UPDATE GIANG_VIEN
        SET MA_GIANG_VIEN = @ma, HO_TEN = @hoTen, EMAIL = @email,
            KHOA = @khoa, NGANH = @nganh, BO_MON = @nganh
        WHERE ID_TAI_KHOAN = @id;
      `);
    }

    await transaction.commit();
    res.json({ thanhCong: true, thongBao: "Cập nhật tài khoản thành công." });
  } catch (error) {
    if (transaction) {
      try { await transaction.rollback(); } catch (_) { /* transaction có thể đã rollback */ }
    }
    const err = xuLyLoiSql(error);
    console.error("Lỗi sửa tài khoản:", err);
    res.status(err.statusCode || 500).json({ thanhCong: false, thongBao: err.message || "Không thể cập nhật tài khoản." });
  }
});


// DELETE /api/admin/tai-khoan/hang-loat — xóa mềm nhiều tài khoản cùng lúc.
router.delete("/hang-loat", async (req, res) => {
  try {
    const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : [])
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isInteger(value) && value > 0))];
    if (!ids.length) throw loi(400, "Chưa chọn tài khoản cần xóa.");
    if (ids.length > 100) throw loi(400, "Mỗi lần chỉ được xóa tối đa 100 tài khoản.");

    const request = layPool().request();
    const thamSo = ids.map((id, index) => {
      request.input(`id${index}`, sql.Int, id);
      return `@id${index}`;
    });
    const ketQua = await request.query(`
      UPDATE TAI_KHOAN
      SET DA_XOA = 1, TRANG_THAI = 0
      WHERE ID_TAI_KHOAN IN (${thamSo.join(",")})
        AND ISNULL(DA_XOA, 0) = 0
        AND VAI_TRO IN ('SINH_VIEN', 'GIANG_VIEN');
    `);
    res.json({
      thanhCong: true,
      thongBao: `Đã xóa ${ketQua.rowsAffected[0]} tài khoản. Dữ liệu học tập liên quan vẫn được bảo toàn.`,
      soLuongDaXoa: ketQua.rowsAffected[0],
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ thanhCong: false, thongBao: error.message || "Không thể xóa hàng loạt." });
  }
});


// DELETE /api/admin/tai-khoan/:id — xóa mềm để không làm mất dữ liệu học tập liên quan.
router.delete("/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) throw loi(400, "ID tài khoản không hợp lệ.");
    const ketQua = await layPool().request().input("id", sql.Int, id).query(`
      UPDATE TAI_KHOAN
      SET DA_XOA = 1, TRANG_THAI = 0
      WHERE ID_TAI_KHOAN = @id AND ISNULL(DA_XOA, 0) = 0
        AND VAI_TRO IN ('SINH_VIEN', 'GIANG_VIEN');
    `);
    if (!ketQua.rowsAffected[0]) throw loi(404, "Không tìm thấy tài khoản hoặc tài khoản đã được xóa.");
    res.json({ thanhCong: true, thongBao: "Đã xóa tài khoản. Dữ liệu học tập liên quan vẫn được bảo toàn." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ thanhCong: false, thongBao: error.message || "Không thể xóa tài khoản." });
  }
});

function chuanHoaHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

function docGiaTriTheoCot(row, mapCot, cacTen) {
  for (const ten of cacTen) {
    const index = mapCot.get(chuanHoaHeader(ten));
    if (index) return row.getCell(index).text?.trim() || "";
  }
  return "";
}

// POST /api/admin/tai-khoan/nhap-excel?loai=SINH_VIEN|GIANG_VIEN
router.post("/nhap-excel", (req, res, next) => {
  uploadExcel.single("file")(req, res, (error) => {
    if (error) return res.status(400).json({ thanhCong: false, thongBao: error.message });
    next();
  });
}, async (req, res) => {
  try {
    const loai = layLoai(req.query.loai || req.body.loai);
    if (!req.file) throw loi(400, "Vui lòng chọn tệp Excel .xlsx.");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet || sheet.rowCount < 2) throw loi(400, "File Excel chưa có dòng dữ liệu bên dưới dòng tiêu đề.");

    const mapCot = new Map();
    sheet.getRow(1).eachCell((cell, columnNumber) => {
      mapCot.set(chuanHoaHeader(cell.text), columnNumber);
    });

    const ketQua = [];
    let soDongCoDuLieu = 0;
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const coDuLieu = row.values.some((value) => value !== null && value !== undefined && String(value).trim() !== "");
      if (!coDuLieu) continue;
      soDongCoDuLieu += 1;

      try {
        let body;
        if (loai === LOAI.SINH_VIEN) {
          body = {
            loai,
            maSinhVien: docGiaTriTheoCot(row, mapCot, ["Mã sinh viên", "Mã SV", "Mã đăng nhập"]),
            hoTen: docGiaTriTheoCot(row, mapCot, ["Họ và tên", "Họ tên"]),
            gioiTinh: docGiaTriTheoCot(row, mapCot, ["Giới tính"]),
            khoa: docGiaTriTheoCot(row, mapCot, ["Khoa"]),
            nganh: docGiaTriTheoCot(row, mapCot, ["Ngành", "Ngành học"]),
            lop: docGiaTriTheoCot(row, mapCot, ["Lớp", "Lớp học"]),
            nienKhoa: docGiaTriTheoCot(row, mapCot, ["Niên khóa", "Khóa học"]),
            matKhau: docGiaTriTheoCot(row, mapCot, ["Mật khẩu", "Password"]),
            trangThai: docGiaTriTheoCot(row, mapCot, ["Trạng thái", "Status"]) || true,
          };
        } else {
          body = {
            loai,
            maGiangVien: docGiaTriTheoCot(row, mapCot, ["Mã giảng viên", "Mã GV", "Mã đăng nhập"]),
            hoTen: docGiaTriTheoCot(row, mapCot, ["Họ và tên", "Họ tên"]),
            khoa: docGiaTriTheoCot(row, mapCot, ["Khoa"]),
            nganh: docGiaTriTheoCot(row, mapCot, ["Ngành", "Bộ môn"]),
            email: docGiaTriTheoCot(row, mapCot, ["Email"]),
            matKhau: docGiaTriTheoCot(row, mapCot, ["Mật khẩu", "Password"]),
            trangThai: docGiaTriTheoCot(row, mapCot, ["Trạng thái", "Status"]) || true,
          };
        }
        await taoTaiKhoanTrongDb(layPool(), loai, body);
        ketQua.push({ dong: rowNumber, thanhCong: true, ma: body.maSinhVien || body.maGiangVien, thongBao: "Đã tạo" });
      } catch (error) {
        ketQua.push({ dong: rowNumber, thanhCong: false, ma: "", thongBao: error.message || "Dữ liệu không hợp lệ" });
      }
    }

    const soThanhCong = ketQua.filter((item) => item.thanhCong).length;
    res.json({
      thanhCong: true,
      thongBao: `Đã nhập ${soThanhCong}/${soDongCoDuLieu} tài khoản.`,
      tongDong: soDongCoDuLieu,
      soThanhCong,
      soThatBai: soDongCoDuLieu - soThanhCong,
      chiTiet: ketQua,
    });
  } catch (error) {
    console.error("Lỗi nhập Excel tài khoản:", error);
    res.status(error.statusCode || 500).json({ thanhCong: false, thongBao: error.message || "Không thể đọc file Excel." });
  }
});

module.exports = router;
