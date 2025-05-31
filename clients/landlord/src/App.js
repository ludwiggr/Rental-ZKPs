import React from 'react';
import {Routes, Route} from 'react-router-dom';

// Import page components
import ListingsOverview from './pages/ListingsOverview';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateListing from "./pages/CreateListing";

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';


function App() {
    return (
        <Routes>
            {/* Public Routes with optional layout */}
            <Route element={<MainLayout/>}>
                <Route path="/listings-overview" element={<ListingsOverview/>}/>
            </Route>
            {/* Public Routes with optional layout */}
            <Route element={<MainLayout/>}>
                <Route path="/create-listing" element={<CreateListing/>}/>
            </Route>
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
