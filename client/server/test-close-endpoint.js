const axios = require('axios');

async function testCloseEndpoint() {
    console.log('🧪 Testing Close Endpoint...\n');

    // First, let's get all grievances to find one to close
    try {
        console.log('1. Fetching all grievances...');
        const grievancesResponse = await axios.get('http://localhost:5000/api/grievances');
        const grievances = grievancesResponse.data;

        console.log(`Found ${grievances.length} grievances`);

        if (grievances.length === 0) {
            console.log('❌ No grievances found to test with');
            return;
        }

        const testGrievance = grievances[0];
        console.log(`Using grievance ID: ${testGrievance.id} for testing`);
        console.log(`Student: ${testGrievance.student_name}`);
        console.log(`Subject: ${testGrievance.subject_name}`);
        console.log('');

        // Now test the close endpoint
        console.log('2. Testing close endpoint...');
        const closeResponse = await axios.put(`http://localhost:5000/api/grievance/${testGrievance.id}/close`);

        console.log('✅ Close endpoint response:', closeResponse.data);
        console.log('Status:', closeResponse.status);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

// Run the test
testCloseEndpoint().catch(console.error);