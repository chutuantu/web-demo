// Read password from stdin (never from argv, logs or source control).
const bcrypt = require('bcrypt');
const { ketNoiDatabase, sql } = require('../config/database');
(async () => {
  const name = process.argv[2];
  const password = require('fs').readFileSync(0, 'utf8').replace(/\r?\n$/, '');
  if (!/^[A-Za-z0-9_]{3,30}$/.test(name || '') || password.length < 12 || Buffer.byteLength(password)>72) throw Error('Mã hoặc mật khẩu không hợp lệ (12 ký tự đến 72 byte).');
  const hash = await bcrypt.hash(password, 12);
  const p = await ketNoiDatabase();
  try {
    await p.request().input('name',sql.VarChar(30),name).input('hash',sql.VarChar(255),hash).query(`INSERT INTO dbo.TAI_KHOAN(MA_DANG_NHAP,MAT_KHAU,VAI_TRO,TRANG_THAI,NGAY_TAO) VALUES(@name,@hash,'ADMIN',1,GETDATE())`);
    console.log('Đã tạo Admin.');
  } finally { await p.close(); }
})().catch(()=>{console.error('Không tạo được Admin. Kiểm tra migration, mã trùng hoặc mật khẩu.'); process.exitCode=1;});
