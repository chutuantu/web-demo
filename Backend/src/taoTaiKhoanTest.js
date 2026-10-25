

const bcrypt = require("bcrypt");
const { sql, layPool, ketNoiDatabase } = require("./config/database");

// ============================================================
// 1. DANH SÁCH SINH VIÊN CẦN TẠO
// ============================================================

const danhSachSinhVien = [
  {
    maDangNhap: "SV_TEST_01",
    matKhau: "123456",
    maSinhVien: "24D0001CNT",
    hoTen: "Sinh Viên Test 01",
    nganhHoc: "Công nghệ thông tin",
    lopHoc: "CNTT14A",
    khoaHoc: "2024-2028",
  },
  {
    maDangNhap: "SV_TEST_02",
    matKhau: "123456",
    maSinhVien: "25D0002CNT",
    hoTen: "Sinh Viên Test 02",
    nganhHoc: "Công nghệ thông tin",
    lopHoc: "CNTT14A",
    khoaHoc: "2025-2029",
  },
  {
    maDangNhap: "SV_TEST_03",
    matKhau: "123456",
    maSinhVien: "24D0005CNT",
    hoTen: "Sinh Viên Test 03",
    nganhHoc: "Ngôn ngữ trung quốc",
    lopHoc: "NNTQ14C",
    khoaHoc: "2024-2028",
  },
];

// ============================================================
// 2. DANH SÁCH GIẢNG VIÊN CẦN TẠO
// ============================================================

const danhSachGiangVien = [
  {
    maDangNhap: "GV_TEST_01",
    matKhau: "123456",
    maGiangVien: "GV_TEST_01",
    hoTen: "Giảng Viên Test 01",
    email: "gvtest01@example.com",
    boMon: "Công nghệ thông tin",
  },

  {
    maDangNhap: "GV_TEST_02",
    matKhau: "123456",
    maGiangVien: "GV_TEST_02",
    hoTen: "Giảng Viên Test 02",
    email: "gvtest02@example.com",
    boMon: "Công nghệ thông tin",
  },

  {
    maDangNhap: "GV_TEST_03",
    matKhau: "123456",
    maGiangVien: "GV_TEST_03",
    hoTen: "Giảng Viên Test 03",
    email: "gvtest03@example.com",
    boMon: "Công nghệ thông tin",
  },
];

// ============================================================
// 3. TẠO TÀI KHOẢN SINH VIÊN
// ============================================================

async function taoTaiKhoanSinhVien(pool, sinhVien) {
  try {
    // ------------------------------------------------------
    // Kiểm tra tài khoản đã tồn tại chưa
    // ------------------------------------------------------

    const kiemTra = await pool
      .request()
      .input("maDangNhap", sql.VarChar(30), sinhVien.maDangNhap).query(`
                    SELECT ID_TAI_KHOAN
                    FROM TAI_KHOAN
                    WHERE MA_DANG_NHAP = @maDangNhap
                `);

    if (kiemTra.recordset.length > 0) {
      console.log(`⚠️ Sinh viên ${sinhVien.maDangNhap} đã tồn tại → bỏ qua.`);

      return;
    }

    // ------------------------------------------------------
    // Hash mật khẩu
    // ------------------------------------------------------

    const hashMatKhau = await bcrypt.hash(sinhVien.matKhau, 10);

    // ------------------------------------------------------
    // Tạo tài khoản
    // ------------------------------------------------------

    const taiKhoan = await pool
      .request()
      .input("maDangNhap", sql.VarChar(30), sinhVien.maDangNhap)
      .input("matKhau", sql.VarChar(255), hashMatKhau)
      .input("vaiTro", sql.VarChar(20), "SINH_VIEN").query(`
                    INSERT INTO TAI_KHOAN
                    (
                        MA_DANG_NHAP,
                        MAT_KHAU,
                        VAI_TRO
                    )
                    OUTPUT INSERTED.ID_TAI_KHOAN
                    VALUES
                    (
                        @maDangNhap,
                        @matKhau,
                        @vaiTro
                    )
                `);

    const idTaiKhoan = taiKhoan.recordset[0].ID_TAI_KHOAN;

    // ------------------------------------------------------
    // Tạo hồ sơ sinh viên
    // ------------------------------------------------------

    await pool
      .request()
      .input("idTaiKhoan", sql.Int, idTaiKhoan)
      .input("maSinhVien", sql.VarChar(30), sinhVien.maSinhVien)
      .input("hoTen", sql.NVarChar(100), sinhVien.hoTen)
      .input("nganhHoc", sql.NVarChar(100), sinhVien.nganhHoc)
      .input("lopHoc", sql.VarChar(50), sinhVien.lopHoc)
      .input("khoaHoc", sql.VarChar(20), sinhVien.khoaHoc).query(`
                INSERT INTO SINH_VIEN
                (
                    ID_TAI_KHOAN,
                    MA_SINH_VIEN,
                    HO_TEN,
                    NGANH_HOC,
                    LOP_HOC,
                    KHOA_HOC
                )
                VALUES
                (
                    @idTaiKhoan,
                    @maSinhVien,
                    @hoTen,
                    @nganhHoc,
                    @lopHoc,
                    @khoaHoc
                )
            `);

    console.log(`✅ Đã tạo sinh viên: ${sinhVien.maDangNhap}`);
  } catch (error) {
    console.error(
      `❌ Lỗi tạo sinh viên ${sinhVien.maDangNhap}:`,
      error.message,
    );
  }
}

