import React from 'react';
import {Routes, Route, Navigate } from 'react-router-dom';

// Import page components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';


// Layouts
import AuthLayout from './layouts/AuthLayout';


function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            {/* Public Routes with optional layout */}
            <Route element={<AuthLayout/>}>
                <Route path="/register" element={<RegisterPage/>}/>
            </Route>
            {/* Public Routes with optional layout */}
            <Route element={<AuthLayout/>}>
                <Route path="/login" element={<LoginPage/>}/>
            </Route>
        </Routes>

    );
}

export default App;
