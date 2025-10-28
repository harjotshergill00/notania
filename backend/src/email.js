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
  const membershipLine = request.membershipPlan ? request.membershipPlan : 'Membership plan pending';
  const body = `Membership: ${membershipLine}\nEmail: ${request.email}\nPhone: ${request.phone}\nDesired role: ${request.desiredRole}\nAttributes: ${request.jobAttributes}\nNotes: ${request.projectNotes}\nOrder ID: ${request.orderId}`;
  logEmail('sale@notanai.ca', subject, body);
}

function sendWelcome(request) {
  const subject = `Welcome to NotAnAI — account #${request.orderId}`;
  const body = `Hi ${request.fullName},\n\nYour NotAnAI member account is ready. Sign in to the member portal to choose the membership tier that best fits your goals, finalize secure payment, and follow project updates.\n\nPortal: ${request.portalUrl}\n\nThank you for trusting us with your career story.\n\n— NotAnAI Member Success`;
  logEmail(request.email, subject, body);
}

function sendMemberReceipt(request) {
  const subject = `Welcome to NotAnAI — membership #${request.orderId}`;
  const body = `Hi ${request.fullName},\n\nThank you for confirming your ${request.membershipPlan} membership with NotAnAI. Our specialist team is reviewing your intake details and will provide updates through the member portal and email.\n\nWe appreciate the opportunity to support your next career move.\n\n— NotAnAI Member Success`;
  logEmail(request.email, subject, body);
}

module.exports = {
  notifySales,
  sendWelcome,
  sendMemberReceipt,
};
