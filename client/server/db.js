const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');

  // USERS table
  const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  roll_no VARCHAR(20),
  class VARCHAR(50),
  role ENUM('admin', 'user', 'faculty', 'hod', 'ceo', 'director') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

`;

  // SUBJECTS table
  const createSubjectsTable = `
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(100),
  student_id INT,
  faculty_id INT,
  marks_obtained INT,
  result_date DATETIME,
  assignment_no VARCHAR(50),
  subject_code VARCHAR(20) DEFAULT NULL,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES users(id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES users(id) 
    ON DELETE SET NULL ON UPDATE CASCADE
);

  `;


  // GRIEVANCES table
  const createGrievancesTable = `
CREATE TABLE IF NOT EXISTS grievances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT,
  student_id INT,
  complaint_date DATE,
  nature_of_complaint TEXT,
  status ENUM('pending', 'resolved', 'closed') DEFAULT 'pending',
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

  `;

  // Create emails table
  const createEmailsTable = `
CREATE TABLE IF NOT EXISTS emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template VARCHAR(100) NOT NULL,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_to_email (to_email),
  INDEX idx_sent_at (sent_at),
  INDEX idx_status (status)
);
`;

  db.query(createUsersTable, (err) => {
    if (err) console.error('❌ Error creating users table:', err);
    else console.log('✅ Users table is ready');
  });

  db.query(createSubjectsTable, (err) => {
    if (err) console.error('❌ Error creating subjects table:', err);
    else console.log('✅ Subjects table is ready');
  });

  db.query(createGrievancesTable, (err) => {
    if (err) console.error('❌ Error creating grievances table:', err);
    else console.log('✅ Grievances table is ready');
  });

  // Add status column to existing grievances table if it doesn't exist
  const addStatusColumn = `
    ALTER TABLE grievances 
    ADD COLUMN status ENUM('pending', 'resolved', 'closed') DEFAULT 'pending'
  `;

  db.query(addStatusColumn, (err) => {
    if (err && !err.message.includes('Duplicate column name')) {
      console.error('❌ Error adding status column (column may already exist):', err.message);
    } else {
      console.log('✅ Status column added to grievances table');
    }
  });

  db.query(createEmailsTable, (err) => {
    if (err) console.error('❌ Error creating emails table:', err);
    else console.log('✅ Emails table is ready');
  });
});

module.exports = db;
