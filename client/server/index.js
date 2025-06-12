// server/index.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register Route
app.post('/api/register', async (req, res) => {
  const { name, userId, email, password, role } = req.body;

  if (!name || !userId || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const query = `
      INSERT INTO users (name, user_id, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [name, userId, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error('❌ Error inserting user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email or User ID already exists' });
        }
        return res.status(500).json({ message: 'Server error' });
      }

      return res.status(201).json({ message: '✅ Registration successful' });
    });
  } catch (error) {
    console.error('❌ Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
