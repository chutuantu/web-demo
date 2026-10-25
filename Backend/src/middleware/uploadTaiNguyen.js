const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================================================
// THƯ MỤC UPLOAD
// ============================================================

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const UPLOAD_TAI_LIEU = path.join(UPLOAD_ROOT, "tai-lieu");

const UPLOAD_VIDEO = path.join(UPLOAD_ROOT, "video");

// ============================================================
// TỰ TẠO THƯ MỤC
// ============================================================

[UPLOAD_ROOT, UPLOAD_TAI_LIEU, UPLOAD_VIDEO].forEach(function (thuMuc) {
  if (!fs.existsSync(thuMuc)) {
    fs.mkdirSync(thuMuc, {
      recursive: true,
    });
  }
});

// ============================================================
// ĐUÔI FILE TÀI LIỆU
// ============================================================

const DUOI_TAI_LIEU = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
]);

// ============================================================
// VIDEO
// CHỈ CHO PHÉP MP4
// ============================================================

const DUOI_VIDEO = new Set([".mp4"]);

// ============================================================
// MIME TÀI LIỆU
// ============================================================

const MIME_TAI_LIEU = new Set([
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "application/zip",

  "application/x-rar-compressed",

  "application/vnd.rar",
]);

// ============================================================
// MIME VIDEO
// CHỈ MP4
// ============================================================

const MIME_VIDEO = new Set(["video/mp4"]);

// ============================================================
// XÁC ĐỊNH LOẠI FILE
//
// Không đọc req.body
// Không đọc req.body.loaiTaiNguyen
//
// Chỉ dựa vào:
// - Đuôi file
// - MIME type
// ============================================================

function xacDinhLoaiFile(file) {
  const tenFile = String(file?.originalname || "");

  const ext = path.extname(tenFile).toLowerCase();

  const mime = String(file?.mimetype || "")
    .trim()
    .toLowerCase();

  // ----------------------------------------------------------
  // VIDEO MP4
  // ----------------------------------------------------------

  if (ext === ".mp4" && mime === "video/mp4") {
    return "VIDEO";
  }

  // ----------------------------------------------------------
  // TÀI LIỆU
  // ----------------------------------------------------------

  if (DUOI_TAI_LIEU.has(ext) && MIME_TAI_LIEU.has(mime)) {
    return "TAI_LIEU";
  }

  return null;
}

// ============================================================
// STORAGE
// ============================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const loaiFile = xacDinhLoaiFile(file);

    // --------------------------------------------------------
    // VIDEO
    // --------------------------------------------------------

    if (loaiFile === "VIDEO") {
      return cb(null, UPLOAD_VIDEO);
    }

    // --------------------------------------------------------
    // TÀI LIỆU
    // --------------------------------------------------------

    if (loaiFile === "TAI_LIEU") {
      return cb(null, UPLOAD_TAI_LIEU);
    }

    // --------------------------------------------------------
    // KHÔNG HỢP LỆ
    // --------------------------------------------------------

    return cb(new Error("Định dạng file không được hệ thống hỗ trợ."));
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file?.originalname || "").toLowerCase();

    let tenGoc = path.basename(file?.originalname || "", ext);

    tenGoc = tenGoc
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    const tenAnToan = tenGoc || "tai-nguyen";

    const thoiGian = Date.now();

    const ngauNhien = Math.floor(Math.random() * 1000000000);

    return cb(null, `${tenAnToan}-${thoiGian}-${ngauNhien}${ext}`);
  },
});

// ============================================================
// FILE FILTER
//
// KHÔNG dùng req.body
// ============================================================

function fileFilter(req, file, cb) {
  const tenFile = String(file?.originalname || "");

  const ext = path.extname(tenFile).toLowerCase();

  const mime = String(file?.mimetype || "")
    .trim()
    .toLowerCase();

  // ==========================================================
  // VIDEO
  // ==========================================================

  if (ext === ".mp4") {
    if (mime !== "video/mp4") {
      return cb(new Error("Video phải là file MP4 hợp lệ."));
    }

    return cb(null, true);
  }

  // ==========================================================
  // TÀI LIỆU
  // ==========================================================

  if (DUOI_TAI_LIEU.has(ext)) {
    if (!MIME_TAI_LIEU.has(mime)) {
      return cb(new Error("MIME type của file tài liệu không hợp lệ."));
    }

    return cb(null, true);
  }

  // ==========================================================
  // KHÔNG HỖ TRỢ
  // ==========================================================

  return cb(new Error("Định dạng file không được hệ thống hỗ trợ."));
}

// ============================================================
// MULTER
// ============================================================

const uploadTaiNguyen = multer({
  storage: storage,
  fileFilter: fileFilter,

  limits: {
    // 500 MB
    fileSize: 500 * 1024 * 1024,

    // Mỗi request chỉ 1 file
    files: 1,
  },
});

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  uploadTaiNguyen,

  UPLOAD_ROOT,

  UPLOAD_TAI_LIEU,

  UPLOAD_VIDEO,

  DUOI_TAI_LIEU,

  DUOI_VIDEO,

  MIME_TAI_LIEU,

  MIME_VIDEO,

  xacDinhLoaiFile,
};
