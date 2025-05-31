import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/listings?mine=true', {
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

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2>Your Listings</h2>
                <button
                    onClick={() => navigate('/create-listing')}
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '1rem',
                        borderRadius: '6px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    ➕ New Listing
                </button>
            </div>

            <div style={styles.grid}>
                {listings.map((listing, index) => (
                    <div key={index} style={styles.card}>
                        <h3>{listing.name}</h3>
                        <p><strong>Address:</strong> {listing.address}</p>
                        <p><strong>Size:</strong> {listing.size} m²</p>
                        <p><strong>Number of applicants:</strong> {listing.applicants.size()}</p>
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
    addButton: {
        fontSize: '1.5rem',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer',
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
