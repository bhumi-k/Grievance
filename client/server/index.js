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
  const { name, email, password, rollNo, class: className, adminCode, role } = req.body;
  console.log('📥 Register request:', req.body);

  // Check common required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  // Admin-specific validation
  if (role === 'admin') {
    if (!adminCode || adminCode !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid or missing admin code' });
    }
  }

  // Student-specific validation
  if (role === 'user') {
    if (!rollNo || !className) {
      return res.status(400).json({ message: 'Roll No. and Class are required for students' });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = role === 'admin'
      ? `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`
      : `INSERT INTO users (name, email, password, roll_no, class, role) VALUES (?, ?, ?, ?, ?, ?)`;

    const values = role === 'admin'
      ? [name, email, hashedPassword, role]
      : [name, email, hashedPassword, rollNo, className, role];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Error inserting user:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Server error' });
      }

      console.log(`✅ Registered as ${role}`);
      return res.status(201).json({ message: `✅ Registered successfully as ${role}` });
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
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    roll_no: user.roll_no,
    role: user.role  // ✅ This is what your frontend needs
  }
});

  });
});
// Admin adds Faculty/HOD/CEO/Director
app.post('/api/admin/register-role', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    const values = [name, email, hashedPassword, role];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Error inserting role:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Server error' });
      }

      return res.status(201).json({ message: `${role} registered successfully` });
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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

// Update Profile (Name, Email, Password)
app.put('/api/users/:id', async (req, res) => {
  const { name, email, password } = req.body;
  const { id } = req.params;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    let query, values;
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`;
      values = [name, email, hashedPassword, id];
    } else {
      query = `UPDATE users SET name = ?, email = ? WHERE id = ?`;
      values = [name, email, id];
    }

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Profile update error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      return res.json({ message: 'Profile updated successfully' });
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Get user profile by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;

  const query = `SELECT id, name, email, roll_no, role FROM users WHERE id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching profile:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  });
});
app.get("/api/grievances", (req, res) => {
  const query = `
    SELECT g.id, g.student_name, g.roll_no, g.complaint_date, 
       g.nature_of_complaint, u.class AS stream
FROM grievances g
JOIN (
  SELECT roll_no, MAX(id) AS latest_user_id
  FROM users
  GROUP BY roll_no
) latest ON g.roll_no = latest.roll_no
JOIN users u ON u.id = latest.latest_user_id
ORDER BY g.complaint_date DESC;


  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching grievances:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});
app.get('/api/grievances/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS total FROM grievances';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ total: results[0].total });
  });
});

