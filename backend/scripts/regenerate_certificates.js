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

  // Update blockchain ledger 1-to-1 for authentic certificates
  console.log("\n=== Synchronizing Blockchain Ledger ===");
  const newLedger = [];

  // Block #0: Genesis Block
  const genesis = new Block(
    0,
    1704067200000,
    {
      type: "genesis",
      note: "BlockVault Genesis Block — Immutable Academic Credential Ledger Initiated",
      issuer: "Government Polytechnic Amravati"
    },
    "0"
  );
  genesis.mineBlock(2);
  newLedger.push({
    index: 0,
    timestamp: genesis.timestamp,
    data: genesis.data,
    previousHash: "0",
    nonce: genesis.nonce,
    hash: genesis.hash
  });
  console.log(`  Block #0 (Genesis) mined: hash=${genesis.hash}`);

  // Sort certificate files deterministically
  const certOrder = [
    "BV-2026-2293B257",
    "BV-2026-2B4C9988",
    "BV-2026-EA31F63B",
    "BV-2026-E4790DA9"
  ];

  // If there are other certificates in certsFolder, append them
  for (const file of files) {
    const id = file.replace(".json", "");
    if (!certOrder.includes(id)) {
      certOrder.push(id);
    }
  }

  for (let i = 0; i < certOrder.length; i++) {
    const certId = certOrder[i];
    const jsonPath = path.join(certsFolder, `${certId}.json`);
    if (!fs.existsSync(jsonPath)) continue;

    const content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const blockIndex = i + 1;
    const prevHash = newLedger[newLedger.length - 1].hash;

    const blockData = {
      type: "certificate_issuance",
      certificateId: certId,
      studentName: content.studentName || "Student",
      course: content.course || "Course",
      grade: content.grade || "First Class with Distinction",
      issueDate: content.issueDate || "2026-10-01",
      certificateHash: certHashMap[certId] || content.hash,
      status: content.status || "Valid"
    };

    if (content.status === "Invalid") {
      blockData.revocationReason = content.revocationReason || "Administrative Review";
    }

    const newBlock = new Block(
      blockIndex,
      1704067200000 + (blockIndex * 86400000), // deterministic sequential timestamps
      blockData,
      prevHash
    );
    newBlock.mineBlock(2);

    newLedger.push({
      index: blockIndex,
      timestamp: newBlock.timestamp,
      data: blockData,
      previousHash: prevHash,
      nonce: newBlock.nonce,
      hash: newBlock.hash
    });

    // Update blockNumber in certificate JSON
    content.blockNumber = `Block #${blockIndex}`;
    fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2), "utf8");

    console.log(`  Block #${blockIndex} (${certId}) mined: hash=${newBlock.hash} prev=${prevHash}`);
  }

  fs.writeFileSync(ledgerFile, JSON.stringify(newLedger, null, 2), "utf8");
  console.log(`✓ Saved updated blockchain ledger with ${newLedger.length} blocks.`);

  // Verify blockchain validation
  blockchain.chain = blockchain.loadChain();
  const validation = blockchain.isChainValid();
  console.log("\n=== Blockchain Integrity Verification ===");
  console.log("Validation status:", validation);
  if (!validation.valid) {
    console.error("ERROR: Blockchain chain is invalid!");
    process.exit(1);
  } else {
    console.log(`SUCCESS: All ${newLedger.length} blocks and certificates valid!`);
  }
}

run().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
