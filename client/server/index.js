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
      s.id,
      s.subject_name,
      s.subject_code,
      s.assignment_no,
      s.marks_obtained,
      s.result_date,
      fac.name AS faculty_name,
      fac.email AS faculty_email,
      EXISTS (
        SELECT 1 
        FROM grievances g 
        WHERE g.subject_id = s.id
      ) AS has_grievance
    FROM subjects s
    JOIN users stu ON s.student_id = stu.id
    JOIN users fac ON s.faculty_id = fac.id
    WHERE stu.roll_no = ?
  `;

  db.query(query, [rollNo], (err, results) => {
    if (err) {
      console.error('❌ Error fetching subjects:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log(`📋 Fetching subjects for rollNo: ${rollNo}`);
    console.log(`📊 Found ${results.length} subjects:`, results);

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

  const query = `
    SELECT 
      s.id,
      s.subject_name,
      s.subject_code,
      s.assignment_no,
      s.marks_obtained,
      s.result_date,
      stu.name AS student_name,
      stu.roll_no AS student_roll,
      fac.name AS faculty_name,
      fac.email AS faculty_email
    FROM subjects s
    JOIN users stu ON s.student_id = stu.id
    JOIN users fac ON s.faculty_id = fac.id
    WHERE s.id = ?;
  `;

  db.query(query, [subjectId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(results[0]);
  });
});

// Raise grievance (FIXED - uses normalized schema)
app.post('/api/grievance', (req, res) => {
  const { subjectId, complaintDate, natureOfComplaint } = req.body;

  if (!subjectId) {
    return res.status(400).json({ error: 'Subject ID is required' });
  }

  // Get subject with student info via JOIN
  const getSubject = `
    SELECT s.*, stu.id as student_id, stu.roll_no, stu.name as student_name
    FROM subjects s
    JOIN users stu ON s.student_id = stu.id
    WHERE s.id = ?
  `;

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

    // Insert using normalized schema (student_id instead of student_name, roll_no)
    const insertQuery = `
      INSERT INTO grievances (subject_id, student_id, complaint_date, nature_of_complaint)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [subjectId, subject.student_id, complaintDate, natureOfComplaint],
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

