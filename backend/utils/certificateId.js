const crypto = require("crypto");

function generateCertificateId() {
  const year = new Date().getFullYear();

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `BV-${year}-${randomPart}`;
}

module.exports = {
  generateCertificateId
};