import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Rooms = () => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [showAutoAssign, setShowAutoAssign] = useState(false);
    const [newRoom, setNewRoom] = useState({
        number_room: '',
        capacity: '',
        floor: ''
    });

    const [rooms, setRooms] = useState([]);
    const [floors, setFloors] = useState([]);

    // Fetch rooms from API
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/rooms');
                if (response.data && response.data.rooms) {
                    setRooms(response.data.rooms);
                } else if (Array.isArray(response.data)) {
                    setRooms(response.data);
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };
        fetchRooms();
    }, []);

    // Fetch floors for form dropdown
    useEffect(() => {
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
        fetchFloors();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoom(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const roomData = {
                number_room: parseInt(newRoom.number_room),
                capacity: parseInt(newRoom.capacity),
                floor: newRoom.floor || undefined,
                students: []
            };

            const response = await axios.post('http://localhost:3000/api/v1/rooms', roomData);
            
            if (response.data.success) {
                // Refresh rooms list
                const roomsResponse = await axios.get('http://localhost:3000/api/v1/rooms');
                if (roomsResponse.data && roomsResponse.data.rooms) {
                    setRooms(roomsResponse.data.rooms);
                } else if (Array.isArray(roomsResponse.data)) {
                    setRooms(roomsResponse.data);
                }
                
                setNewRoom({
                    number_room: '',
                    capacity: '',
                    floor: ''
                });
                setShowForm(false);
                alert('Room created successfully!');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Error creating room. Please check the console for details.');
        }
    };

    const handleAutoAssign = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/v1/auto-assign');
            if (response.data) {
                // Refresh rooms list after auto-assign
                const roomsResponse = await axios.get('http://localhost:3000/api/v1/rooms');
                if (roomsResponse.data && roomsResponse.data.rooms) {
                    setRooms(roomsResponse.data.rooms);
                } else if (Array.isArray(roomsResponse.data)) {
                    setRooms(roomsResponse.data);
                }
                setShowAutoAssign(false);
                alert('Students have been automatically assigned to available rooms.');
            }
        } catch (error) {
            console.error('Error auto-assigning students:', error);
            alert('Error auto-assigning students. Please check the console for details.');
        }
    };

    const confirmAutoAssign = () => {
        setShowAutoAssign(true);
    };

    const availableRooms = rooms.filter(r => {
        const studentsCount = r.students_count || r.students?.length || 0;
        return studentsCount < r.capacity;
    });

    return (
        <div className="space-y-6">
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-[#003049] to-[#003049] text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                            <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Occupied Rooms</p>
                            <p className="text-2xl font-bold text-gray-900">{rooms.filter(r => r.students_count > 0).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                            <p className="text-2xl font-bold text-gray-900">{rooms.filter(r => r.students_count === 0).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white mr-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                            <p className="text-2xl font-bold text-gray-900">{rooms.reduce((sum, room) => sum + room.capacity, 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 font-['Poppins',sans-serif]">Rooms</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={confirmAutoAssign}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Auto Assign Students
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-[#003049] text-white px-6 py-3 rounded-lg hover:-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            {showForm ? 'Cancel' : 'Add New Room'}
                        </button>
                    </div>
                </div>

                {showAutoAssign && (
                    <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800">Confirm Auto Assignment</h3>
                                <p className="text-yellow-700">
                                    This will automatically assign students to {availableRooms.length} available rooms.
                                    Are you sure you want to proceed?
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAutoAssign(false)}
                                    className="bg-[#780000] text-white px-4 py-2 rounded-md hover:bg-[#780000]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAutoAssign}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="number"
                                name="number_room"
                                placeholder="Room Number"
                                value={newRoom.number_room}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="number"
                                name="capacity"
                                placeholder="Capacity"
                                value={newRoom.capacity}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <select
                                name="floor"
                                value={newRoom.floor}
                                onChange={handleInputChange}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            >
                                <option value="">Select Floor (Optional)</option>
                                {floors.map(floor => (
                                    <option key={floor._id} value={floor._id}>
                                        Floor {floor.number_floor}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Add Room
                        </button>
                    </form>
                )}

                <div className="grid grid-cols-1   gap-6">
                    {rooms.map((room, index) => {
                        const roomId = room._id || room.id;
                        const roomNumber = room.number_room || room.number;
                        const capacity = room.capacity;
                        const studentsCount = room.students_count || room.students?.length || 0;
                        return (
                            <div
                                key={roomId}
                                onClick={() => navigate(`/rooms/${roomId}`)}
                                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl "
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center justify-center mb-4">
                              
                                </div>
                                <div className=" ">
                                    <h3 className="text-xl font-semibold text-gray-900 font-['Poppins',sans-serif]">Room {roomNumber}</h3>
                                    <p className="text-sm text-gray-500">Capacity: {capacity}</p>
                                    <p className="text-sm text-gray-500">Students: {studentsCount}</p>
                                    {room.floor_number && (
                                        <p className="text-sm text-gray-500">Floor: {room.floor_number}</p>
                                    )}
                                    {room.build_number && (
                                        <p className="text-sm text-gray-500">Building: {room.build_number}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Rooms;



