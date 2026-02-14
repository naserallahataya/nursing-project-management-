import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Staff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/supervisor/all');
                if (response.data) {
                    setStaff(response.data);
                }
            } catch (error) {
                console.error('Error fetching staff:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

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
            {/* Staff Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 font-['Poppins',sans-serif]">On-Duty Staff</h2>
                    <button
                        onClick={() => navigate('/staff/add')}
                        className="bg-[#003049] hover:bg-[#003049] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Add New Employee
                    </button>
                </div>
                <div className="space-y-4">
                    {staff.length > 0 ? (
                        staff.map((member, index) => {
                            const memberId = member._id || member.id;
                            return (
                                <div
                                    key={memberId}
                                    onClick={() => navigate(`/staff/${memberId}`)}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer animate-slide-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                                    {member.email && (
                                        <p className="text-sm text-gray-600 mt-1">{member.email}</p>
                                    )}
                                    {member.phone && (
                                        <p className="text-sm text-gray-600">{member.phone}</p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No staff members found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Staff;