// Fetch all grievances for faculty (FIXED - uses proper JOINs)
app.get('/api/grievances', (req, res) => {
  const query = `
    SELECT 
      g.id, 
      g.subject_id, 
      g.complaint_date, 
      g.nature_of_complaint,
      s.subject_name,
      s.subject_code,
      s.assignment_no,
      s.marks_obtained,
      stu.name AS student_name,
      stu.roll_no,
      stu.email AS student_email,
      fac.name AS faculty_name,
      fac.email AS faculty_email
    FROM grievances g
    JOIN subjects s ON g.subject_id = s.id
    JOIN users stu ON g.student_id = stu.id
    JOIN users fac ON s.faculty_id = fac.id
    ORDER BY g.complaint_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching grievances:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// Resolve grievance
// get grievance details by ID (FIXED - uses proper JOINs)
app.get('/api/grievance/:id', (req, res) => {
  const grievanceId = req.params.id;
  const query = `
    SELECT 
      g.*,
      s.subject_name,
      s.subject_code,
      s.assignment_no,
      s.marks_obtained,
      stu.name AS student_name,
      stu.roll_no,
      stu.email AS student_email,
      fac.name AS faculty_name,
      fac.email AS faculty_email
    FROM grievances g
    JOIN subjects s ON g.subject_id = s.id
    JOIN users stu ON g.student_id = stu.id
    JOIN users fac ON s.faculty_id = fac.id
    WHERE g.id = ?
  `;
  db.query(query, [grievanceId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});

// Resolve grievance by updating marks
app.put('/api/grievance/:id/resolve', (req, res) => {
  const grievanceId = req.params.id;
  const { newMarks } = req.body;

  const getSubjectIdQuery = `SELECT subject_id FROM grievances WHERE id = ?`;
  db.query(getSubjectIdQuery, [grievanceId], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const subjectId = rows[0].subject_id;
    const updateQuery = `UPDATE subjects SET marks_obtained = ? WHERE id = ?`;

    db.query(updateQuery, [newMarks, subjectId], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to update marks' });
      res.json({ message: 'Marks updated successfully' });
    });
  });
});


// Debug endpoint to check database contents
app.get('/api/debug/users', (req, res) => {
  const query = 'SELECT id, name, email, roll_no, role FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/debug/subjects', (req, res) => {
  const query = `
    SELECT 
      s.*,
      stu.name AS student_name,
      stu.roll_no,
      fac.name AS faculty_name
    FROM subjects s
    LEFT JOIN users stu ON s.student_id = stu.id
    LEFT JOIN users fac ON s.faculty_id = fac.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add sample data endpoint (for testing)
app.post('/api/debug/add-sample-data', async (req, res) => {
  try {
    // First, get a student and faculty user
    const getUsersQuery = `
      SELECT 
        (SELECT id FROM users WHERE role = 'user' LIMIT 1) AS student_id,
        (SELECT roll_no FROM users WHERE role = 'user' LIMIT 1) AS student_roll_no,
        (SELECT id FROM users WHERE role IN ('faculty', 'admin') LIMIT 1) AS faculty_id
    `;

    db.query(getUsersQuery, (err, userResults) => {
      if (err) {
        console.error('Error getting users:', err);
        return res.status(500).json({ error: 'Error getting users' });
      }

      const { student_id, student_roll_no, faculty_id } = userResults[0];

      if (!student_id || !faculty_id) {
        return res.status(400).json({
          error: 'Need at least one student and one faculty/admin user in database',
          debug: { student_id, faculty_id, student_roll_no }
        });
      }

      // Insert sample subjects
      const sampleSubjects = [
        ['Data Structures', 'CS101', 'ASG001', student_id, faculty_id, 85, '2024-12-01 10:00:00'],
        ['Database Systems', 'CS201', 'ASG002', student_id, faculty_id, 78, '2024-12-02 14:30:00'],
        ['Web Development', 'CS301', 'ASG003', student_id, faculty_id, 92, '2024-12-03 16:00:00']
      ];

      const insertQuery = `
        INSERT INTO subjects (subject_name, subject_code, assignment_no, student_id, faculty_id, marks_obtained, result_date)
        VALUES ?
      `;

      db.query(insertQuery, [sampleSubjects], (err, result) => {
        if (err) {
          console.error('Error inserting sample subjects:', err);
          return res.status(500).json({ error: 'Error inserting sample data' });
        }

        res.json({
          message: 'Sample data added successfully!',
          inserted: result.affectedRows,
          student_roll_no: student_roll_no
        });
      });
    });

  } catch (error) {
    console.error('Error adding sample data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
// This duplicate endpoint is removed - we already have the corrected one above
// Get grievances count
app.get('/api/grievances/count', (req, res) => {
  const query = 'SELECT COUNT(*) AS total FROM grievances';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ total: results[0].total });
  });
});

// Add subject for a student (Admin/Faculty functionality)
app.post('/api/subjects', (req, res) => {
  const { subject_name, subject_code, assignment_no, student_roll_no, faculty_email, marks_obtained, result_date } = req.body;

  if (!subject_name || !student_roll_no) {
    return res.status(400).json({ error: 'Subject name and student roll number are required' });
  }

  // Get student and faculty IDs
  const getIds = `
    SELECT 
      (SELECT id FROM users WHERE roll_no = ? AND role = 'user') AS student_id,
      (SELECT id FROM users WHERE email = ? AND role IN ('faculty', 'hod', 'ceo', 'director', 'admin')) AS faculty_id
  `;

  // If no faculty email provided, use any admin/faculty
  const facultyEmailToUse = faculty_email || 'admin@college.com';

  db.query(getIds, [student_roll_no, facultyEmailToUse], (err, results) => {
    if (err) {
      console.error('❌ Error fetching IDs:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    const { student_id, faculty_id } = results[0];

    if (!student_id) {
      return res.status(404).json({ error: `Student with roll number ${student_roll_no} not found` });
    }

    // If no specific faculty found, get any admin/faculty
    if (!faculty_id) {
      const getAnyFaculty = `SELECT id FROM users WHERE role IN ('faculty', 'admin') LIMIT 1`;
      db.query(getAnyFaculty, (err2, facultyResults) => {
        if (err2 || facultyResults.length === 0) {
          return res.status(404).json({ error: 'No faculty/admin found in system' });
        }

        const anyFacultyId = facultyResults[0].id;
        insertSubjectRecord(subject_name, subject_code, assignment_no, student_id, anyFacultyId, marks_obtained, result_date, res);
      });
    } else {
      insertSubjectRecord(subject_name, subject_code, assignment_no, student_id, faculty_id, marks_obtained, result_date, res);
    }
  });
});

// Helper function to insert subject
function insertSubjectRecord(subject_name, subject_code, assignment_no, student_id, faculty_id, marks_obtained, result_date, res) {
  const insertSubject = `
    INSERT INTO subjects (subject_name, subject_code, assignment_no, student_id, faculty_id, marks_obtained, result_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    subject_name,
    subject_code || null,
    assignment_no || 'ASG001',
    student_id,
    faculty_id,
    marks_obtained || 0,
    result_date || new Date()
  ];

  db.query(insertSubject, values, (err) => {
    if (err) {
      console.error('❌ Error inserting subject:', err);
      return res.status(500).json({ error: 'Could not add subject' });
    }
    res.json({ message: 'Subject added successfully!' });
  });
}

// Get faculty-specific grievances (for role-based filtering)
app.get('/api/grievances/faculty/:facultyId', (req, res) => {
  const facultyId = req.params.facultyId;

  const query = `
    SELECT 
      g.id, 
      g.subject_id, 
      g.complaint_date, 
      g.nature_of_complaint,
      s.subject_name,
      s.subject_code,
      s.assignment_no,
      s.marks_obtained,
      stu.name AS student_name,
      stu.roll_no,
      stu.email AS student_email
    FROM grievances g
    JOIN subjects s ON g.subject_id = s.id
    JOIN users stu ON g.student_id = stu.id
    WHERE s.faculty_id = ?
    ORDER BY g.complaint_date DESC
  `;

  db.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching faculty grievances:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

