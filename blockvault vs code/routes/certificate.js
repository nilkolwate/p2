const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blockvault"
});

function addCertificate(student_id, certificate_name, issue_date) {

    const sql = "INSERT INTO certificates (student_id, certificate_name, issue_date) VALUES (?, ?, ?)";

    db.query(sql, [student_id, certificate_name, issue_date], function(err, result) {

        if (err) {
            console.log("Certificate creation failed:", err);
            return;
        }

        console.log("Certificate created, ID:", result.insertId);
    });
}

module.exports = addCertificate;