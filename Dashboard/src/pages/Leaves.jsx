import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [supervisors, setSupervisors] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentLeave, setCurrentLeave] = useState({
        supervisor: '',
        start_date: '',
        end_date: '',
        reason: '',
        note: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all supervisors and their vacations
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                setLoading(true);
                // First, fetch all supervisors
                const supervisorsResponse = await axios.get('http://localhost:3000/api/supervisor/all');
                if (supervisorsResponse.data) {
                    setSupervisors(supervisorsResponse.data);
                    
                    // Then fetch vacations for each supervisor
                    const allVacations = [];
                    for (const supervisor of supervisorsResponse.data) {
                        try {
                            const vacationsResponse = await axios.get(`http://localhost:3000/api/vacation/supervisor/${supervisor._id || supervisor.id}`);
                            if (vacationsResponse.data && Array.isArray(vacationsResponse.data)) {
                                // Add supervisor info to each vacation
                                const vacationsWithSupervisor = vacationsResponse.data.map(vacation => ({
                                    ...vacation,
                                    supervisorName: supervisor.name,
                                    supervisorId: supervisor._id || supervisor.id
                                }));
                                allVacations.push(...vacationsWithSupervisor);
                            }
                        } catch (error) {
                            console.error(`Error fetching vacations for supervisor ${supervisor._id}:`, error);
                        }
                    }
                    // Sort by start_date descending
                    allVacations.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
                    setLeaves(allVacations);
                }
            } catch (error) {
                console.error('Error fetching leaves:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, []);

    const filteredLeaves = leaves.filter(leave => {
        const supervisorName = leave.supervisorName || leave.supervisor?.name || '';
        return supervisorName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleAdd = () => {
        setCurrentLeave({
            supervisor: '',
            start_date: '',
            end_date: '',
            reason: '',
            note: ''
        });
        setIsEditing(true);
    };

    const handleEdit = (leave) => {
        // Since there's no update endpoint, we'll pre-fill the form for recreation
        if (window.confirm('To edit this leave request, you will need to delete it and create a new one. Would you like to proceed?')) {
            // Delete the existing leave first
            handleDelete(leave._id || leave.id);
            // Then pre-fill the form with the old data
            setCurrentLeave({
                supervisor: leave.supervisor?._id || leave.supervisor || leave.supervisorId || '',
                start_date: leave.start_date ? new Date(leave.start_date).toISOString().split('T')[0] : '',
                end_date: leave.end_date ? new Date(leave.end_date).toISOString().split('T')[0] : '',
                reason: leave.reason || '',
                note: leave.note || ''
            });
            setIsEditing(true);
        }
    };

    const handleDelete = async (id) => {
        const leave = leaves.find(l => (l._id || l.id) === id);
        if (window.confirm(`Are you sure you want to delete the leave request for "${leave.supervisorName || leave.supervisor?.name || 'this supervisor'}"?`)) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/vacation/delete/${id}`);
                if (response.data) {
                    // Remove from local state
                    setLeaves(leaves.filter(l => (l._id || l.id) !== id));
                    alert('Leave request deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting leave:', error);
                const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Error deleting leave request';
                alert(errorMsg);
            }
        }
    };

    const handleSave = async () => {
        try {
            const vacationData = {
                supervisor: currentLeave.supervisor,
                start_date: currentLeave.start_date,
                end_date: currentLeave.end_date,
                reason: currentLeave.reason,
                note: currentLeave.note || '',
                createdBy: 'admin'
            };

            const response = await axios.post('http://localhost:3000/api/vacation/add', vacationData);
            
            if (response.data) {
                // Refresh leaves
                const supervisorsResponse = await axios.get('http://localhost:3000/api/supervisor/all');
                if (supervisorsResponse.data) {
                    const allVacations = [];
                    for (const supervisor of supervisorsResponse.data) {
                        try {
                            const vacationsResponse = await axios.get(`http://localhost:3000/api/vacation/supervisor/${supervisor._id || supervisor.id}`);
                            if (vacationsResponse.data && Array.isArray(vacationsResponse.data)) {
                                const vacationsWithSupervisor = vacationsResponse.data.map(vacation => ({
                                    ...vacation,
                                    supervisorName: supervisor.name,
                                    supervisorId: supervisor._id || supervisor.id
                                }));
                                allVacations.push(...vacationsWithSupervisor);
                            }
                        } catch (error) {
                            console.error(`Error fetching vacations for supervisor ${supervisor._id}:`, error);
                        }
                    }
                    allVacations.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
                    setLeaves(allVacations);
                }
                setIsEditing(false);
                alert('Leave request created successfully!');
            }
        } catch (error) {
            console.error('Error saving leave:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Error saving leave request';
            alert(errorMsg);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
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
            {/* Leaves Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 font-['Poppins',sans-serif]">Leave Requests</h2>
                    <button
                        onClick={handleAdd}
                        className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition duration-200"
                    >
                        Add Leave Request
                    </button>
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
                        <h3 className="text-lg font-semibold mb-4">Add New Leave Request</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={currentLeave.supervisor}
                                onChange={(e) => setCurrentLeave({ ...currentLeave, supervisor: e.target.value })}
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
                                placeholder="Reason"
                                value={currentLeave.reason}
                                onChange={(e) => setCurrentLeave({ ...currentLeave, reason: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                            <input
                                type="date"
                                placeholder="Start Date"
                                value={currentLeave.start_date}
                                onChange={(e) => setCurrentLeave({ ...currentLeave, start_date: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                            <input
                                type="date"
                                placeholder="End Date"
                                value={currentLeave.end_date}
                                onChange={(e) => setCurrentLeave({ ...currentLeave, end_date: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Note (Optional)"
                                value={currentLeave.note}
                                onChange={(e) => setCurrentLeave({ ...currentLeave, note: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg col-span-2"
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
                    {filteredLeaves.length > 0 ? (
                        filteredLeaves.map((leave, index) => {
                            const leaveId = leave._id || leave.id;
                            const supervisorName = leave.supervisorName || leave.supervisor?.name || 'N/A';
                            const startDate = leave.start_date ? new Date(leave.start_date).toLocaleDateString("en-US") : 'N/A';
                            const endDate = leave.end_date ? new Date(leave.end_date).toLocaleDateString("en-US") : 'N/A';
                            
                            return (
                                <div
                                    key={leaveId}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow animate-slide-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{supervisorName}</h3>
                                            <p className="text-gray-600">{leave.reason || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{startDate} - {endDate}</p>
                                            {leave.note && (
                                                <p className="text-sm text-gray-400 mt-1">Note: {leave.note}</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(leave); }}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(leaveId); }}
                                                className="bg-[#780000] text-white px-4 py-2 rounded-lg hover:bg-[#780000] transition duration-200 font-medium"
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
                            <p className="text-gray-500">No leave requests found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaves;




