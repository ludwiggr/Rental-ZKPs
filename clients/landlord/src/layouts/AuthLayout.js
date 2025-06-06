import React from 'react';
import { Outlet } from 'react-router-dom';

function MainLayout() {
    return (
        <>
            <main>
                <Outlet /> {/* This renders the current nested route */}
            </main>
        </>
    );
}

export default MainLayout;
