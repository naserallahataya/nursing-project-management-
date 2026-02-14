import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Hospitals = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedHospitalId, setExpandedHospitalId] = useState(null);
    const [newHospital, setNewHospital] = useState({
        name: '',
        vacancies: ''
    });

    // Fetch hospitals from API
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/hospitals');
                if (response.data) {
                    setHospitals(response.data);
                }
            } catch (error) {
                console.error('Error fetching hospitals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    // Fetch available students (students without hospitals or graduated students)
    useEffect(() => {
        const fetchAvailableStudents = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/users');
                if (response.data.success) {
                    // Filter students that don't have a hospital assigned or are graduated
                    const available = response.data.data.filter(
                        student => (!student.hospital || student.hospital === null) &&
                            (student.status === 'graduated' || student.status === 'g')
                    );
                    setAvailableStudents(available);
                }
            } catch (error) {
                console.error('Error fetching available students:', error);
            }
        };
        if (showAssignForm) {
            fetchAvailableStudents();
        }
    }, [showAssignForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewHospital(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateHospital = async (e) => {
        e.preventDefault();
        try {
            const hospitalData = {
                name: newHospital.name,
                vacancies: parseInt(newHospital.vacancies)
            };

            const response = await axios.post('http://localhost:3000/api/v1/hospitals', hospitalData);

            if (response.data) {
                // Refresh hospitals list
                const hospitalsResponse = await axios.get('http://localhost:3000/api/v1/hospitals');
                if (hospitalsResponse.data) {
                    setHospitals(hospitalsResponse.data);
                }

                setNewHospital({
                    name: '',
                    vacancies: ''
                });
                setShowAddForm(false);
                alert('Hospital created successfully!');
            }
        } catch (error) {
            console.error('Error creating hospital:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error creating hospital';
            alert(errorMsg);
        }
    };

    const handleAssignStudent = async (studentId) => {
        if (!selectedHospital) return;

        try {
            const response = await axios.post('http://localhost:3000/api/v1/hospitals/assign', {
                hospitalId: selectedHospital._id || selectedHospital.id,
                studentId: studentId
            });

            if (response.data) {
                // Refresh hospitals list
                const hospitalsResponse = await axios.get('http://localhost:3000/api/v1/hospitals');
                if (hospitalsResponse.data) {
                    setHospitals(hospitalsResponse.data);
                }

                // Refresh available students
                const studentsResponse = await axios.get('http://localhost:3000/api/v1/users');
                if (studentsResponse.data.success) {
                    const available = studentsResponse.data.data.filter(
                        student => (!student.hospital || student.hospital === null) &&
                            (student.status === 'graduated' || student.status === 'g')
                    );
                    setAvailableStudents(available);
                }

                alert('Student assigned to hospital successfully!');
            }
        } catch (error) {
            console.error('Error assigning student:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error assigning student';
            alert(errorMsg);
        }
    };

    const openAssignForm = (hospital) => {
        setSelectedHospital(hospital);
        setShowAssignForm(true);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 font-['Poppins',sans-serif]">Hospitals</h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-[#003049] text-white px-6 py-3 rounded-lg hover:bg-[#003049] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        {showAddForm ? 'Cancel' : 'Add New Hospital'}
                    </button>
                </div>

                {/* Add Hospital Form */}
                {showAddForm && (
                    <form onSubmit={handleCreateHospital} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Hospital Name"
                                value={newHospital.name}
                                onChange={handleInputChange}
                                required
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                            <input
                                type="number"
                                name="vacancies"
                                placeholder="Number of Vacancies"
                                value={newHospital.vacancies}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Create Hospital
                        </button>
                    </form>
                )}
            </div>

            {/* Hospitals List */}
            <div className="space-y-4">
                {hospitals.length > 0 ? (
                    hospitals.map((hospital, index) => {
                        const hospitalId = hospital._id || hospital.id;
                        const students = hospital.students || [];
                        const vacancies = hospital.vacancies || 0;
                        const studentsCount = students.length;

                        return (
                            <div
                                key={hospitalId}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg "
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => setExpandedHospitalId(expandedHospitalId === hospitalId ? null : hospitalId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                       
                                        <h3 className="text-xl font-semibold text-gray-900 font-['Poppins',sans-serif]">
                                            {hospital.name}
                                        </h3>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transition-transform duration-300 ${expandedHospitalId === hospitalId ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>

                                {/* Expanded Content */}
                                {expandedHospitalId === hospitalId && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Vacancies:</span> {vacancies}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Students:</span> {studentsCount}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAssignForm(hospital);
                                                }}
                                                disabled={vacancies === 0}
                                                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${vacancies === 0
                                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                Assign Student
                                            </button>
                                        </div>

                                        {/* Students in Hospital */}
                                        {students.length > 0 ? (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Students:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {students.map((student) => {
                                                        const studentId = student._id || student.id;
                                                        const lastName = student.lastName || student.lastname || '';
                                                        const name = student.name || '';
                                                        return (
                                                            <div
                                                                key={studentId}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/students/${studentId}`);
                                                                }}
                                                                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                                            >
                                                                <div className="w-8 h-8 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                                                    {name.charAt(0)}{lastName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{name} {lastName}</p>
                                                                    {student.email && (
                                                                        <p className="text-xs text-gray-500">{student.email}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No students assigned yet</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <p className="text-gray-500">No hospitals found</p>
                    </div>
                )}
            </div>

            {/* Assign Student Modal/Form */}
            {showAssignForm && selectedHospital && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Assign Student to {selectedHospital.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAssignForm(false);
                                    setSelectedHospital(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Available Vacancies: <span className="font-medium">{selectedHospital.vacancies}</span>
                            </p>
                        </div>

                        {availableStudents.length > 0 ? (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Available Students (Graduated):</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availableStudents.map((student) => {
                                        const studentId = student._id || student.id;
                                        const lastName = student.lastName || student.lastname || '';
                                        const name = student.name || '';
                                        return (
                                            <div
                                                key={studentId}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-[#003049] to-[#003049] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                                        {name.charAt(0)}{lastName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{name} {lastName}</p>
                                                        {student.email && (
                                                            <p className="text-xs text-gray-500">{student.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignStudent(studentId)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm transition-colors"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No available students to assign</p>
                                <p className="text-sm text-gray-400 mt-2">Only graduated students without hospitals can be assigned</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hospitals;




