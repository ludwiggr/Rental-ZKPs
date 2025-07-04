import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, TextField, CircularProgress, Alert, Paper } from '@mui/material';

function RegisterPage() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to register');
            }

            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth={400} mx="auto" mt={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" fontWeight={600} align="center" mb={3}>
                    Register
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        label="Username"
                        variant="outlined"
                        fullWidth
                    />
                    <TextField
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        label="Email"
                        variant="outlined"
                        fullWidth
                    />
                    <TextField
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        label="Password"
                        variant="outlined"
                        fullWidth
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{ fontWeight: 600 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                    </Button>
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() => navigate('/login')}
                        sx={{ mt: 2 }}
                    >
                        Already have an account? Login
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default RegisterPage;
