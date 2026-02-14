import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Students = () => {
    const navigate = useNavigate();
    // Specialization enum from user.model.js
    const specializations = [
        'Adult Nursing',
        'Critical Care Nursing',
        'Maternal and Child Health Nursing',
        'Psychiatric and Mental Health Nursing',
        'Community Health Nursing',
        'Nursing Administration',
        'General'
    ];
    // Student year enum from user.model.js
    const studentYears = ['1st year', '2nd year', '3rd year', '4th year'];

    const [students, setStudents] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newStudent, setNewStudent] = useState({
        name: '',
        lastname: '',
        email: '',
        address: '',
        phone: '',
        city: '',
        birthday: '',
        studentYear: '',
        specialis: '',
        buildId: '',
        floorId: '',
        roomId: ''
    });

    // Fetch students from API
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/users');
                if (response.data.success) {
                    setStudents(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, []);

    // Fetch buildings, floors, and rooms from API
    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/builds');
                if (response.data) {
                    setBuildings(response.data);
                }
            } catch (error) {
                console.error('Error fetching buildings:', error);
            }
        };

        const fetchFloors = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/floors');
                if (response.data) {
                    setFloors(response.data);
                }
            } catch (error) {
                console.error('Error fetching floors:', error);
            }
        };

        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/rooms/available');
                if (response.data) {
                    // Handle response structure: { availableRooms: [...], availableRoomsCount: number, ... }
                    if (response.data.availableRooms && Array.isArray(response.data.availableRooms)) {
                        setRooms(response.data.availableRooms);
                    } else if (response.data.rooms && Array.isArray(response.data.rooms)) {
                        // Fallback for different response structure
                        setRooms(response.data.rooms);
                    } else if (Array.isArray(response.data)) {
                        // Fallback if response is directly an array
                        setRooms(response.data);
                    } else {
                        console.warn('Unexpected rooms response structure:', response.data);
                        setRooms([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
                setRooms([]);
            }
        };

        fetchBuildings();
        fetchFloors();
        fetchRooms();
    }, []);

    // Calculate statistics
    const stats = {
        totalStudents: students.length,
        graduatedStudents: students.filter(s => s.status === 'graduated' || s.status === 'g').length,
        hospitalsLinked: new Set(students.filter(s => s.hospital || s.hospitalId).map(s => s.hospital || s.hospitalId)).size,
        availableRooms: students.filter(s => s.room || s.roomId).length
    };

    const filteredStudents = students.filter(student =>
        `${student.name} ${student.lastName || student.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Map form fields to API expected format
            const studentData = {
                name: newStudent.name,
                lastName: newStudent.lastname,
                email: newStudent.email,
                address: newStudent.address,
                phone: newStudent.phone,
                city: newStudent.city,
                birthDate: newStudent.birthday,
                studentYear: newStudent.studentYear,
                specialization: newStudent.specialis,
                building: newStudent.buildId || null,
                floor: newStudent.floorId || null,
                room: newStudent.roomId || null, // Convert empty string to null
                status: 'student',
                image: '' // You may need to add image upload functionality
            };

            const response = await axios.post('http://localhost:3000/api/v1/users', studentData);

            if (response.data.success) {
                // Add the new student to the list
                setStudents(prev => [...prev, response.data.data]);
                // Reset form
                setNewStudent({
                    name: '',
                    lastname: '',
                    email: '',
                    address: '',
                    phone: '',
                    city: '',
                    birthday: '',
                    studentYear: '',
                    specialis: '',
                    buildId: '',
                    floorId: '',
                    roomId: ''
                });
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error creating student:', error);
            const errorMessage = error.response?.data?.message || 'Error creating student';
            const errorDetails = error.response?.data?.errors || error.response?.data;
            console.error('Error details:', errorDetails);
            alert(`${errorMessage}\n\nCheck console for more details.`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-[#003049] to-[#003049] text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Graduated Students</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.graduatedStudents}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Hospitals Linked</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.hospitalsLinked}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.availableRooms}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search students by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                />
            </div>

            {/* Students Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Students</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[#003049] text-white px-6 py-3 rounded-lg hover:bg-[#003049] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        {showForm ? 'Cancel' : 'Add New Student'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="First Name"
                                value={newStudent.name}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="text"
                                name="lastname"
                                placeholder="Last Name"
                                value={newStudent.lastname}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={newStudent.email}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone"
                                value={newStudent.phone}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={newStudent.address}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={newStudent.city}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="date"
                                name="birthday"
                                value={newStudent.birthday}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <select
                                name="studentYear"
                                value={newStudent.studentYear}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            >
                                <option value="">Select Year</option>
                                {studentYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <select
                                name="specialis"
                                value={newStudent.specialis}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            >
                                <option value="">Select Specialization</option>
                                {specializations.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                            <select
                                name="buildId"
                                value={newStudent.buildId}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            >
                                <option value="">Select Building</option>
                                {buildings && buildings.length > 0 ? (
                                    buildings.map(build => (
                                        <option key={build._id} value={build._id}>
                                            Building {build.number_build || build.build_number || build.number || 'N/A'}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No buildings available</option>
                                )}
                            </select>
                            <select
                                name="floorId"
                                value={newStudent.floorId}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            >
                                <option value="">Select Floor</option>
                                {floors && floors.length > 0 ? (
                                    floors.map(floor => (
                                        <option key={floor._id} value={floor._id}>
                                            Floor {floor.number_floor || floor.number || 'N/A'}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No floors available</option>
                                )}
                            </select>
                            <select
                                name="roomId"
                                value={newStudent.roomId}
                                onChange={handleInputChange}
 
<<<<<<< HEAD
                                
=======
                               
>>>>>>> d7d6efc (modifications)
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
          >
                                <option value="">Select Room</option>
                                {rooms && rooms.length > 0 ? (
                                    rooms
                                        .filter(room => room.empty_spaces > 0)
                                        .map(room => (
                                            <option key={room._id} value={room._id}>
                                                Room {room.number_room || room.number || 'N/A'} (Available: {room.empty_spaces || 0}/{room.capacity || 0})
                                            </option>
                                        ))
                                ) : (
                                    <option value="" disabled>No rooms available</option>
                                )}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Add Student
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1   gap-6">
                    {filteredStudents.map((student, index) => {
                        const studentId = student._id || student.id;
                        const lastName = student.lastName || student.lastname || '';
                        return (
                            <div
                                key={studentId}
                                onClick={() => navigate(`/students/${studentId}`)}
                                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform   animate-slide-up cursor-pointer"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center">

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 font-['Poppins',sans-serif]">{student.name} {lastName}</h3>
                                        <p className="text-sm text-gray-500">{student.status === 'graduated' || student.status === 'g' ? 'Graduate' : 'Student'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Students;




