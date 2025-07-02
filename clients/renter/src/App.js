import React from 'react';
import {Routes, Route} from 'react-router-dom';

// Import page components
import ListingsOverview from './pages/ListingsOverview';
import DummyLandingPage from './pages/DummyLandingPage';
import Apply from "./pages/Apply";

// Layouts
import MainLayout from './layouts/MainLayout';



function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Redirect from root to listings overview */}
                <Route path="/landing" element={<DummyLandingPage />} />
                <Route path="/listings-overview" element={<ListingsOverview />} />
                <Route path="/apply/:id" element={<Apply/>}/>
            </Route>
        </Routes>

    );
}

export default App;
