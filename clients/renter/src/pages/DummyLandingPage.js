import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

function DummyLandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const getData = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const userId = urlParams.get('userId');

            console.log("User ID", userId);
            console.log("Token", token);

            if (!token || !userId) {
                //window.location.href = `http://login.localhost/login`;
                console.log("Token or User ID not found in URL parameters.");
            }
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);

        }
        getData()
        navigate('/listings-overview')
    }, [navigate]);

    return (<div>Loading...</div>)
}

export default DummyLandingPage;
