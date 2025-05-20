const { LandlordZKPService } = require('../services/ZKPService');
const { APIService } = require('@shared/services/APIService');

async function landlordExample() {
  // Initialize services
  const landlordService = new LandlordZKPService('landlord123');
  const apiService = new APIService('http://localhost:3001');

  try {
    // Generate property proof
    const propertyProof = await landlordService.generatePropertyProof('property456', 500000, true);
    console.log('Generated property proof:', propertyProof);

    // Submit proof to API
    const submissionResponse = await apiService.submitProof(propertyProof, 'property');
    if (!submissionResponse.success) {
      throw new Error(submissionResponse.error);
    }
    console.log('Proof submitted successfully');

    // Request rental proof
    const proofRequest = landlordService.requestRentalProof({
      minIncome: 60000,
      minCreditScore: 700
    });
    const requestResponse = await apiService.requestProof(proofRequest);
    if (!requestResponse.success) {
      throw new Error(requestResponse.error);
    }

    // Verify received proof
    if (requestResponse.data && requestResponse.data.proof) {
      const isValid = await landlordService.verifyRentalProof(
        requestResponse.data.proof,
        requestResponse.data.publicInputs
      );
      console.log('Rental proof is valid:', isValid);
    }
  } catch (error) {
    console.error('Error in landlord example:', error);
  }
}

landlordExample(); 