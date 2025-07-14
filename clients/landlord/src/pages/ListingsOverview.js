import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../services/api';
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
            const token = localStorage.getItem('token');

            try {
                const data = await api.getListings(token);
                setListings(data.listings);
            } catch (err) {
                setError(error)
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
            rejected: 0,
            verified: 0
        };

        applications.forEach(app => {
            if (app.status === 'approved') stats.approved++;
            else if (app.status === 'rejected') stats.rejected++;
            else if (app.status === 'verified') stats.verified++;
            else if (app.status === 'pending') stats.pending++;
        });

        return stats;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" width="100vw">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" width="100vw">
                <Container maxWidth="lg" sx={{mt: 4}}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Container sx={{py: 4, px: 0, height: '100vh', maxWidth: '100%', width: '100%'}}>
            <Box sx={{ width: 'auto', display: 'flex', justifyContent: 'flex-end', pr: 3, pb: 3}}>
                <Typography variant="h4" component="h3" sx={{flexGrow: 1}}>
                    Your Listings
                </Typography>
                <Box sx={{ width: { xs: 40, sm: 40, md: 'calc(33.3333% - 24px)' }, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={null}
                        onClick={() => navigate('/create-listing')}
                        sx={{ minWidth: 0, width: 40, height: 40, borderRadius: '50%', p: 0, mr: 0 }}
                    >
                        <AddIcon />
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ pr: 3 }}>
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
                            <Grid item xs={12} sm={6} md={4} key={listing._id}>
                                <Card sx={{ height: '100%', boxSizing: 'border-box', m: 0 }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Typography variant="h6" gutterBottom>
                                                {listing.name || 'Unnamed Listing'}
                                            </Typography>
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
                                        {(listing.incomeRequirement || listing.creditScoreRequirement) && (
                                            <Box sx={{mb: 2}}>
                                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                                    Required Proofs:
                                                </Typography>
                                                {listing.incomeRequirement && (
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Income</strong>
                                                    <span> - Min: €{listing.incomeRequirement}</span>
                                                </Typography>)}
                                                {listing.creditScoreRequirement && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Credit Score</strong>
                                                        <span> - Min: {listing.creditScoreRequirement}</span>
                                                    </Typography>)}
                                            </Box>
                                        )}

                                        <Box mt={2}>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                Applications
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Chip
                                                    icon={<PersonIcon/>}
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
                                                {stats.verified > 0 && (
                                                    <Chip
                                                        label={`${stats.verified} Verified`}
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
                                            onClick={() => navigate(`/listing/${listing._id}`)}
                                            startIcon={<VisibilityIcon/>}
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
