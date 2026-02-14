import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddStaff = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        shift: '',
        experience: '',
        address: '',
        emergencyContact: '',
        joinDate: new Date().toISOString().split('T')[0] // Today's date as default
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Map form data to supervisor model fields
            // The Supervisor model has: name, email, phone, notes
            // We'll combine additional info into notes
            const additionalInfo = [
                `Position: ${formData.position}`,
                `Department: ${formData.department}`,
                `Shift: ${formData.shift}`,
                `Experience: ${formData.experience}`,
                `Address: ${formData.address}`,
                `Emergency Contact: ${formData.emergencyContact}`,
                `Join Date: ${formData.joinDate}`
            ].join('\n');

            const supervisorData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                notes: additionalInfo
            };

            const response = await axios.post('http://localhost:3000/api/supervisor/add', supervisorData);

            if (response.data) {
                alert('Employee added successfully!');
                navigate('/staff');
            }
        } catch (error) {
            console.error('Error adding employee:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.msg || 'Error adding employee';
            alert(errorMsg);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Poppins',sans-serif]">Add New Employee</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                            <input
                                type="text"
                                id="position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="shift" className="block text-sm font-medium text-gray-700">Shift</label>
                            <select
                                id="shift"
                                name="shift"
                                value={formData.shift}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            >
                                <option value="">Select Shift</option>
                                <option value="Day Shift">Day Shift</option>
                                <option value="Night Shift">Night Shift</option>
                                <option value="Weekend Shift">Weekend Shift</option>
                                <option value="On-call">On-call</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
                            <input
                                type="text"
                                id="experience"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="e.g., 5 years"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Join Date</label>
                            <input
                                type="date"
                                id="joinDate"
                                name="joinDate"
                                value={formData.joinDate}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                        <div>
                            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                            <input
                                type="tel"
                                id="emergencyContact"
                                name="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="bg-[#003049] hover:bg-[#003049] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Add Employee
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/staff')}
                            className="bg-[#780000] hover:bg-[#780000] text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaff;




