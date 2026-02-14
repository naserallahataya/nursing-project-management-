import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService, userService } from '../services/api';

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ capacity: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [operationLoading, setOperationLoading] = useState({});

    // Fetch room data
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await roomService.getById(id);
                if (response.data) {
                    setRoom(response.data);
                    setFormData({ capacity: response.data.capacity });
                }
            } catch (error) {
                console.error('Error fetching room:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    // Fetch available students (students without rooms) - optimized endpoint
    useEffect(() => {
        const fetchAvailableStudents = async () => {
            if (!showAddForm) {
                setAvailableStudents([]);
                return;
            }
            
            setLoadingStudents(true);
            try {
                const response = await userService.getWithoutRoom();
                if (response.data.success) {
                    setAvailableStudents(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching available students:', error);
                setAvailableStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchAvailableStudents();
    }, [showAddForm]);

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
            const response = await axios.put(`http://localhost:3000/api/v1/rooms/${id}`, {
                capacity: parseInt(formData.capacity)
            });
            
            if (response.data) {
                // Refresh room data
                const roomResponse = await axios.get(`http://localhost:3000/api/v1/rooms/${id}`);
                if (roomResponse.data) {
                    setRoom(roomResponse.data);
                    setIsEditing(false);
                    alert('Room updated successfully!');
                }
            }
        } catch (error) {
            console.error('Error updating room:', error);
            const errorMsg = error.response?.data?.msg || error.response?.data?.error || 'Error updating room';
            alert(errorMsg);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            const response = await axios.delete(`http://localhost:3000/api/v1/rooms/${id}/students`, {
                data: { studentId }
            });
            
            if (response.data) {
                // Refresh room data
                const roomResponse = await axios.get(`http://localhost:3000/api/v1/rooms/${id}`);
                if (roomResponse.data) {
                    setRoom(roomResponse.data);
                }
                alert('Student removed from room successfully!');
            }
        } catch (error) {
            console.error('Error removing student:', error);
            const errorMsg = error.response?.data?.msg || error.response?.data?.error || 'Error removing student';
            alert(errorMsg);
        }
    };

    const handleAddStudent = async (studentId) => {
        try {
            const response = await axios.post(`http://localhost:3000/api/v1/rooms/${id}/students`, {
                studentId
            });
            
            if (response.data) {
                // Refresh room data
                const roomResponse = await axios.get(`http://localhost:3000/api/v1/rooms/${id}`);
                if (roomResponse.data) {
                    setRoom(roomResponse.data);
                }
                setShowAddForm(false);
                alert('Student added to room successfully!');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            const errorMsg = error.response?.data?.msg || error.response?.data?.error || 'Error adding student';
            alert(errorMsg);
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

    if (!room) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Room Not Found</h2>
                <p className="text-gray-600">The requested room could not be found.</p>
                <button
                    onClick={() => navigate('/rooms')}
                    className="mt-4 bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
                    Back to Rooms
                </button>
            </div>
        );
    }

    const roomStudents = room.students || [];
    const roomNumber = room.number_room || room.number;
    const capacity = room.capacity;
    const currentStudents = room.current_students || roomStudents.length;
    const emptySpaces = room.empty_spaces || (capacity - currentStudents);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/rooms')}
                        className="flex items-center text-[#003049] hover:text-[#003049] transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Rooms
                    </button>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                        >
                            Edit Room
                        </button>
                    )}
                </div>
                <div className="flex items-center">
                   
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                            Room {roomNumber}
                        </h1>
                        {room.floor_number && room.build_number && (
                            <p className="text-lg text-gray-600">Building {room.build_number} - Floor {room.floor_number}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Room Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Room Information</h2>
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    min={currentStudents}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum capacity: {currentStudents} (current number of students)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({ capacity: room.capacity });
                                    }}
                                    className="bg-[#780000] text-white px-4 py-2 rounded-md hover:bg-[#780000] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {room.build_number && (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Building</p>
                                        <p className="text-gray-900">Building {room.build_number}</p>
                                    </div>
                                </div>
                            )}
                            {room.floor_number && (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Floor</p>
                                        <p className="text-gray-900">Floor {room.floor_number}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Capacity</p>
                                    <p className="text-gray-900">{capacity} students</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Current Occupancy</p>
                                    <p className="text-gray-900">{currentStudents} students ({emptySpaces} empty spaces)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Students in Room */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">
                    Students in Room {roomNumber}
                </h2>

                {roomStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {roomStudents.map((student, index) => {
                            const studentId = student._id || student.id;
                            const lastName = student.lastName || student.lastname || '';
                            const name = student.name || '';
                            return (
                                <div
                                    key={studentId}
                                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up relative"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveStudent(studentId);
                                        }}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                                        title="Remove student"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                    <div
                                        onClick={() => navigate(`/students/${studentId}`)}
                                        className="cursor-pointer pr-8"
                                    >
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                                {name.charAt(0)}{lastName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{name} {lastName}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {student.status === 'graduated' || student.status === 'g' ? 'Graduate' : 'Student'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {student.email && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                                    </svg>
                                                    {student.email}
                                                </div>
                                            )}
                                            {student.specialization && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                    {student.specialization}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 mb-6">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <p className="text-gray-500 text-lg">No students currently assigned to this room</p>
                    </div>
                )}

                {/* Add Student Section */}
                <div className="border-t pt-6">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        {showAddForm ? 'Cancel' : 'Add Student'}
                    </button>

                    {showAddForm && availableStudents.length > 0 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold mb-4">Available Students</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableStudents.map(student => {
                                    const studentId = student._id || student.id;
                                    const lastName = student.lastName || student.lastname || '';
                                    const name = student.name || '';
                                    return (
                                        <div
                                            key={studentId}
                                            className="flex items-center justify-between bg-white p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                                    {name.charAt(0)}{lastName.charAt(0)}
                                                </div>
                                                <span className="text-gray-900">{name} {lastName}</span>
                                            </div>
                                            <button
                                                onClick={() => handleAddStudent(studentId)}
                                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {showAddForm && availableStudents.length === 0 && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <p className="text-gray-500">No available students to add.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;