// ============================================================
// 4. TẠO TÀI KHOẢN GIẢNG VIÊN
// ============================================================

async function taoTaiKhoanGiangVien(pool, giangVien) {
  try {
    // ------------------------------------------------------
    // Kiểm tra tài khoản đã tồn tại chưa
    // ------------------------------------------------------

    const kiemTra = await pool
      .request()
      .input("maDangNhap", sql.VarChar(30), giangVien.maDangNhap).query(`
                    SELECT ID_TAI_KHOAN
                    FROM TAI_KHOAN
                    WHERE MA_DANG_NHAP = @maDangNhap
                `);

    if (kiemTra.recordset.length > 0) {
      console.log(`⚠️ Giảng viên ${giangVien.maDangNhap} đã tồn tại → bỏ qua.`);

      return;
    }

    // ------------------------------------------------------
    // Hash mật khẩu
    // ------------------------------------------------------

    const hashMatKhau = await bcrypt.hash(giangVien.matKhau, 10);

    // ------------------------------------------------------
    // Tạo tài khoản
    // ------------------------------------------------------

    const taiKhoan = await pool
      .request()
      .input("maDangNhap", sql.VarChar(30), giangVien.maDangNhap)
      .input("matKhau", sql.VarChar(255), hashMatKhau)
      .input("vaiTro", sql.VarChar(20), "GIANG_VIEN").query(`
                    INSERT INTO TAI_KHOAN
                    (
                        MA_DANG_NHAP,
                        MAT_KHAU,
                        VAI_TRO
                    )
                    OUTPUT INSERTED.ID_TAI_KHOAN
                    VALUES
                    (
                        @maDangNhap,
                        @matKhau,
                        @vaiTro
                    )
                `);

    const idTaiKhoan = taiKhoan.recordset[0].ID_TAI_KHOAN;

    // ------------------------------------------------------
    // Tạo hồ sơ giảng viên
    // ------------------------------------------------------

    await pool
      .request()
      .input("idTaiKhoan", sql.Int, idTaiKhoan)
      .input("maGiangVien", sql.VarChar(30), giangVien.maGiangVien)
      .input("hoTen", sql.NVarChar(100), giangVien.hoTen)
      .input("email", sql.VarChar(100), giangVien.email)
      .input("boMon", sql.NVarChar(100), giangVien.boMon).query(`
                INSERT INTO GIANG_VIEN
                (
                    ID_TAI_KHOAN,
                    MA_GIANG_VIEN,
                    HO_TEN,
                    EMAIL,
                    BO_MON
                )
                VALUES
                (
                    @idTaiKhoan,
                    @maGiangVien,
                    @hoTen,
                    @email,
                    @boMon
                )
            `);

    console.log(`✅ Đã tạo giảng viên: ${giangVien.maDangNhap}`);
  } catch (error) {
    console.error(
      `❌ Lỗi tạo giảng viên ${giangVien.maDangNhap}:`,
      error.message,
    );
  }
}

// ============================================================
// 5. CHẠY
// ============================================================

async function chay() {
  try {
    await ketNoiDatabase();

    const pool = layPool();

    // ------------------------------------------------------
    // Tạo toàn bộ sinh viên
    // ------------------------------------------------------

    console.log("");
    console.log("========== SINH VIÊN ==========");

    for (const sinhVien of danhSachSinhVien) {
      await taoTaiKhoanSinhVien(pool, sinhVien);
    }

    // ------------------------------------------------------
    // Tạo toàn bộ giảng viên
    // ------------------------------------------------------

    console.log("");
    console.log("========== GIẢNG VIÊN ==========");

    for (const giangVien of danhSachGiangVien) {
      await taoTaiKhoanGiangVien(pool, giangVien);
    }

    console.log("");
    console.log("======================================");

    console.log("✅ HOÀN TẤT TẠO TÀI KHOẢN");

    console.log("======================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Không thể tạo tài khoản:", error);

    process.exit(1);
  }
}

chay();
