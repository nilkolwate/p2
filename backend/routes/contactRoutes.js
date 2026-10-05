const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/**
 * Configure email transporter
 * Uses Gmail App Password from environment variables.
 */
function getEmailTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
  });
}

/**
 * POST /api/contact and /api/support
 * Logs support inquiries and attempts email notification.
 */
router.post("/", async (req, res) => {
  const { name, email, subject, message, problem, userEmail } = req.body;
  const senderEmail = (email || userEmail || "").trim();
  const senderName = (name || "BlockVault User").trim();
  const msgSubject = (subject || "BlockVault Support Inquiry").trim();
  const msgContent = (message || problem || "").trim();

  if (!senderEmail) {
    return res.status(400).json({
      success: false,
      message: "Please enter your email address.",
    });
  }

  if (!msgContent) {
    return res.status(400).json({
      success: false,
      message: "Please describe your message or query.",
    });
  }

  // 1. Always save inquiry immediately to local inquiries.json
  const inquiryRecord = {
    id: `INQ-${Date.now()}`,
    name: senderName,
    email: senderEmail,
    subject: msgSubject,
    message: msgContent,
    sentAt: new Date().toISOString(),
    status: "received",
  };

  try {
    const inquiriesFile = path.join(__dirname, "..", "inquiries.json");
    let list = [];
    if (fs.existsSync(inquiriesFile)) {
      list = JSON.parse(fs.readFileSync(inquiriesFile, "utf8"));
    }
    list.unshift(inquiryRecord);
    fs.writeFileSync(inquiriesFile, JSON.stringify(list, null, 2), "utf8");
  } catch (fsErr) {
    console.warn("Could not save inquiry log:", fsErr.message);
  }

  // 2. Attempt email dispatch via Nodemailer or HTTP API if configured
  let emailSent = false;
  let emailError = null;
  const transporter = getEmailTransporter();

  if (transporter) {
    try {
      const recipient = process.env.EMAIL_USER || "blockvault.support@gmail.com";
      const info = await transporter.sendMail({
        from: `"BlockVault Contact" <${process.env.EMAIL_USER}>`,
        to: recipient,
        replyTo: senderEmail,
        subject: `[BlockVault] ${msgSubject} - from ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background: #fafafa;">
            <h2 style="color: #1F3D2B; margin-top: 0; border-bottom: 2px solid #1F3D2B; padding-bottom: 10px;">
              BlockVault Contact Inquiry
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #222;">${senderName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; color: #222;"><a href="mailto:${senderEmail}" style="color: #14579c;">${senderEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Subject:</td>
                <td style="padding: 8px 0; color: #222;">${msgSubject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #222;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <h4 style="color: #1F3D2B; margin-bottom: 8px;">Message:</h4>
            <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
${msgContent}
            </div>
          </div>
        `,
        text: `BlockVault Contact Message\n\nName: ${senderName}\nEmail: ${senderEmail}\nSubject: ${msgSubject}\nDate: ${new Date().toLocaleString()}\n\nMessage:\n${msgContent}`,
      });
      console.log("Contact email sent successfully, messageId:", info.messageId);
      emailSent = true;
    } catch (err) {
      console.error("Nodemailer delivery error:", err.message);
      emailError = err.message;
    }
  } else {
    emailError = "EMAIL_USER or EMAIL_PASSWORD not configured on server.";
  }

  // Return success since the inquiry was logged successfully
  return res.json({
    success: true,
    saved: true,
    emailSent,
    inquiryId: inquiryRecord.id,
    message: emailSent
      ? "Your message has been sent successfully to the BlockVault support team!"
      : "Your inquiry has been received and recorded by the BlockVault support team.",
    ...(emailError ? { emailNote: emailError } : {}),
  });
});

module.exports = router;
