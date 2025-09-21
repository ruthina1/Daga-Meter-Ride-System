// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffPage from './staff/page/StaffPage';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminLogin from './admin/pages/AdminLogin';
import ProtectedRoute from './admin/components/ProtectedRoute';
import UserManagement from './admin/components/UserManagement';
import DriverManagement from './admin/components/DriverManagement';
import './App.css';
import StaffManagement from './admin/components/StaffManagement';
import CarManagement from './admin/components/CarManagement';
import TripManagement from './admin/components/TripManagement';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/staff" element={<StaffPage />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLogin />
          </ProtectedRoute>
        } 
      />
      <Route path="/dashboard" element={<AdminDashboard />} />
       <Route path="/admin/cars" element={<CarManagement />} />

      <Route 
        path="/admin/users" 
        element={
          
            <UserManagement />
          
        } 
      />

      // In your App.js, add routes for the new submenu items
<Route 
  path="/admin/drivers" 
  element={
    <ProtectedRoute>
      <DriverManagement />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin/staff" 
  element={
    <ProtectedRoute>
      <StaffManagement />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin/trips" 
  element={
     <TripManagement/>
  } 
/>


    </Routes>
  );
}

export default App;