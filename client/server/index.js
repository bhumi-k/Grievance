const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

// Register Route
app.post('/api/register', async (req, res) => {
  const { name, email, password, rollNo, class: className } = req.body;
  console.log('📥 Register request:', req.body);

  if (!name || !email || !password || !rollNo || !className) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, roll_no, class)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [name, email, hashedPassword, rollNo, className], (err, result) => {
      if (err) {
        console.error('❌ Error inserting user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Server error' });
      }

      console.log('✅ User registered');
      return res.status(201).json({ message: '✅ Registration successful' });
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'No user found with this email' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, roll_no: user.roll_no }
    });
  });
});

// Fetch all subjects for a student
app.get('/api/subjects', (req, res) => {
  const rollNo = req.query.rollNo;
  if (!rollNo) return res.status(400).json({ error: 'Roll number required' });

  const query = `
    SELECT 
      s.*, 
      EXISTS (
        SELECT 1 
        FROM grievances g 
        WHERE g.subject_id = s.id
      ) AS has_grievance
    FROM subjects s
    WHERE s.roll_no = ?
  `;

  db.query(query, [rollNo], (err, results) => {
    if (err) {
      console.error('❌ Error fetching subjects:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Convert 0/1 to boolean
    const formatted = results.map(row => ({
      ...row,
      has_grievance: Boolean(row.has_grievance),
    }));

    res.json(formatted);
  });
});

// Get a single subject by id (used for pre-filling grievance form)
app.get('/api/subject/:id', (req, res) => {
  const subjectId = req.params.id;

  const query = `SELECT * FROM subjects WHERE id = ?`;

  db.query(query, [subjectId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(404).json({ error: 'Subject not found' });

    res.json(results[0]);
  });
});

// Raise grievance
app.post('/api/grievance', (req, res) => {
  const { subjectId, complaintDate, natureOfComplaint } = req.body;

  if (!subjectId) {
    return res.status(400).json({ error: 'Subject ID is required' });
  }

  const getSubject = `SELECT * FROM subjects WHERE id = ?`;
  db.query(getSubject, [subjectId], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const subject = rows[0];
    const resultTime = new Date(subject.result_date).getTime();
    const now = Date.now();
    const diff = now - resultTime;

    if (diff > 48 * 60 * 60 * 1000) {
      return res.status(403).json({ error: 'Grievance window closed' });
    }

    const insertQuery = `
      INSERT INTO grievances (subject_id, student_name, roll_no, complaint_date, nature_of_complaint)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [subjectId, subject.student_name, subject.roll_no, complaintDate, natureOfComplaint],
      (err) => {
        if (err) {
          console.error('❌ Error inserting grievance:', err);
          return res.status(500).json({ error: 'Could not raise grievance' });
        }
        res.json({ message: 'Grievance raised successfully!' });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
