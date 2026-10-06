const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const qrService = require("../services/qrService");
const { createCertificatePDF } = require("../services/pdfService");
const Block = require("../blockchain/Block");
const blockchain = require("../blockchain/Blockchain");

const certsFolder = path.join(__dirname, "..", "certificates");
const ledgerFile = path.join(__dirname, "..", "data", "blockchain_ledger.json");

async function run() {
  console.log("=== Regenerating All Certificates with Live Canonical URL ===");
  const files = fs.readdirSync(certsFolder).filter(f => f.endsWith(".json"));
  const certHashMap = {};

  for (const file of files) {
    const jsonPath = path.join(certsFolder, file);
    const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const certId = content.certificateId || content.id || file.replace(".json", "");
    const pdfPath = path.join(certsFolder, `${certId}.pdf`);

    const canonicalUrl = `https://sayalijogi26-alt.github.io/Blockvault-1/#/verify/${certId}`;
    console.log(`Processing ${certId} -> ${canonicalUrl}`);

    // Generate fresh QR code pointing to https://sayalijogi26-alt.github.io/Blockvault-1/#/verify/<certId>
    const qrBuffer = await qrService.generateQRCode(canonicalUrl);
    const qrDataUrl = await qrService.generateQRCodeDataURL(canonicalUrl);

    // Re-create official PDF
    await createCertificatePDF(
      {
        studentName: content.studentName || "Student",
        rollNumber: content.rollNumber || "N/A",
        course: content.course || "Course",
        department: content.department || "Computer Engineering",
        institution: content.institution || "Government Polytechnic Amravati",
        issueDate: content.issueDate || "2026-10-01",
        certificateId: certId
      },
      qrBuffer,
      pdfPath
    );

    // Compute fresh SHA-256
    const pdfBuffer = fs.readFileSync(pdfPath);
    const hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
    certHashMap[certId] = hash;

    // Update JSON
    content.verificationUrl = canonicalUrl;
    content.qrDataUrl = qrDataUrl;
    content.pdfUrl = `https://blockvault-1.onrender.com/certificates/${certId}.pdf`;
    content.hash = hash;
    content.sha256 = hash;

    fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2), "utf8");
    console.log(`  ✓ Updated ${certId}: hash=${hash.slice(0, 16)}...`);
  }

  // Update blockchain ledger
  if (fs.existsSync(ledgerFile)) {
    console.log("\n=== Synchronizing Blockchain Ledger ===");
    const ledger = JSON.parse(fs.readFileSync(ledgerFile, "utf8"));

    for (let i = 0; i < ledger.length; i++) {
      const block = ledger[i];
      if (block.data && block.data.certificateId && certHashMap[block.data.certificateId]) {
        block.data.certificateHash = certHashMap[block.data.certificateId];
      }
    }

    // Re-mine from block 1 onwards to maintain mathematical proof-of-work chain integrity
    for (let i = 1; i < ledger.length; i++) {
      ledger[i].previousHash = ledger[i - 1].hash;
      const tempBlock = new Block(
        ledger[i].index,
        ledger[i].timestamp,
        ledger[i].data,
        ledger[i].previousHash
      );
      tempBlock.mineBlock(2);
      ledger[i].nonce = tempBlock.nonce;
      ledger[i].hash = tempBlock.hash;
      console.log(`  Block #${ledger[i].index} mined: hash=${ledger[i].hash} prev=${ledger[i].previousHash}`);
    }

    fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2), "utf8");
    console.log("✓ Saved updated blockchain ledger.");
  }

  // Verify blockchain validation
  // Reload chain
  blockchain.chain = blockchain.loadChain();
  const validation = blockchain.isChainValid();
  console.log("\n=== Blockchain Integrity Verification ===");
  console.log("Validation status:", validation);
  if (!validation.valid) {
    console.error("ERROR: Blockchain chain is invalid!");
    process.exit(1);
  } else {
    console.log("SUCCESS: All certificates and blockchain cryptographic anchors valid!");
  }
}

run().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
