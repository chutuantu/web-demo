const sql = require("mssql");
require("dotenv").config();

const cauHinhDatabase = {
    server: process.env.DB_SERVER,

    database: process.env.DB_DATABASE,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    port: Number(process.env.DB_PORT),

    options: {
        encrypt: false,
        trustServerCertificate: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

async function ketNoiDatabase() {
    try {
        pool = await sql.connect(cauHinhDatabase);

        console.log("✅ Kết nối SQL Server thành công!");
        console.log(`📁 Database: ${process.env.DB_DATABASE}`);

        return pool;
    } catch (error) {
        console.error("❌ Kết nối SQL Server thất bại!");
        console.error(error.message);

        throw error;
    }
}

function layPool() {
    if (!pool) {
        throw new Error("Database chưa được kết nối!");
    }

    return pool;
}

module.exports = {
    sql,
    ketNoiDatabase,
    layPool
};