const QRCode = require("qrcode");

async function generateQRCode(verificationUrl) {
  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    type: "png",
    width: 300,
    margin: 2,
    errorCorrectionLevel: "H"
  });
  return qrBuffer;
}

async function generateQRCodeDataURL(verificationUrl) {
  return await QRCode.toDataURL(verificationUrl, {
    margin: 2,
    errorCorrectionLevel: "H",
    width: 250
  });
}

/**
 * Returns the canonical frontend verification URL for a certificate.
 * Uses HashRouter format: https://sayalijogi26-alt.github.io/Blockvault-1/#/verify/<certificateId>
 */
function getVerificationUrl(certificateId) {
  const frontendUrl = (process.env.FRONTEND_URL || "https://sayalijogi26-alt.github.io/Blockvault-1").replace(/\/+$/, "");
  return `${frontendUrl}/#/verify/${certificateId}`;
}

module.exports = {
  generateQRCode,
  generateQRCodeDataURL,
  getVerificationUrl
};