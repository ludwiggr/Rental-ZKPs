import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";

const CreateListing = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        size: '',
    });
    const navigate = useNavigate();

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to create a listing.');
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    size: Number(formData.size),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Error creating listing');
                setMessage(null);
            } else {
                setMessage('Listing created successfully!');
                navigate('/listings-overview')
            }
        } catch (err) {
            setError('Network or server error');
            setMessage(null);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Create New Listing</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Size (sqm):</label>
                    <input
                        type="number"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        required
                        min="1"
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <button type="submit" style={{ padding: '0.5rem 1rem' }}>
                    Create Listing
                </button>
            </form>
        </div>
    );
};

export default CreateListing;
