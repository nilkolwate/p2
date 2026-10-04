const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blockvault"
});

function verifyCertificate(id, callback) {
    const sql = "SELECT * FROM certificates WHERE certificate_id = ?";
    db.query(sql, [id], function(err, result) {
        if (err || result.length === 0) {
            callback("Certificate not found or invalid");
            return;
        }
        callback("Certificate is genuine");
    });
}

function getCertificate(id, callback) {
    const sql = "SELECT * FROM certificates WHERE certificate_id = ?";
    db.query(sql, [id], function(err, result) {
        if (err || result.length === 0) {
            callback(null);
            return;
        }
        callback(result[0]);
    });
}

module.exports = { verifyCertificate, getCertificate };