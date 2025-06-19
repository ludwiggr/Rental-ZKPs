import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Stack
} from '@mui/material';

const ListingDetails = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState(null);
    const [proofDialogOpen, setProofDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listingData, applicationsData] = await Promise.all([
                    api.getListing(id),
                    api.getListingApplications(id)
                ]);
                setListing(listingData.listing);
                setApplications(applicationsData.applications || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleVerifyApplication = async (applicationId) => {
        try {
            setLoading(true);
            const result = await api.verifyApplication(id, applicationId);

            // Update the application status in the local state
            setApplications(apps => apps.map(app =>
                app.id === applicationId ? { ...app, verificationResult: result.verified } : app
            ));

            // Show success/failure message
            setError(result.verified ? null : 'Proof verification failed');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            setLoading(true);
            await api.updateApplicationStatus(id, applicationId, newStatus);

            // Update the application status in the local state
            setApplications(apps => apps.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProof = (proof, type) => {
        setSelectedProof({
            type,
            data: proof
        });
        setProofDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;

        try {
            await api.deleteListing(id);
            navigate('/listings-overview');
        } catch (err) {
            setError(err.message);
        }
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
        </Box>
    );

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!listing) return <Alert severity="info">Listing not found</Alert>;

    return (
        <Box sx={{ p: 3, maxWidth: '800px', margin: '0 auto' }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>{listing.name}</Typography>
                <Typography variant="body1" paragraph><strong>Address:</strong> {listing.address}</Typography>
                <Typography variant="body1" paragraph><strong>Size:</strong> {listing.size} m²</Typography>
                {listing.price && (
                    <Typography variant="body1" paragraph><strong>Price:</strong> €{listing.price}</Typography>
                )}
                {listing.type && (
                    <Typography variant="body1" paragraph><strong>Type:</strong> {listing.type}</Typography>
                )}
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Applications ({applications.length})</Typography>
                {applications.length === 0 ? (
                    <Alert severity="info">No applications yet</Alert>
                ) : (
                    <List>
                        {applications.map((application, index) => (
                            <React.Fragment key={application.id}>
                                {index > 0 && <Divider />}
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1">
                                                    Application #{application.id}
                                                </Typography>
                                                <Chip
                                                    label={application.status}
                                                    color={getStatusChipColor(application.status)}
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 1 }}>
                                                <Stack spacing={1}>
                                                    <Typography variant="body2">
                                                        Submitted: {new Date(application.timestamp).toLocaleString()}
                                                    </Typography>
                                                    {application.verificationResult !== undefined && (
                                                        <Typography variant="body2" color={application.verificationResult ? 'success.main' : 'error.main'}>
                                                            Verification: {application.verificationResult ? 'Valid' : 'Invalid'}
                                                        </Typography>
                                                    )}
                                                    <Stack direction="row" spacing={1}>
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleViewProof(application.incomeProof, 'Income')}
                                                            variant="text"
                                                        >
                                                            View Income Proof
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            onClick={() => handleViewProof(application.creditScoreProof, 'Credit Score')}
                                                            variant="text"
                                                        >
                                                            View Credit Score Proof
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Stack spacing={1}>
                                            {!application.verificationResult && application.status === 'pending' && (
                                                <Button
                                                    onClick={() => handleVerifyApplication(application.id)}
                                                    disabled={loading}
                                                    variant="outlined"
                                                    size="small"
                                                >
                                                    Verify Proofs
                                                </Button>
                                            )}
                                            {application.verificationResult && application.status === 'pending' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleUpdateStatus(application.id, 'approved')}
                                                        disabled={loading}
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                                        disabled={loading}
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </Stack>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    onClick={() => navigate('/listings-overview')}
                    variant="outlined"
                >
                    Back to Listings
                </Button>
                <Button
                    onClick={handleDelete}
                    variant="contained"
                    color="error"
                >
                    Delete Listing
                </Button>
            </Box>

            <Dialog
                open={proofDialogOpen}
                onClose={() => setProofDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedProof?.type} Proof Details
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            backgroundColor: '#f5f5f5',
                            padding: '1rem',
                            borderRadius: '4px'
                        }}>
                            {selectedProof ? JSON.stringify(selectedProof.data, null, 2) : ''}
                        </pre>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProofDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListingDetails;
