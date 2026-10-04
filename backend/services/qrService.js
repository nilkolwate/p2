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

module.exports = {
  generateQRCode,
  generateQRCodeDataURL
};