import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
    return (
        <>
            <main>
                <Outlet /> {/* This renders the current nested route */}
            </main>
        </>
    );
}

export default AuthLayout;
