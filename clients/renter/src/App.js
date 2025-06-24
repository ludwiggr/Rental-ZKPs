import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Grid, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  const [incomeVerificationResult, setIncomeVerificationResult] = useState(null);
  const [creditVerificationResult, setCreditVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(null);
  const [listings, setListings] = useState([]);
  const [listingsError, setListingsError] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await APIService.getListings();
        setListings(data.listings || []);
        setListingsError(null);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
        setListingsError('Failed to load listings. Please try again later.');
      } finally {
        setListingsLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleGenerateIncomeProof = async () => {
    try {
      setError(null);
      setLoading(true);
      setIncomeProof(null);
      setIncomeVerificationResult(null);
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

  const handleVerifyProof = async (proof, proofType = 'income') => {
    try {
      setError(null);
      setLoading(true);

      if (proofType === 'income') {
        setIncomeVerificationResult(null);
      } else {
        setCreditVerificationResult(null);
      }

      const result = await APIService.verifyProof(proof);

      if (proofType === 'income') {
        setIncomeVerificationResult(result.success);
      } else {
        setCreditVerificationResult(result.success);
      }

      console.log('Verification result:', result);
    } catch (error) {
      console.error('Error verifying proof:', error);
      setError(error.message || 'Failed to verify proof');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToLandlord = async (proof) => {
    try {
      setError(null);
      setLoading(true);
      setSendingStatus(null);

      const result = await APIService.sendProofToLandlord(proof);
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
      setLoading(true);
      setCreditScoreProof(null);
      setCreditVerificationResult(null);

      const result = await APIService.requestCreditCheck({
        creditScore: parseFloat(creditScore),
        bankId,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        setCreditScoreProof(result.proof);
      } else {
        setError(result.error || 'Failed to request credit check');
      }
    } catch (error) {
      console.error('Error requesting credit check:', error);
      setError('Failed to request credit check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToListing = (listing) => {
    setSelectedListing(listing);
    setIsApplicationDialogOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!incomeProof || !creditScoreProof) {
      setError('Please generate both income and credit score proofs before applying');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await APIService.submitApplication(selectedListing._id || selectedListing.id, {
        incomeProof,
        creditScoreProof
      });

      setApplicationStatus(prev => ({
        ...prev,
        [selectedListing._id || selectedListing.id]: 'pending'
      }));

      setIsApplicationDialogOpen(false);
      setSendingStatus('Application submitted successfully!');
    } catch (err) {
      console.error('Failed to submit application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Listings
        </Typography>

        {listingsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {listingsError}
          </Alert>
        )}

        {listingsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {listings.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No listings available at the moment.</Alert>
              </Grid>
            ) : (
              listings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={listing._id || listing.id}>
                  <Paper
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <Typography variant="h6" component="h2" gutterBottom>
                      {listing.name || 'Unnamed Listing'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Address:</strong> {listing.address || 'No address provided'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Size:</strong> {listing.size || 'N/A'} m²
                    </Typography>
                    {listing.price && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>Price:</strong> €{listing.price}
                      </Typography>
                    )}
                    {listing.type && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>Type:</strong> {listing.type}
                      </Typography>
                    )}
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      {applicationStatus[listing._id || listing.id] ? (
                        <Alert severity="info">
                          Application status: {applicationStatus[listing._id || listing.id]}
                        </Alert>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleApplyToListing(listing)}
                          disabled={loading}
                        >
                          Apply Now
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        )}

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
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleVerifyProof(incomeProof, 'income')}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Proof'}
            </Button>
            {incomeVerificationResult !== null && (
              <Alert severity={incomeVerificationResult ? "success" : "error"} sx={{ mt: 2 }}>
                {incomeVerificationResult ? "Proof verified successfully!" : "Proof verification failed!"}
              </Alert>
            )}
          </Paper>
        )}

        {sendingStatus !== null && (
          <Alert severity={sendingStatus ? "success" : "error"} sx={{ mb: 2 }}>
            {sendingStatus ? "Proof sent to landlord successfully!" : "Failed to send proof to landlord!"}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
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
                helperText="Valid range: 300-850"
              />
              <TextField
                fullWidth
                label="Bank ID"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                margin="normal"
                helperText="Valid bank ID: 12345"
              />
              <Button
                variant="contained"
                onClick={handleRequestCreditCheck}
                sx={{ mt: 2 }}
                fullWidth
                disabled={loading || !creditScore || !bankId}
              >
                {loading ? <CircularProgress size={24} /> : 'Request Credit Check'}
              </Button>
              {creditScoreProof && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Credit Score Proof:</Typography>
                  <Box sx={{ mb: 2 }}>
                    <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                      {JSON.stringify(creditScoreProof, null, 2)}
                    </pre>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleVerifyProof(creditScoreProof, 'credit')}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify Proof'}
                  </Button>
                  {creditVerificationResult !== null && (
                    <Alert severity={creditVerificationResult ? "success" : "error"} sx={{ mt: 2 }}>
                      {creditVerificationResult ? "Proof verified successfully!" : "Proof verification failed!"}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Dialog open={isApplicationDialogOpen} onClose={() => setIsApplicationDialogOpen(false)}>
          <DialogTitle>Apply to Listing</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              To apply for this listing, you need to:
            </Typography>
            <Typography component="div">
              1. Generate Income Proof {incomeProof ? '✅' : '❌'}
            </Typography>
            <Typography component="div">
              2. Generate Credit Score Proof {creditScoreProof ? '✅' : '❌'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsApplicationDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={!incomeProof || !creditScoreProof || loading}
              variant="contained"
              color="primary"
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default RenterApp; 