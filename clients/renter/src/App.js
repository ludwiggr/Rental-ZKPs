import React from 'react';
import {Routes, Route} from 'react-router-dom';

// Import page components
import ListingsOverview from './pages/ListingsOverview';
import DummyLandingPage from './pages/DummyLandingPage';

// Layouts
import MainLayout from './layouts/MainLayout';


function App() {
    return (
        <Routes>
            {/* Public Routes with optional layout */}
            <Route element={<MainLayout/>}>
                <Route path="/landing" element={<DummyLandingPage/>}/>
            </Route>
            {/* Public Routes with optional layout */}
            <Route element={<MainLayout/>}>
                <Route path="/listings-overview" element={<ListingsOverview/>}/>
            </Route>
        </Routes>

    );
}

export default App;
