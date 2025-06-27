const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");

  // Create users table dynamically
  const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  roll_no VARCHAR(20),
  class VARCHAR(50),
  role ENUM('user', 'admin', 'faculty', 'ceo', 'hod', 'director') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

  db.query(createUsersTable, (err) => {
    if (err) console.error("❌ Error creating users table:", err);
    else console.log("✅ Users table is ready");
  });
});

module.exports = db;
