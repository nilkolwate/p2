const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blockvault"
});

db.connect(function(err) {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("Database connected");
    }
});

module.exports = db;