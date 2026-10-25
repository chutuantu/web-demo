(function () {
  "use strict";

  var MOBILE_QUERY = "(max-width: 1024px)";

  var menu = document.getElementById("mobileMenu");
  var openButton = document.getElementById("openMenuBtn");
  var closeButton = document.getElementById("closeMenuBtn");

  if (!menu || !openButton) {
    return;
  }

  var overlay = document.createElement("div");
  overlay.className = "lop-phu-menu-mobile";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  openButton.setAttribute("type", "button");
  openButton.setAttribute("aria-controls", "mobileMenu");
  openButton.setAttribute("aria-expanded", "false");
  openButton.setAttribute("aria-label", "Mở menu");

  function laMobile() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function dangMo() {
    return menu.classList.contains("dang-mo");
  }

  function datTrangThai(mo) {
    menu.classList.toggle("dang-mo", mo);
    overlay.classList.toggle("dang-mo", mo);
    document.body.classList.toggle("menu-dang-mo", mo);

    openButton.setAttribute("aria-expanded", mo ? "true" : "false");
    openButton.setAttribute("aria-label", mo ? "Đóng menu" : "Mở menu");
  }

  function dongMenu() {
    datTrangThai(false);
  }

  function dongTatCaMenuCon() {
    var cacMuc = menu.querySelectorAll(".lua-chon.dang-mo");

    Array.prototype.forEach.call(cacMuc, function (muc) {
      muc.classList.remove("dang-mo");
    });
  }

  openButton.addEventListener("click", function () {
    datTrangThai(!dangMo());
  });

  if (closeButton) {
    closeButton.addEventListener("click", dongMenu);
  }

  overlay.addEventListener("click", dongMenu);

  menu.addEventListener("click", function (event) {
    var lienKet = event.target.closest("a");

    if (!lienKet) {
      return;
    }

    var muc = lienKet.parentElement;
    var menuCon = muc ? muc.querySelector(":scope > .menu-con") : null;
    var trongMenuCon = lienKet.closest(".menu-con") !== null;

    if (laMobile() && menuCon && !trongMenuCon) {
      event.preventDefault();
      muc.classList.toggle("dang-mo");
      return;
    }

    dongMenu();
    dongTatCaMenuCon();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && dangMo()) {
      dongMenu();
    }
  });

  var media = window.matchMedia(MOBILE_QUERY);

  function xuLyKhiDoiKichThuoc() {
    if (!media.matches) {
      dongMenu();
      dongTatCaMenuCon();
    }
  }

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", xuLyKhiDoiKichThuoc);
  } else if (typeof media.addListener === "function") {
    media.addListener(xuLyKhiDoiKichThuoc);
  }

  window.addEventListener("resize", xuLyKhiDoiKichThuoc);
})();
