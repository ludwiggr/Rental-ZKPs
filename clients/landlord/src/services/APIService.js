const LANDLORD_API_URL = 'http://localhost:3001';

class APIService {
  static async getProofs() {
    console.log('Fetching proofs...');
    const response = await fetch(`${LANDLORD_API_URL}/proofs`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch proofs');
    }

    const result = await response.json();
    console.log('Received proofs:', result);
    return result;
  }

  static async verifyProof(index) {
    console.log('Verifying proof at index:', index);
    const response = await fetch(`${LANDLORD_API_URL}/verify-proof/${index}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify proof');
    }

    const result = await response.json();
    console.log('Verification result:', result);
    return result;
  }
}

export default APIService; 