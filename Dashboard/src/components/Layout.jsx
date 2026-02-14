import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/students', label: 'Students' },
        { path: '/rooms', label: 'Rooms' },
        { path: '/hospitals', label: 'Hospitals' },
        { path: '/buildings', label: 'Buildings' },
        { path: '/staff', label: 'On-Duty Staff' },
        { path: '/shifts', label: 'Shifts' },
        { path: '/leaves', label: 'Leaves' },
    ];

    return (
        <div className="flex h-screen bg-[#F7FAFB] font-['Inter',sans-serif] relative">
            {/* White top bar with name */}
            <div className="absolute top-8- left-0 w-64 bg-[#F7FAFB] text-[#003049] text-center py-11 text-2xl font-bold   z-20 ">
                NursFlow
            </div>

            {/* Sidebar */}
            <div
                className={`bg-[#003049] text-white w-64 py-7 px-2 absolute left-0 top-16 bottom-0   rounded-tr-[50px] mt-30 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 z-10`}
            >
                <nav className="mt-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block py-2.5 px-4 rounded transition duration-200  ${location.pathname === item.path ? "bg-white text-[#003049] " : ""
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>


            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">


                {/* Page content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F7FAFB] p-6">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-0 bg-black opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;


