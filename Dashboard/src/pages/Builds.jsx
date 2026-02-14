import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Builds = () => {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBuildForm, setShowBuildForm] = useState(false);
    const [showFloorForm, setShowFloorForm] = useState(false);
    const [selectedBuild, setSelectedBuild] = useState(null);
    const [newBuild, setNewBuild] = useState({
        number_build: ''
    });
    const [newFloor, setNewFloor] = useState({
        number_floor: ''
    });

    // Fetch builds from API
    useEffect(() => {
        const fetchBuilds = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/builds');
                if (response.data) {
                    console.log('Fetched builds:', response.data);
                    setBuilds(response.data);
                }
            } catch (error) {
                console.error('Error fetching builds:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBuilds();
    }, []);

    const handleBuildInputChange = (e) => {
        const { name, value } = e.target;
        setNewBuild(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFloorInputChange = (e) => {
        const { name, value } = e.target;
        setNewFloor(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateBuild = async (e) => {
        e.preventDefault();
        try {
            const buildData = {
                number_build: parseInt(newBuild.number_build),
                floors: []
            };

            const response = await axios.post('http://localhost:3000/api/v1/builds', buildData);
            
            if (response.data.success) {
                // Refresh builds list
                const buildsResponse = await axios.get('http://localhost:3000/api/v1/builds');
                if (buildsResponse.data) {
                    setBuilds(buildsResponse.data);
                }
                
                setNewBuild({
                    number_build: ''
                });
                setShowBuildForm(false);
                alert('Building created successfully!');
            }
        } catch (error) {
            console.error('Error creating build:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error creating building';
            alert(errorMsg);
        }
    };

    const handleCreateFloor = async (e) => {
        e.preventDefault();
        if (!selectedBuild) return;

        try {
            console.log('Selected build:', selectedBuild);
            let buildId = selectedBuild._id || selectedBuild.id;
            
            // If _id is not available, try to find the build by build_number
            if (!buildId && selectedBuild.build_number) {
                try {
                    const allBuildsResponse = await axios.get('http://localhost:3000/api/v1/builds');
                    const fullBuild = allBuildsResponse.data.find(
                        b => b.build_number === selectedBuild.build_number || b.number_build === selectedBuild.build_number
                    );
                    if (fullBuild) {
                        buildId = fullBuild._id;
                        console.log('Found build by number:', buildId);
                    }
                } catch (err) {
                    console.error('Error finding build:', err);
                }
            }
            
            if (!buildId) {
                console.error('Build ID not found. Selected build:', selectedBuild);
                alert('Error: Build ID not found. Please refresh the page and try again.');
                return;
            }
            
            const floorData = {
                number_floor: parseInt(newFloor.number_floor),
                build: buildId,
                rooms: []
            };

            console.log('Creating floor with data:', floorData);
            const response = await axios.post('http://localhost:3000/api/v1/floors', floorData);
            
            if (response.data.success) {
                // Wait a bit to ensure the build is saved
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refresh builds list to get updated data
                const buildsResponse = await axios.get('http://localhost:3000/api/v1/builds');
                if (buildsResponse.data) {
                    setBuilds(buildsResponse.data);
                }
                
                setNewFloor({
                    number_floor: ''
                });
                setShowFloorForm(false);
                setSelectedBuild(null);
                alert('Floor created successfully!');
            }
        } catch (error) {
            console.error('Error creating floor:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error creating floor';
            alert(errorMsg);
        }
    };

    const openFloorForm = (build) => {
        console.log('Opening floor form for build:', build);
        setSelectedBuild(build);
        setShowFloorForm(true);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 font-['Poppins',sans-serif]">Buildings</h2>
                    <button
                        onClick={() => setShowBuildForm(!showBuildForm)}
                        className="bg-[#003049] text-white px-6 py-3 rounded-lg hover:bg-[#003049] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        {showBuildForm ? 'Cancel' : 'Add New Building'}
                    </button>
                </div>
               
                {/* Add Building Form */}
                {showBuildForm && (
                    <form onSubmit={handleCreateBuild} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                name="number_build"
                                placeholder="Building Number"
                                value={newBuild.number_build}
                                onChange={handleBuildInputChange}
                                required
                                min="1"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-4 bg-blue-950 text-white px-4 py-2 rounded-md  transition-colors"
                        >
                            Create Building
                        </button>
                    </form>
                )}
            </div>

            {/* Buildings List */}
            <div className="space-y-4">
                {builds.length > 0 ? (
                    builds.map((build, index) => {
                        const buildNumber = build.build_number || build.number_build;
                        const floors = build.floors || [];
                        const floorsCount = build.floors_count || floors.length;
                        
                        return (
                            <div
                                key={build._id || build.id || index}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform  animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                       
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 font-['Poppins',sans-serif]">
                                                Building {buildNumber}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {floorsCount} {floorsCount === 1 ? 'Floor' : 'Floors'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center  mb-4">
                                        <button
                                            onClick={() => {
                                                console.log('Build clicked:', build);
                                                console.log('Build _id:', build._id);
                                                console.log('Build id:', build.id);
                                                openFloorForm(build);
                                            }}
                                            className="bg-green-600 text-white px-4 py-2  me-3.5 rounded-lg hover:bg-green-700  duration-300   hover:scale-105"
                                        >
                                            Add Floor
                                            
                                        </button>

                                        <button
                                            onClick={() => setShowBuildForm(!showBuildForm)}
                                            className="bg-[#003049] text-white px-6 py-3 rounded-lg hover:bg-[#003049]    duration-300   hover:scale-105 shadow-lg hover:shadow-xl"
                                        >
                                            {showBuildForm ? 'Cancel' : 'Edit'}
                                        </button>
                                    </div>
                                </div>

                                {/* Floor Details */}
                                {floors.length > 0 ? (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Floors:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {floors.map((floor, floorIndex) => {
                                                const floorNumber = floor.floor_number || floor.number_floor;
                                                const roomsCount = floor.rooms_count || floor.rooms?.length || 0;
                                                return (
                                                    <div
                                                        key={floor._id || floor.id || floorIndex}
                                                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    Floor {floorNumber}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500">No floors added yet</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <p className="text-gray-500">No buildings found</p>
                    </div>
                )}
            </div>

            {/* Add Floor Modal/Form */}
            {showFloorForm && selectedBuild && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Add Floor to Building {selectedBuild.build_number || selectedBuild.number_build}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowFloorForm(false);
                                    setSelectedBuild(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateFloor}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Floor Number
                                </label>
                                <input
                                    type="number"
                                    name="number_floor"
                                    placeholder="Enter floor number"
                                    value={newFloor.number_floor}
                                    onChange={handleFloorInputChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003049]"
                                />
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Create Floor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFloorForm(false);
                                        setSelectedBuild(null);
                                    }}
                                    className="flex-1 bg-[#780000] text-white px-4 py-2 rounded-md hover:bg-[#780000] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Builds;




