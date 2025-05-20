import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Grid, Alert, CircularProgress } from '@mui/material';
import { generateIncomeProof, requestCreditCheck } from './services/APIService';
import APIService from './services/APIService';

const RenterApp = () => {
  const [income, setIncome] = useState('');
  const [employerId, setEmployerId] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [bankId, setBankId] = useState('');
  const [incomeProof, setIncomeProof] = useState(null);
  const [creditScoreProof, setCreditScoreProof] = useState(null);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(null);

  const handleGenerateIncomeProof = async () => {
    try {
      setError(null);
      setLoading(true);
      setIncomeProof(null);
      setVerificationResult(null);
      setSendingStatus(null);

      const result = await APIService.generateIncomeProof(parseFloat(income), employerId);
      setIncomeProof(result.proof);
      console.log('Generated proof:', result.proof);
    } catch (error) {
      console.error('Error generating income proof:', error);
      setError(error.message || 'Failed to generate income proof');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProof = async () => {
    try {
      setError(null);
      setLoading(true);
      setVerificationResult(null);

      const result = await APIService.verifyProof(incomeProof);
      setVerificationResult(result.success);
      console.log('Verification result:', result);
    } catch (error) {
      console.error('Error verifying proof:', error);
      setError(error.message || 'Failed to verify proof');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToLandlord = async () => {
    try {
      setError(null);
      setLoading(true);
      setSendingStatus(null);

      const result = await APIService.sendProofToLandlord(incomeProof);
      setSendingStatus(result.success);
      console.log('Sending result:', result);
    } catch (error) {
      console.error('Error sending proof to landlord:', error);
      setError(error.message || 'Failed to send proof to landlord');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreditCheck = async () => {
    try {
      setError(null);
      const result = await APIService.requestCreditCheck({
        creditScore: parseFloat(creditScore),
        bankId,
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        setCreditScoreProof(result.check);
      } else {
        setError(result.error || 'Failed to request credit check');
      }
    } catch (error) {
      console.error('Error requesting credit check:', error);
      setError('Failed to request credit check. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Income Verification
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Monthly Income (€)"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            margin="normal"
            helperText="Maximum allowed: 3000€"
          />
          <TextField
            fullWidth
            label="Employer ID"
            value={employerId}
            onChange={(e) => setEmployerId(e.target.value)}
            margin="normal"
            helperText="Valid employer ID: 42"
          />
          <Button
            variant="contained"
            onClick={handleGenerateIncomeProof}
            disabled={loading || !income || !employerId}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Income Proof'}
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {incomeProof && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generated Proof
            </Typography>
            <Box sx={{ mb: 2 }}>
              <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(incomeProof, null, 2)}
              </pre>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerifyProof}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify Proof'}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSendToLandlord}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send to Landlord'}
              </Button>
            </Box>
          </Paper>
        )}

        {verificationResult !== null && (
          <Alert severity={verificationResult ? "success" : "error"} sx={{ mb: 2 }}>
            {verificationResult ? "Proof verified successfully!" : "Proof verification failed!"}
          </Alert>
        )}

        {sendingStatus !== null && (
          <Alert severity={sendingStatus ? "success" : "error"} sx={{ mb: 2 }}>
            {sendingStatus ? "Proof sent to landlord successfully!" : "Failed to send proof to landlord!"}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Credit Score Verification
              </Typography>
              <TextField
                fullWidth
                label="Credit Score"
                type="number"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Bank ID"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleRequestCreditCheck}
                sx={{ mt: 2 }}
                fullWidth
                disabled={!creditScore || !bankId}
              >
                Request Credit Check
              </Button>
              {creditScoreProof && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Credit Score Proof:</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {JSON.stringify(creditScoreProof, null, 2)}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RenterApp; 