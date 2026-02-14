import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShiftDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shift, setShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        buildId: '',
        floorId: '',
        supervisor: '',
        note: ''
    });
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [supervisors, setSupervisors] = useState([]);

    // Fetch shift data
    useEffect(() => {
        const fetchShift = async () => {
            try {
                // Since there's no get by ID endpoint, we'll try to get shifts by date and find the one
                // Or we can use supervisor shifts endpoint
                // For now, let's try to get all shifts for the current week and find the one
                const today = new Date();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                const weekStart = startOfWeek.toISOString().split('T')[0];

                const response = await axios.get(`http://localhost:3000/api/shift/week?start=${weekStart}`);
                if (response.data && response.data.shifts) {
                    const foundShift = response.data.shifts.find(s =>
                        (s._id && s._id.toString() === id) ||
                        (s.id && s.id.toString() === id)
                    );
                    if (foundShift) {
                        setShift(foundShift);
                        setFormData({
                            date: foundShift.date ? new Date(foundShift.date).toISOString().split('T')[0] : '',
                            start_time: foundShift.start_time || '',
                            end_time: foundShift.end_time || '',
                            buildId: foundShift.buildId?._id || foundShift.buildId || '',
                            floorId: foundShift.floorId?._id || foundShift.floorId || '',
                            supervisor: foundShift.supervisor?._id || foundShift.supervisor || '',
                            note: foundShift.note || ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching shift:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchShift();
    }, [id]);

    // Fetch buildings, floors, and supervisors for edit form
    useEffect(() => {
        if (!isEditing) return;

        const fetchData = async () => {
            try {
                const [buildsResponse, floorsResponse, supervisorsResponse] = await Promise.all([
                    axios.get('http://localhost:3000/api/v1/builds'),
                    axios.get('http://localhost:3000/api/v1/floors/available'),
                    axios.get('http://localhost:3000/api/supervisor/all')
                ]);

                if (buildsResponse.data) setBuildings(buildsResponse.data);
                if (floorsResponse.data) setFloors(floorsResponse.data);
                if (supervisorsResponse.data) setSupervisors(supervisorsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
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
                date: formData.date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                buildId: formData.buildId,
                floorId: formData.floorId,
                supervisor: formData.supervisor,
                note: formData.note
            };

            const response = await axios.put(`http://localhost:3000/api/shift/edit/${id}`, updateData);

            if (response.data) {
                setShift(response.data.shift);
                setIsEditing(false);
                alert('Shift updated successfully!');
            }
        } catch (error) {
            console.error('Error updating shift:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Error updating shift';
            alert(errorMsg);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-6 rounded-lg ">
                    <p className="text-gray-600 text-center">Loading buildings...</p>
                </div>
            </div>
        );
    }

    if (!shift) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shift Not Found</h2>
                <p className="text-gray-600">The requested shift could not be found.</p>
                <button
                    onClick={() => navigate('/shifts')}
                    className="mt-4 bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
                    Back to Shifts
                </button>
            </div>
        );
    }

    const supervisorName = shift.supervisor?.name || 'N/A';
    const buildingName = shift.buildId?.number_build ? `Building ${shift.buildId.number_build}` : 'N/A';
    const floorName = shift.floorId?.number_floor ? `Floor ${shift.floorId.number_floor}` : 'N/A';
    const shiftDate = shift.date ? new Date(shift.date).toLocaleDateString("en-US") : 'N/A';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/shifts')}
                        className="flex items-center text-[#003049] hover:text-[#003049] transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Shifts
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                        >
                            Edit Shift
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        date: shift.date ? new Date(shift.date).toISOString().split('T')[0] : '',
                                        start_time: shift.start_time || '',
                                        end_time: shift.end_time || '',
                                        buildId: shift.buildId?._id || shift.buildId || '',
                                        floorId: shift.floorId?._id || shift.floorId || '',
                                        supervisor: shift.supervisor?._id || shift.supervisor || '',
                                        note: shift.note || ''
                                    });
                                }}
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
                <div className="flex items-center">
                    <div className="w-16 h-16 bg-[#003049] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        {supervisorName.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                            {supervisorName}
                        </h1>
                        <p className="text-lg text-gray-600">{shiftDate} - {shift.start_time} to {shift.end_time}</p>
                    </div>
                </div>
            </div>

            {/* Shift Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Shift Information</h2>
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                                <select
                                    name="buildId"
                                    value={formData.buildId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                >
                                    <option value="">Select Building</option>
                                    {buildings.map(build => (
                                        <option key={build._id || build.id} value={build._id || build.id}>
                                            Building {build.build_number || build.number_build}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                                <select
                                    name="floorId"
                                    value={formData.floorId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                >
                                    <option value="">Select Floor</option>
                                    {floors.map(floor => (
                                        <option key={floor._id || floor.id} value={floor._id || floor.id}>
                                            Floor {floor.number_floor}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                                <select
                                    name="supervisor"
                                    value={formData.supervisor}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                >
                                    <option value="">Select Supervisor</option>
                                    {supervisors.map(supervisor => (
                                        <option key={supervisor._id || supervisor.id} value={supervisor._id || supervisor.id}>
                                            {supervisor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p className="text-gray-900">{shiftDate}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Start Time</p>
                                <p className="text-gray-900">{shift.start_time}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">End Time</p>
                                <p className="text-gray-900">{shift.end_time}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Building</p>
                                <p className="text-gray-900">{buildingName}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Floor</p>
                                <p className="text-gray-900">{floorName}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Supervisor</p>
                                <p className="text-gray-900">{supervisorName}</p>
                            </div>
                        </div>
                        {shift.note && (
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Note</p>
                                    <p className="text-gray-900">{shift.note}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftDetails;




