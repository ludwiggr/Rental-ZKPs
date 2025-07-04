import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {backend_api} from "../services/backend_api";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Grid,
    Alert,
    CircularProgress,
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
            const token = localStorage.getItem('token');

            try {
                const data = await backend_api.getListings(token);

                setListings(data.listings);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [navigate]);

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
        <Container maxWidth={false} sx={{py: 0, width: '100vw', px: 0}}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1" sx={{flexGrow: 1}}>
                    Your Listings
                </Typography>
                <Button
                    variant="contained"
                    startIcon={null}
                    onClick={() => navigate('/create-listing')}
                    sx={{minWidth: 0, width: 40, height: 40, borderRadius: '50%', p: 0}}
                >
                    <AddIcon/>
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
                                                        <span> - Min: €${listing.incomeRequirement}</span>
                                                    </Typography>)}
                                                {listing.creditScoreRequirement && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Income</strong>
                                                        <span> - Min: ${listing.creditScoreRequirement}</span>
                                                    </Typography>)}
                                            </Box>
                                        )}

                                        <Box mt={2}>
                                            <Typography variant="subtitle2" gutterBottom>
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
                                            onClick={() => navigate(`/apply/${listing._id}`)}
                                            startIcon={<VisibilityIcon/>}
                                        >
                                            Apply
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
