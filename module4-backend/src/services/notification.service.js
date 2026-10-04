const nodemailer = require('nodemailer');
const env = require('../config/env');
const db = require('../config/db');
const AppError = require('../utils/AppError');

let transporter = null;
if (env.smtp.host) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
}

async function sendEmail(to, subject, text) {
  if (!transporter || !to) return false;
  try {
    await transporter.sendMail({ from: env.smtp.from, to, subject, text });
    return true;
  } catch (err) {
    console.error('Email failed:', err.message);
    return false;
  }
}

/** Create in-app notification (+ optional email). */
async function create({ userId, type, title, message, email = null, sendMail = false }) {
  let emailSent = 0;
  if (sendMail && email) emailSent = (await sendEmail(email, title, message)) ? 1 : 0;

  await db.execute(
    `INSERT INTO NOTIFICATIONS (USER_ID, TYPE, TITLE, MESSAGE, EMAIL_SENT)
     VALUES (:userId, :type, :title, :message, :emailSent)`,
    { userId, type, title, message: String(message).slice(0, 1000), emailSent }
  );
}

/** Called after every verification. Never throws (fire-and-forget safe). */
async function notifyVerification({ result, certificate, method }) {
  try {
    const { status, certificateId } = result;

    // 1) Tell the issuer their certificate was checked
    if (certificate?.issuerId) {
      const issuer = await db.queryOne(`SELECT USER_ID, EMAIL FROM USERS WHERE USER_ID = :id`, { id: certificate.issuerId });
      if (issuer) {
        const bad = status === 'TAMPERED' || status === 'REVOKED';
        await create({
          userId: issuer.userId,
          type: bad ? 'VERIFICATION_ALERT' : 'VERIFICATION',
          title: `Certificate ${certificateId} verified: ${status}`,
          message: `Your certificate ${certificateId} was verified via ${method}. Result: ${status}.`,
          email: issuer.email,
          sendMail: bad,
        });
      }
    }

    // 2) Alert every admin on tampering
    if (status === 'TAMPERED') {
      const admins = await db.query(`SELECT USER_ID, EMAIL FROM USERS WHERE UPPER(ROLE) = :role`, { role: env.adminRole });
      for (const a of admins) {
        await create({
          userId: a.userId,
          type: 'TAMPER_ALERT',
          title: `Tampering detected: ${certificateId}`,
          message: `A verification attempt (${method}) detected a hash mismatch for certificate ${certificateId}: ${result.reason}`,
          email: a.email,
          sendMail: true,
        });
      }
    }
  } catch (err) {
    console.error('notifyVerification failed:', err.message);
  }
}

async function listForUser(userId, { unreadOnly, limit, offset }) {
  const where = unreadOnly ? 'AND IS_READ = 0' : '';
  const items = await db.query(
    `SELECT NOTIFICATION_ID, TYPE, TITLE, MESSAGE, IS_READ, CREATED_AT
       FROM NOTIFICATIONS WHERE USER_ID = :userId ${where}
      ORDER BY CREATED_AT DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
    { userId, offset, limit }
  );
  const total = await db.queryOne(
    `SELECT COUNT(*) AS TOTAL FROM NOTIFICATIONS WHERE USER_ID = :userId ${where}`, { userId }
  );
  return { items: items.map((n) => ({ ...n, isRead: n.isRead === 1 })), total: total.total };
}

async function unreadCount(userId) {
  const r = await db.queryOne(`SELECT COUNT(*) AS CNT FROM NOTIFICATIONS WHERE USER_ID = :userId AND IS_READ = 0`, { userId });
  return r.cnt;
}

async function markRead(userId, notificationId) {
  const r = await db.execute(
    `UPDATE NOTIFICATIONS SET IS_READ = 1 WHERE NOTIFICATION_ID = :id AND USER_ID = :userId`,
    { id: notificationId, userId }
  );
  if (!r.rowsAffected) throw new AppError('Notification not found', 404, 'NOT_FOUND');
}

async function markAllRead(userId) {
  const r = await db.execute(`UPDATE NOTIFICATIONS SET IS_READ = 1 WHERE USER_ID = :userId AND IS_READ = 0`, { userId });
  return r.rowsAffected;
}

module.exports = { create, notifyVerification, listForUser, unreadCount, markRead, markAllRead };
