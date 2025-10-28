const fs = require('fs');
const path = require('path');

const outboxDir = path.join(__dirname, '..', 'outbox');

function ensureOutbox() {
  if (!fs.existsSync(outboxDir)) {
    fs.mkdirSync(outboxDir, { recursive: true });
  }
}

function logEmail(to, subject, body) {
  ensureOutbox();
  const timestamp = new Date().toISOString();
  const entry = `\n[${timestamp}]\nTO: ${to}\nSUBJECT: ${subject}\n${body}\n`;
  fs.appendFileSync(path.join(outboxDir, 'sale_notanai.log'), entry, 'utf8');
}

function notifySales(request) {
  const subject = `New member onboarding request — ${request.fullName}`;
  const body = `Membership: ${request.membershipPlan}\nEmail: ${request.email}\nPhone: ${request.phone}\nDesired role: ${request.desiredRole}\nAttributes: ${request.jobAttributes}\nNotes: ${request.projectNotes}\nOrder ID: ${request.orderId}`;
  logEmail('sale@notanai.ca', subject, body);
}

function sendMemberReceipt(request) {
  const subject = `Welcome to NotAnAI — membership #${request.orderId}`;
  const body = `Hi ${request.fullName},\n\nThank you for confirming your ${request.membershipPlan} membership with NotAnAI. Our specialist team is reviewing your intake details and will provide updates through the member portal and email.\n\nWe appreciate the opportunity to support your next career move.\n\n— NotAnAI Member Success`;
  logEmail(request.email, subject, body);
}

module.exports = {
  notifySales,
  sendMemberReceipt,
};
