import React from 'react';
import {Routes, Route, Navigate } from 'react-router-dom';

// Import page components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';


// Layouts
import AuthLayout from './layouts/AuthLayout';


function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            {/* Landing page for role-based redirects */}
            <Route path="/landing" element={<LandingPage/>}/>
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
