import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ListingDetails = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchListing = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:3000/api/listings/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch listing');
                setListing(data.listing);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchListing();
    }, [id]);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!listing) return <p>Loading...</p>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2>{listing.name}</h2>
            <h3>General infos</h3>
            <p><strong>Address:</strong> {listing.address}</p>
            <p><strong>Size:</strong> {listing.size} sqm</p>
            <p><strong>Created by:</strong> {listing.createdBy}</p>
            <h3>Applicants</h3>
            {listing.applicants && listing.applicants.length > 0 ? (
                <ul>
                    {listing.applicants.map((user) => (
                        <li key={user._id}>{user.email}, {user.username}</li>
                    ))}
                </ul>
            ) : (
                <p>No applicants yet.</p>
            )}
        </div>
    );
};

export default ListingDetails;
