const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// Email transporter using Gmail App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "blockvault.support@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "vwuwhbvaxwrcgpkh"
  }
});

/**
 * POST /api/contact and /api/support
 * Sends contact / support inquiries directly to blockvault.support@gmail.com
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message, problem, userEmail } = req.body;
    const senderEmail = email || userEmail;
    const senderName = name || "BlockVault User";
    const msgSubject = subject || "BlockVault Support Inquiry";
    const msgContent = message || problem;

    if (!senderEmail || !senderEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address."
      });
    }

    if (!msgContent || !msgContent.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please describe your message or query."
      });
    }

    const mailOptions = {
      from: `BlockVault Contact <${process.env.EMAIL_USER || "blockvault.support@gmail.com"}>`,
      to: "blockvault.support@gmail.com",
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
          <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
            Sent automatically via BlockVault Blockchain Certificate Verification Platform
          </p>
        </div>
      `,
      text: `BlockVault Contact Message\n\nName: ${senderName}\nEmail: ${senderEmail}\nSubject: ${msgSubject}\nDate: ${new Date().toLocaleString()}\n\nMessage:\n${msgContent}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Contact email sent successfully, messageId:", info.messageId);

    // Save inquiry to local database for auditing
    try {
      const fs = require("fs");
      const path = require("path");
      const inquiriesFile = path.join(__dirname, "..", "inquiries.json");
      let list = [];
      if (fs.existsSync(inquiriesFile)) {
        list = JSON.parse(fs.readFileSync(inquiriesFile, "utf8"));
      }
      list.unshift({
        id: `INQ-${Date.now()}`,
        name: senderName,
        email: senderEmail,
        subject: msgSubject,
        message: msgContent,
        sentAt: new Date().toISOString(),
        messageId: info.messageId
      });
      fs.writeFileSync(inquiriesFile, JSON.stringify(list, null, 2), "utf8");
    } catch (fsErr) {
      console.warn("Could not save inquiry log:", fsErr.message);
    }

    // Also send an automated confirmation copy to the sender's own inbox
    if (senderEmail && senderEmail.includes("@") && senderEmail.toLowerCase() !== "blockvault.support@gmail.com") {
      try {
        await transporter.sendMail({
          from: `"BlockVault Academic Support" <${process.env.EMAIL_USER || "blockvault.support@gmail.com"}>`,
          to: senderEmail,
          subject: `Inquiry Received: ${msgSubject} - BlockVault Support`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background: #fafafa;">
              <h2 style="color: #1F3D2B; margin-top: 0; border-bottom: 2px solid #1F3D2B; padding-bottom: 10px;">
                BlockVault Support — Message Received
              </h2>
              <p>Hello <strong>${senderName}</strong>,</p>
              <p>Thank you for reaching out. We have successfully logged your inquiry and notified the BlockVault administration team at Government Polytechnic Amravati.</p>
              <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 15px 0;">
                <p style="margin: 0; font-size: 12px; color: #777; font-weight: bold; text-transform: uppercase;">Your Message:</p>
                <p style="margin-top: 6px; font-size: 14px; color: #222; white-space: pre-wrap;">${msgContent}</p>
              </div>
              <p style="font-size: 13px; color: #555;">Our team will respond to this email address shortly.</p>
              <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
                BlockVault Blockchain-Based Academic Certificate Verification System
              </p>
            </div>
          `,
          text: `Hello ${senderName},\n\nWe received your message regarding "${msgSubject}".\n\nYour message:\n${msgContent}\n\nOur team will review and get back to you shortly.\n\nBlockVault Support`
        });
      } catch (autoErr) {
        console.warn("User auto-reply notice could not be sent:", autoErr.message);
      }
    }

    res.json({
      success: true,
      message: "Your message has been sent successfully to the BlockVault support team!",
      messageId: info.messageId
    });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email. Please check your network and try again.",
      error: error.message
    });
  }
});

module.exports = router;
