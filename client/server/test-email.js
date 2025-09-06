const emailService = require('./Email');
require('dotenv').config();

async function testEmail() {
    console.log('🧪 Testing Email Configuration...\n');

    // Test 1: Check email server connection
    console.log('1. Testing email server connection...');
    const connectionTest = await emailService.testConnection();
    console.log('Result:', connectionTest);
    console.log('');

    if (!connectionTest.success) {
        console.log('❌ Email configuration failed. Please check your .env file settings.');
        return;
    }

    // Test 2: Send a test email using the API format
    console.log('2. Testing email sending...');
    const testEmailData = {
        to: process.env.EMAIL_USER, // Send to yourself for testing
        template: 'grievance_submitted',
        variables: {
            faculty_name: 'Dr. John Smith',
            student_name: 'Test Student',
            roll_no: 'CS2021001',
            subject_name: 'Data Structures',
            subject_code: 'CS101',
            assignment: 'Assignment 1',
            marks_obtained: '85',
            result_date: '2024-12-01',
            complaint_id: '12345',
            grievance: 'Marks calculation seems incorrect'
        }
    };

    try {
        const result = await emailService.sendEmail(
            testEmailData.to,
            testEmailData.template,
            testEmailData.variables
        );
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Test email failed:', error);
    }

    console.log('\n✅ Email testing completed!');
    console.log('\nTo test manually:');
    console.log('1. Make sure your .env file has correct email credentials');
    console.log('2. For Outlook: Use your email and app password');
    console.log('3. For Gmail: Enable 2FA and use app password');
    console.log('4. Run: node test-email.js (from server directory)');
    console.log('5. Check your email inbox for the test message');
}

// Run the test
testEmail().catch(console.error);