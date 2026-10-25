const express = require("express");
const axios = require("axios");

const router = express.Router();

const ML_API_URL = `${process.env.ML_API_URL || "http://127.0.0.1:5000"}/du-doan`;

// ============================================================
// POST /api/du-doan/diem-hoc-phan
// Dự đoán điểm học phần
// ============================================================

router.post("/diem-hoc-phan", async (req, res) => {
  try {
    const {
      ma_hoc_phan,
      so_tin_chi,
      diem_chuyen_can,
      diem_thuong_xuyen,
      ty_le_hoan_thanh_bai_tap,
      so_buoi_nghi,
    } = req.body;

    // --------------------------------------------------------
    // Kiểm tra dữ liệu bắt buộc
    // --------------------------------------------------------

    if (
      !ma_hoc_phan ||
      so_tin_chi === undefined ||
      diem_chuyen_can === undefined ||
      diem_thuong_xuyen === undefined ||
      ty_le_hoan_thanh_bai_tap === undefined ||
      so_buoi_nghi === undefined
    ) {
      return res.status(400).json({
        thanh_cong: false,
        message: "Thiếu dữ liệu đầu vào",
      });
    }

    // --------------------------------------------------------
    // Gửi dữ liệu sang Flask ML
    // --------------------------------------------------------

    const ketQuaML = await axios.post(
      ML_API_URL,
      {
        ma_hoc_phan,
        so_tin_chi,
        diem_chuyen_can,
        diem_thuong_xuyen,
        ty_le_hoan_thanh_bai_tap,
        so_buoi_nghi,
      },
      {
        timeout: 10000,
      },
    );

    // --------------------------------------------------------
    // Trả toàn bộ kết quả ML về frontend
    //
    // Bao gồm:
    // - điểm dự đoán
    // - xếp loại
    // - mức đánh giá
    // - mức cảnh báo
    // - nhận định
    // - lời khuyên
    // --------------------------------------------------------

    return res.json({
      thanh_cong: ketQuaML.data.thanh_cong,
      du_lieu_dau_vao: ketQuaML.data.du_lieu_dau_vao,
      ket_qua: ketQuaML.data.ket_qua,
    });
  } catch (error) {
    console.error("Lỗi gọi ML API:", error.message);

    // Nếu Flask trả lỗi
    if (error.response) {
      return res.status(error.response.status || 500).json(
        error.response.data || {
          thanh_cong: false,
          message: "Mô hình học máy trả về lỗi",
        },
      );
    }

    // Flask không chạy / không kết nối được
    return res.status(500).json({
      thanh_cong: false,
      message: "Không thể kết nối đến mô hình học máy",
    });
  }
});

module.exports = router;
