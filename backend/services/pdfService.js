const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function createCertificatePDF(data, qrBuffer, outputPath) {

  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0
    });

    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    const W = doc.page.width;
    const H = doc.page.height;

    // =====================================================
    // BACKGROUND
    // =====================================================

    doc.rect(0, 0, W, H)
      .fill("#ffffff");

    // Outer border
    doc.lineWidth(3)
      .strokeColor("#1261a0")
      .rect(18, 18, W - 36, H - 36)
      .stroke();

    // Inner border
    doc.lineWidth(1)
      .strokeColor("#6da3cf")
      .rect(32, 32, W - 64, H - 64)
      .stroke();


    // =====================================================
    // COLLEGE LOGO
    // =====================================================

    const logoPath = path.join(
      __dirname,
      "..",
      "assets",
      "gp-logo.png"
    );

    console.log(
      "Logo:",
      logoPath,
      fs.existsSync(logoPath)
    );

    if (fs.existsSync(logoPath)) {

      doc.image(
        logoPath,
        105,
        45,
        {
          fit: [80, 80],
          align: "center",
          valign: "center"
        }
      );

    } else {

      console.log(
        "Logo not found:",
        logoPath
      );

    }


    // =====================================================
    // COLLEGE NAME
    // =====================================================

    doc.font("Helvetica-Bold")
      .fontSize(27)
      .fillColor("#14579c")
      .text(
        "GOVERNMENT POLYTECHNIC AMRAVATI",
        190,
        64,
        {
          width: W - 250,
          align: "center"
        }
      );


    // =====================================================
    // TAGLINE
    // =====================================================

    doc.font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text(
        "LEARN · GROW · ACHIEVE",
        190,
        101,
        {
          width: W - 250,
          align: "center"
        }
      );


    // =====================================================
    // CERTIFICATE TITLE
    // =====================================================

    doc.font("Helvetica-Bold")
      .fontSize(34)
      .fillColor("#14579c")
      .text(
        "CERTIFICATE",
        0,
        125,
        {
          width: W,
          align: "center"
        }
      );


    doc.font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#333333")
      .text(
        "OF ACHIEVEMENT",
        0,
        166,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // DECORATIVE LINES
    // =====================================================

    doc.lineWidth(1)
      .strokeColor("#14579c");

    doc.moveTo(145, 177)
      .lineTo(335, 177)
      .stroke();

    doc.moveTo(W - 335, 177)
      .lineTo(W - 145, 177)
      .stroke();


    // =====================================================
    // CERTIFICATE ID
    // =====================================================

    doc.font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#333333")
      .text(
        "Certificate ID:",
        70,
        205
      );

    doc.font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text(
        data.certificateId || "",
        140,
        205
      );


    // =====================================================
    // ISSUE DATE
    // =====================================================

    doc.font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#333333")
      .text(
        "Issue Date:",
        W - 270,
        205
      );

    doc.font("Helvetica")
      .fontSize(9)
      .fillColor("#333333")
      .text(
        data.issueDate || "",
        W - 205,
        205
      );


    // =====================================================
    // CERTIFICATE BODY
    // =====================================================

    doc.font("Helvetica")
      .fontSize(12)
      .fillColor("#333333")
      .text(
        "This is to certify that",
        0,
        245,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // STUDENT NAME
    // =====================================================

    doc.font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#14579c")
      .text(
        data.studentName || "",
        0,
        275,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // ROLL NUMBER
    // =====================================================

    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("#333333")
      .text(
        `Roll Number: ${data.rollNumber || ""}`,
        0,
        310,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // COURSE TEXT
    // =====================================================

    doc.font("Helvetica")
      .fontSize(13)
      .fillColor("#333333")
      .text(
        "has successfully completed the course",
        0,
        342,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // COURSE NAME
    // =====================================================

    doc.font("Helvetica-Bold")
      .fontSize(25)
      .fillColor("#14579c")
      .text(
        data.course || "",
        0,
        370,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // DEPARTMENT
    // =====================================================

    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("#333333")
      .text(
        `Department: ${data.department || ""}`,
        0,
        405,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // QR CODE
    // =====================================================

    if (qrBuffer) {

      doc.image(
        qrBuffer,
        W - 185,
        285,
        {
          width: 105,
          height: 105
        }
      );

      doc.font("Helvetica")
        .fontSize(8)
        .fillColor("#555555")
        .text(
          "Scan to Verify Certificate",
          W - 205,
          395,
          {
            width: 145,
            align: "center"
          }
        );

    }


    // =====================================================
    // HOD SIGNATURE
    // =====================================================

    const hodSignaturePath = path.join(
      __dirname,
      "..",
      "assets",
      "hod-signature.png"
    );

    console.log(
      "HOD signature:",
      hodSignaturePath,
      fs.existsSync(hodSignaturePath)
    );


    // HOD signature line
    doc.lineWidth(1)
      .strokeColor("#14579c");

    doc.moveTo(75, 515)
      .lineTo(250, 515)
      .stroke();


    // HOD signature image
    if (fs.existsSync(hodSignaturePath)) {

      doc.image(
        hodSignaturePath,
        105,
        455,
        {
          width: 115,
          height: 55
        }
      );

    } else {

      console.log(
        "ERROR: HOD signature NOT FOUND:",
        hodSignaturePath
      );

    }


    // HOD text
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#333333")
      .text(
        "HoD",
        75,
        523,
        {
          width: 175,
          align: "center"
        }
      );


    // =====================================================
    // PRINCIPAL SIGNATURE
    // =====================================================

    const principalSignaturePath = path.join(
      __dirname,
      "..",
      "assets",
      "principal-signature.png"
    );

    console.log(
      "Principal signature:",
      principalSignaturePath,
      fs.existsSync(principalSignaturePath)
    );


    // Principal signature line
    doc.lineWidth(1)
      .strokeColor("#14579c");

    doc.moveTo(W - 250, 515)
      .lineTo(W - 75, 515)
      .stroke();


    // Principal signature image
    if (fs.existsSync(principalSignaturePath)) {

      doc.image(
        principalSignaturePath,
        W - 220,
        455,
        {
          width: 115,
          height: 55
        }
      );

    } else {

      console.log(
        "ERROR: Principal signature NOT FOUND:",
        principalSignaturePath
      );

    }


    // Principal text
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#333333")
      .text(
        "Principal",
        W - 250,
        523,
        {
          width: 175,
          align: "center"
        }
      );


    // =====================================================
    // FOOTER
    // =====================================================

    doc.font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#397cae")
      .text(
        "BLOCKVAULT",
        0,
        H - 50,
        {
          width: W,
          align: "center"
        }
      );


    doc.font("Helvetica")
      .fontSize(8)
      .fillColor("#555555")
      .text(
        "Blockchain Based Certificate Verification System",
        0,
        H - 36,
        {
          width: W,
          align: "center"
        }
      );


    // =====================================================
    // FINISH PDF
    // =====================================================

    doc.end();


    stream.on(
      "finish",
      () => {

        console.log(
          "PDF created successfully:",
          outputPath
        );

        resolve(outputPath);

      }
    );


    stream.on(
      "error",
      (error) => {

        reject(error);

      }
    );

  });
}


module.exports = {
  createCertificatePDF
};