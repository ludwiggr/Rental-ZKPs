import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import page components
import ListingsOverview from './pages/ListingsOverview';
import LandingPage from './pages/LandingPage';
import Apply from "./pages/Apply";

// Layouts
import MainLayout from './layouts/MainLayout';



function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Redirect from root to listings overview */}
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/tenant-landing" element={<LandingPage />} />
                <Route path="/listings-overview" element={<ListingsOverview />} />
                <Route path="/apply/:id" element={<Apply />} />
            </Route>
        </Routes>

    );
}

export default App;
