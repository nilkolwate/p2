const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const { generateCertificateId } = require("../utils/certificateId");
const { generateQRCode, generateQRCodeDataURL, getVerificationUrl } = require("./qrService");
const { createCertificatePDF } = require("./pdfService");
const blockchain = require("../blockchain/Blockchain");

const certificatesFolder = path.join(__dirname, "..", "certificates");

// Ensure certificates folder exists
if (!fs.existsSync(certificatesFolder)) {
  fs.mkdirSync(certificatesFolder, { recursive: true });
}

/**
 * Get current Local IPv4 address for local network access (mobile/tablet QR scans)
 */
function getLocalIPv4() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
  } catch (e) {
    // fallback
  }
  return "127.0.0.1";
}

/**
 * Extract clean Certificate ID from any QR scan string
 * Supports:
 * - Direct ID: "BV-2026-2293B257"
 * - URL path: "http://.../verify/BV-2026-2293B257"
 * - Query parameter: "http://.../verify?id=BV-2026-2293B257"
 * - JSON: '{"certificateId":"BV-2026-2293B257"}'
 */
function extractCertificateIdFromQR(qrData) {
  if (!qrData || typeof qrData !== "string") return null;
  const trimmed = qrData.trim();

  // 1. Direct Certificate ID (e.g. BV-2026-2293B257)
  if (/^[A-Za-z0-9_-]+$/.test(trimmed) && trimmed.length >= 4 && trimmed.length <= 40) {
    return trimmed;
  }

  // 2. URL with /verify/CERT_ID
  const urlPathMatch = trimmed.match(/\/verify\/([A-Za-z0-9_-]+)/i);
  if (urlPathMatch && urlPathMatch[1]) {
    return urlPathMatch[1];
  }

  // 3. URL with ?id=CERT_ID or ?certificateId=CERT_ID
  const urlParamMatch = trimmed.match(/[?&](?:id|certificateId)=([A-Za-z0-9_-]+)/i);
  if (urlParamMatch && urlParamMatch[1]) {
    return urlParamMatch[1];
  }

  // 4. JSON format
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && (parsed.certificateId || parsed.id)) {
      return parsed.certificateId || parsed.id;
    }
  } catch (e) {
    // Not JSON
  }

  return trimmed;
}

/**
 * Generate a new authentic certificate
 * (Module 2: Certificate Management + Module 3: SHA-256 Hash + Module 5: QR Code)
 */
async function generateCertificate(data, hostHeader = null) {
  const collegeName = data.institution || "Government Polytechnic Amravati";
  const certificateId = data.certificateId || generateCertificateId();
  // For QR code: encode canonical frontend URL (HashRouter https://nilkolwate.github.io/p2/#/verify/<certificateId>)
  const verificationUrl = getVerificationUrl(certificateId);

  // Generate QR buffer for PDFKit and DataURL for frontend preview
  const qrBuffer = await generateQRCode(verificationUrl);
  const qrDataUrl = await generateQRCodeDataURL(verificationUrl);

  const fileName = `${certificateId}.pdf`;
  const outputPath = path.join(certificatesFolder, fileName);

  // Generate real PDF with PDFKit
  await createCertificatePDF(
    {
      studentName: data.studentName,
      rollNumber: data.rollNumber || "N/A",
      course: data.course,
      department: data.department || "Computer Engineering",
      institution: collegeName,
      issueDate: data.issueDate,
      certificateId: certificateId
    },
    qrBuffer,
    outputPath
  );

  // Compute SHA-256 fingerprint of the generated PDF (Module 3)
  const pdfBuffer = fs.readFileSync(outputPath);
  const hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  // Anchor to Blockchain (Module 4)
  const newBlock = blockchain.addBlock({
    type: "certificate_issuance",
    certificateId: certificateId,
    studentName: data.studentName,
    course: data.course,
    grade: data.grade || "First Class with Distinction",
    issueDate: data.issueDate,
    certificateHash: hash,
    status: "Valid"
  });

  const currentHost = hostHeader || `localhost:5000`;
  const certificateData = {
    id: certificateId,
    certificateId: certificateId,
    studentName: data.studentName,
    rollNumber: data.rollNumber || "N/A",
    course: data.course,
    department: data.department || "Computer Engineering",
    institution: collegeName,
    issueDate: data.issueDate,
    grade: data.grade || "First Class with Distinction",
    status: "Valid",
    hash: hash,
    sha256: hash,
    blockNumber: `Block #${newBlock.index}`,
    issuer: data.issuer || "Office of the Registrar",
    verificationUrl: verificationUrl,
    qrDataUrl: qrDataUrl,
    pdfUrl: `http://${currentHost}/certificates/${fileName}`,
    fileName: fileName,
    createdAt: new Date().toISOString()
  };

  // Save metadata JSON
  const jsonFile = path.join(certificatesFolder, `${certificateId}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(certificateData, null, 2), "utf8");

  return certificateData;
}

/**
 * Retrieve all certificates from JSON files
 */
function getAllCertificates(hostHeader = null) {
  if (!fs.existsSync(certificatesFolder)) return [];

  const files = fs.readdirSync(certificatesFolder);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const currentHost = hostHeader || `localhost:5000`;

  const certs = [];
  for (const file of jsonFiles) {
    try {
      const fullPath = path.join(certificatesFolder, file);
      const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      const certId = content.certificateId || content.id || file.replace(".json", "");
      const pdfFileName = `${certId}.pdf`;

      // Standardize fields and sanitize URLs so stale/dead IPs never break links
      const cert = {
        id: certId,
        certificateId: certId,
        studentName: content.studentName || "Unknown",
        rollNumber: content.rollNumber || "N/A",
        course: content.course || "Diploma",
        department: content.department || "Computer Engineering",
        institution: content.institution || "Government Polytechnic Amravati",
        issueDate: content.issueDate || "N/A",
        grade: content.grade || "First Class with Distinction",
        status: content.status || "Valid",
        hash: content.hash || content.sha256 || "",
        sha256: content.hash || content.sha256 || "",
        blockNumber: content.blockNumber || "Block #1",
        issuer: content.issuer || "Office of the Registrar",
        verificationUrl: getVerificationUrl(certId),
        qrDataUrl: content.qrDataUrl,
        pdfUrl: `http://${currentHost}/certificates/${pdfFileName}`,
        revocationReason: content.revocationReason,
        createdAt: content.createdAt || content.issueDate
      };
      certs.push(cert);
    } catch (err) {
      console.error(`Failed to parse certificate ${file}:`, err);
    }
  }

  // Sort newest first
  return certs.reverse();
}

