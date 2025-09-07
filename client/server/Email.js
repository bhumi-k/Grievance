const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const db = require('./db');

class EmailService {
    constructor() {
        this.transporter = this.createTransporter();
    }

    createTransporter() {
        // Gmail configuration
        const gmailConfig = {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use App Password for Gmail
            }
        };

        // Outlook configuration
        const outlookConfig = {
            host: process.env.EMAIL_HOST || 'smtp.office365.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true', // false for TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                ciphers: 'SSLv3'
            }
        };

        // Dynamic transporter selection based on EMAIL_HOST
        const emailHost = (process.env.EMAIL_HOST || '').toLowerCase();
        const config = emailHost.includes('gmail') ? gmailConfig : outlookConfig;

        console.log(`📧 Using ${emailHost.includes('gmail') ? 'Gmail' : 'Outlook'} SMTP configuration`);
        return nodemailer.createTransport(config);
    }

    // Load email template from file
    loadTemplate(templateName) {
        try {
            const templatePath = path.join(__dirname, 'email_contents', `${templateName}.txt`);
            return fs.readFileSync(templatePath, 'utf8');
        } catch (error) {
            console.error(`❌ Error loading template ${templateName}:`, error);
            throw new Error(`Template ${templateName} not found`);
        }
    }

    // Replace placeholders in template with actual values
    replacePlaceholders(template, variables) {
        let content = template;
        Object.keys(variables).forEach(key => {
            const placeholder = `{{${key}}}`;
            content = content.replace(new RegExp(placeholder, 'g'), variables[key] || '');
        });
        return content;
    }

    // Send email and log to database
    async sendEmail(to, template, variables) {
        try {
            // Load and process template
            const emailTemplate = this.loadTemplate(template);
            const emailContent = this.replacePlaceholders(emailTemplate, variables);

            // Robust subject extraction from template
            const lines = emailContent.split('\n');
            let subject = '(No Subject)';
            let bodyStartIndex = 0;

            // Search for a line starting with "Subject:"
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('Subject:')) {
                    subject = lines[i].replace('Subject:', '').trim();
                    bodyStartIndex = i + 1;
                    break;
                }
            }

            // Skip empty lines after subject to get body
            while (bodyStartIndex < lines.length && lines[bodyStartIndex].trim() === '') {
                bodyStartIndex++;
            }

            const body = lines.slice(bodyStartIndex).join('\n');

            // Email options
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: to,
                subject: subject,
                text: body
            };

            // Send email
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.messageId);

            // Log email to database
            await this.logEmailToDatabase(to, subject, template, 'sent');

            return {
                success: true,
                messageId: info.messageId,
                message: 'Email sent successfully'
            };

        } catch (error) {
            console.error('❌ Error sending email:', error);

            // Log failed email to database
            await this.logEmailToDatabase(to, 'Failed to send', template, 'failed');

            return {
                success: false,
                error: error.message,
                message: 'Failed to send email'
            };
        }
    }

    // Log email to MySQL database
    async logEmailToDatabase(toEmail, subject, template, status) {
        return new Promise((resolve, reject) => {
            const query = `
        INSERT INTO emails (to_email, subject, template, status, sent_at)
        VALUES (?, ?, ?, ?, NOW())
      `;

            db.query(query, [toEmail, subject, template, status], (err, result) => {
                if (err) {
                    console.error('❌ Error logging email to database:', err);
                    reject(err);
                } else {
                    console.log('✅ Email logged to database');
                    resolve(result);
                }
            });
        });
    }

    // Test email configuration
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email server connection verified');
            return { success: true, message: 'Email configuration is valid' };
        } catch (error) {
            console.error('❌ Email server connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Send grievance submitted notification to faculty
    async sendGrievanceSubmitted(grievanceData) {
        const variables = {
            faculty_name: grievanceData.faculty_name,
            student_name: grievanceData.student_name,
            roll_no: grievanceData.roll_no,
            subject_name: grievanceData.subject_name,
            subject_code: grievanceData.subject_code,
            assignment: grievanceData.assignment_no,
            marks_obtained: grievanceData.marks_obtained,
            result_date: new Date(grievanceData.result_date).toLocaleDateString('en-IN'),
            complaint_id: grievanceData.complaint_id,
            grievance: grievanceData.nature_of_complaint
        };

        return await this.sendEmail(
            grievanceData.faculty_email,
            'grievance_submitted',
            variables
        );
    }

    // Send grievance resolved notification to student
    async sendGrievanceResolved(grievanceData, oldMarks, newMarks) {
        const variables = {
            student_name: grievanceData.student_name,
            faculty_name: grievanceData.faculty_name,
            roll_no: grievanceData.roll_no,
            subject_name: grievanceData.subject_name,
            subject_code: grievanceData.subject_code,
            assignment: grievanceData.assignment_no,
            complaint_id: grievanceData.id,
            result_date: new Date(grievanceData.result_date).toLocaleDateString('en-IN'),
            old_marks: oldMarks,
            new_marks: newMarks,
            grievance: grievanceData.nature_of_complaint
        };

        return await this.sendEmail(
            grievanceData.student_email,
            'grievance_resolved',
            variables
        );
    }

    // Send grievance closed notification to student
    async sendGrievanceClosed(grievanceData) {
        console.log('📧 Starting sendGrievanceClosed with data:', {
            student_email: grievanceData.student_email,
            student_name: grievanceData.student_name,
            id: grievanceData.id
        });

        const variables = {
            student_name: grievanceData.student_name,
            faculty_name: grievanceData.faculty_name,
            roll_no: grievanceData.roll_no,
            subject_name: grievanceData.subject_name,
            subject_code: grievanceData.subject_code,
            assignment: grievanceData.assignment_no,
            complaint_id: grievanceData.id,
            result_date: new Date(grievanceData.result_date).toLocaleDateString('en-IN'),
            marks_obtained: grievanceData.marks_obtained,
            grievance: grievanceData.nature_of_complaint
        };

        console.log('🔍 Closure email variables:', variables);

        try {
            const result = await this.sendEmail(
                grievanceData.student_email,
                'grievance_closed',
                variables
            );
            console.log('✅ sendGrievanceClosed completed:', result);
            return result;
        } catch (error) {
            console.error('❌ sendGrievanceClosed failed:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();