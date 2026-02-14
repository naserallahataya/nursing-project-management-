const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

let testData = {
    hospitals: [],
    builds: [],
    floors: [],
    rooms: [],
    students: []
};

// Helper function to log test results
function logTest(testName, success, message = '') {
    const status = success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`${status} ${colors.cyan}${testName}${colors.reset} ${message}`);
    return success;
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) config.data = data;
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
}

// Test functions
async function testHospitals() {
    console.log(`\n${colors.blue}=== Testing Hospital Endpoints ===${colors.reset}\n`);

    // Create Hospital
    const hospitalData = {
        name: 'Al-Shifa Hospital',
        vacancies: 50,
        students: []
    };
    let result = await apiCall('POST', '/hospitals', hospitalData);
    if (logTest('Create Hospital', result.success, result.success ? `ID: ${result.data.data._id}` : result.error.message)) {
        testData.hospitals.push(result.data.data);
    }

    // Create another hospital
    hospitalData.name = 'Ibn Sina Hospital';
    hospitalData.vacancies = 30;
    result = await apiCall('POST', '/hospitals', hospitalData);
    if (logTest('Create Second Hospital', result.success)) {
        testData.hospitals.push(result.data.data);
    }

    // Get All Hospitals
    result = await apiCall('GET', '/hospitals');
    logTest('Get All Hospitals', result.success, result.success ? `Count: ${result.data.length}` : result.error.message);

    // Get Hospital By ID
    if (testData.hospitals.length > 0) {
        result = await apiCall('GET', `/hospitals/${testData.hospitals[0]._id}`);
        logTest('Get Hospital By ID', result.success);
    }
}

async function testBuilds() {
    console.log(`\n${colors.blue}=== Testing Build Endpoints ===${colors.reset}\n`);

    // Create Build
    const buildData = { number_build: 1 };
    let result = await apiCall('POST', '/builds', buildData);
    if (logTest('Create Build', result.success, result.success ? `ID: ${result.data.data._id}` : result.error.message)) {
        testData.builds.push(result.data.data);
    }

    // Create another build
    buildData.number_build = 2;
    result = await apiCall('POST', '/builds', buildData);
    if (logTest('Create Second Build', result.success)) {
        testData.builds.push(result.data.data);
    }

    // Get All Builds
    result = await apiCall('GET', '/builds');
    logTest('Get All Builds', result.success, result.success ? `Count: ${result.data.length}` : result.error.message);

    // Get Available Builds
    result = await apiCall('GET', '/builds/available');
    logTest('Get Available Builds', result.success);
}

async function testFloors() {
    console.log(`\n${colors.blue}=== Testing Floor Endpoints ===${colors.reset}\n`);

    if (testData.builds.length === 0) {
        console.log(`${colors.yellow}⚠ No builds available, skipping floor tests${colors.reset}`);
        return;
    }

    // Create Floor
    const floorData = {
        number_floor: 1,
        build: testData.builds[0]._id,
        rooms: []
    };
    let result = await apiCall('POST', '/floors', floorData);
    if (logTest('Create Floor', result.success, result.success ? `ID: ${result.data.data._id}` : result.error.message)) {
        testData.floors.push(result.data.data);
    }

    // Create more floors
    for (let i = 2; i <= 3; i++) {
        floorData.number_floor = i;
        floorData.build = testData.builds[0]._id;
        result = await apiCall('POST', '/floors', floorData);
        if (result.success) {
            testData.floors.push(result.data.data);
        }
    }
    logTest('Create Multiple Floors', testData.floors.length >= 3);

    // Get Available Floors
    result = await apiCall('GET', '/floors/available');
    logTest('Get Available Floors', result.success);
}

async function testRooms() {
    console.log(`\n${colors.blue}=== Testing Room Endpoints ===${colors.reset}\n`);

    if (testData.floors.length === 0) {
        console.log(`${colors.yellow}⚠ No floors available, skipping room tests${colors.reset}`);
        return;
    }

    // Create Room
    const roomData = {
        number_room: 101,
        capacity: 4,
        floor: testData.floors[0]._id,
        students: []
    };
    let result = await apiCall('POST', '/rooms', roomData);
    if (logTest('Create Room', result.success, result.success ? `ID: ${result.data.data._id}` : result.error.message)) {
        testData.rooms.push(result.data.data);
    }

    // Create more rooms
    for (let i = 2; i <= 5; i++) {
        roomData.number_room = 100 + i;
        roomData.capacity = 4;
        roomData.floor = testData.floors[Math.floor((i - 1) / 2)]._id;
        result = await apiCall('POST', '/rooms', roomData);
        if (result.success) {
            testData.rooms.push(result.data.data);
        }
    }
    logTest('Create Multiple Rooms', testData.rooms.length >= 5);

    // Get Available Rooms
    result = await apiCall('GET', '/rooms/available');
    logTest('Get Available Rooms', result.success, result.success ? `Count: ${result.data.length}` : result.error.message);

    // Get Room Info
    if (testData.rooms.length > 0) {
        result = await apiCall('GET', `/rooms/${testData.rooms[0]._id}`);
        logTest('Get Room Info', result.success);
    }

    // Update Room Capacity
    if (testData.rooms.length > 0) {
        result = await apiCall('PUT', `/rooms/${testData.rooms[0]._id}`, { capacity: 6 });
        logTest('Update Room Capacity', result.success);
    }
}

