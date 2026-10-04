const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blockvault"
});

function revokeCertificate(id, callback) {
    const sql = "UPDATE certificates SET status = 'REVOKED' WHERE certificate_id = ?";
    db.query(sql, [id], function(err, result) {
        if (err) {
            console.log("Revoke failed:", err);
            callback("Failed to revoke certificate");
            return;
        }
        callback("Certificate revoked successfully");
    });
}

module.exports = revokeCertificate;