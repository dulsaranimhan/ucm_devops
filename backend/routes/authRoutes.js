const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, student_id: user.student_id, faculty: user.faculty, role: user.role, created_at: user.created_at });

router.post('/register', async (req, res, next) => {
  const { name, email, password, student_id, faculty } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Please fill in your name, email and password.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [existing] = await db.queryAsync('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length) return res.status(409).json({ message: 'An account with this email already exists.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.queryAsync('INSERT INTO users (name, email, password, student_id, faculty) VALUES (?, ?, ?, ?, ?)', [name.trim(), normalizedEmail, hash, student_id?.trim() || null, faculty?.trim() || null]);
    res.status(201).json({ message: 'User registered successfully.', id: result.insertId });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  const accountType = req.body?.accountType || 'student';
  if (!['student', 'club'].includes(accountType)) return res.status(400).json({ message: 'Choose Student or Club sign-in.' });
  if (!email || !password) return res.status(400).json({ message: 'Please enter your email and password.' });
  try {
    const [rows] = await db.queryAsync('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) return res.status(401).json({ message: 'Invalid email or password.' });
    const user = publicUser(rows[0]);
    const [managedClubs] = await db.queryAsync(`SELECT c.id, c.name, cm.role FROM club_members cm JOIN clubs c ON c.id=cm.club_id
      WHERE cm.user_id=? AND cm.status='approved' AND cm.role IN ('president','officer') ORDER BY c.name`, [user.id]);
    const token = jwt.sign({ id: user.id, accountType }, process.env.JWT_SECRET, { expiresIn: req.body.rememberMe ? '30d' : '12h' });
    res.json({ token, user, accountType, managedClubs });
  } catch (err) { next(err); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));
module.exports = router;
