import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BuildingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock building data - in a real app, this would come from an API or context
    const buildings = [
        {
            id: 1,
            name: 'Building 1',
            floors: [
                {
                    id: 1,
                    number: 1,
                    rooms: [
                        { id: 1, number: '101', capacity: 6, students: 2 },
                        { id: 2, number: '102', capacity: 6, students: 0 },
                        { id: 3, number: '103', capacity: 6, students: 4 }
                    ]
                },
                {
                    id: 2,
                    number: 2,
                    rooms: [
                        { id: 4, number: '201', capacity: 6, students: 3 },
                        { id: 5, number: '202', capacity: 6, students: 1 },
                        { id: 6, number: '203', capacity: 6, students: 0 }
                    ]
                }
            ]
        },
        {
            id: 2,
            name: 'Building 2',
            floors: [
                {
                    id: 3,
                    number: 1,
                    rooms: [
                        { id: 7, number: '101', capacity: 6, students: 5 },
                        { id: 8, number: '102', capacity: 6, students: 2 }
                    ]
                },
                {
                    id: 4,
                    number: 2,
                    rooms: [
                        { id: 9, number: '201', capacity: 6, students: 1 },
                        { id: 10, number: '202', capacity: 6, students: 0 }
                    ]
                }
            ]
        }
    ];

    const building = buildings.find(b => b.id === parseInt(id));

    if (!building) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Building Not Found</h2>
                <p className="text-gray-600">The requested building could not be found.</p>
                <button
                    onClick={() => navigate('/buildings')}
                    className="mt-4 bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
                    Back to Buildings
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/buildings')}
                        className="flex items-center text-[#003049] hover:text-[#003049] transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Buildings
                    </button>
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                            {building.id}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                                {building.name}
                            </h1>
                            <p className="text-lg text-gray-600">Building ID: {building.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Building Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Building Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Building ID</p>
                                <p className="text-gray-900">{building.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Floors</p>
                                <p className="text-gray-900">{building.floors.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                                <p className="text-gray-900">{building.floors.reduce((sum, floor) => sum + floor.rooms.length, 0)}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Occupied Rooms</p>
                                <p className="text-gray-900">{building.floors.reduce((sum, floor) => sum + floor.rooms.filter(room => room.students > 0).length, 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floors and Rooms */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Floors & Rooms</h2>
                <div className="space-y-6">
                    {building.floors.map((floor, floorIndex) => (
                        <div key={floor.id} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Floor {floor.number}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {floor.rooms.map((room, roomIndex) => (
                                    <div
                                        key={room.id}
                                        onClick={() => navigate(`/rooms/${room.id}`)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg  cursor-pointer animate-slide-up"
                                        style={{ animationDelay: `${(floorIndex * floor.rooms.length + roomIndex) * 0.1}s` }}
                                    >
                                        <div className="flex items-center justify-center mb-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {room.number}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-lg font-semibold text-gray-900">Room {room.number}</h4>
                                            <p className="text-sm text-gray-500">Capacity: {room.capacity}</p>
                                            <p className="text-sm text-gray-500">Students: {room.students}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuildingDetails;



