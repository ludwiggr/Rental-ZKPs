import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import page components
import ListingsOverview from './pages/ListingsOverview';
import CreateListing from "./pages/CreateListing";
import ListingDetails from './pages/ListingDetails';
import LandingPage from './pages/LandingPage';

// Layouts
import MainLayout from './layouts/MainLayout';

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Redirect from root to listings overview */}
                <Route path="/" element={<Navigate to="/listings-overview" replace />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/landlord-landing" element={<LandingPage />} />
                <Route path="/listings-overview" element={<ListingsOverview />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/listing/:id" element={<ListingDetails />} />
            </Route>
        </Routes>
    );
}

export default App;
