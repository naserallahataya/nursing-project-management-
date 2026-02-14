import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);

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

    // Fetch student data
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/users/${id}`);
                if (response.data.success) {
                    const studentData = response.data.data;
                    setStudent(studentData);
                    // Initialize form data
                    setFormData({
                        name: studentData.name || '',
                        lastName: studentData.lastName || '',
                        email: studentData.email || '',
                        phone: studentData.phone || '',
                        address: studentData.address || '',
                        city: studentData.city || '',
                        birthDate: studentData.birthDate ? new Date(studentData.birthDate).toISOString().split('T')[0] : '',
                        studentYear: studentData.studentYear || '',
                        specialization: studentData.specialization || '',
                        status: studentData.status || 'student',
                        building: studentData.building?._id || studentData.building || '',
                        floor: studentData.floor?._id || studentData.floor || '',
                        room: studentData.room?._id || studentData.room || '',
                        hospital: studentData.hospital?._id || studentData.hospital || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching student:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    // Fetch buildings, floors, and rooms for dropdowns
    useEffect(() => {
        if (!isEditing) return;

        const fetchBuildings = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/builds/available');
                if (response.data) {
                    setBuildings(response.data);
                }
            } catch (error) {
                console.error('Error fetching buildings:', error);
            }
        };

        const fetchFloors = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/floors/available');
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
                    if (response.data.availableRooms && Array.isArray(response.data.availableRooms)) {
                        setRooms(response.data.availableRooms);
                    } else if (Array.isArray(response.data)) {
                        setRooms(response.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchBuildings();
        fetchFloors();
        fetchRooms();
    }, [isEditing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                name: formData.name,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                birthDate: formData.birthDate,
                studentYear: formData.studentYear,
                specialization: formData.specialization,
                status: formData.status,
                building: formData.building,
                floor: formData.floor,
                room: formData.room,
                hospital: formData.hospital
            };

            const response = await axios.put(`http://localhost:3000/api/v1/users/${id}`, updateData);

            if (response.data.success) {
                setStudent(response.data.data);
                setIsEditing(false);
                alert('Student updated successfully!');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Error updating student. Please check the console for details.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-6 rounded-lg  ">
                    <p className="text-gray-600 text-center">Loading buildings...</p>
                </div>
            </div>
        );
    }
    if (!student) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Not Found</h2>
                <p className="text-gray-600">The requested student could not be found.</p>
                <button
                    onClick={() => navigate('/students')}
                    className="mt-4 bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    const displayStudent = isEditing ? formData : student;
    const lastName = displayStudent.lastName || displayStudent.lastname || '';
    const name = displayStudent.name || '';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/students')}
                        className="flex items-center text-[#003049] hover:text-[#003049] transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Students
                    </button>
                    <div className="flex items-center gap-4">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                            >
                                Edit Student
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-[#780000] text-white px-4 py-2 rounded-lg hover:bg-[#780000] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center">
                  
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                            {name} {lastName}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {displayStudent.status === 'graduated' || displayStudent.status === 'g' ? 'Graduate' : 'Student'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Personal Information</h2>
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Birthday</label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-gray-900">{student.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="text-gray-900">{student.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                    <p className="text-gray-900">{student.address}, {student.city}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Birthday</p>
                                    <p className="text-gray-900">
                                        {student.birthDate ? new Date(student.birthDate).toLocaleDateString("en-US") : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Academic Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Academic Information</h2>
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Year</label>
                                <select
                                    name="studentYear"
                                    value={formData.studentYear}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                >
                                    {studentYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Specialization</label>
                                <select
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                >
                                    <option value="">Select Specialization</option>
                                    {specializations.map(spec => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                >
                                    <option value="student">Student</option>
                                    <option value="graduated">Graduate</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {formData.status === 'graduated' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Hospital</label>
                                    <input
                                        type="text"
                                        name="hospital"
                                        value={formData.hospital}
                                        onChange={handleInputChange}
                                        placeholder="Hospital ID"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Building</label>
                                        <select
                                            name="building"
                                            value={formData.building}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                        >
                                            <option value="">Select Building</option>
                                            {buildings.map(build => (
                                                <option key={build._id} value={build._id}>
                                                    Building {build.number_build}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Floor</label>
                                        <select
                                            name="floor"
                                            value={formData.floor}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                        >
                                            <option value="">Select Floor</option>
                                            {floors.map(floor => (
                                                <option key={floor._id} value={floor._id}>
                                                    Floor {floor.number_floor}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Room</label>
                                        <select
                                            name="room"
                                            value={formData.room}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                        >
                                            <option value="">Select Room</option>
                                            {rooms.map(room => (
                                                <option key={room._id} value={room._id}>
                                                    Room {room.number_room} (Available: {room.empty_spaces}/{room.capacity})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Year</p>
                                    <p className="text-gray-900">{student.studentYear}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Specialization</p>
                                    <p className="text-gray-900">{student.specialization || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-gray-900">{student.status === 'graduated' || student.status === 'g' ? 'Graduate' : 'Student'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {student.status === 'graduated' || student.status === 'g' ? (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Hospital</p>
                                        <p className="text-gray-900">
                                            {student.hospital?.name || student.hospital?._id || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Building</p>
                                            <p className="text-gray-900">
                                                {student.building?.number_build ? `Building ${student.building.number_build}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Floor</p>
                                            <p className="text-gray-900">
                                                {student.floor?.number_floor ? `Floor ${student.floor.number_floor}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Room</p>
                                            <p className="text-gray-900">
                                                {student.room?.number_room ? `Room ${student.room.number_room}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetails;




