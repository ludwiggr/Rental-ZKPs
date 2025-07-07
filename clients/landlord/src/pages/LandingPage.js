import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const getToken = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (!token) {
                const currentHost = window.location.host;
                window.location.href = `http://${currentHost}/login`;
            }
            localStorage.setItem('token', token);
        }
        getToken()
        navigate('/listings-overview')
    }, [navigate]);

    return (<div>Loading...</div>)
}

export default LandingPage;
