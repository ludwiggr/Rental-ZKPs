import React from 'react';
import {Routes, Route} from 'react-router-dom';

// Import page components
import ListingsOverview from './pages/ListingsOverview';
import CreateListing from "./pages/CreateListing";
import ListingDetails from './pages/ListingDetails';

// Layouts
import MainLayout from './layouts/MainLayout';


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
            <Route path="/listing/:id" element={<ListingDetails />} />
        </Routes>

    );
}

export default App;
