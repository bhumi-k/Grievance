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
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

  // SUBJECTS table
  const createSubjectsTable = `
  CREATE TABLE IF NOT EXISTS subjects (
     id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100),
    student_name VARCHAR(100),
    roll_no VARCHAR(20),
    marks_obtained INT,
    result_date DATETIME,
    faculty_name VARCHAR(100),
    assignment_no VARCHAR(50),
    subject_code VARCHAR(20) DEFAULT NULL
  );
  `;


  // GRIEVANCES table
  const createGrievancesTable = `
  CREATE TABLE IF NOT EXISTS grievances (
   id int(11) NOT NULL AUTO_INCREMENT,
  subject_id varchar(11) DEFAULT NULL,
  student_name varchar(100) DEFAULT NULL,
  roll_no varchar(20) DEFAULT NULL,
  grievance_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  complaint_date date DEFAULT NULL,
  nature_of_complaint varchar(255) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY subject_id (subject_id)
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
});

module.exports = db;
