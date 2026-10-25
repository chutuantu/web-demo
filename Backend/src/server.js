const app = require("./app");
const { ketNoiDatabase } = require("./config/database");

const PORT = 3000;

async function khoiDongServer() {
    try {
        await ketNoiDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Không thể khởi động server.");
        process.exit(1);
    }
}

khoiDongServer();