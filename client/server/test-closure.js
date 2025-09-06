const emailService = require('./Email');
require('dotenv').config();

async function testClosureEmail() {
    console.log('🧪 Testing Grievance Closure Email...\n');

    // Mock grievance data similar to what the database would return
    const mockGrievanceData = {
        id: 123,
        student_name: 'Test Student',
        student_email: process.env.EMAIL_USER, // Send to yourself for testing
        faculty_name: 'Dr. John Smith',
        roll_no: 'CS2021001',
        subject_name: 'Data Structures',
        subject_code: 'CS101',
        assignment_no: 'Assignment 1',
        marks_obtained: 85,
        result_date: '2024-12-01',
        nature_of_complaint: 'Marks calculation seems incorrect'
    };

    console.log('Mock data:', mockGrievanceData);
    console.log('');

    try {
        console.log('Sending closure email...');
        const result = await emailService.sendGrievanceClosed(mockGrievanceData);
        console.log('Result:', result);

        if (result.success) {
            console.log('✅ Closure email sent successfully!');
        } else {
            console.log('❌ Closure email failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testClosureEmail().catch(console.error);