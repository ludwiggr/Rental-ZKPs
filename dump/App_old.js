import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Grid, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import APIService from './APIService';
import MainLayout from '../clients/renter/src/layouts/MainLayout';

const RenterApp = () => {
  const [income, setIncome] = useState('');
  const [employerId, setEmployerId] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [bankId, setBankId] = useState('');
  const [incomeProof, setIncomeProof] = useState(null);
  const [creditScoreProof, setCreditScoreProof] = useState(null);
  const [error, setError] = useState(null);
  const [incomeError, setIncomeError] = useState(null);
  const [creditError, setCreditError] = useState(null);
  const [incomeVerificationResult, setIncomeVerificationResult] = useState(null);
  const [creditVerificationResult, setCreditVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingStatus, setSendingStatus] = useState({});
  const [listings, setListings] = useState([]);
  const [listingsError, setListingsError] = useState(null);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [applicationIds, setApplicationIds] = useState({});
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
      setIncomeError(null);
      setLoading(true);
      setIncomeProof(null);
      setIncomeVerificationResult(null);

      const result = await APIService.generateIncomeProof(parseFloat(income), employerId);
      setIncomeProof(result.proof);
      console.log('Generated proof:', result.proof);
    } catch (error) {
      console.error('Error generating income proof:', error);
      setIncomeError(error.message || 'Failed to generate income proof');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProof = async (proof, proofType = 'income') => {
    try {
      if (proofType === 'income') {
        setIncomeError(null);
        setIncomeVerificationResult(null);
      } else {
        setCreditError(null);
        setCreditVerificationResult(null);
      }
      setLoading(true);

      const result = await APIService.verifyProof(proof);

      if (proofType === 'income') {
        setIncomeVerificationResult(result.success);
      } else {
        setCreditVerificationResult(result.success);
      }

      console.log('Verification result:', result);
    } catch (error) {
      console.error('Error verifying proof:', error);
      const errorMessage = error.message || 'Failed to verify proof';
      if (proofType === 'income') {
        setIncomeError(errorMessage);
      } else {
        setCreditError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCreditCheck = async () => {
    try {
      setCreditError(null);
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
        setCreditError(result.error || 'Failed to request credit check');
      }
    } catch (error) {
      console.error('Error requesting credit check:', error);
      setCreditError(error.message || 'Failed to request credit check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToListing = (listing) => {
    setSelectedListing(listing);
    setError(null);
    setIsApplicationDialogOpen(true);
  };

  // Function to validate that generated proofs meet listing requirements
  const validateProofsMeetRequirements = (listing) => {
    if (!listing?.proofRequirements || listing.proofRequirements.length === 0) {
      // For listings without specific requirements, require both proofs
      return incomeProof && creditScoreProof;
    }

    for (const requirement of listing.proofRequirements) {
      if (requirement.type === 'income') {
        if (!incomeProof) return false;
        // Check if income meets minimum requirement
        if (requirement.minValue && parseFloat(income) < requirement.minValue) {
          return false;
        }
      } else if (requirement.type === 'creditScore') {
        if (!creditScoreProof) return false;
        // Check if credit score meets minimum requirement
        if (requirement.minValue && parseFloat(creditScore) < requirement.minValue) {
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmitApplication = async () => {
    // Validate that proofs meet requirements
    if (!validateProofsMeetRequirements(selectedListing)) {
      if (selectedListing?.proofRequirements && selectedListing.proofRequirements.length > 0) {
        const missingRequirements = [];
        for (const requirement of selectedListing.proofRequirements) {
          if (requirement.type === 'income') {
            if (!incomeProof) {
              missingRequirements.push('Income proof');
            } else if (requirement.minValue && parseFloat(income) < requirement.minValue) {
              missingRequirements.push(`Income proof (minimum €${requirement.minValue} required, you have €${income})`);
            }
          } else if (requirement.type === 'creditScore') {
            if (!creditScoreProof) {
              missingRequirements.push('Credit score proof');
            } else if (requirement.minValue && parseFloat(creditScore) < requirement.minValue) {
              missingRequirements.push(`Credit score proof (minimum ${requirement.minValue} required, you have ${creditScore})`);
            }
          }
        }
        setError(`Missing or insufficient proofs: ${missingRequirements.join(', ')}`);
      } else {
        setError('Please generate both income and credit score proofs before applying');
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await APIService.submitApplication(selectedListing._id || selectedListing.id, {
        incomeProof,
        creditScoreProof
      });

      const listingId = selectedListing._id || selectedListing.id;
      const applicationId = result.application.id;

      setApplicationStatus(prev => ({
        ...prev,
        [listingId]: 'pending'
      }));

      setApplicationIds(prev => ({
        ...prev,
        [listingId]: applicationId
      }));

      setSendingStatus(prev => ({
        ...prev,
        [listingId]: 'Application submitted successfully!'
      }));

      setIsApplicationDialogOpen(false);
    } catch (err) {
      console.error('Failed to submit application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async (listingId, applicationId) => {
    try {
      const result = await APIService.getApplicationStatus(listingId, applicationId);
      if (result.success && result.application) {
        setApplicationStatus(prev => ({
          ...prev,
          [listingId]: result.application.status
        }));
      }
    } catch (error) {
      console.error('Failed to check application status:', error);
    }
  };

  // Check application status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      Object.entries(applicationIds).forEach(([listingId, applicationId]) => {
        if (applicationStatus[listingId] === 'pending') {
          checkApplicationStatus(listingId, applicationId);
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [applicationIds, applicationStatus]);

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Available Listings Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h4" component="h1">
            Available Listings
          </Typography>
        </Box>

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
          <Grid container spacing={6} sx={{ mb: 6 }}>
            {listings.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">No listings available at the moment.</Alert>
              </Grid>
            ) : (
              listings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={listing._id || listing.id}>
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

                    {/* Proof Requirements Section */}
                    {listing.proofRequirements && listing.proofRequirements.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Required Proofs:
                        </Typography>
                        {listing.proofRequirements.map((req, index) => (
                          <Box key={index} sx={{ mb: 1, pl: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>{req.type === 'income' ? 'Income Proof' : 'Credit Score Proof'}</strong>
                              {req.minValue && (
                                <span> - Min: {req.type === 'income' ? `€${req.minValue}` : req.minValue}</span>
                              )}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      {sendingStatus[listing._id || listing.id] ? (
                        <Alert severity="success" sx={{ mb: 1 }}>
                          {sendingStatus[listing._id || listing.id]}
                        </Alert>
                      ) : null}
                      {applicationStatus[listing._id || listing.id] ? (
                        <Alert
                          severity={
                            applicationStatus[listing._id || listing.id] === 'approved' ? 'success' :
                              applicationStatus[listing._id || listing.id] === 'rejected' ? 'error' : 'info'
                          }
                        >
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Income Verification Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h4" component="h1">
            Income Verification
          </Typography>
        </Box>

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

        {incomeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {incomeError}
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

        {/* Credit Score Verification Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h4" component="h1">
            Credit Score Verification
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
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
                disabled={loading || !creditScore || !bankId}
              >
                {loading ? <CircularProgress size={24} /> : 'Request Credit Check'}
              </Button>
              {creditError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {creditError}
                </Alert>
              )}
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

            {selectedListing?.proofRequirements && selectedListing.proofRequirements.length > 0 ? (
              <>
                {selectedListing.proofRequirements.map((req, index) => {
                  const isIncome = req.type === 'income';
                  const hasProof = isIncome ? incomeProof : creditScoreProof;
                  const currentValue = isIncome ? parseFloat(income) : parseFloat(creditScore);
                  const meetsMinimum = req.minValue ? currentValue >= req.minValue : true;
                  const isValid = hasProof && meetsMinimum;

                  return (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography component="div" variant="body2">
                        <strong>{isIncome ? 'Income Proof' : 'Credit Score Proof'}</strong>
                        {req.minValue && (
                          <span> - Minimum: {isIncome ? `€${req.minValue}` : req.minValue}</span>
                        )}
                        {hasProof ? (
                          meetsMinimum ? ' ✅' : ` ❌ (You have ${isIncome ? `€${currentValue}` : currentValue}, need ${isIncome ? `€${req.minValue}` : req.minValue})`
                        ) : ' ❌ (No proof generated)'}
                      </Typography>
                    </Box>
                  );
                })}
              </>
            ) : (
              <>
                <Typography component="div">
                  1. Generate Income Proof {incomeProof ? '✅' : '❌'}
                </Typography>
                <Typography component="div">
                  2. Generate Credit Score Proof {creditScoreProof ? '✅' : '❌'}
                </Typography>
              </>
            )}

            {selectedListing?.proofRequirements && selectedListing.proofRequirements.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Make sure your proofs meet the minimum requirements specified above.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsApplicationDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={!validateProofsMeetRequirements(selectedListing) || loading}
              variant="contained"
              color="primary"
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default RenterApp; 