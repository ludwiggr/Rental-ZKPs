import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    FormControlLabel,
    Checkbox,
    Alert,
    Divider,
    Grid
} from '@mui/material';

const CreateListing = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        size: '',
        price: '',
        type: ''
    });

    const [proofRequirements, setProofRequirements] = useState({
        income: {
            required: false,
            minValue: ''
        },
        creditScore: {
            required: false,
            minValue: ''
        }
    });

    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProofRequirementChange = (proofType, field, value) => {
        setProofRequirements(prev => ({
            ...prev,
            [proofType]: {
                ...prev[proofType],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to create a listing.');
            return;
        }

        try {
            // Convert proof requirements to the expected format
            if (proofRequirements.income.required) {
                if (!proofRequirements.income.minValue) {
                    throw new Error('Please specify a minimum income value');
                }
            }
            if (proofRequirements.creditScore.required) {
                if (!proofRequirements.income.minValue) {
                    throw new Error('Please specify a minimum credit score');
                }
            }

            const res = await fetch('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    size: Number(formData.size),
                    price: Number(formData.price),
                    type: formData.type,
                    ...(proofRequirements.income.required && {incomeRequirement:proofRequirements.income.minValue}),
                    ...(proofRequirements.creditScore.required && {creditScoreRequirement: proofRequirements.creditScore.minValue})
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error creating listing');
                setMessage(null);
            } else {
                setMessage('Listing created successfully!');
                navigate('/listings-overview')
            }
        } catch (err) {
            setError('Network or server error');
            setMessage(null);
        }
    };

    return (
        <Box sx={{p: 3, maxWidth: '800px', margin: '0 auto', py: '30px', width: '100vw', px: '30px', height: '100vh'}}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Create New Listing</Typography>

                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Size (sqm)"
                                name="size"
                                type="number"
                                value={formData.size}
                                onChange={handleChange}
                                required
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Price (€)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                select
                                label="Type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                <option value="flat">Flat</option>
                                <option value="house">House</option>
                                <option value="studio">Studio</option>
                                <option value="apartment">Apartment</option>
                            </TextField>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>Proof Requirements</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Specify which proofs are required for applicants and their minimum/maximum values.
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={proofRequirements.income.required}
                                            onChange={(e) => handleProofRequirementChange('income', 'required', e.target.checked)}
                                        />
                                    }
                                    label="Require Income Proof"
                                />
                                {proofRequirements.income.required && (
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Minimum Income (€)"
                                                type="number"
                                                value={proofRequirements.income.minValue}
                                                onChange={(e) => handleProofRequirementChange('income', 'minValue', e.target.value)}
                                                inputProps={{ min: 0 }}
                                                helperText="Higher income is always better"
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={proofRequirements.creditScore.required}
                                            onChange={(e) => handleProofRequirementChange('creditScore', 'required', e.target.checked)}
                                        />
                                    }
                                    label="Require Credit Score Proof"
                                />
                                {proofRequirements.creditScore.required && (
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Minimum Credit Score"
                                                type="number"
                                                value={proofRequirements.creditScore.minValue}
                                                onChange={(e) => handleProofRequirementChange('creditScore', 'minValue', e.target.value)}
                                                inputProps={{ min: 300, max: 850 }}
                                                helperText="Higher credit score is always better"
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                        >
                            Create Listing
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate('/listings-overview')}
                        >
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default CreateListing;
