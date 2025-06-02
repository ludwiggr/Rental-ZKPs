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
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>{listing.name}</h2>
            <p><strong>Address:</strong> {listing.address}</p>
            <p><strong>Size:</strong> {listing.size} sqm</p>
            <p><strong>Created by:</strong> {listing.createdBy}</p>
        </div>
    );
};

export default ListingDetails;
