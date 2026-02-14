const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import models
const Hospital = require('./models/hospital.model');
const Build = require('./models/build.model');
const Floor = require('./models/floor.model');
const Room = require('./models/room.model');
const User = require('./models/user.model');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Seed function
const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Room.deleteMany({});
        await Floor.deleteMany({});
        await Build.deleteMany({});
        await Hospital.deleteMany({});
        console.log('Existing data cleared');

        // 1. Create Hospitals
        console.log('Creating hospitals...');
        const hospitals = await Hospital.insertMany([
            {
                name: 'Damascus Hospital',
                vacancies: 50,
                students: []
            },
            {
                name: 'Al-Mouwasat Hospital',
                vacancies: 40,
                students: []
            },
            {
                name: 'Ibn Al-Nafis Hospital',
                vacancies: 35,
                students: []
            },
            {
                name: 'Al-Assad University Hospital',
                vacancies: 45,
                students: []
            }
        ]);
        console.log(`Created ${hospitals.length} hospitals`);

        // 2. Create Builds
        console.log('Creating builds...');
        const builds = await Build.insertMany([
            { number_build: 1, floors: [] },
            { number_build: 2, floors: [] },
            { number_build: 3, floors: [] }
        ]);
        console.log(`Created ${builds.length} builds`);

        // 3. Create Floors for each build
        console.log('Creating floors...');
        const floors = [];
        for (const build of builds) {
            const buildFloors = await Floor.insertMany([
                { number_floor: 1, build: build._id, rooms: [] },
                { number_floor: 2, build: build._id, rooms: [] },
                { number_floor: 3, build: build._id, rooms: [] }
            ]);
            floors.push(...buildFloors);
            
            // Update build with floors
            build.floors = buildFloors.map(f => f._id);
            await build.save();
        }
        console.log(`Created ${floors.length} floors`);

        // 4. Create Rooms for each floor
        console.log('Creating rooms...');
        const rooms = [];
        for (const floor of floors) {
            // Get the build number and floor number to create unique room numbers
            const build = await Build.findById(floor.build);
            const buildNum = build.number_build;
            const floorNum = floor.number_floor;
            const baseRoomNum = buildNum * 1000 + floorNum * 100;
            
            const floorRooms = await Room.insertMany([
                { number_room: baseRoomNum + 1, capacity: 4, floor: floor._id, students: [] },
                { number_room: baseRoomNum + 2, capacity: 4, floor: floor._id, students: [] },
                { number_room: baseRoomNum + 3, capacity: 3, floor: floor._id, students: [] },
                { number_room: baseRoomNum + 4, capacity: 4, floor: floor._id, students: [] },
                { number_room: baseRoomNum + 5, capacity: 2, floor: floor._id, students: [] }
            ]);
            rooms.push(...floorRooms);
            
            // Update floor with rooms
            floor.rooms = floorRooms.map(r => r._id);
            await floor.save();
        }
        console.log(`Created ${rooms.length} rooms`);

        // 5. Create Students/Users
        console.log('Creating students...');
        const specializations = [
            'Adult Nursing',
            'Critical Care Nursing',
            'Maternal and Child Health Nursing',
            'Psychiatric and Mental Health Nursing',
            'Community Health Nursing',
            'Nursing Administration',
            'General'
        ];

        const studentYears = ['1st year', '2nd year', '3rd year', '4th year'];
        const cities = ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Tartus'];
        const statuses = ['student', 'graduated'];

        const students = [];
        let studentCount = 0;

        // Refresh rooms from database to get current state
        const allRooms = await Room.find();

        // Arabic first names and last names for more realistic data
        const firstNames = [
            'Sara', 'Layla', 'Fatima', 'Aisha', 'Mariam', 'Nour', 'Hala', 'Rana',
            'Yara', 'Zeina', 'Lina', 'Rania', 'Dina', 'Nada', 'Hiba', 'Rima',
            'Nour', 'Salma', 'Lama', 'Reem', 'Hanan', 'Wafa', 'Amira', 'Nisreen'
        ];
        const lastNames = [
            'Al-Ahmad', 'Al-Hassan', 'Al-Mahmoud', 'Al-Ibrahim', 'Al-Khalil',
            'Al-Said', 'Al-Ali', 'Al-Hussein', 'Al-Mohammed', 'Al-Omar',
            'Al-Youssef', 'Al-Karim', 'Al-Nasser', 'Al-Farouk', 'Al-Zahra'
        ];

        // Create students and assign them to rooms systematically
        for (let i = 0; i < 80; i++) {
            // Find a room with available capacity
            const availableRoom = allRooms.find(r => r.students.length < r.capacity);
            
            if (!availableRoom) {
                console.log(`No available rooms for student ${i + 1}`);
                break;
            }

            // Get the floor and build for this room
            const floor = await Floor.findById(availableRoom.floor);
            const build = await Build.findOne({ floors: floor._id });
            
            // Select a hospital with available vacancies
            let hospital = hospitals.find(h => h.vacancies > 0);
            if (!hospital) {
                // If no hospital has vacancies, select randomly
                hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
            }

            // Generate realistic name
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const city = cities[Math.floor(Math.random() * cities.length)];
            const year = 1998 + Math.floor(Math.random() * 6); // Ages 18-24
            const month = Math.floor(Math.random() * 12);
            const day = Math.floor(Math.random() * 28) + 1;

            const student = await User.create({
                name: firstName,
                lastName: lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@nursing.edu`,
                phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
                city: city,
                birthDate: new Date(year, month, day),
                studentYear: studentYears[Math.floor(Math.random() * studentYears.length)],
                status: i < 60 ? 'student' : 'graduated', // First 60 are students, rest graduated
                address: `${city}, Street ${Math.floor(Math.random() * 100) + 1}, Building ${Math.floor(Math.random() * 20) + 1}`,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}`,
                hospital: hospital._id,
                room: availableRoom._id,
                building: build._id,
                floor: floor._id,
                specialization: specializations[Math.floor(Math.random() * specializations.length)]
            });

            students.push(student);

            // Add student to room
            availableRoom.students.push(student._id);
            await availableRoom.save();

            // Add student to hospital
            hospital.students.push(student._id);
            hospital.vacancies = Math.max(0, hospital.vacancies - 1);
            await hospital.save();

            // Refresh rooms list to get updated capacity
            const roomIndex = allRooms.findIndex(r => r._id.toString() === availableRoom._id.toString());
            if (roomIndex !== -1) {
                allRooms[roomIndex] = await Room.findById(availableRoom._id);
            }

            studentCount++;
        }

        console.log(`Created ${studentCount} students`);

        // Final summary with details
        console.log('\n=== SEED SUMMARY ===');
        console.log(`Hospitals: ${hospitals.length}`);
        hospitals.forEach(h => {
            console.log(`  - ${h.name}: ${h.students.length} students, ${h.vacancies} vacancies remaining`);
        });
        
        console.log(`\nBuilds: ${builds.length}`);
        builds.forEach(b => {
            console.log(`  - Build ${b.number_build}: ${b.floors.length} floors`);
        });
        
        console.log(`\nFloors: ${floors.length}`);
        console.log(`Rooms: ${rooms.length}`);
        const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
        const totalOccupied = rooms.reduce((sum, r) => sum + r.students.length, 0);
        console.log(`  - Total capacity: ${totalCapacity}`);
        console.log(`  - Occupied: ${totalOccupied}`);
        console.log(`  - Available: ${totalCapacity - totalOccupied}`);
        
        console.log(`\nStudents: ${studentCount}`);
        const studentsByStatus = await User.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        studentsByStatus.forEach(s => {
            console.log(`  - ${s._id}: ${s.count}`);
        });
        
        const studentsBySpecialization = await User.aggregate([
            { $group: { _id: '$specialization', count: { $sum: 1 } } }
        ]);
        console.log('\nStudents by Specialization:');
        studentsBySpecialization.forEach(s => {
            console.log(`  - ${s._id}: ${s.count}`);
        });
        
        console.log('\n✅ Database seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();

