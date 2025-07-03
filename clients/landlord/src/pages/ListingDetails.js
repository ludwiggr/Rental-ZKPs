import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {api} from '../services/api';
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
    const {id} = useParams();
    const [listing, setListing] = useState(null);
    const [error, setError] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState(null);
    const [proofDialogOpen, setProofDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListing = async () => {
            const token = localStorage.getItem('token');
            try {
                const listing = await api.getListingById(id, token)
                console.log(listing);
                setListing(listing);
                setApplications(listing.applications)
                console.log(listing.applications);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    useEffect(() => {

        if (applications.some(app => app.status === 'pending')) {
            if (
                listing?.incomeRequirement === undefined &&
                listing?.creditScoreRequirement === undefined &&
                applications
            ) {
                console.log('No proof requirements, skipping application status update');
                setApplications(applications.map(app => {
                    if (app.status === 'pending') {
                        app.status = 'verified';
                    }
                    return app;
                }));
            }
        }
    }, [listing, applications]);


    const handleVerifyApplication = async (applicationId) => {
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await api.verifyApplication(applicationId, listing._id, token);
            console.log(response);

            const verified = response.verified;

            if (response.verified) {
                setApplications(applications =>
                    applications.map(app =>
                        app._id === applicationId ? {
                            ...app,
                            status: 'verified',
                            verificationResult: response.verified
                        } : app
                    )
                );
            } else {
                setError('Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (application, newStatus) => {
        setApplications(applications =>
            applications.map(app =>
                app.id === application.id ? {...app, status: newStatus} : app
            )
        );
        // ToDo: Update application status in backend
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
            const token = localStorage.getItem('token');
            await api.deleteListing(id, token);
            navigate('/listings-overview');
        } catch (err) {
            setError(err.message);
        }
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'verified':
                return 'info';
            default:
                return 'default';
        }
    };

    // Function to check if a proof meets the minimum requirements
    const checkProofMeetsRequirements = (proofType, proofData) => {
        if (!listing?.proofRequirements) return true; // No requirements = always valid

        const requirement = listing.proofRequirements.find(req => req.type === proofType);
        if (!requirement || !requirement.minValue) return true; // No minimum requirement = always valid

        // Extract the value from the proof data based on the actual proof structure
        let proofValue;
        if (proofType === 'income') {
            // Extract income value from proof - check multiple possible locations
            proofValue = proofData?.output?.content?.attribute ||
                proofData?.income ||
                proofData?.value ||
                proofData?.publicSignals?.[0] ||
                0;
        } else if (proofType === 'creditScore') {
            // Extract credit score value from proof
            proofValue = proofData?.output?.content?.attribute ||
                proofData?.creditScore ||
                proofData?.value ||
                proofData?.publicSignals?.[0] ||
                0;
        }

        // Convert to number and compare
        const numericValue = parseFloat(proofValue);

        // Debug logging
        console.log(`Proof validation for ${proofType}:`, {
            proofValue,
            numericValue,
            requirement: requirement.minValue,
            meetsRequirement: numericValue >= requirement.minValue,
            proofData: proofData
        });

        return numericValue >= requirement.minValue;
    };

    // Function to check if all required proofs are present and valid
    const canVerifyApplication = (application) => {
        return true;

        // if (listing.incomeRequirement !== undefined && listing.creditScoreRequirement === undefined) return false;
        // if
        //
        // for (const proofType of requiredProofs) {
        //     const proof = proofType === 'income' ? application.incomeProof : application.creditScoreProof;
        //     if (!proof) return false; // Missing required proof
        //     if (!checkProofMeetsRequirements(proofType, proof)) return false; // Proof doesn't meet requirements
        // }
        //
        // return true;
    };

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress/>
        </Box>
    );

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!listing) return <Alert severity="info">Listing not found</Alert>;

    return (
        <Box sx={{p: 3, maxWidth: '800px', margin: '0 auto'}}>
            <Paper sx={{p: 3, mb: 3}}>
                <Typography variant="h4" gutterBottom>{listing.name}</Typography>
                <Typography variant="body1" paragraph><strong>Address:</strong> {listing.address}</Typography>
                <Typography variant="body1" paragraph><strong>Size:</strong> {listing.size} m²</Typography>
                {listing.price && (
                    <Typography variant="body1" paragraph><strong>Price:</strong> €{listing.price}</Typography>
                )}
                {listing.type && (
                    <Typography variant="body1" paragraph><strong>Type:</strong> {listing.type}</Typography>
                )}

                {/* Proof Requirements */}
                {listing.proofRequirements && listing.proofRequirements.length > 0 && (
                    <Box sx={{mt: 2}}>
                        <Typography variant="h6" gutterBottom>Proof Requirements</Typography>
                        {listing.proofRequirements.map((req, index) => (
                            <Typography key={index} variant="body1" paragraph>
                                <strong>{req.type === 'income' ? 'Income Proof' : 'Credit Score Proof'}</strong>
                                {req.minValue && (
                                    <span> - Minimum: {req.type === 'income' ? `€${req.minValue}` : req.minValue}</span>
                                )}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Paper>

            <Paper sx={{p: 3}}>
                <Typography variant="h5" gutterBottom>Applications ({applications.length})</Typography>
                {applications.length === 0 ? (
                    <Alert severity="info">No applications yet</Alert>
                ) : (
                    <List>
                        {applications.map((application, index) => (
                            <React.Fragment key={application.id}>
                                {index > 0 && <Divider/>}
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
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
                                            <Box sx={{mt: 1}}>
                                                <Stack spacing={1}>
                                                    <Typography variant="body2">
                                                        Submitted: {new Date(application.timestamp).toLocaleString()}
                                                    </Typography>
                                                    {application.verificationResult !== undefined && (
                                                        <Typography variant="body2"
                                                                    color={application.verificationResult ? 'success.main' : 'error.main'}>
                                                            Verification: {application.verificationResult ? 'Valid' : 'Invalid'}
                                                        </Typography>
                                                    )}
                                                    <Stack direction="row" spacing={1}>
                                                        {listing.incomeRequirement && application.incomeProof && (
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleViewProof(application.incomeProof, 'Income')}
                                                                variant="text"
                                                                color={checkProofMeetsRequirements('income', application.incomeProof) ? 'primary' : 'error'}
                                                            >
                                                                View Income Proof
                                                                {!checkProofMeetsRequirements('income', application.incomeProof) && ' ⚠️'}
                                                            </Button>
                                                        )}
                                                        {listing.creditScoreRequirement && application.creditScoreProof && (
                                                            <Button
                                                                size="small"
                                                                onClick={() => handleViewProof(application.creditScoreProof, 'Credit Score')}
                                                                variant="text"
                                                                color={checkProofMeetsRequirements('creditScore', application.creditScoreProof) ? 'primary' : 'error'}
                                                            >
                                                                View Credit Score Proof
                                                                {!checkProofMeetsRequirements('creditScore', application.creditScoreProof) && ' ⚠️'}
                                                            </Button>
                                                        )}
                                                    </Stack>
                                                    {/* Show missing required proofs */}

                                                    {/*{getRequiredProofs().map(proofType => {*/}
                                                    {/*    const hasProof = proofType === 'income' ? application.incomeProof : application.creditScoreProof;*/}
                                                    {/*    if (!hasProof) {*/}
                                                    {/*        return (*/}
                                                    {/*            <Typography key={proofType} variant="body2"*/}
                                                    {/*                        color="error.main">*/}
                                                    {/*                Missing {proofType === 'income' ? 'Income' : 'Credit Score'} Proof*/}
                                                    {/*                ❌*/}
                                                    {/*            </Typography>*/}
                                                    {/*        );*/}
                                                    {/*    }*/}
                                                    {/*    return null;*/}
                                                    {/*})}*/}
                                                    {/* Show insufficient proof values */}
                                                    {/*{getRequiredProofs().map(proofType => {*/}
                                                    {/*    const proof = proofType === 'income' ? application.incomeProof : application.creditScoreProof;*/}
                                                    {/*    if (proof && !checkProofMeetsRequirements(proofType, proof)) {*/}
                                                    {/*        const requirement = listing.proofRequirements.find(req => req.type === proofType);*/}
                                                    {/*        return (*/}
                                                    {/*            <Typography key={proofType} variant="body2"*/}
                                                    {/*                        color="error.main">*/}
                                                    {/*                {proofType === 'income' ? 'Income' : 'Credit Score'} Proof*/}
                                                    {/*                insufficient*/}
                                                    {/*                (need {proofType === 'income' ? `€${requirement.minValue}` : requirement.minValue})*/}
                                                    {/*                ⚠️*/}
                                                    {/*            </Typography>*/}
                                                    {/*        );*/}
                                                    {/*    }*/}
                                                    {/*    return null;*/}
                                                    {/*})}*/}
                                                </Stack>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Stack spacing={1}>
                                            {application.status === 'pending' && (
                                                <>
                                                    {canVerifyApplication(application) ? (
                                                        <Button
                                                            onClick={() => handleVerifyApplication(application._id)}
                                                            disabled={loading}
                                                            variant="outlined"
                                                            size="small"
                                                        >
                                                            Verify Proofs
                                                        </Button>
                                                    ) : (
                                                        <Typography variant="body2" color="error.main"
                                                                    sx={{fontSize: '0.75rem'}}>
                                                            Cannot verify - missing or insufficient proofs
                                                        </Typography>
                                                    )}
                                                </>
                                            )}
                                            {application.status === 'verified' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleUpdateStatus(application, 'approved')}
                                                        disabled={loading}
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleUpdateStatus(application, 'rejected')}
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

            <Box sx={{mt: 3, display: 'flex', justifyContent: 'space-between'}}>
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
                    <Box sx={{mt: 2}}>
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
