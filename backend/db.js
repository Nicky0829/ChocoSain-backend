const mysql = require("mysql");

const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

conexion.connect((err) => {
    if (err) {
        console.log("Error:", err);
    } else {
        console.log("Conectado a MySQL en la nube 🟢");
    }
});

module.exports = conexion;