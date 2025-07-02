import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {backend_api} from '../services/backend_api';
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

    const handleGenerateProof = (type) => {
        // Hier Proof-Generierung einbinden (Dummy für Demo)
        const proof = {"proof": 'Very trustable proof'};
        if (type === 'income') {
            setIncomeProof(proof);
        } else if (type === 'credit') {
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
            navigate('/listing-overview');
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
                            <Button variant="outlined" onClick={() => handleGenerateProof('income')}>Einkommensnachweis
                                generieren</Button>
                        ) : (
                            <Alert severity="success">Einkommensnachweis generiert!</Alert>
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
                            <Button variant="outlined" onClick={() => handleGenerateProof('credit')}>Bonitätsnachweis
                                generieren</Button>
                        ) : (
                            <Alert severity="success">Bonitätsnachweis generiert!</Alert>
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
