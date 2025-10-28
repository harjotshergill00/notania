const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@notanai.ca';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('notanai!admin', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-notanai-key';
const TOKEN_TTL = '8h';

function issueToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function createAdminToken(email) {
  return issueToken({ role: 'admin', email });
}

function createMemberToken(userId) {
  return issueToken({ role: 'member', userId });
}

function extractToken(req) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return queryToken;
}

function requireRole(role) {
  return (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const payload = verifyToken(token);
      if (payload.role !== role) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (role === 'admin') {
        req.admin = payload;
      }
      if (role === 'member') {
        req.member = { userId: payload.userId };
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

function authenticateAdmin(email, password) {
  if (email !== ADMIN_EMAIL) {
    return false;
  }
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

const requireAdmin = requireRole('admin');
const requireMember = requireRole('member');

module.exports = {
  authenticateAdmin,
  createAdminToken,
  createMemberToken,
  requireAdmin,
  requireMember,
};
