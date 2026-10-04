const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blockvault"
});

function getBlockchain(callback) {

    const sql = "SELECT * FROM blockchain ORDER BY block_id ASC";

    db.query(sql, function(err, result) {

        if (err) {
            console.log("Blockchain fetch failed:", err);
            callback(null);
            return;
        }

        callback(result);
    });
}

module.exports = getBlockchain;