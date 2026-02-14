import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const HospitalDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [hospitals, setHospitals] = useState([
        {
            id: 1,
            name: 'City General Hospital',
            vacancies: 15,
            students: [1, 3] // student IDs
        },
        {
            id: 2,
            name: 'Regional Medical Center',
            vacancies: 8,
            students: [2, 4] // student IDs
        },
        {
            id: 3,
            name: 'University Hospital',
            vacancies: 22,
            students: [1, 2, 3, 4] // student IDs
        }
    ]);

    const [students, setStudents] = useState([
        {
            id: 1,
            name: 'Alice',
            lastname: 'Johnson',
            email: 'alice.johnson@example.com',
            address: '123 Main St',
            phone: '123-456-7890',
            city: 'New York',
            birthday: '1995-05-15',
            studentYear: 'Junior',
            status: 'g',
            specialis: 'Nursing',
            hospitalId: 1
        },
        {
            id: 2,
            name: 'Bob',
            lastname: 'Smith',
            email: 'bob.smith@example.com',
            address: '456 Elm St',
            phone: '987-654-3210',
            city: 'Los Angeles',
            birthday: '1994-08-20',
            studentYear: 'Senior',
            status: 's',
            specialis: 'Pediatric Nursing',
            hospitalId: 2
        },
        {
            id: 3,
            name: 'Charlie',
            lastname: 'Brown',
            email: 'charlie.brown@example.com',
            address: '789 Oak St',
            phone: '555-123-4567',
            city: 'Chicago',
            birthday: '1996-12-10',
            studentYear: 'Sophomore',
            status: 'g',
            specialis: 'Surgical Nursing',
            hospitalId: 1
        },
        {
            id: 4,
            name: 'Diana',
            lastname: 'Prince',
            email: 'diana.prince@example.com',
            address: '321 Pine St',
            phone: '444-567-8901',
            city: 'Houston',
            birthday: '1993-03-25',
            studentYear: 'Senior',
            status: 's',
            specialis: 'Emergency Nursing',
            buildId: 1,
            floorId: 2,
            roomId: 3
        }
    ]);

    const [showAddForm, setShowAddForm] = useState(false);

    const hospital = hospitals.find(h => h.id === parseInt(id));

    const availableGraduates = students.filter(s => s.status === 'g' && !s.hospitalId);
    const hospitalGraduates = students.filter(s => hospital.students.includes(s.id));

    const handleAddGraduate = (studentId) => {
        const selectedStudent = students.find(s => s.id === studentId);
        if (selectedStudent && hospital.students.length < hospital.vacancies) {
            setHospitals(prevHospitals =>
                prevHospitals.map(h =>
                    h.id === parseInt(id)
                        ? { ...h, students: [...h.students, studentId] }
                        : h
                )
            );
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.id === studentId
                        ? { ...student, hospitalId: parseInt(id) }
                        : student
                )
            );
        }
        setShowAddForm(false);
    };

    if (!hospital) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hospital Not Found</h2>
                <p className="text-gray-600">The requested hospital could not be found.</p>
                <button
                    onClick={() => navigate('/hospitals')}
                    className="mt-4 bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
                    Back to Hospitals
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
                        onClick={() => navigate('/hospitals')}
                        className="flex items-center text-[#003049] hover:text-[#003049] transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Hospitals
                    </button>
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                            {hospital.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                                {hospital.name}
                            </h1>
                            <p className="text-lg text-gray-600">Hospital ID: {hospital.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hospital Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Hospital Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Hospital ID</p>
                                <p className="text-gray-900">{hospital.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Available Vacancies</p>
                                <p className="text-gray-900">{hospital.vacancies - hospital.students.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Assigned Graduates</p>
                                <p className="text-gray-900">{hospital.students.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graduates in Hospital */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 font-['Poppins',sans-serif]">
                        Graduates at {hospital.name}
                    </h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        {showAddForm ? 'Cancel' : 'Add Graduate'}
                    </button>
                </div>

                {showAddForm && availableGraduates.length > 0 && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold mb-4">Available Graduates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableGraduates.map(graduate => (
                                <div
                                    key={graduate.id}
                                    className="flex items-center justify-between bg-white p-3 rounded-lg border"
                                >
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                            {graduate.name.charAt(0)}{graduate.lastname.charAt(0)}
                                        </div>
                                        <span className="text-gray-900">{graduate.name} {graduate.lastname}</span>
                                    </div>
                                    <button
                                        onClick={() => handleAddGraduate(graduate.id)}
                                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showAddForm && availableGraduates.length === 0 && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-gray-500">No available graduates to add.</p>
                    </div>
                )}

                {hospitalGraduates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hospitalGraduates.map((graduate, index) => (
                            <div
                                key={graduate.id}
                                onClick={() => navigate(`/students/${graduate.id}`)}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up cursor-pointer"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                        {graduate.name.charAt(0)}{graduate.lastname.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{graduate.name} {graduate.lastname}</h3>
                                        <p className="text-sm text-gray-500">Graduate</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                        {graduate.email}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        {graduate.specialis}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <p className="text-gray-500 text-lg">No graduates currently assigned to this hospital</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalDetails;




