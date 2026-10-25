/* ======================================================
   PHẦN 1: BÁO CÁO
====================================================== */


/* ======================================================
   CHỜ HTML TẢI XONG
====================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ==================================================
       LẤY CÁC PHẦN TỬ HTML
    ================================================== */

    const nutTaoBaoCao =
        document.getElementById("nut-tao-bao-cao");

    const chonKhoangThoiGian =
        document.getElementById("chon-khoang-thoi-gian");


    /* ==================================================
       SỰ KIỆN: TẠO BÁO CÁO
    ================================================== */

    nutTaoBaoCao.addEventListener("click", function () {

        console.log("Đã nhấn nút Tạo báo cáo mới");

        alert(
            "Chức năng Tạo báo cáo mới sẽ được triển khai ở phần tiếp theo."
        );

    });


    /* ==================================================
       SỰ KIỆN: CHỌN KHOẢNG THỜI GIAN
    ================================================== */

    chonKhoangThoiGian.addEventListener("click", function () {

        console.log("Đã nhấn chọn khoảng thời gian");

        alert(
            "Chức năng chọn khoảng thời gian sẽ được triển khai sau."
        );

    });

});

/* ======================================================
   PHẦN 2: THỐNG KÊ TỔNG QUAN
====================================================== */


/* ======================================================
   LẤY CÁC PHẦN TỬ THỐNG KÊ
====================================================== */

const tongSoSinhVien =
    document.getElementById("tong-so-sinh-vien");

const diemTrungBinhHocKy =
    document.getElementById("diem-trung-binh-hoc-ky");

const soSinhVienNguyCo =
    document.getElementById("so-sinh-vien-nguy-co");

const soSinhVienGioi =
    document.getElementById("so-sinh-vien-gioi");


/* ======================================================
   DỮ LIỆU THỐNG KÊ
====================================================== */

const duLieuThongKe = {

    tongSinhVien: 256,

    diemTrungBinh: 7.28,

    sinhVienNguyCo: 18,

    sinhVienGioi: 83

};


/* ======================================================
   CẬP NHẬT DỮ LIỆU LÊN GIAO DIỆN
====================================================== */

tongSoSinhVien.textContent =
    duLieuThongKe.tongSinhVien;

diemTrungBinhHocKy.textContent =
    duLieuThongKe.diemTrungBinh.toFixed(2);

soSinhVienNguyCo.textContent =
    duLieuThongKe.sinhVienNguyCo;

soSinhVienGioi.textContent =
    duLieuThongKe.sinhVienGioi;


/* ======================================================
   PHẦN 3: TÌM KIẾM VÀ LỌC SINH VIÊN
====================================================== */


/* ======================================================
   LẤY CÁC PHẦN TỬ
====================================================== */

const oTimKiemSinhVien =
    document.getElementById("tim-kiem-sinh-vien");

const nutXoaTimKiem =
    document.getElementById("nut-xoa-tim-kiem");

const locLop =
    document.getElementById("loc-lop");

const locHocKy =
    document.getElementById("loc-hoc-ky");

const locKhoangThoiGian =
    document.getElementById("loc-khoang-thoi-gian");

const nutLocSinhVien =
    document.getElementById("nut-loc-sinh-vien");


/* ======================================================
   HIỂN THỊ / ẨN NÚT XÓA TÌM KIẾM
====================================================== */

oTimKiemSinhVien.addEventListener("input", function () {

    if (this.value.trim() !== "") {

        nutXoaTimKiem.style.display = "flex";

    } else {

        nutXoaTimKiem.style.display = "none";

    }

});


/* ======================================================
   XÓA NỘI DUNG TÌM KIẾM
====================================================== */

nutXoaTimKiem.addEventListener("click", function () {

    oTimKiemSinhVien.value = "";

    nutXoaTimKiem.style.display = "none";

    oTimKiemSinhVien.focus();

});


/* ======================================================
   NÚT LỌC
====================================================== */

