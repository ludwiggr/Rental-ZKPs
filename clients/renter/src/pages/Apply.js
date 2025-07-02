import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { backend_api } from '../services/backend_api';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';

function Apply() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [proof, setProof] = useState({ income: '', credit: '' });
    const [proofGenerated, setProofGenerated] = useState({ income: false, credit: false });
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
        setProofGenerated((prev) => ({ ...prev, [type]: true }));
        setProof((prev) => ({ ...prev, [type]: 'proof123' }));
    };

    const handleApply = async () => {
        setApplying(true);
        const token = localStorage.getItem('token');
        const proofs = {};
        if (needsIncomeProof) proofs.incomeProof = { proof: proof.income };
        if (needsCreditProof) proofs.creditScoreProof = { proof: proof.credit };
        try {
            await backend_api.applyToListing(id, token, proofs);
            navigate('/listing-overview');
        } catch (err) {
            setError(err.message);
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!listing) return null;

    const needsIncomeProof = listing.incomeRequirement !== undefined && listing.incomeRequirement !== null;
    const needsCreditProof = listing.creditScoreRequirement !== undefined && listing.creditScoreRequirement !== null;

    return (
        <Box maxWidth={600} mx="auto" mt={4}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Bewerbung für: {listing.name}</Typography>
            <Box
                component="form"
                onSubmit={e => { e.preventDefault(); handleApply(); }}
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Adresse</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{listing.address}</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Größe</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{listing.size}</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Preis</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{listing.price} €</Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Typ</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>{listing.type}</Typography>
                </Box>
                {needsIncomeProof && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Einkommensnachweis</Typography>
                        <Alert severity="info" sx={{ mb: 1 }}>
                            Mindestens {listing.incomeRequirement} € erforderlich.
                        </Alert>
                        {!proofGenerated.income ? (
                            <Button variant="outlined" onClick={() => handleGenerateProof('income')}>Einkommensnachweis generieren</Button>
                        ) : (
                            <Alert severity="success">Einkommensnachweis generiert!</Alert>
                        )}
                    </Box>
                )}
                {needsCreditProof && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Bonitätsnachweis</Typography>
                        <Alert severity="info" sx={{ mb: 1 }}>
                            Mindestens {listing.creditScoreRequirement} erforderlich.
                        </Alert>
                        {!proofGenerated.credit ? (
                            <Button variant="outlined" onClick={() => handleGenerateProof('credit')}>Bonitätsnachweis generieren</Button>
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
                        sx={{ mt: 2, fontWeight: 600 }}
                        disabled={applying || (needsIncomeProof && !proofGenerated.income) || (needsCreditProof && !proofGenerated.credit)}
                    >
                        Jetzt bewerben
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default Apply;
