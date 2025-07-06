import React, { useEffect } from 'react';

function LandingPage() {
    useEffect(() => {
        const userRole = sessionStorage.getItem('userRole');
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userId = urlParams.get('userId');

        if (!token) {
            // No token, redirect to login
            window.location.href = '/login';
            return;
        }

        if (userRole === 'landlord') {
            // Redirect to landlord service
            const currentHost = window.location.host;
            window.location.href = `http://${currentHost}/landlord-landing?token=${encodeURIComponent(token)}`;
        } else if (userRole === 'tenant') {
            // Redirect to tenant service
            const currentHost = window.location.host;
            window.location.href = `http://${currentHost}/tenant-landing?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;
        } else {
            // No role specified, redirect to login
            window.location.href = '/login';
        }
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px'
        }}>
            Redirecting...
        </div>
    );
}

export default LandingPage; 