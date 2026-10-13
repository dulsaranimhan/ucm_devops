const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Database connection eka load karaganna
const db = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Auth Routes (Register & Login) connect kirima
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Test Route ekak
app.get('/', (req, res) => {
  res.send('University Club Management Backend is running...');
});

// Server eka run karana port eka
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});