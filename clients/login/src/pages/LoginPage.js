import React, { useState } from 'react';
import { Box, Button, Typography, TextField, CircularProgress, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('landlord');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e, role) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Login failed');
            }
            const data = await res.json();
            if (role === 'landlord') {
                // Use the same host and port, but with landlord.localhost in the Host header
                const currentHost = window.location.host;
                window.location.href = `http://${currentHost}/landing?token=${encodeURIComponent(data.token)}`;
                // Set a flag to indicate this should be treated as landlord
                sessionStorage.setItem('userRole', 'landlord');
            } else if (role === 'tenant') {
                // Use the same host and port, but with tenant.localhost in the Host header
                const currentHost = window.location.host;
                window.location.href = `http://${currentHost}/landing?token=${encodeURIComponent(data.token)}&userId=${encodeURIComponent(data.userId)}`;
                // Set a flag to indicate this should be treated as tenant
                sessionStorage.setItem('userRole', 'tenant');
            }
        } catch (err) {
            setMessage(err.message || 'Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box maxWidth={400} mx="auto" mt={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" fontWeight={600} align="center" mb={3}>
                    Login
                </Typography>
                <Box component="form" onSubmit={(e) => handleLogin(e, selectedRole)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        label="Email"
                        variant="outlined"
                        fullWidth
                    />
                    <TextField
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        label="Password"
                        variant="outlined"
                        fullWidth
                    />
                    {message && <Alert severity="error">{message}</Alert>}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            type="submit"
                            variant={selectedRole === 'landlord' ? 'contained' : 'outlined'}
                            color="primary"
                            size="large"
                            disabled={loading}
                            sx={{ fontWeight: 600 }}
                            onClick={() => setSelectedRole('landlord')}
                        >
                            {loading && selectedRole === 'landlord' ? <CircularProgress size={24} color="inherit" /> : 'Login as Landlord'}
                        </Button>
                        <Button
                            type="submit"
                            variant={selectedRole === 'tenant' ? 'contained' : 'outlined'}
                            color="primary"
                            size="large"
                            disabled={loading}
                            sx={{ fontWeight: 600 }}
                            onClick={() => setSelectedRole('tenant')}
                        >
                            {loading && selectedRole === 'tenant' ? <CircularProgress size={24} color="inherit" /> : 'Login as Tenant'}
                        </Button>
                    </Box>
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() => navigate('/register')}
                        sx={{ mt: 2 }}
                    >
                        Don't have an account? Register
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default LoginPage;
