# Email Integration Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd client
npm install nodemailer
```

### 2. Database Setup

Run this SQL to create the emails table:

```sql
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
```

### 3. Environment Variables

Update your `client/server/.env` file with email credentials:

#### For Outlook/Hotmail:

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

#### For Gmail (Alternative):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🔐 Security Setup

### Outlook Setup:

1. Go to Microsoft Account Security settings
2. Enable 2-Step Verification
3. Generate an App Password
4. Use the app password in EMAIL_PASS (not your regular password)

### Gmail Setup:

1. Enable 2-Factor Authentication
2. Go to Google Account > Security > App passwords
3. Generate an app password for "Mail"
4. Use the 16-character app password in EMAIL_PASS

## 🧪 Testing

### Test Email Configuration:

```bash
cd client/server
node test-email.js
```

### Test via API:

```bash
# Test connection
curl http://localhost:5000/api/email/test

# Send test email
curl -X POST http://localhost:5000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "grievance_submitted",
    "variables": {
      "faculty_name": "Dr. Smith",
      "student_name": "John Doe",
      "roll_no": "CS2021001"
    }
  }'
```

## 📧 Email Templates

Three templates are available in `client/server/email_contents/`:

1. **grievance_submitted.txt** - Sent to faculty when student submits grievance
2. **grievance_resolved.txt** - Sent to student when grievance is resolved
3. **grievance_closed.txt** - Sent to student when grievance is closed

## 🔧 API Endpoints

### Send Email

```
POST /api/send-email
{
  "to": "recipient@email.com",
  "template": "grievance_submitted",
  "variables": {
    "student_name": "John Doe",
    "faculty_name": "Dr. Smith"
  }
}
```

### Test Email Config

```
GET /api/email/test
```

### Get Email Logs

```
GET /api/emails
```

### Close Grievance (sends email)

```
PUT /api/grievance/:id/close
```

## 🚨 Troubleshooting

### Common Issues:

1. **Authentication Failed**

   - Use app passwords, not regular passwords
   - Enable 2FA first

2. **Connection Timeout**

   - Check firewall settings
   - Verify SMTP server and port

3. **Template Not Found**

   - Ensure template files exist in `client/server/email_contents/`
   - Check file names match exactly

4. **Database Errors**
   - Run the emails table creation SQL
   - Check database connection

### Error Handling:

- Emails are logged to database regardless of success/failure
- Grievance operations continue even if email fails
- Check server logs for detailed error messages

## 📝 Email Variables

### Available placeholders for templates:

- `{{student_name}}` - Student's full name
- `{{roll_no}}` - Student's roll number
- `{{faculty_name}}` - Faculty member's name
- `{{subject_name}}` - Subject name
- `{{subject_code}}` - Subject code
- `{{assignment}}` - Assignment number
- `{{marks_obtained}}` - Current marks
- `{{result_date}}` - Result date
- `{{complaint_id}}` - Grievance ID
- `{{grievance}}` - Nature of complaint
- `{{old_marks}}` - Previous marks (for resolved emails)
- `{{new_marks}}` - Updated marks (for resolved emails)

## 🔄 Integration Points

The email system automatically triggers on:

1. **Grievance Submission** → Email to faculty
2. **Grievance Resolution** → Email to student with old/new marks
3. **Grievance Closure** → Email to student (no changes)

All emails are logged in the `emails` table for audit purposes.
