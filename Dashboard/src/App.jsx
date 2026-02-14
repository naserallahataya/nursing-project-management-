import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Hospitals from './pages/Hospitals';
import HospitalDetails from './pages/HospitalDetails';
import Builds from './pages/Builds';
import BuildingDetails from './pages/BuildingDetails';
import Staff from './pages/Staff';
import StaffDetails from './pages/StaffDetails';
import AddStaff from './pages/AddStaff';
import Shifts from './pages/Shifts';
import ShiftDetails from './pages/ShiftDetails';
import Leaves from './pages/Leaves';
import './App.css';

function App() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Ensure visiting root opens the login page first */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/*"
          element={
            isLoggedIn ? (
              <Layout>
                <Routes>
                  <Route path="/students" element={<Students />} />
                  <Route path="/students/:id" element={<StudentDetails />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/rooms/:id" element={<RoomDetails />} />
                  <Route path="/hospitals" element={<Hospitals />} />
                  <Route path="/hospitals/:id" element={<HospitalDetails />} />
                  <Route path="/buildings" element={<Builds />} />
                  <Route path="/buildings/:id" element={<BuildingDetails />} />
                  <Route path="/staff" element={<Staff />} />
                  <Route path="/staff/add" element={<AddStaff />} />
                  <Route path="/staff/:id" element={<StaffDetails />} />
                  <Route path="/shifts" element={<Shifts />} />
                  <Route path="/shifts/:id" element={<ShiftDetails />} />
                  <Route path="/leaves" element={<Leaves />} />
                  <Route path="/" element={<Navigate to="/students" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

 
export default App;




  
