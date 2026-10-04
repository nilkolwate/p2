const crypto = require("crypto");
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blockvault"
});

function createHash(data) {
    return crypto
        .createHash("sha256")
        .update(data)
        .digest("hex");
}

function addBlock(certificate_id, action, data, previous_hash, callback) {

    const data_hash = createHash(data);

    const blockData =
        certificate_id +
        action +
        data +
        previous_hash;

    const block_hash = createHash(blockData);

    const sql = `
        INSERT INTO blockchain
        (certificate_id, action, data_hash, previous_hash, block_hash)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            certificate_id,
            action,
            data_hash,
            previous_hash,
            block_hash
        ],
        function(err, result) {

            if (err) {
                console.log("Blockchain record failed:", err);
                return;
            }

            console.log("Blockchain record added successfully");
            console.log("Block ID:", result.insertId);

            if (callback) {
                callback(result.insertId);
            }
        }
    );
}

module.exports = {
    addBlock,
    createHash
};