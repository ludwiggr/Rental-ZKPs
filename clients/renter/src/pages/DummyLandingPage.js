import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

function DummyLandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const getToken = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (!token) {
                window.location.href = `http://login.localhost/login`;
            }
            localStorage.setItem('token', token);
            navigate('/listings-overview');
        }
        getToken();

    }, [navigate]);

    return (<div>Loading...</div>)
}

export default DummyLandingPage;