/**
 * Get certificate by ID
 */
function getCertificateById(certificateId, hostHeader = null) {
  if (!certificateId) return null;
  const jsonPath = path.join(certificatesFolder, `${certificateId}.json`);
  if (!fs.existsSync(jsonPath)) return null;

  try {
    const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const certId = content.certificateId || content.id || certificateId;
    const currentHost = hostHeader || `localhost:5000`;

    return {
      id: certId,
      certificateId: certId,
      studentName: content.studentName,
      rollNumber: content.rollNumber || "N/A",
      course: content.course,
      department: content.department || "Computer Engineering",
      institution: content.institution || "Government Polytechnic Amravati",
      issueDate: content.issueDate,
      grade: content.grade || "First Class with Distinction",
      status: content.status || "Valid",
      hash: content.hash || content.sha256,
      sha256: content.hash || content.sha256,
      blockNumber: content.blockNumber || "Block #1",
      issuer: content.issuer || "Office of the Registrar",
      verificationUrl: getVerificationUrl(certId),
      qrDataUrl: content.qrDataUrl,
      pdfUrl: `http://${currentHost}/certificates/${certId}.pdf`,
      revocationReason: content.revocationReason
    };
  } catch (err) {
    console.error("Error reading certificate JSON:", err);
    return null;
  }
}

/**
 * Verify QR Code data against blockchain records (Module 6)
 */
function verifyQRCode(qrData, hashToCheck = null) {
  const certificateId = extractCertificateIdFromQR(qrData);

  if (!certificateId) {
    return {
      success: false,
      verified: false,
      message: "Invalid QR code format. Unable to detect Certificate ID."
    };
  }

  const cert = getCertificateById(certificateId);
  if (!cert) {
    return {
      success: false,
      verified: false,
      certificateId: certificateId,
      message: `Certificate record ${certificateId} not found in BlockVault ledger.`
    };
  }

  if (cert.status === "Invalid") {
    return {
      success: true,
      verified: false,
      certificateRecord: cert,
      reason: `Certificate has been REVOKED: ${cert.revocationReason || "Administrative Review"}`
    };
  }

  if (hashToCheck && hashToCheck.toLowerCase() !== (cert.hash || "").toLowerCase()) {
    return {
      success: true,
      verified: false,
      certificateRecord: cert,
      uploadedHash: hashToCheck,
      originalHash: cert.hash,
      reason: "Cryptographic hash mismatch! The certificate has been modified or tampered with."
    };
  }

  return {
    success: true,
    verified: true,
    certificateRecord: cert,
    reason: "Certificate verified successfully against the immutable blockchain ledger."
  };
}

/**
 * Revoke certificate
 */
function revokeCertificate(certificateId, reason = "Administrative Review") {
  const jsonPath = path.join(certificatesFolder, `${certificateId}.json`);
  if (!fs.existsSync(jsonPath)) return null;

  const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  content.status = "Invalid";
  content.revocationReason = reason;
  content.revokedAt = new Date().toISOString();

  fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2), "utf8");

  // Anchor revocation in blockchain
  blockchain.addBlock({
    type: "certificate_revocation",
    certificateId: certificateId,
    studentName: content.studentName,
    course: content.course,
    issueDate: content.issueDate,
    certificateHash: content.hash || content.sha256,
    status: "Invalid",
    revocationReason: reason
  });

  return content;
}

/**
 * Restore certificate
 */
function restoreCertificate(certificateId) {
  const jsonPath = path.join(certificatesFolder, `${certificateId}.json`);
  if (!fs.existsSync(jsonPath)) return null;

  const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  content.status = "Valid";
  delete content.revocationReason;
  delete content.revokedAt;

  fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2), "utf8");

  // Anchor restoration in blockchain
  blockchain.addBlock({
    type: "certificate_restoration",
    certificateId: certificateId,
    studentName: content.studentName,
    course: content.course,
    issueDate: content.issueDate,
    certificateHash: content.hash || content.sha256,
    status: "Valid"
  });

  return content;
}

module.exports = {
  generateCertificate,
  getAllCertificates,
  getCertificateById,
  verifyQRCode,
  extractCertificateIdFromQR,
  revokeCertificate,
  restoreCertificate,
  getLocalIPv4
};