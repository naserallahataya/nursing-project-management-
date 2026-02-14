import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaffDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notesInput, setNotesInput] = useState('');
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        const fetchStaffMember = async () => {
            try {
                // First try to get all supervisors and find the one with matching ID
                const response = await axios.get('http://localhost:3000/api/supervisor/all');
                if (response.data) {
                    const foundMember = response.data.find(s => 
                        (s._id && s._id.toString() === id) || 
                        (s.id && s.id.toString() === id)
                    );
                    if (foundMember) {
                        setMember(foundMember);
                        setFormData({
                            name: foundMember.name || '',
                            email: foundMember.email || '',
                            phone: foundMember.phone || '',
                            notes: foundMember.notes || ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading staff details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaffMember();
    }, [id]);

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
            const response = await axios.put(`http://localhost:3000/api/supervisor/edit/${id}`, formData);
            
            if (response.data) {
                setMember(response.data.supervisor);
                setIsEditing(false);
                alert('Staff member updated successfully!');
            }
        } catch (error) {
            console.error('Error updating staff member:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Error updating staff member';
            alert(errorMsg);
        }
    };

    const handleAddNote = async () => {
        if (notesInput.trim()) {
            try {
                const updatedNotes = member.notes 
                    ? `${member.notes}\n${new Date().toLocaleDateString("en-US")}: ${notesInput.trim()}`
                    : `${new Date().toLocaleDateString("en-US")}: ${notesInput.trim()}`;
                
                const updatedData = {
                    ...formData,
                    notes: updatedNotes
                };

                const response = await axios.put(`http://localhost:3000/api/supervisor/edit/${id}`, updatedData);
                
                if (response.data) {
                    setMember(response.data.supervisor);
                    setNotesInput('');
                    alert('Note added successfully!');
                }
            } catch (error) {
                console.error('Error adding note:', error);
                alert('Error adding note. Please try again.');
            }
        }
    };

    // Parse notes from the notes string
    const parseNotes = (notesString) => {
        if (!notesString) return [];
        // Split by newlines and filter empty lines
        return notesString.split('\n').filter(line => line.trim());
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

    if (!member) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Staff Member Not Found</h2>
                <p className="text-gray-600">The requested staff member could not be found.</p>
                <button
                    onClick={() => navigate('/staff')}
                    className="mt-4 bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
                    Back to Staff
                </button>
            </div>
        );
    }

    const notes = parseNotes(member.notes);
    const additionalInfo = notes.filter(note => 
        note.includes('Position:') || 
        note.includes('Department:') || 
        note.includes('Shift:') || 
        note.includes('Experience:') || 
        note.includes('Address:') || 
        note.includes('Emergency Contact:') || 
        note.includes('Join Date:')
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/staff')}
                        className="flex items-center text-[#003049] hover:text-[#003049] transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Staff
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                        >
                            Edit Staff
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: member.name || '',
                                        email: member.email || '',
                                        phone: member.phone || '',
                                        notes: member.notes || ''
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
                        {member.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-['Poppins',sans-serif]">
                            {member.name}
                        </h1>
                        {additionalInfo.find(info => info.includes('Position:')) && (
                            <p className="text-lg text-gray-600">
                                {additionalInfo.find(info => info.includes('Position:')).replace('Position: ', '')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Staff Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Staff Information</h2>
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                <p className="text-gray-900">{member.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-gray-900">{member.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-gray-900">{member.phone}</p>
                            </div>
                        </div>
                        {additionalInfo.length > 0 && (
                            <>
                                {additionalInfo.map((info, index) => {
                                    const [key, value] = info.split(': ');
                                    if (!value) return null;
                                    return (
                                        <div key={index} className="flex items-center">
                                            <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">{key}</p>
                                                <p className="text-gray-900">{value}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                        {notes.filter(note => !note.includes(':')).length > 0 && (
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Notes</p>
                                    <div className="text-gray-900">
                                        {notes.filter(note => !note.includes(':')).map((note, index) => (
                                            <div key={index} className="mt-1">{note}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Notes Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Add Notes</h2>
                <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003049] focus:border-transparent"
                    rows="4"
                    placeholder="Enter notes here..."
                />
                <button
                    onClick={handleAddNote}
                    className="mt-4 bg-[#003049] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
                    Add Note
                </button>
            </div>
        </div>
    );
};

export default StaffDetails;




