import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {backend_api} from '../services/backend_api';
import {bank_api} from '../services/bank_api';
import {Box, Button, Typography, CircularProgress, Alert} from '@mui/material';

function Apply() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [incomeProof, setIncomeProof] = useState(null);
    const [creditProof, setCreditProof] = useState(null);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            const token = localStorage.getItem('token');
            try {
                const data = await backend_api.getListingById(id, token);
                setListing(data);
            } catch (err) {
                setError('Fehler beim Laden des Listings.');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleGenerateProof = async (type) => {
        // Hier Proof-Generierung einbinden (Dummy für Demo)
        let proof = null;
        try {
            const userId = localStorage.getItem('userId');

            let targetValue;
            if (type === 'income') {
                targetValue = listing.incomeRequirement;
            } else if (type === 'creditScore') {
                targetValue = listing.creditScoreRequirement;
            } else {
                throw new Error("Invalid proof type");
            }
            proof = await bank_api.generateProof(userId, type, targetValue)
        } catch (err) {
            setError("Proof could not be generated.");
            const proof = null;
        }
        if (type === 'income') {
            setIncomeProof(proof);
        } else if (type === 'creditScore') {
            setCreditProof(proof);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        const token = localStorage.getItem('token');
        const proofs = {};
        if (needsIncomeProof) proofs.incomeProof = incomeProof;
        if (needsCreditProof) proofs.creditScoreProof = creditProof;
        try {
            await backend_api.applyToListing(id, token, proofs);
            navigate('/listings-overview');
        } catch (err) {
            setError(err.message);
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <CircularProgress/>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!listing) return null;

    const needsIncomeProof = listing.incomeRequirement !== undefined;
    const needsCreditProof = listing.creditScoreRequirement !== undefined;

    return (
        <Box maxWidth={600} mx="auto" mt={4}>
            <Typography variant="h4" gutterBottom sx={{fontWeight: 600, mb: 3}}>Application
                for: {listing.name}</Typography>
            <Box
                component="form"
                onSubmit={e => {
                    e.preventDefault();
                    handleApply();
                }}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    background: '#fff',
                    borderRadius: 3,
                    boxShadow: 3,
                    p: 4,
                }}
            >
                <Box>
                    <Typography variant="subtitle1" sx={{fontWeight: 500}}>Adress</Typography>
                    <Typography sx={{color: 'text.secondary'}}>{listing.address}</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{fontWeight: 500}}>Size</Typography>
                    <Typography sx={{color: 'text.secondary'}}>{listing.size}</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{fontWeight: 500}}>Price</Typography>
                    <Typography sx={{color: 'text.secondary'}}>{listing.price} €</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{fontWeight: 500}}>Type</Typography>
                    <Typography sx={{color: 'text.secondary'}}>{listing.type}</Typography>
                </Box>
                {needsIncomeProof && (
                    <Box>
                        <Typography variant="subtitle1" sx={{fontWeight: 500}}>Income Proof</Typography>
                        <Alert severity="info" sx={{mb: 1}}>
                            Mindestens {listing.incomeRequirement} € erforderlich.
                        </Alert>
                        {incomeProof == null ? (
                            <Button variant="outlined" onClick={() => handleGenerateProof('income')}>Generate Proof!
                                </Button>
                        ) : (
                            <Alert severity="success">Proof generated!</Alert>
                        )}
                    </Box>
                )}
                {needsCreditProof && (
                    <Box>
                        <Typography variant="subtitle1" sx={{fontWeight: 500}}>Credit Score Proof</Typography>
                        <Alert severity="info" sx={{mb: 1}}>
                            Mindestens {listing.creditScoreRequirement} erforderlich.
                        </Alert>
                        {creditProof == null ? (
                            <Button variant="outlined" onClick={() => handleGenerateProof('creditScore')}>Generate Proof!
                            </Button>
                        ) : (
                            <Alert severity="success">Proof generated!</Alert>
                        )}
                    </Box>
                )}
                <Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{mt: 2, fontWeight: 600}}
                        disabled={applying || (needsIncomeProof && incomeProof == null) || (needsCreditProof && creditProof == null)}
                    >
                        Jetzt bewerben
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default Apply;
