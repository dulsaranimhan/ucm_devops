const jwt = require('jsonwebtoken');
const db = require('../db');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.queryAsync('SELECT id, name, email, student_id, faculty, role, created_at FROM users WHERE id = ?', [payload.id]);
    if (!rows.length) return res.status(401).json({ message: 'Your account is no longer available.' });
    req.user = rows[0];
    req.accountType = payload.accountType === 'club' ? 'club' : 'student';
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    next(err);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required.' });
  next();
}

module.exports = { authenticate, requireAdmin };
