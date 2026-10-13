const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  try {
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user into database
      db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
          }
          res.status(201).json({ message: 'User registered successfully!' });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 2. Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  // Find user by email
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey123',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

module.exports = router;