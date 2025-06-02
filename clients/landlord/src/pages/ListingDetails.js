import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ListingDetails = () => {
    const {id} = useParams();
    const [listing, setListing] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


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

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        if (!window.confirm("Are you sure you want to delete this listing?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/listings/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);
            alert("Listing deleted");
            navigate('/listings-overview');
        } catch (err) {
            alert("Error deleting listing: " + err.message);
        }
    };

    if (error) return <p style={{color: 'red'}}>{error}</p>;
    if (!listing) return <p>Loading...</p>;

    return (
        <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif'}}>
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
            <button
                onClick={handleDelete}
                style={{
                    marginTop: '1rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                🗑 Delete Listing
            </button>
        </div>
    );
};

export default ListingDetails;
