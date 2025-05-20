const { RenterZKPService } = require('../services/ZKPService');
const { APIService } = require('@shared/services/APIService');

async function renterExample() {
  // Initialize services
  const renterService = new RenterZKPService('renter789');
  const apiService = new APIService('http://localhost:3001');

  try {
    // Generate rental proof
    const rentalProof = await renterService.generateRentalProof(75000, 720, true);
    console.log('Generated rental proof:', rentalProof);

    // Submit proof to API
    const submissionResponse = await apiService.submitProof(rentalProof, 'rental');
    if (!submissionResponse.success) {
      throw new Error(submissionResponse.error);
    }
    console.log('Proof submitted successfully');

    // Request landlord proof
    const proofRequest = renterService.requestLandlordProof({
      minPropertyValue: 400000
    });
    const requestResponse = await apiService.requestProof(proofRequest);
    if (!requestResponse.success) {
      throw new Error(requestResponse.error);
    }

    // Verify received proof
    if (requestResponse.data && requestResponse.data.proof) {
      const isValid = await renterService.verifyLandlordProof(
        requestResponse.data.proof,
        requestResponse.data.publicInputs
      );
      console.log('Landlord proof is valid:', isValid);
    }
  } catch (error) {
    console.error('Error in renter example:', error);
  }
}

renterExample();

export default renterExample; 