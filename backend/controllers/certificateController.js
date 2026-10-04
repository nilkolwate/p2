const certificateService = require("../services/certificateService");

/**
 * Generate a new digital certificate (Module 2, 3, 5)
 */
const generateCertificate = async (req, res) => {
  try {
    const {
      studentName,
      rollNumber,
      course,
      department,
      issueDate,
      grade,
      institution
    } = req.body;

    if (!studentName || !course) {
      return res.status(400).json({
        success: false,
        message: "Student name and course are required."
      });
    }

    const host = req.get("host") || "localhost:5000";

    const certificate = await certificateService.generateCertificate(
      {
        studentName,
        rollNumber: rollNumber || `RN-${Math.floor(100 + Math.random() * 900)}`,
        course,
        department: department || "Computer Engineering",
        institution: institution || "Government Polytechnic Amravati",
        issueDate: issueDate || new Date().toISOString().split("T")[0],
        grade: grade || "First Class with Distinction"
      },
      host
    );

    res.status(201).json({
      success: true,
      message: "Certificate generated and anchored successfully.",
      data: certificate
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate certificate.",
      error: error.message
    });
  }
};

/**
 * Get all certificates with dynamic host resolution
 */
const getAllCertificates = (req, res) => {
  try {
    const host = req.get("host") || "localhost:5000";
    const certs = certificateService.getAllCertificates(host);
    res.json({
      success: true,
      count: certs.length,
      data: certs
    });
  } catch (error) {
    console.error("Get all certificates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificates."
    });
  }
};

/**
 * Get certificate by ID
 */
const getCertificateById = (req, res) => {
  try {
    const { certificateId } = req.params;
    const host = req.get("host") || "localhost:5000";
    const cert = certificateService.getCertificateById(certificateId, host);

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate ${certificateId} not found.`
      });
    }

    res.json({
      success: true,
      data: cert
    });
  } catch (error) {
    console.error("Get certificate by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate."
    });
  }
};

/**
 * Revoke certificate
 */
const revokeCertificate = (req, res) => {
  try {
    const { certificateId, reason } = req.body;
    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required."
      });
    }

    const updated = certificateService.revokeCertificate(certificateId, reason);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Certificate ${certificateId} not found.`
      });
    }

    res.json({
      success: true,
      message: `Certificate ${certificateId} revoked successfully.`,
      data: updated
    });
  } catch (error) {
    console.error("Revoke error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke certificate."
    });
  }
};

/**
 * Restore certificate
 */
const restoreCertificate = (req, res) => {
  try {
    const { certificateId, reason } = req.body;
    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required."
      });
    }

    const updated = certificateService.restoreCertificate(certificateId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Certificate ${certificateId} not found.`
      });
    }

    res.json({
      success: true,
      message: `Certificate ${certificateId} restored successfully.`,
      data: updated
    });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore certificate."
    });
  }
};

/**
 * Verify Certificate by ID and/or SHA-256 hash (Module 6)
 */
const verifyCertificate = (req, res) => {
  try {
    const certificateId = req.body.certificateId || req.query.certificateId || req.params.certificateId;
    const hash = req.body.hash || req.query.hash;
    const host = req.get("host") || "localhost:5000";

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Certificate ID is required for verification."
      });
    }

    const cert = certificateService.getCertificateById(certificateId, host);
    if (!cert) {
      return res.status(404).json({
        success: false,
        verified: false,
        certificateId: certificateId,
        message: `Certificate record ${certificateId} not found on the blockchain ledger.`
      });
    }

    if (cert.status === "Invalid") {
      return res.json({
        success: true,
        verified: false,
        certificateRecord: cert,
        reason: `Certificate has been REVOKED: ${cert.revocationReason || "Administrative Review"}`
      });
    }

    if (hash && hash.toLowerCase() !== (cert.hash || "").toLowerCase()) {
      return res.json({
        success: true,
        verified: false,
        certificateRecord: cert,
        uploadedHash: hash,
        originalHash: cert.hash,
        reason: "Cryptographic hash mismatch! The certificate file has been altered or tampered with."
      });
    }

    res.json({
      success: true,
      verified: true,
      certificateRecord: cert,
      reason: "Certificate verified successfully against the immutable blockchain ledger."
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Server verification error."
    });
  }
};

/**
 * Verify QR Code data (Module 5 & 6)
 * Accepts raw ID, URL, or JSON from QR code scan
 */
const verifyQRCode = (req, res) => {
  try {
    const { qrData, hash } = req.body;
    if (!qrData) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Scanned QR code content is required."
      });
    }

    const result = certificateService.verifyQRCode(qrData, hash);
    res.json(result);
  } catch (error) {
    console.error("QR verification error:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Server QR verification error."
    });
  }
};

module.exports = {
  generateCertificate,
  getAllCertificates,
  getCertificateById,
  revokeCertificate,
  restoreCertificate,
  verifyCertificate,
  verifyQRCode
};