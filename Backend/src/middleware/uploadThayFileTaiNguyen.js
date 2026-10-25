const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ============================================================
// THƯ MỤC UPLOAD
// ============================================================

const UPLOAD_ROOT = path.join(
  __dirname,
  "..",
  "uploads"
);

const UPLOAD_TAI_LIEU = path.join(
  UPLOAD_ROOT,
  "tai-lieu"
);

const UPLOAD_VIDEO = path.join(
  UPLOAD_ROOT,
  "video"
);

// ============================================================
// TẠO THƯ MỤC NẾU CHƯA CÓ
// ============================================================

[
  UPLOAD_ROOT,
  UPLOAD_TAI_LIEU,
  UPLOAD_VIDEO,
].forEach((thuMuc) => {
  if (!fs.existsSync(thuMuc)) {
    fs.mkdirSync(thuMuc, {
      recursive: true,
    });
  }
});

// ============================================================
// ĐUÔI FILE
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

const DUOI_VIDEO = new Set([
  ".mp4",
  ".webm",
  ".mov",
]);

// ============================================================
// MIME
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

const MIME_VIDEO = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

// ============================================================
// STORAGE
// ============================================================
//
// QUAN TRỌNG:
// Không xác định thư mục bằng req.body.loaiTaiNguyen.
//
// API thay file sẽ xác định loại tài nguyên trước
// rồi truyền vào req.loaiTaiNguyen.
//
// ============================================================

const storage = multer.diskStorage({

  destination: function (
    req,
    file,
    cb
  ) {

    const loai =
      String(
        req.loaiTaiNguyen || ""
      )
        .trim()
        .toUpperCase();

    if (loai === "TAI_LIEU") {
      return cb(
        null,
        UPLOAD_TAI_LIEU
      );
    }

    if (loai === "VIDEO") {
      return cb(
        null,
        UPLOAD_VIDEO
      );
    }

    return cb(
      new Error(
        "Không xác định được loại tài nguyên cần thay file."
      )
    );
  },

  filename: function (
    req,
    file,
    cb
  ) {

    const ext =
      path
        .extname(
          file.originalname
        )
        .toLowerCase();

    const tenGoc =
      path
        .basename(
          file.originalname,
          ext
        )
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        );

    const tenAnToan =
      tenGoc ||
      "tai-nguyen";

    const thoiGian =
      Date.now();

    const ngauNhien =
      Math.round(
        Math.random() * 1e9
      );

    cb(
      null,
      `${tenAnToan}-${thoiGian}-${ngauNhien}${ext}`
    );
  },
});

// ============================================================
// FILE FILTER
// ============================================================

function fileFilter(
  req,
  file,
  cb
) {

  const loai =
    String(
      req.loaiTaiNguyen || ""
    )
      .trim()
      .toUpperCase();

  const ext =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();

  const mime =
    String(
      file.mimetype || ""
    )
      .trim()
      .toLowerCase();

  // ==========================================================
  // TÀI LIỆU
  // ==========================================================

  if (loai === "TAI_LIEU") {

    if (!DUOI_TAI_LIEU.has(ext)) {
      return cb(
        new Error(
          "Định dạng file tài liệu không được hỗ trợ."
        )
      );
    }

    if (!MIME_TAI_LIEU.has(mime)) {
      return cb(
        new Error(
          "MIME type của file tài liệu không hợp lệ."
        )
      );
    }

    return cb(
      null,
      true
    );
  }

  // ==========================================================
  // VIDEO
  // ==========================================================

  if (loai === "VIDEO") {

    if (!DUOI_VIDEO.has(ext)) {
      return cb(
        new Error(
          "Định dạng video không được hỗ trợ."
        )
      );
    }

    if (!MIME_VIDEO.has(mime)) {
      return cb(
        new Error(
          "MIME type của video không hợp lệ."
        )
      );
    }

    return cb(
      null,
      true
    );
  }

  return cb(
    new Error(
      "Loại tài nguyên không hợp lệ."
    )
  );
}

// ============================================================
// MULTER
// ============================================================

const uploadThayFileTaiNguyen =
  multer({

    storage,

    fileFilter,

    limits: {
      fileSize:
        500 * 1024 * 1024,

      files: 1,
    },
  });

module.exports =
  uploadThayFileTaiNguyen;