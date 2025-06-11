import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Alert, CircularProgress } from '@mui/material';
import APIService from './services/APIService';

/**
 * @typedef {Object} PropertyProof
 * @property {string} propertyHash
 * @property {any} proof
 * @property {Object} publicInputs
 * @property {string} publicInputs.city
 * @property {string} publicInputs.propertyType
 * @property {string} publicInputs.governmentVerificationId
 */

/**
 * @typedef {Object} ServerResponse
 * @property {boolean} success
 * @property {Object} [data]
 * @property {string} [data.verificationId]
 * @property {string} [data.timestamp]
 * @property {string} [data.signature]
 */

/**
 * @returns {JSX.Element}
 */
const ZKPExamplePage = () => {
    const [proofs, setProofs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationResults, setVerificationResults] = useState({});

    useEffect(() => {
        fetchProofs();
    }, []);

    const fetchProofs = async () => {
        try {
            setError(null);
            setLoading(true);
            const result = await APIService.getProofs();
            setProofs(result.proofs);
        } catch (error) {
            console.error('Error fetching proofs:', error);
            setError(error.message || 'Failed to fetch proofs');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyProof = async (index) => {
        try {
            setError(null);
            setLoading(true);

            const result = await APIService.verifyProof(index);
            setVerificationResults(prev => ({
                ...prev,
                [index]: result.verified
            }));
        } catch (error) {
            console.error('Error verifying proof:', error);
            setError(error.message || 'Failed to verify proof');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <h1>Test 2</h1>
                <Typography variant="h4" component="h1" gutterBottom>
                    Received Income Proofs
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress />
                    </Box>
                )}

                {proofs.length === 0 && !loading ? (
                    <Alert severity="info">
                        No proofs received yet.
                    </Alert>
                ) : (
                    proofs.map((proofData, index) => (
                        <Paper key={index} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Proof #{index + 1}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Received: {new Date(proofData.timestamp).toLocaleString()}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                  {JSON.stringify(proofData.proof, null, 2)}
                </pre>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleVerifyProof(index)}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Verify Proof'}
                                </Button>
                                {verificationResults[index] !== undefined && (
                                    <Alert severity={verificationResults[index] ? "success" : "error"}>
                                        {verificationResults[index] ? "Proof verified successfully!" : "Proof verification failed!"}
                                    </Alert>
                                )}
                            </Box>
                        </Paper>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default ZKPExamplePage;
