# Critical Issues in Grievance System

## 1. GRIEVANCES TABLE SCHEMA MISMATCH

- Database schema has: `student_id INT, FOREIGN KEY (student_id) REFERENCES users(id)`
- But API still inserts: `student_name, roll_no` (old columns that don't exist!)

## 2. SUBJECTS TABLE MISSING COLUMNS

- API tries to access `s.student_name, s.roll_no, s.faculty_name`
- But subjects table only has `student_id, faculty_id` (normalized)

## 3. BROKEN GRIEVANCE INSERTION

- `/api/grievance` endpoint tries to insert into non-existent columns
- This will cause SQL errors

## 4. INCONSISTENT QUERIES

- Some queries use JOINs correctly, others still reference old columns