async function testStudents() {
    console.log(`\n${colors.blue}=== Testing Student Endpoints ===${colors.reset}\n`);

    if (testData.hospitals.length === 0 || testData.builds.length === 0 || 
        testData.floors.length === 0 || testData.rooms.length === 0) {
        console.log(`${colors.yellow}⚠ Missing required data, skipping student tests${colors.reset}`);
        return;
    }

    const specializations = [
        'Adult Nursing',
        'Critical Care Nursing',
        'Maternal and Child Health Nursing',
        'Psychiatric and Mental Health Nursing',
        'Community Health Nursing',
        'Nursing Administration',
        'General'
    ];

    // Create Students
    for (let i = 1; i <= 10; i++) {
        const studentData = {
            name: `Student${i}`,
            lastName: `Last${i}`,
            email: `student${i}@example.com`,
            phone: `050123456${i}`,
            city: 'Gaza',
            birthDate: new Date(2000 + i, 0, 1),
            studentYear: ['1st year', '2nd year', '3rd year', '4th year'][(i - 1) % 4],
            status: 'student',
            address: `Address ${i}`,
            image: `https://example.com/image${i}.jpg`,
            hospital: testData.hospitals[i % testData.hospitals.length]._id,
            room: testData.rooms[i % testData.rooms.length]._id,
            building: testData.builds[0]._id,
            floor: testData.floors[i % testData.floors.length]._id,
            specialization: specializations[i % specializations.length]
        };

        const result = await apiCall('POST', '/users', studentData);
        if (result.success) {
            testData.students.push(result.data.data);
        }
    }
    logTest('Create Students', testData.students.length >= 10, `Created: ${testData.students.length}`);

    // Get All Students
    let result = await apiCall('GET', '/users');
    logTest('Get All Students', result.success, result.success ? `Count: ${result.data.count}` : result.error.message);

    // Get Student By ID
    if (testData.students.length > 0) {
        result = await apiCall('GET', `/users/${testData.students[0]._id}`);
        logTest('Get Student By ID', result.success);
    }

    // Get Students with filters
    result = await apiCall('GET', '/users?status=student');
    logTest('Get Students by Status', result.success);

    result = await apiCall('GET', '/users?specialization=Adult Nursing');
    logTest('Get Students by Specialization', result.success);

    // Update Student
    if (testData.students.length > 0) {
        result = await apiCall('PUT', `/users/${testData.students[0]._id}`, { name: 'Updated Name' });
        logTest('Update Student', result.success);
    }
}

async function testRoomOperations() {
    console.log(`\n${colors.blue}=== Testing Room Operations ===${colors.reset}\n`);

    if (testData.rooms.length === 0 || testData.students.length === 0) {
        console.log(`${colors.yellow}⚠ Missing required data, skipping room operation tests${colors.reset}`);
        return;
    }

    // Add Student to Room
    const result1 = await apiCall('POST', `/rooms/${testData.rooms[0]._id}/students`, {
        studentId: testData.students[0]._id
    });
    logTest('Add Student to Room', result1.success);

    // Get Room Info after adding student
    const result2 = await apiCall('GET', `/rooms/${testData.rooms[0]._id}`);
    logTest('Get Room Info After Adding Student', result2.success);

    // Remove Student from Room
    const result3 = await apiCall('DELETE', `/rooms/${testData.rooms[0]._id}/students`, {
        studentId: testData.students[0]._id
    });
    logTest('Remove Student from Room', result3.success);
}

async function testAutoAssign() {
    console.log(`\n${colors.blue}=== Testing Auto-Assign ===${colors.reset}\n`);

    const result = await apiCall('POST', '/auto-assign');
    logTest('Auto-Assign Students', result.success, result.success ? JSON.stringify(result.data) : result.error.message);
}

async function runAllTests() {
    console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║         API Testing & Data Seeding Script               ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

    try {
        await testHospitals();
        await testBuilds();
        await testFloors();
        await testRooms();
        await testStudents();
        await testRoomOperations();
        await testAutoAssign();

        console.log(`\n${colors.green}✓ All tests completed!${colors.reset}\n`);
        console.log(`${colors.cyan}Test Data Summary:${colors.reset}`);
        console.log(`  Hospitals: ${testData.hospitals.length}`);
        console.log(`  Builds: ${testData.builds.length}`);
        console.log(`  Floors: ${testData.floors.length}`);
        console.log(`  Rooms: ${testData.rooms.length}`);
        console.log(`  Students: ${testData.students.length}\n`);

    } catch (error) {
        console.error(`${colors.red}Error running tests: ${error.message}${colors.reset}`);
    }
}

// Check if server is running
async function checkServer() {
    try {
        await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`);
        return true;
    } catch (error) {
        try {
            await axios.get(`${BASE_URL}/builds`);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Main execution
(async () => {
    console.log(`${colors.yellow}Checking if server is running...${colors.reset}`);
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log(`${colors.red}✗ Server is not running. Please start the server first:${colors.reset}`);
        console.log(`  ${colors.cyan}cd Backend && npm run dev${colors.reset}\n`);
        process.exit(1);
    }

    console.log(`${colors.green}✓ Server is running${colors.reset}\n`);
    await runAllTests();
})();

