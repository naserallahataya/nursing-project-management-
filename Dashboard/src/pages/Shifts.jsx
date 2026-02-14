import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Shifts = () => {
    const navigate = useNavigate();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentShift, setCurrentShift] = useState({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        buildId: '',
        floorId: '',
        supervisor: '',
        note: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch buildings, floors, and supervisors
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch buildings
                const buildsResponse = await axios.get('http://localhost:3000/api/v1/builds');
                if (buildsResponse.data) {
                    setBuildings(buildsResponse.data);
                }

                // Fetch floors
                const floorsResponse = await axios.get('http://localhost:3000/api/v1/floors');
                if (floorsResponse.data) {
                    setFloors(floorsResponse.data);
                }

                // Fetch supervisors
                const supervisorsResponse = await axios.get('http://localhost:3000/api/supervisor/all');
                if (supervisorsResponse.data) {
                    setSupervisors(supervisorsResponse.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Fetch shifts by date
    useEffect(() => {
        const fetchShifts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/api/shift/date/${selectedDate}`);
                if (response.data) {
                    setShifts(response.data);
                }
            } catch (error) {
                console.error('Error fetching shifts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchShifts();
    }, [selectedDate]);

    const handleAdd = () => {
        setCurrentShift({
            date: selectedDate,
            start_time: '',
            end_time: '',
            buildId: '',
            floorId: '',
            supervisor: '',
            note: ''
        });
        setIsEditing(true);
    };

    const handleEdit = (shift) => {
        setCurrentShift({
            date: shift.date ? new Date(shift.date).toISOString().split('T')[0] : selectedDate,
            start_time: shift.start_time || '',
            end_time: shift.end_time || '',
            buildId: shift.buildId?._id || shift.buildId || '',
            floorId: shift.floorId?._id || shift.floorId || '',
            supervisor: shift.supervisor?._id || shift.supervisor || '',
            note: shift.note || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        const shift = shifts.find(s => (s._id || s.id) === id);
        if (window.confirm(`Are you sure you want to delete this shift?`)) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/shift/delete/${id}`);
                if (response.data) {
                    // Refresh shifts
                    const shiftsResponse = await axios.get(`http://localhost:3000/api/shift/date/${selectedDate}`);
                    if (shiftsResponse.data) {
                        setShifts(shiftsResponse.data);
                    }
                    alert('Shift deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting shift:', error);
                const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Error deleting shift';
                alert(errorMsg);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (currentShift._id || currentShift.id) {
                // Update existing shift
                const shiftId = currentShift._id || currentShift.id;
                const updateData = {
                    date: currentShift.date,
                    start_time: currentShift.start_time,
                    end_time: currentShift.end_time,
                    buildId: currentShift.buildId,
                    floorId: currentShift.floorId,
                    supervisor: currentShift.supervisor,
                    note: currentShift.note
                };

                const response = await axios.put(`http://localhost:3000/api/shift/edit/${shiftId}`, updateData);
                if (response.data) {
                    // Refresh shifts
                    const shiftsResponse = await axios.get(`http://localhost:3000/api/shift/date/${selectedDate}`);
                    if (shiftsResponse.data) {
                        setShifts(shiftsResponse.data);
                    }
                    setIsEditing(false);
                    alert('Shift updated successfully!');
                }
            } else {
                // Create new shift
                const shiftData = {
                    date: currentShift.date,
                    start_time: currentShift.start_time,
                    end_time: currentShift.end_time,
                    buildId: currentShift.buildId,
                    floorId: currentShift.floorId,
                    supervisor: currentShift.supervisor,
                    note: currentShift.note || '',
                    createdBy: 'admin' // You can change this to get from auth context
                };

                const response = await axios.post('http://localhost:3000/api/shift/add', shiftData);
                if (response.data) {
                    // Refresh shifts
                    const shiftsResponse = await axios.get(`http://localhost:3000/api/shift/date/${selectedDate}`);
                    if (shiftsResponse.data) {
                        setShifts(shiftsResponse.data);
                    }
                    setIsEditing(false);
                    alert('Shift created successfully!');
                }
            }
        } catch (error) {
            console.error('Error saving shift:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Error saving shift';
            alert(errorMsg);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const filteredShifts = shifts.filter(shift => {
        const supervisorName = shift.supervisor?.name || '';
        return supervisorName.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
            {/* Shifts Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 font-['Poppins',sans-serif]">Shifts</h2>
                    <button
                        onClick={handleAdd}
                        className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition duration-200"
                    >
                        Add Shift
                    </button>
                </div>

                {/* Date Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full md:w-auto p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent"
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by supervisor name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent"
                    />
                </div>

                {isEditing && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-semibold mb-4">{currentShift._id || currentShift.id ? 'Edit Shift' : 'Add New Shift'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="date"
                                placeholder="Date"
                                value={currentShift.date}
                                onChange={(e) => setCurrentShift({ ...currentShift, date: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                            <input
                                type="time"
                                placeholder="Start Time"
                                value={currentShift.start_time}
                                onChange={(e) => setCurrentShift({ ...currentShift, start_time: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                            <input
                                type="time"
                                placeholder="End Time"
                                value={currentShift.end_time}
                                onChange={(e) => setCurrentShift({ ...currentShift, end_time: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                            <select
                                value={currentShift.buildId}
                                onChange={(e) => setCurrentShift({ ...currentShift, buildId: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Select Building</option>
                                {buildings.map(build => (
                                    <option key={build._id || build.id} value={build._id || build.id}>
                                        Building {build.build_number || build.number_build}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={currentShift.floorId}
                                onChange={(e) => setCurrentShift({ ...currentShift, floorId: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Select Floor</option>
                                {floors && floors.length > 0 ? (
                                    floors.map(floor => (
                                        <option key={floor._id || floor.id} value={floor._id || floor.id}>
                                            Floor {floor.number_floor || floor.floor_number || 'N/A'}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No floors available</option>
                                )}
                            </select>
                            <select
                                value={currentShift.supervisor}
                                onChange={(e) => setCurrentShift({ ...currentShift, supervisor: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Select Supervisor</option>
                                {supervisors.map(supervisor => (
                                    <option key={supervisor._id || supervisor.id} value={supervisor._id || supervisor.id}>
                                        {supervisor.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Note (Optional)"
                                value={currentShift.note}
                                onChange={(e) => setCurrentShift({ ...currentShift, note: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                            <div className="flex space-x-2 col-span-2">
                                <button
                                    onClick={handleSave}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-[#780000] text-white px-4 py-2 rounded-lg hover:bg-[#780000] transition duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {filteredShifts.length > 0 ? (
                        filteredShifts.map((shift, index) => {
                            const shiftId = shift._id || shift.id;
                            const supervisorName = shift.supervisor?.name || 'N/A';
                            const buildingName = shift.buildId?.number_build ? `Building ${shift.buildId.number_build}` : 'N/A';
                            const floorName = shift.floorId?.number_floor ? `Floor ${shift.floorId.number_floor}` : 'N/A';

                            return (
                                <div
                                    key={shiftId}
                                    onClick={() => navigate(`/shifts/${shiftId}`)}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer animate-slide-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {supervisorName} - {shift.start_time} to {shift.end_time}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {buildingName} - {floorName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {shift.date ? new Date(shift.date).toLocaleDateString("en-US") : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(shift); }}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(shiftId); }}
                                                className="bg-[#780000] text-white px-3 py-1 rounded hover:bg-[#780000] transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No shifts found for this date</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shifts;




