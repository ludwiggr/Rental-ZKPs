import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            const token = localStorage.getItem('token');

            try {
                const res = await fetch('/api/listings?mine=false', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch listings');
                }

                const data = await res.json();
                setListings(data.listings);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [navigate]);

    const applyToListing = async (listingId) => {
        console.log(listingId);
        try {
            const token = localStorage.getItem('token')

            const response = await fetch(`/api/listings/${listingId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            alert('Successfully applied to the listing');
        } catch (error) {
            console.error('Error applying:', error);
            alert(error.message);
        }
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2>Your Listings</h2>
            </div>

            <div style={styles.grid}>
                {listings.map((listing, index) => (
                    <div key={index} style={{ ...styles.card, position: 'relative' }}>
                        <button
                            onClick={() => applyToListing(listing._id)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: '#eee',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                            title="View details"
                        >
                            apply
                        </button>
                        <h3>{listing.name}</h3>
                        <p><strong>Address:</strong> {listing.address}</p>
                        <p><strong>Size:</strong> {listing.size} m²</p>
                        <p><strong>Number of applicants:</strong> {listing.applicants?.length || 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    page: {
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    grid: {
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    },
    card: {
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '1rem',
        background: '#f9f9f9',
    },
    loading: {
        textAlign: 'center',
        padding: '2rem',
    },
};

export default Listings;
