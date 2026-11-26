(() => {
  "use strict";

  const API_BASE = ["5500", "5501", "5502"].includes(window.location.port)
    ? "http://localhost:3000"
    : "";
  const API_PREFIX = "/api/admin/tai-khoan";
  const state = {
    loai: "SINH_VIEN",
    trang: 1,
    gioiHan: 10,
    tuKhoa: "",
    tongTrang: 1,
    tongSo: 0,
    danhSach: [],
    daChon: new Set(),
    modal: null,
  };

  const el = (id) => document.getElementById(id);
  const tokenHienTai = () => localStorage.getItem("token") || sessionStorage.getItem("token") || "";

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  async function goiApi(path, options = {}) {
    const token = tokenHienTai();
    if (!token) throw new Error("Bạn chưa đăng nhập hoặc chưa có token. Hãy đăng nhập bằng tài khoản ADMIN trước.");

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok || (data && data.thanhCong === false)) {
      throw new Error(data?.thongBao || `Yêu cầu thất bại (HTTP ${response.status}).`);
    }
    return data;
  }

  function thongBao(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "error" : ""}`;
    toast.innerHTML = `<i class="fa-solid ${type === "error" ? "fa-circle-exclamation" : "fa-circle-check"}"></i><span>${escapeHTML(message)}</span>`;
    el("toastRegion").appendChild(toast);
    window.setTimeout(() => toast.remove(), 4200);
  }

  function fieldText({ name, label, icon, placeholder, required = true, type = "text", value = "", autoComplete = "off", note = "", idPrefix = "field-" }) {
    const req = required ? '<span class="required">*</span>' : "";
    const safeValue = escapeHTML(value);
    const input = `
      <div class="input-wrap ${type === "password" ? "password-field" : ""}">
        <i class="leading-icon ${icon}"></i>
        <input type="${type}" id="${idPrefix}${name}" name="${name}" value="${safeValue}"
          placeholder="${escapeHTML(placeholder || `Nhập ${label.toLocaleLowerCase("vi-VN")}`)}"
          ${required ? "required" : ""} ${type === "password" ? 'minlength="8"' : ""}
          autocomplete="${autoComplete}" />
        ${type === "password" ? `<button class="password-toggle" type="button" data-toggle-password="${idPrefix}${name}" aria-label="Hiện hoặc ẩn mật khẩu"><i class="fa-regular fa-eye"></i></button>` : ""}
      </div>
      ${note ? `<small class="field-note">${escapeHTML(note)}</small>` : ""}
    `;
    return `<div class="form-field"><label for="${idPrefix}${name}">${label} ${req}</label>${input}</div>`;
  }

  function fieldSelect({ name, label, icon, options, value = "", required = true, idPrefix = "field-" }) {
    const req = required ? '<span class="required">*</span>' : "";
    const optionHTML = options.map((item) => {
      const selected = item.value === value ? "selected" : "";
      return `<option value="${escapeHTML(item.value)}" ${selected}>${escapeHTML(item.label)}</option>`;
    }).join("");
    return `
      <div class="form-field">
        <label for="${idPrefix}${name}">${label} ${req}</label>
        <div class="input-wrap select-wrap">
          <i class="leading-icon ${icon}"></i>
          <select id="${idPrefix}${name}" name="${name}" ${required ? "required" : ""}>
            <option value="" disabled ${value ? "" : "selected"}>Chọn ${label.toLocaleLowerCase("vi-VN")}</option>
            ${optionHTML}
          </select>
        </div>
      </div>`;
  }

  function fieldStatus(value = true, idPrefix = "field-") {
    return `
      <div class="form-field status-field">
        <span class="field-label">Trạng thái</span>
        <div class="status-switch-row">
          <label class="switch" aria-label="Kích hoạt tài khoản">
            <input id="${idPrefix}trangThai" name="trangThai" type="checkbox" ${value ? "checked" : ""} />
            <span class="switch-track"></span>
          </label>
          <span class="status-label" id="${idPrefix}statusLabel">${value ? "Kích hoạt ngay" : "Tạm khóa"}</span>
        </div>
      </div>`;
  }

  function renderCreateFields() {
    let html = "";
    if (state.loai === "SINH_VIEN") {
      html = [
        fieldText({ name: "maSinhVien", label: "Mã sinh viên", icon: "fa-solid fa-id-card", placeholder: "Ví dụ: SV2301001" }),
        fieldText({ name: "hoTen", label: "Họ và tên", icon: "fa-solid fa-user", placeholder: "Nhập họ và tên" }),
        fieldSelect({ name: "gioiTinh", label: "Giới tính", icon: "fa-solid fa-venus-mars", options: [{ value: "Nam", label: "Nam" }, { value: "Nữ", label: "Nữ" }, { value: "Khác", label: "Khác" }] }),
        fieldText({ name: "khoa", label: "Khoa", icon: "fa-solid fa-building-columns", placeholder: "Nhập tên khoa" }),
        fieldText({ name: "nganh", label: "Ngành", icon: "fa-solid fa-book-open", placeholder: "Nhập ngành học" }),
        fieldText({ name: "lop", label: "Lớp", icon: "fa-solid fa-users", placeholder: "Ví dụ: CNTT K15A" }),
        fieldText({ name: "nienKhoa", label: "Niên khóa", icon: "fa-regular fa-calendar", placeholder: "Ví dụ: 2023-2027" }),
        fieldText({ name: "matKhau", label: "Mật khẩu", icon: "fa-solid fa-lock", type: "password", placeholder: "Tối thiểu 8 ký tự", autoComplete: "new-password" }),
        fieldStatus(true),
      ].join("");
    } else {
      html = [
        fieldText({ name: "maGiangVien", label: "Mã giảng viên", icon: "fa-solid fa-id-card", placeholder: "Ví dụ: GV00123" }),
        fieldText({ name: "hoTen", label: "Họ và tên", icon: "fa-solid fa-user", placeholder: "Nhập họ và tên" }),
        fieldText({ name: "khoa", label: "Khoa", icon: "fa-solid fa-building-columns", placeholder: "Nhập tên khoa" }),
        fieldText({ name: "nganh", label: "Ngành", icon: "fa-solid fa-book-open", placeholder: "Nhập ngành hoặc bộ môn" }),
        fieldText({ name: "email", label: "Email", icon: "fa-regular fa-envelope", placeholder: "ten@bafu.edu.vn", type: "email" }),
        fieldText({ name: "matKhau", label: "Mật khẩu", icon: "fa-solid fa-lock", type: "password", placeholder: "Tối thiểu 8 ký tự", autoComplete: "new-password" }),
        fieldStatus(true),
      ].join("");
    }
    el("formFields").innerHTML = html;
    ganSuKienMatKhau(el("formFields"));
    ganSuKienTrangThai(el("formFields"));
  }

  function ganSuKienMatKhau(container) {
    container.querySelectorAll("[data-toggle-password]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = el(button.dataset.togglePassword);
        if (!input) return;
        const dangAn = input.type === "password";
        input.type = dangAn ? "text" : "password";
        button.innerHTML = `<i class="fa-regular ${dangAn ? "fa-eye-slash" : "fa-eye"}"></i>`;
      });
    });
  }

  function ganSuKienTrangThai(container, idPrefix = "field-") {
    const input = container.querySelector("input[name='trangThai']");
    const label = container.querySelector(`#${idPrefix}statusLabel`);
    if (!input || !label) return;
    input.addEventListener("change", () => {
      label.textContent = input.checked ? "Kích hoạt ngay" : "Tạm khóa";
    });
  }

  function layDuLieuForm(form, loai, isEdit = false) {
    const data = new FormData(form);
    const body = {
      loai,
      hoTen: String(data.get("hoTen") || "").trim(),
      khoa: String(data.get("khoa") || "").trim(),
      nganh: String(data.get("nganh") || "").trim(),
      matKhau: String(data.get("matKhau") || "").trim(),
      trangThai: Boolean(form.querySelector("input[name='trangThai']")?.checked),
    };
    if (loai === "SINH_VIEN") {
      body.maSinhVien = String(data.get("maSinhVien") || "").trim();
      body.gioiTinh = String(data.get("gioiTinh") || "").trim();
      body.lop = String(data.get("lop") || "").trim();
      body.nienKhoa = String(data.get("nienKhoa") || "").trim();
    } else {
      body.maGiangVien = String(data.get("maGiangVien") || "").trim();
      body.email = String(data.get("email") || "").trim();
    }
    if (isEdit && !body.matKhau) delete body.matKhau;
    return body;
  }

  async function taiDanhSach() {
    el("tableBody").innerHTML = '<tr><td class="table-state" colspan="10"><i class="fa-solid fa-circle-notch fa-spin"></i>Đang tải dữ liệu...</td></tr>';
    try {
      const params = new URLSearchParams({
        loai: state.loai,
        page: String(state.trang),
        limit: String(state.gioiHan),
        tuKhoa: state.tuKhoa,
      });
      const data = await goiApi(`/?${params.toString()}`);
      state.danhSach = Array.isArray(data.duLieu) ? data.duLieu : [];
      state.tongSo = data.phanTrang?.tongSo || 0;
      state.tongTrang = data.phanTrang?.tongTrang || 1;
      if (state.trang > state.tongTrang) {
        state.trang = state.tongTrang;
        return taiDanhSach();
      }
      veBang();
    } catch (error) {
      state.danhSach = [];
      state.tongSo = 0;
      state.tongTrang = 1;
      el("tableHead").innerHTML = "";
      el("tableBody").innerHTML = `<tr><td class="table-state" colspan="10"><i class="fa-solid fa-triangle-exclamation"></i>${escapeHTML(error.message)}</td></tr>`;
      el("tableSummary").textContent = "Không thể tải danh sách tài khoản.";
      vePhanTrang();
    }
    capNhatDemDaChon();
  }

  function veBang() {
    const laSinhVien = state.loai === "SINH_VIEN";
    const headers = laSinhVien
      ? ["<input class='check-cell' type='checkbox' id='selectAll' aria-label='Chọn tất cả trang này' />", "STT", "Mã sinh viên", "Họ và tên", "Lớp", "Ngành", "Niên khóa", "Trạng thái", "Ngày tạo", "Thao tác"]
      : ["<input class='check-cell' type='checkbox' id='selectAll' aria-label='Chọn tất cả trang này' />", "STT", "Mã giảng viên", "Họ và tên", "Khoa", "Ngành", "Trạng thái", "Ngày tạo", "Thao tác"];
    el("tableHead").innerHTML = `<tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr>`;

    if (!state.danhSach.length) {
      el("tableBody").innerHTML = `<tr><td class="table-state" colspan="${headers.length}"><i class="fa-regular fa-folder-open"></i>Chưa có tài khoản nào trong danh sách.</td></tr>`;
    } else {
      el("tableBody").innerHTML = state.danhSach.map((item, index) => {
        const id = Number(item.id);
        const checked = state.daChon.has(id) ? "checked" : "";
        const status = item.trangThai
          ? '<span class="status-badge active">Đang hoạt động</span>'
          : '<span class="status-badge locked">Đã khóa</span>';
        const created = dinhDangNgay(item.ngayTao);
        const cells = laSinhVien
          ? `
            <td class="number-cell">${(state.trang - 1) * state.gioiHan + index + 1}</td>
            <td class="code-cell">${escapeHTML(item.ma)}</td>
            <td class="name-cell">${escapeHTML(item.hoTen)}</td>
            <td>${escapeHTML(item.lop || "—")}</td>
            <td>${escapeHTML(item.nganh || "—")}</td>
            <td>${escapeHTML(item.nienKhoa || "—")}</td>
            <td>${status}</td>
            <td>${created}</td>`
          : `
            <td class="number-cell">${(state.trang - 1) * state.gioiHan + index + 1}</td>
            <td class="code-cell">${escapeHTML(item.ma)}</td>
            <td class="name-cell">${escapeHTML(item.hoTen)}</td>
            <td>${escapeHTML(item.khoa || "—")}</td>
            <td>${escapeHTML(item.nganh || "—")}</td>
            <td>${status}</td>
            <td>${created}</td>`;
        return `
          <tr data-row-id="${id}">
            <td><input class="check-cell row-check" type="checkbox" data-id="${id}" ${checked} aria-label="Chọn ${escapeHTML(item.ma)}" /></td>
            ${cells}
            <td><div class="row-actions">
              <button class="action-button action-view" type="button" data-action="view" data-id="${id}" title="Xem"><i class="fa-regular fa-eye"></i></button>
              <button class="action-button action-edit" type="button" data-action="edit" data-id="${id}" title="Sửa"><i class="fa-regular fa-pen-to-square"></i></button>
              <button class="action-button action-delete" type="button" data-action="delete" data-id="${id}" title="Xóa"><i class="fa-regular fa-trash-can"></i></button>
            </div></td>
          </tr>`;
      }).join("");
    }

    const dau = state.tongSo ? (state.trang - 1) * state.gioiHan + 1 : 0;
    const cuoi = Math.min(state.trang * state.gioiHan, state.tongSo);
    el("tableSummary").textContent = `Hiển thị ${dau}–${cuoi} trong tổng số ${state.tongSo} tài khoản`;
    const selectAll = el("selectAll");
    if (selectAll && state.danhSach.length) {
      selectAll.checked = state.danhSach.every((item) => state.daChon.has(Number(item.id)));
      selectAll.indeterminate = !selectAll.checked && state.danhSach.some((item) => state.daChon.has(Number(item.id)));
    }
    vePhanTrang();
    capNhatDemDaChon();
  }

  function dinhDangNgay(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
  }

  function vePhanTrang() {
    const container = el("pagination");
    const total = Math.max(1, state.tongTrang);
    const current = Math.min(state.trang, total);
    const buttons = [];
    buttons.push(`<button class="page-button" type="button" data-page="${current - 1}" ${current <= 1 ? "disabled" : ""} aria-label="Trang trước"><i class="fa-solid fa-chevron-left"></i></button>`);
    let pages;
    if (total <= 7) {
      pages = Array.from({ length: total }, (_, i) => i + 1);
    } else if (current <= 4) {
      pages = [1, 2, 3, 4, 5, "...", total];
    } else if (current >= total - 3) {
      pages = [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    } else {
      pages = [1, "...", current - 1, current, current + 1, "...", total];
    }
    pages.forEach((page) => {
      if (page === "...") buttons.push('<span class="page-ellipsis">…</span>');
      else buttons.push(`<button class="page-button ${page === current ? "active" : ""}" type="button" data-page="${page}" ${page === current ? 'aria-current="page"' : ""}>${page}</button>`);
    });
    buttons.push(`<button class="page-button" type="button" data-page="${current + 1}" ${current >= total ? "disabled" : ""} aria-label="Trang sau"><i class="fa-solid fa-chevron-right"></i></button>`);
    container.innerHTML = buttons.join("");
  }

  function capNhatDemDaChon() {
    el("selectedCounter").innerHTML = `<i class="fa-solid fa-square-check"></i>Đã chọn (${state.daChon.size})`;
    el("btnBulkDelete").disabled = state.daChon.size === 0;
  }

  function moModal({ eyebrow = "Tài khoản", title, content, footer }) {
    state.modal = true;
    el("modalEyebrow").textContent = eyebrow;
    el("modalTitle").textContent = title;
    el("modalContent").innerHTML = content;
    el("modalFooter").innerHTML = footer || `<button class="button button-outline" type="button" data-modal-close>Đóng</button>`;
    el("modalBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
    el("modalContent").querySelectorAll("[data-toggle-password]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = el(button.dataset.togglePassword);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.innerHTML = `<i class="fa-regular ${show ? "fa-eye-slash" : "fa-eye"}"></i>`;
      });
    });
    ganSuKienTrangThai(el("modalContent"), "edit-");
  }

  function dongModal() {
    state.modal = null;
    el("modalBackdrop").hidden = true;
    document.body.style.overflow = "";
    el("modalContent").innerHTML = "";
    el("modalFooter").innerHTML = "";
  }

  function itemChiTiet(label, value) {
    return `<div class="detail-item"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value || "—")}</strong></div>`;
  }

  async function xemTaiKhoan(id) {
    try {
      const result = await goiApi(`/${id}`);
      const d = result.duLieu;
      const fields = d.loai === "SINH_VIEN"
        ? [
            itemChiTiet("Mã sinh viên", d.maSinhVien), itemChiTiet("Họ và tên", d.hoTen),
            itemChiTiet("Giới tính", d.gioiTinh), itemChiTiet("Khoa", d.khoa),
            itemChiTiet("Ngành", d.nganh), itemChiTiet("Lớp", d.lop),
            itemChiTiet("Niên khóa", d.nienKhoa), itemChiTiet("Ngày tạo", dinhDangNgay(d.ngayTao)),
          ]
        : [
            itemChiTiet("Mã giảng viên", d.maGiangVien), itemChiTiet("Họ và tên", d.hoTen),
            itemChiTiet("Khoa", d.khoa), itemChiTiet("Ngành", d.nganh),
            itemChiTiet("Email", d.email), itemChiTiet("Ngày tạo", dinhDangNgay(d.ngayTao)),
          ];
      fields.push(itemChiTiet("Trạng thái", d.trangThai ? "Đang hoạt động" : "Đã khóa"));
      moModal({
        eyebrow: d.loai === "SINH_VIEN" ? "Hồ sơ sinh viên" : "Hồ sơ giảng viên",
        title: "Thông tin tài khoản",
        content: `<div class="detail-grid">${fields.join("")}</div><p class="modal-tip">Mật khẩu không được hiển thị trong màn hình xem để bảo vệ tài khoản.</p>`,
      });
    } catch (error) {
      thongBao(error.message, "error");
    }
  }

  function modalEditFields(d) {
    let fields = "";
    if (d.loai === "SINH_VIEN") {
      fields = [
        fieldText({ idPrefix: "edit-", name: "maSinhVien", label: "Mã sinh viên", icon: "fa-solid fa-id-card", value: d.maSinhVien }),
        fieldText({ idPrefix: "edit-", name: "hoTen", label: "Họ và tên", icon: "fa-solid fa-user", value: d.hoTen }),
        fieldSelect({ idPrefix: "edit-", name: "gioiTinh", label: "Giới tính", icon: "fa-solid fa-venus-mars", value: d.gioiTinh || "", required: false, options: [{ value: "Nam", label: "Nam" }, { value: "Nữ", label: "Nữ" }, { value: "Khác", label: "Khác" }] }),
        fieldText({ idPrefix: "edit-", name: "khoa", label: "Khoa", icon: "fa-solid fa-building-columns", value: d.khoa }),
        fieldText({ idPrefix: "edit-", name: "nganh", label: "Ngành", icon: "fa-solid fa-book-open", value: d.nganh }),
        fieldText({ idPrefix: "edit-", name: "lop", label: "Lớp", icon: "fa-solid fa-users", value: d.lop }),
        fieldText({ idPrefix: "edit-", name: "nienKhoa", label: "Niên khóa", icon: "fa-regular fa-calendar", value: d.nienKhoa }),
        fieldText({ idPrefix: "edit-", name: "matKhau", label: "Mật khẩu mới", icon: "fa-solid fa-lock", type: "password", required: false, placeholder: "Để trống nếu không đổi", autoComplete: "new-password" }),
      ].join("");
    } else {
      fields = [
        fieldText({ idPrefix: "edit-", name: "maGiangVien", label: "Mã giảng viên", icon: "fa-solid fa-id-card", value: d.maGiangVien }),
        fieldText({ idPrefix: "edit-", name: "hoTen", label: "Họ và tên", icon: "fa-solid fa-user", value: d.hoTen }),
        fieldText({ idPrefix: "edit-", name: "khoa", label: "Khoa", icon: "fa-solid fa-building-columns", value: d.khoa }),
        fieldText({ idPrefix: "edit-", name: "nganh", label: "Ngành", icon: "fa-solid fa-book-open", value: d.nganh }),
        fieldText({ idPrefix: "edit-", name: "email", label: "Email", icon: "fa-regular fa-envelope", value: d.email, type: "email" }),
        fieldText({ idPrefix: "edit-", name: "matKhau", label: "Mật khẩu mới", icon: "fa-solid fa-lock", type: "password", required: false, placeholder: "Để trống nếu không đổi", autoComplete: "new-password" }),
      ].join("");
    }
    return `${fields}${fieldStatus(Boolean(d.trangThai), "edit-")}`;
  }

  async function suaTaiKhoan(id) {
    try {
      const result = await goiApi(`/${id}`);
      const d = result.duLieu;
      moModal({
        eyebrow: "Chỉnh sửa hồ sơ",
        title: "Cập nhật thông tin tài khoản",
        content: `<form id="formEditAccount" class="modal-form-grid" novalidate>${modalEditFields(d)}</form><p class="modal-tip">Mật khẩu mới không bắt buộc. Để trống trường này nếu muốn giữ nguyên mật khẩu hiện tại.</p>`,
        footer: `<button class="button button-outline" type="button" data-modal-close>Hủy</button><button class="button button-primary" type="submit" form="formEditAccount" id="btnSaveEdit"><i class="fa-regular fa-floppy-disk"></i>Lưu thay đổi</button>`,
      });
      el("formEditAccount").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const body = layDuLieuForm(form, d.loai, true);
        const button = el("btnSaveEdit");
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Đang lưu...';
        try {
          const payload = { ...body };
          delete payload.loai;
          await goiApi(`/${id}`, { method: "PUT", body: JSON.stringify(payload) });
          dongModal();
          thongBao("Cập nhật tài khoản thành công.");
          await taiDanhSach();
        } catch (error) {
          thongBao(error.message, "error");
          button.disabled = false;
          button.innerHTML = '<i class="fa-regular fa-floppy-disk"></i>Lưu thay đổi';
        }
      });
    } catch (error) {
      thongBao(error.message, "error");
    }
  }

  function xacNhanXoa({ ids, title, description, bulk = false }) {
    moModal({
      eyebrow: "Xác nhận thao tác",
      title,
      content: `
        <div class="confirm-box">
          <div class="confirm-icon"><i class="fa-solid fa-trash-can"></i></div>
          <div><h3>Bạn có chắc chắn muốn xóa?</h3><p>${escapeHTML(description)}</p></div>
        </div>
        <p class="modal-tip">Tài khoản sẽ được chuyển sang trạng thái đã xóa và ẩn khỏi danh sách. Dữ liệu kết quả học tập, lịch sử dự đoán và tài nguyên liên quan vẫn được giữ lại.</p>
      `,
      footer: `<button class="button button-outline" type="button" data-modal-close>Hủy</button><button class="button button-danger" id="btnConfirmDelete" type="button"><i class="fa-regular fa-trash-can"></i>Xác nhận xóa</button>`,
    });
    el("btnConfirmDelete").addEventListener("click", async () => {
      const button = el("btnConfirmDelete");
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Đang xử lý...';
      try {
        if (bulk) {
          await goiApi("/hang-loat", { method: "DELETE", body: JSON.stringify({ ids }) });
        } else {
          await goiApi(`/${ids[0]}`, { method: "DELETE" });
        }
        ids.forEach((id) => state.daChon.delete(Number(id)));
        dongModal();
        thongBao(bulk ? "Đã xử lý xóa hàng loạt tài khoản." : "Đã xóa tài khoản.");
        await taiDanhSach();
      } catch (error) {
        thongBao(error.message, "error");
        button.disabled = false;
        button.innerHTML = '<i class="fa-regular fa-trash-can"></i>Xác nhận xóa';
      }
    });
  }

  async function taiMauExcel() {
    try {
      const token = tokenHienTai();
      if (!token) throw new Error("Bạn chưa đăng nhập bằng tài khoản ADMIN.");
      const query = new URLSearchParams({ loai: state.loai });
      const response = await fetch(`${API_BASE}${API_PREFIX}/mau-excel?${query}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) {
        let message = "Không thể tải file mẫu Excel.";
        try { message = (await response.json()).thongBao || message; } catch (_) { /* bỏ qua */ }
        throw new Error(message);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mau-tai-khoan-${state.loai.toLowerCase()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      thongBao("Đã tải file mẫu Excel.");
    } catch (error) {
      thongBao(error.message, "error");
    }
  }

  async function nhapExcel(file) {
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      thongBao("Vui lòng chọn file Excel có định dạng .xlsx.", "error");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    thongBao("Đang đọc file Excel và tạo tài khoản...");
    try {
      const query = new URLSearchParams({ loai: state.loai });
      const result = await goiApi(`/nhap-excel?${query}`, { method: "POST", body: form });
      state.daChon.clear();
      state.trang = 1;
      await taiDanhSach();
      const failed = (result.chiTiet || []).filter((item) => !item.thanhCong);
      let content = `
        <div class="detail-grid">
          ${itemChiTiet("Tổng số dòng dữ liệu", String(result.tongDong || 0))}
          ${itemChiTiet("Tạo thành công", String(result.soThanhCong || 0))}
          ${itemChiTiet("Không thành công", String(result.soThatBai || 0))}
          ${itemChiTiet("Kết quả", result.thongBao)}
        </div>`;
      if (failed.length) {
        content += `<div style="margin-top:16px;overflow:auto"><table class="account-table"><thead><tr><th>Dòng Excel</th><th>Lý do</th></tr></thead><tbody>${failed.map((item) => `<tr><td>${item.dong}</td><td>${escapeHTML(item.thongBao)}</td></tr>`).join("")}</tbody></table></div>`;
      }
      moModal({ eyebrow: "Nhập dữ liệu Excel", title: "Kết quả nhập tài khoản", content, footer: `<button class="button button-primary" type="button" data-modal-close>Hoàn tất</button>` });
      if (failed.length) thongBao(`Có ${failed.length} dòng chưa được nhập. Xem chi tiết trong cửa sổ kết quả.`, "error");
    } catch (error) {
      thongBao(error.message, "error");
    } finally {
      el("fileExcel").value = "";
    }
  }

  function ganSuKien() {
    document.querySelectorAll(".role-tab").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.loai === state.loai) return;
        state.loai = button.dataset.loai;
        state.trang = 1;
        state.daChon.clear();
        document.querySelectorAll(".role-tab").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        renderCreateFields();
        taiDanhSach();
      });
    });

    el("formTaiKhoan").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      const body = layDuLieuForm(form, state.loai);
      const button = el("btnCreateAccount");
      button.disabled = true;
      button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Đang tạo...';
      try {
        await goiApi("/", { method: "POST", body: JSON.stringify(body) });
        form.reset();
        renderCreateFields();
        state.trang = 1;
        thongBao("Tạo tài khoản thành công.");
        await taiDanhSach();
      } catch (error) {
        thongBao(error.message, "error");
      } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-paper-plane"></i>Tạo tài khoản';
      }
    });

    el("formTaiKhoan").addEventListener("reset", (event) => {
      event.preventDefault();
      renderCreateFields();
    });
    el("btnResetForm").addEventListener("click", (event) => {
      event.preventDefault();
      renderCreateFields();
    });

    let searchTimer;
    el("inputSearch").addEventListener("input", (event) => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        state.tuKhoa = event.target.value.trim();
        state.trang = 1;
        state.daChon.clear();
        taiDanhSach();
      }, 280);
    });

    el("pageSize").addEventListener("change", (event) => {
      state.gioiHan = Number(event.target.value) || 10;
      state.trang = 1;
      state.daChon.clear();
      taiDanhSach();
    });

    el("tableBody").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const id = Number(button.dataset.id);
      if (button.dataset.action === "view") xemTaiKhoan(id);
      if (button.dataset.action === "edit") suaTaiKhoan(id);
      if (button.dataset.action === "delete") {
        const account = state.danhSach.find((item) => Number(item.id) === id);
        xacNhanXoa({ ids: [id], title: "Xóa tài khoản", description: `Tài khoản ${account?.ma || "được chọn"} – ${account?.hoTen || ""} sẽ bị xóa khỏi danh sách quản lý.` });
      }
    });

    el("tableBody").addEventListener("change", (event) => {
      const checkbox = event.target.closest(".row-check");
      if (!checkbox) return;
      const id = Number(checkbox.dataset.id);
      if (checkbox.checked) state.daChon.add(id);
      else state.daChon.delete(id);
      const selectAll = el("selectAll");
      if (selectAll) {
        selectAll.checked = state.danhSach.length > 0 && state.danhSach.every((item) => state.daChon.has(Number(item.id)));
        selectAll.indeterminate = !selectAll.checked && state.danhSach.some((item) => state.daChon.has(Number(item.id)));
      }
      capNhatDemDaChon();
    });

    el("tableHead").addEventListener("change", (event) => {
      if (event.target.id !== "selectAll") return;
      state.danhSach.forEach((item) => {
        if (event.target.checked) state.daChon.add(Number(item.id));
        else state.daChon.delete(Number(item.id));
      });
      veBang();
    });

    el("pagination").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-page]");
      if (!button || button.disabled) return;
      const nextPage = Number(button.dataset.page);
      if (!Number.isInteger(nextPage) || nextPage < 1 || nextPage > state.tongTrang || nextPage === state.trang) return;
      state.trang = nextPage;
      taiDanhSach();
    });

    el("btnBulkDelete").addEventListener("click", () => {
      const ids = [...state.daChon];
      if (!ids.length) return;
      xacNhanXoa({
        ids,
        bulk: true,
        title: "Xóa nhiều tài khoản",
        description: `Bạn đang chọn ${ids.length} tài khoản. Những tài khoản này sẽ được chuyển sang trạng thái đã xóa.`,
      });
    });

    el("btnDownloadTemplate").addEventListener("click", taiMauExcel);
    el("btnImportExcel").addEventListener("click", () => el("fileExcel").click());
    el("fileExcel").addEventListener("change", (event) => nhapExcel(event.target.files?.[0]));
    el("btnCloseModal").addEventListener("click", dongModal);
    el("modalBackdrop").addEventListener("click", (event) => {
      if (event.target === el("modalBackdrop") || event.target.closest("[data-modal-close]")) dongModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.modal) dongModal();
    });
  }

  function khoiTao() {
    renderCreateFields();
    ganSuKien();
    taiDanhSach();
  }

  document.addEventListener("DOMContentLoaded", khoiTao);
})();