nutLocSinhVien.addEventListener("click", function () {

    const tuKhoa =
        oTimKiemSinhVien.value.trim();

    const lop =
        locLop.options[locLop.selectedIndex].text;

    const hocKy =
        locHocKy.options[locHocKy.selectedIndex].text;

    const khoangThoiGian =
        locKhoangThoiGian.value;


    /* Trạng thái đang lọc */

    nutLocSinhVien.classList.add("dang-loc");

    nutLocSinhVien.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Đang lọc...</span>
    `;


    /* Mô phỏng xử lý dữ liệu */

    setTimeout(function () {

        nutLocSinhVien.classList.remove("dang-loc");

        nutLocSinhVien.innerHTML = `
            <i class="fa-solid fa-filter"></i>
            <span>Lọc</span>
        `;


        console.log("========== KẾT QUẢ LỌC ==========");

        console.log("Từ khóa:", tuKhoa || "Không có");

        console.log("Lớp:", lop);

        console.log("Học kỳ:", hocKy);

        console.log("Khoảng thời gian:", khoangThoiGian);


    }, 700);

});

const nutMoLich =
    document.getElementById("nut-mo-lich");

const ngayBatDau =
    document.getElementById("ngay-bat-dau");

const ngayKetThuc =
    document.getElementById("ngay-ket-thuc");

const oKhoangThoiGian =
    document.getElementById("loc-khoang-thoi-gian");


/* Click icon lịch */

nutMoLich.addEventListener("click", function () {

    moLich(ngayBatDau);

});


/* Mở lịch */

function moLich(inputNgay) {

    if (typeof inputNgay.showPicker === "function") {

        try {
            inputNgay.showPicker();
        } catch (error) {
            inputNgay.focus();
        }

    } else {

        inputNgay.focus();

    }
}


/* Chọn ngày bắt đầu */

ngayBatDau.addEventListener("change", function () {

    if (!ngayBatDau.value) {
        return;
    }

    ngayKetThuc.min = ngayBatDau.value;

    setTimeout(function () {

        moLich(ngayKetThuc);

    }, 150);

});


/* Chọn ngày kết thúc */

ngayKetThuc.addEventListener("change", function () {

    if (!ngayKetThuc.value) {
        return;
    }

    if (
        ngayBatDau.value &&
        ngayKetThuc.value < ngayBatDau.value
    ) {

        alert(
            "Ngày kết thúc không được nhỏ hơn ngày bắt đầu!"
        );

        ngayKetThuc.value = "";

        return;
    }

    const batDau =
        dinhDangNgay(ngayBatDau.value);

    const ketThuc =
        dinhDangNgay(ngayKetThuc.value);

    oKhoangThoiGian.value =
        `${batDau} - ${ketThuc}`;

});


/* Định dạng ngày */

function dinhDangNgay(ngay) {

    const phanNgay = ngay.split("-");

    return `${phanNgay[2]}/${phanNgay[1]}/${phanNgay[0]}`;
}

/* ======================================================
   PHẦN 4: PHÂN BỐ ĐIỂM GPA
====================================================== */


/* ======================================================
   DỮ LIỆU GPA
====================================================== */

const duLieuGPA = {

    gioi: {
        ten: "Giỏi",
        soLuong: 83,
        phanTram: 32.42
    },

    kha: {
        ten: "Khá",
        soLuong: 102,
        phanTram: 39.84
    },

    trungBinh: {
        ten: "Trung bình",
        soLuong: 48,
        phanTram: 18.75
    },

    yeu: {
        ten: "Yếu",
        soLuong: 16,
        phanTram: 6.25
    },

    kem: {
        ten: "Kém",
        soLuong: 7,
        phanTram: 2.73
    }

};


/* ======================================================
   TÍNH TỔNG SINH VIÊN
====================================================== */

const tongGPA =
    duLieuGPA.gioi.soLuong +
    duLieuGPA.kha.soLuong +
    duLieuGPA.trungBinh.soLuong +
    duLieuGPA.yeu.soLuong +
    duLieuGPA.kem.soLuong;


/* ======================================================
   HIỂN THỊ TỔNG SINH VIÊN
====================================================== */

const tongSinhVienGPA =
    document.getElementById("tong-sinh-vien-gpa");

if (tongSinhVienGPA) {

    tongSinhVienGPA.textContent = tongGPA;

}


/* ======================================================
   TẠO BIỂU ĐỒ DONUT
====================================================== */

const bieuDoDonutGPA =
    document.getElementById("bieu-do-donut-gpa");


if (bieuDoDonutGPA) {

    const gioi =
        duLieuGPA.gioi.phanTram;

    const kha =
        duLieuGPA.kha.phanTram;

    const trungBinh =
        duLieuGPA.trungBinh.phanTram;

    const yeu =
        duLieuGPA.yeu.phanTram;

    const kem =
        duLieuGPA.kem.phanTram;


    /* Tính điểm kết thúc của từng vùng */

    const diemKetThucGioi =
        gioi;

    const diemKetThucKha =
        gioi + kha;

    const diemKetThucTrungBinh =
        gioi + kha + trungBinh;

    const diemKetThucYeu =
        gioi + kha + trungBinh + yeu;


    /* Tạo gradient */

    const gradientGPA = `
        #2fac61 0% ${diemKetThucGioi}%,

        #4285d4 ${diemKetThucGioi}%
        ${diemKetThucKha}%,

        #f2ad18 ${diemKetThucKha}%
        ${diemKetThucTrungBinh}%,

        #e86c34 ${diemKetThucTrungBinh}%
        ${diemKetThucYeu}%,

        #df493f ${diemKetThucYeu}%
        100%
    `;


    bieuDoDonutGPA.style.setProperty(
        "--gpa-donut",
        gradientGPA
    );

}


/* ======================================================
   NÚT XEM CHI TIẾT GPA
====================================================== */

const nutXemChiTietGPA =
    document.getElementById("nut-xem-chi-tiet-gpa");


if (nutXemChiTietGPA) {

    nutXemChiTietGPA.addEventListener(
        "click",
        function () {

            console.log(
                "Đang xem chi tiết phân bố GPA..."
            );

            alert(
                "Chi tiết phân bố GPA sẽ được phát triển ở bước tiếp theo."
            );

        }
    );

}

/* ======================================================
   PHẦN 5: XU HƯỚNG ĐIỂM TRUNG BÌNH
====================================================== */


/* ======================================================
   DỮ LIỆU THEO ẢNH MẪU
====================================================== */

const duLieuDiemTrungBinh = [

    {
        hocKy: "HK 2",
        namHoc: "2022-2023",
        diem: 6.42
    },

    {
        hocKy: "HK 1",
        namHoc: "2023-2023",
        diem: 6.71
    },

    {
        hocKy: "HK 2",
        namHoc: "2023-2024",
        diem: 6.95
    },

    {
        hocKy: "HK 1",
        namHoc: "2023-2024",
        diem: 7.07
    },

    {
        hocKy: "HK 2",
        namHoc: "2023-2024",
        diem: 7.28
    }

];


/* ======================================================
   LẤY CÁC PHẦN TỬ
====================================================== */

const duongBieuDo =
    document.getElementById("duong-bieu-do");

const vungDuoiDuong =
    document.getElementById("vung-duoi-duong");

const nhomDiemBieuDo =
    document.getElementById("nhom-diem-bieu-do");

const nhanDiemBieuDo =
    document.getElementById("nhan-diem-bieu-do");

const nhanHocKy =
    document.getElementById("nhan-hoc-ky");


/* ======================================================
   HÀM TẠO BIỂU ĐỒ
====================================================== */

function taoBieuDoDiemTrungBinh() {

    if (!duongBieuDo) {
        return;
    }


    /*
       Kích thước SVG gốc
    */

    const rong = 500;

    const cao = 180;


    /*
       Tính tọa độ các điểm

       Trục Y:
       10 = trên cùng
       0  = dưới cùng
    */

    const cacDiem =
        duLieuDiemTrungBinh.map(
            function (duLieu, index) {

                const x =
                    index *
                    (rong /
                    (duLieuDiemTrungBinh.length - 1));


                const y =
                    cao -
                    (
                        duLieu.diem /
                        10
                    ) *
                    cao;


                return {

                    x: x,

                    y: y,

                    diem: duLieu.diem,

                    hocKy: duLieu.hocKy,

                    namHoc: duLieu.namHoc

                };

            }
        );


    /* ==================================================
       TẠO ĐƯỜNG
    ================================================== */

    let duong =
        `M ${cacDiem[0].x} ${cacDiem[0].y}`;


    for (
        let i = 1;
        i < cacDiem.length;
        i++
    ) {

        duong +=
            ` L ${cacDiem[i].x} ${cacDiem[i].y}`;

    }


    duongBieuDo.setAttribute(
        "d",
        duong
    );


    /* ==================================================
       TẠO VÙNG NỀN
    ================================================== */

    let vung =
        `M ${cacDiem[0].x} ${cao}`;

    vung +=
        ` L ${cacDiem[0].x} ${cacDiem[0].y}`;


    for (
        let i = 1;
        i < cacDiem.length;
        i++
    ) {

        vung +=
            ` L ${cacDiem[i].x} ${cacDiem[i].y}`;

    }


    vung +=
        ` L ${cacDiem[cacDiem.length - 1].x} ${cao}`;

    vung += " Z";


    vungDuoiDuong.setAttribute(
        "d",
        vung
    );


    /* ==================================================
       XÓA DỮ LIỆU CŨ
    ================================================== */

    nhomDiemBieuDo.innerHTML = "";

    nhanDiemBieuDo.innerHTML = "";

    nhanHocKy.innerHTML = "";


    /* ==================================================
       TẠO CÁC ĐIỂM
    ================================================== */

    cacDiem.forEach(
        function (diem, index) {


            /* ------------------------------------------
               TẠO CIRCLE
            ------------------------------------------ */

            const circle =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );


            circle.setAttribute(
                "cx",
                diem.x
            );

            circle.setAttribute(
                "cy",
                diem.y
            );

            circle.setAttribute(
                "r",
                "4"
            );

            circle.setAttribute(
                "class",
                "diem-bieu-do"
            );


            nhomDiemBieuDo.appendChild(
                circle
            );


            /* ------------------------------------------
               NHÃN ĐIỂM
            ------------------------------------------ */

            const nhan =
                document.createElement(
                    "span"
                );


            nhan.className =
                "gia-tri-diem";


            nhan.textContent =
                diem.diem.toFixed(2);


            nhan.style.left =
                (
                    diem.x /
                    rong *
                    100
                ) + "%";


            nhan.style.top =
                (
                    diem.y /
                    cao *
                    100
                ) + "%";


            nhanDiemBieuDo.appendChild(
                nhan
            );


            /* ------------------------------------------
               NHÃN HỌC KỲ
            ------------------------------------------ */

            const nhanHocKyItem =
                document.createElement(
                    "div"
                );


            nhanHocKyItem.className =
                "nhan-hoc-ky-item";


            nhanHocKyItem.innerHTML = `
                ${diem.hocKy}<br>
                ${diem.namHoc}
            `;


            nhanHocKyItem.style.position =
                "absolute";


            nhanHocKyItem.style.left =
                (
                    diem.x /
                    rong *
                    100
                ) + "%";


            nhanHocKy.appendChild(
                nhanHocKyItem
            );

        }
    );

}


/* ======================================================
   KHỞI TẠO
====================================================== */

taoBieuDoDiemTrungBinh();


/* ======================================================
   VẼ LẠI KHI THAY ĐỔI KÍCH THƯỚC
====================================================== */

window.addEventListener(
    "resize",
    function () {

        taoBieuDoDiemTrungBinh();

    }
);


/* ======================================================
   NÚT XEM CHI TIẾT
====================================================== */

const nutXemChiTietXuHuong =
    document.getElementById(
        "nut-xem-chi-tiet-xu-huong"
    );


if (nutXemChiTietXuHuong) {

    nutXemChiTietXuHuong.addEventListener(
        "click",
        function () {

            console.log(
                "Xem chi tiết xu hướng điểm trung bình"
            );

        }
    );

}

/* ======================================================
   PHẦN 6: PHÂN BỐ MỨC ĐỘ NGUY CƠ
====================================================== */


/* ======================================================
   DỮ LIỆU
====================================================== */

const duLieuMucDoNguyCo = {

    tongSo: 256,

    nguyCoThap: 152,

    nguyCoTrungBinh: 86,

    nguyCoCao: 18

};


/* ======================================================
   LẤY PHẦN TỬ
====================================================== */

const donutNguyCoThap =
    document.getElementById(
        "donut-nguy-co-thap"
    );

const donutNguyCoTrungBinh =
    document.getElementById(
        "donut-nguy-co-trung-binh"
    );

const donutNguyCoCao =
    document.getElementById(
        "donut-nguy-co-cao"
    );

const tongSinhVienNguyCo =
    document.getElementById(
        "tong-sinh-vien-nguy-co"
    );


/* ======================================================
   TẠO DONUT
====================================================== */

function taoBieuDoNguyCo() {

    if (
        !donutNguyCoThap ||
        !donutNguyCoTrungBinh ||
        !donutNguyCoCao
    ) {

        return;

    }


    const tong =
        duLieuMucDoNguyCo.tongSo;


    /*
       Chu vi vòng tròn

       C = 2 × π × r
    */

    const banKinh = 72;

    const chuVi =
        2 *
        Math.PI *
        banKinh;


    /* ==================================================
       TÍNH TỶ LỆ
    ================================================== */

    const tyLeThap =
        duLieuMucDoNguyCo.nguyCoThap /
        tong;


    const tyLeTrungBinh =
        duLieuMucDoNguyCo.nguyCoTrungBinh /
        tong;


    const tyLeCao =
        duLieuMucDoNguyCo.nguyCoCao /
        tong;


    /* ==================================================
       ĐỘ DÀI TỪNG PHẦN
    ================================================== */

    const doDaiThap =
        chuVi * tyLeThap;


    const doDaiTrungBinh =
        chuVi * tyLeTrungBinh;


    const doDaiCao =
        chuVi * tyLeCao;


    /* ==================================================
       CÀI DASH
    ================================================== */

    donutNguyCoThap.style.strokeDasharray =
        `${doDaiThap} ${chuVi}`;

    donutNguyCoThap.style.strokeDashoffset =
        0;


    donutNguyCoTrungBinh.style.strokeDasharray =
        `${doDaiTrungBinh} ${chuVi}`;

    donutNguyCoTrungBinh.style.strokeDashoffset =
        -doDaiThap;


    donutNguyCoCao.style.strokeDasharray =
        `${doDaiCao} ${chuVi}`;

    donutNguyCoCao.style.strokeDashoffset =
        -(
            doDaiThap +
            doDaiTrungBinh
        );


    /* ==================================================
       HIỂN THỊ TỔNG
    ================================================== */

    if (tongSinhVienNguyCo) {

        tongSinhVienNguyCo.textContent =
            tong;

    }

}


/* ======================================================
   KHỞI TẠO
====================================================== */

taoBieuDoNguyCo();


/* ======================================================
   NÚT XEM CHI TIẾT
====================================================== */

const nutXemChiTietNguyCo =
    document.getElementById(
        "nut-xem-chi-tiet-nguy-co"
    );


if (nutXemChiTietNguyCo) {

    nutXemChiTietNguyCo.addEventListener(
        "click",
        function () {

            console.log(
                "Xem chi tiết phân bố mức độ nguy cơ"
            );

        }
    );

}

/* ======================================================
   PHẦN 7: KẾT QUẢ THEO HỌC PHẦN
====================================================== */


/* ======================================================
   DỮ LIỆU 5 HỌC PHẦN
====================================================== */

const duLieuHocPhan = [

    {
        stt: 1,

        ten:
            "Cấu trúc dữ liệu và giải thuật",

        soSinhVien: 256,

        diemTrungBinh: 7.45,

        tyLeDat: 91.41,

        nguyCoCao: 10,

        tyLeNguyCo: 3.91
    },


    {
        stt: 2,

        ten:
            "Cơ sở dữ liệu",

        soSinhVien: 256,

        diemTrungBinh: 7.12,

        tyLeDat: 84.77,

        nguyCoCao: 14,

        tyLeNguyCo: 5.47
    },


    {
        stt: 3,

        ten:
            "Lập trình hướng đối tượng",

        soSinhVien: 256,

        diemTrungBinh: 7.68,

        tyLeDat: 93.36,

        nguyCoCao: 8,

        tyLeNguyCo: 3.13
    },


    {
        stt: 4,

        ten:
            "Hệ điều hành",

        soSinhVien: 256,

        diemTrungBinh: 6.85,

        tyLeDat: 81.25,

        nguyCoCao: 18,

        tyLeNguyCo: 7.03
    },


    {
        stt: 5,

        ten:
            "Mạng máy tính",

        soSinhVien: 256,

        diemTrungBinh: 6.33,

        tyLeDat: 72.66,

        nguyCoCao: 22,

        tyLeNguyCo: 8.59
    }

];


/* ======================================================
   TẠO BẢNG
====================================================== */

function taoBangHocPhan() {

    const khuVucDuLieu =
        document.getElementById(
            "du-lieu-hoc-phan"
        );


    if (!khuVucDuLieu) {

        return;

    }


    khuVucDuLieu.innerHTML = "";


    /* ================================================
       DUYỆT 5 HỌC PHẦN
    ================================================= */

    duLieuHocPhan.forEach(
        function (hocPhan) {


            const dong =
                document.createElement("tr");


            /* ==========================================
               TẠO DÒNG
            =========================================== */

            dong.innerHTML = `

                <!-- STT -->

                <td class="o-stt">
                    ${hocPhan.stt}
                </td>


                <!-- HỌC PHẦN -->

                <td
                    class="ten-hoc-phan"
                    title="${hocPhan.ten}"
                >
                    ${hocPhan.ten}
                </td>


                <!-- SỐ SINH VIÊN -->

                <td class="o-so-sinh-vien">
                    ${hocPhan.soSinhVien}
                </td>


                <!-- ĐIỂM TRUNG BÌNH -->

                <td class="o-diem-trung-binh">
                    ${hocPhan.diemTrungBinh.toFixed(2)}
                </td>


                <!-- TỶ LỆ ĐẠT -->

                <td>

                    <div class="o-ty-le-dat">

                        <span class="phan-tram-dat">
                            ${hocPhan.tyLeDat.toFixed(2)}%
                        </span>

                        <div class="thanh-tien-trinh">

                            <div
                                class="gia-tri-tien-trinh"
                                style="
                                    width:
                                    ${hocPhan.tyLeDat}%;
                                "
                            ></div>

                        </div>

                    </div>

                </td>


                <!-- NGUY CƠ CAO -->

                <td>

                    <div class="o-nguy-co-cao">

                        <span
                            class="so-nguy-co-cao"
                        >
                            ${hocPhan.nguyCoCao}
                        </span>

                        <span
                            class="ty-le-nguy-co-cao"
                        >
                            (${hocPhan.tyLeNguyCo.toFixed(2)}%)
                        </span>

                    </div>

                </td>

            `;


            khuVucDuLieu.appendChild(
                dong
            );

        }
    );

}


/* ======================================================
   KHỞI TẠO BẢNG
====================================================== */

taoBangHocPhan();


/* ======================================================
   NÚT XEM TẤT CẢ
====================================================== */

const nutXemTatCaHocPhan =
    document.getElementById(
        "nut-xem-tat-ca-hoc-phan"
    );


const nutXemTatCaDuoi =
    document.getElementById(
        "nut-xem-tat-ca-duoi"
    );


/* ======================================================
   HÀM XỬ LÝ XEM TẤT CẢ
====================================================== */

function xuLyXemTatCaHocPhan() {

    console.log(
        "Đang mở danh sách tất cả học phần..."
    );

}


/* ======================================================
   GÁN SỰ KIỆN
====================================================== */

if (nutXemTatCaHocPhan) {

    nutXemTatCaHocPhan.addEventListener(
        "click",
        xuLyXemTatCaHocPhan
    );

}


if (nutXemTatCaDuoi) {

    nutXemTatCaDuoi.addEventListener(
        "click",
        xuLyXemTatCaHocPhan
    );

}

/* ======================================================
   PHẦN 8: DANH SÁCH BÁO CÁO ĐÃ TẠO
====================================================== */


/* ======================================================
   DỮ LIỆU BÁO CÁO
====================================================== */

const duLieuBaoCao = [

    {
        id: 1,

        loai: "excel",

        ten:
            "Báo cáo tổng hợp lớp",

        hocKy:
            "HK 2 (2023 - 2024) - CNTT01",

        ngay:
            "10/05/2024",

        gio:
            "14:30"
    },


    {
        id: 2,

        loai: "word",

        ten:
            "Báo cáo cảnh báo nguy cơ",

        hocKy:
            "HK 2 (2023 - 2024) - CNTT01",

        ngay:
            "10/05/2024",

        gio:
            "14:28"
    },


    {
        id: 3,

        loai: "excel",

        ten:
            "Báo cáo theo học phần",

        hocKy:
            "HK 2 (2023 - 2024) - CNTT01",

        ngay:
            "09/05/2024",

        gio:
            "09:15"
    },


    {
        id: 4,

        loai: "pdf",

        ten:
            "Báo cáo so sánh học kỳ",

        hocKy:
            "HK 1 & HK 2 (2023 - 2024) - CNTT01",

        ngay:
            "09/05/2024",

        gio:
            "16:45"
    }

];


/* ======================================================
   LẤY ICON THEO LOẠI
====================================================== */

function layIconBaoCao(loai) {

    if (loai === "excel") {

        return {
            classIcon: "icon-excel",
            icon:
                "fa-solid fa-file-excel"
        };

    }


    if (loai === "word") {

        return {
            classIcon: "icon-word",
            icon:
                "fa-solid fa-file-word"
        };

    }


    if (loai === "pdf") {

        return {
            classIcon: "icon-pdf",
            icon:
                "fa-solid fa-file-pdf"
        };

    }


    return {
        classIcon: "icon-bao-cao",
        icon:
            "fa-solid fa-file-lines"
    };

}


/* ======================================================
   TẠO DANH SÁCH BÁO CÁO
====================================================== */

function taoDanhSachBaoCao() {

    const khuVuc =
        document.getElementById(
            "danh-sach-bao-cao"
        );


    if (!khuVuc) {

        return;

    }


    khuVuc.innerHTML = "";


    duLieuBaoCao.forEach(
        function (baoCao) {


            const thongTinIcon =
                layIconBaoCao(
                    baoCao.loai
                );


            /* ==========================================
               TẠO DÒNG
            =========================================== */

            const dong =
                document.createElement(
                    "div"
                );


            dong.className =
                "mot-bao-cao";


            dong.innerHTML = `

                <!-- ICON -->

                <div
                    class="
                        bieu-tuong-bao-cao
                        ${thongTinIcon.classIcon}
                    "
                >

                    <i
                        class="${thongTinIcon.icon}"
                    ></i>

                </div>


                <!-- THÔNG TIN -->

                <div
                    class="thong-tin-bao-cao"
                >

                    <div
                        class="ten-bao-cao"
                        title="${baoCao.ten}"
                    >
                        ${baoCao.ten}
                    </div>


                    <div
                        class="thoi-gian-bao-cao"
                    >

                        <i
                            class="fa-regular fa-clock"
                        ></i>

                        <span>
                            ${baoCao.hocKy}
                        </span>

                    </div>

                </div>


                <!-- NGÀY GIỜ -->

                <div
                    class="thong-tin-bao-cao"
                    style="
                        flex: 0 0 82px;
                        align-items: flex-end;
                    "
                >

                    <div
                        class="thoi-gian-bao-cao"
                    >

                        <span>
                            ${baoCao.ngay}
                        </span>

                    </div>


                    <div
                        class="thoi-gian-bao-cao"
                    >

                        <span>
                            ${baoCao.gio}
                        </span>

                    </div>

                </div>


                <!-- TẢI XUỐNG -->

                <button
                    type="button"
                    class="nut-tai-bao-cao"
                    data-id="${baoCao.id}"
                    title="Tải báo cáo"
                >

                    <i
                        class="fa-solid fa-download"
                    ></i>

                </button>

            `;


            khuVuc.appendChild(
                dong
            );

        }
    );

}


/* ======================================================
   XỬ LÝ TẢI BÁO CÁO
====================================================== */

function xuLyTaiBaoCao(nut) {

    if (!nut) {

        return;

    }


    nut.classList.add(
        "dang-tai"
    );


    const icon =
        nut.querySelector("i");


    if (icon) {

        icon.className =
            "fa-solid fa-spinner";

    }


    setTimeout(
        function () {

            nut.classList.remove(
                "dang-tai"
            );


            if (icon) {

                icon.className =
                    "fa-solid fa-check";

            }


            setTimeout(
                function () {

                    if (icon) {

                        icon.className =
                            "fa-solid fa-download";

                    }

                },
                1200
            );


            console.log(
                "Đã yêu cầu tải báo cáo:",
                nut.dataset.id
            );

        },
        800
    );

}


/* ======================================================
   GÁN SỰ KIỆN CHO NÚT TẢI
====================================================== */

function ganSuKienTaiBaoCao() {

    const cacNutTai =
        document.querySelectorAll(
            ".nut-tai-bao-cao"
        );


    cacNutTai.forEach(
        function (nut) {

            nut.addEventListener(
                "click",
                function () {

                    xuLyTaiBaoCao(
                        nut
                    );

                }
            );

        }
    );

}


/* ======================================================
   NÚT XEM TẤT CẢ
====================================================== */

const nutXemTatCaBaoCao =
    document.getElementById(
        "nut-xem-tat-ca-bao-cao"
    );


if (nutXemTatCaBaoCao) {

    nutXemTatCaBaoCao.addEventListener(
        "click",
        function () {

            console.log(
                "Đang mở danh sách tất cả báo cáo..."
            );

        }
    );

}


/* ======================================================
   KHỞI TẠO
====================================================== */

taoDanhSachBaoCao();

ganSuKienTaiBaoCao();