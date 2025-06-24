import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Container,
    Chip,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';

function ListingsOverview() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const data = await api.getListings();
                setListings(data.listings || []);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch listings:', err);
                setError('Failed to load listings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const getApplicationStats = (applications = []) => {
        const stats = {
            total: applications.length,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        applications.forEach(app => {
            if (app.status === 'approved') stats.approved++;
            else if (app.status === 'rejected') stats.rejected++;
            else stats.pending++;
        });

        return stats;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1">
                    Your Listings
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/create-listing')}
                >
                    New Listing
                </Button>
            </Box>

            <Grid container spacing={3}>
                {listings.length === 0 ? (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            No listings found. Create your first listing!
                        </Alert>
                    </Grid>
                ) : (
                    listings.map((listing) => {
                        const stats = getApplicationStats(listing.applications);
                        return (
                            <Grid item xs={12} sm={6} md={4} key={listing.id}>
                                <Card>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Typography variant="h6" gutterBottom>
                                                {listing.name || 'Unnamed Listing'}
                                            </Typography>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/listing/${listing.id}`)}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <Typography color="textSecondary" gutterBottom>
                                            {listing.address || 'No address provided'}
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            <strong>Size:</strong> {listing.size || 'N/A'} m²
                                        </Typography>
                                        {listing.price && (
                                            <Typography variant="body2" paragraph>
                                                <strong>Price:</strong> €{listing.price}
                                            </Typography>
                                        )}

                                        {/* Proof Requirements */}
                                        {listing.proofRequirements && listing.proofRequirements.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                                    Required Proofs:
                                                </Typography>
                                                {listing.proofRequirements.map((req, index) => (
                                                    <Typography key={index} variant="body2" color="text.secondary">
                                                        <strong>{req.type === 'income' ? 'Income' : 'Credit Score'}</strong>
                                                        {req.minValue && (
                                                            <span> - Min: {req.type === 'income' ? `€${req.minValue}` : req.minValue}</span>
                                                        )}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}

                                        <Box mt={2}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Applications
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Chip
                                                    icon={<PersonIcon />}
                                                    label={`${stats.total} Total`}
                                                    size="small"
                                                />
                                                {stats.pending > 0 && (
                                                    <Chip
                                                        label={`${stats.pending} Pending`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                )}
                                                {stats.approved > 0 && (
                                                    <Chip
                                                        label={`${stats.approved} Approved`}
                                                        size="small"
                                                        color="success"
                                                    />
                                                )}
                                                {stats.rejected > 0 && (
                                                    <Chip
                                                        label={`${stats.rejected} Rejected`}
                                                        size="small"
                                                        color="error"
                                                    />
                                                )}
                                            </Stack>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/listing/${listing.id}`)}
                                            startIcon={<VisibilityIcon />}
                                        >
                                            View Details
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>
        </Container>
    );
}

export default ListingsOverview;
