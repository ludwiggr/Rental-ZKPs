const API_BASE_URL = 'http://localhost:3000';
const EMPLOYER_API_URL = 'http://localhost:3003';
const BANK_API_URL = 'http://localhost:3002';
const LANDLORD_API_URL = 'http://localhost:3004';

class APIService {
  static async generateIncomeProof(income, employerId) {
    console.log('Sending income verification request:', { income, employerId });
    const response = await fetch(`${EMPLOYER_API_URL}/verify-income`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        income,
        employerId,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate income proof');
    }

    const result = await response.json();
    console.log('Received income verification response:', result);
    return result;
  }

  static async verifyProof(proof) {
    console.log('Verifying proof...');
    // First send the proof to landlord API
    const sendResponse = await fetch(`${LANDLORD_API_URL}/receive-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proof }),
    });

    if (!sendResponse.ok) {
      const error = await sendResponse.json();
      throw new Error(error.error || 'Failed to send proof for verification');
    }

    // Get the index of the received proof (it will be 0 since it's the first one)
    const proofsResponse = await fetch(`${LANDLORD_API_URL}/proofs`);
    if (!proofsResponse.ok) {
      throw new Error('Failed to get proofs list');
    }

    const proofsData = await proofsResponse.json();
    const proofIndex = proofsData.proofs.length - 1; // Get the index of the latest proof

    // Now verify the proof using the landlord API
    const verifyResponse = await fetch(`${LANDLORD_API_URL}/verify-proof/${proofIndex}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      throw new Error(error.error || 'Failed to verify proof');
    }

    const result = await verifyResponse.json();
    console.log('Verification result:', result);
    return result;
  }

  static async sendProofToLandlord(proof) {
    console.log('Sending proof to backend...');
    const response = await fetch(`${LANDLORD_API_URL}/receive-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proof }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send proof to backend');
    }

    const result = await response.json();
    console.log('Sending result:', result);
    return result;
  }

  static async requestCreditCheck({ creditScore, bankId, timestamp }) {
    console.log('Requesting credit check:', { creditScore, bankId, timestamp });
    const response = await fetch(`${BANK_API_URL}/request-credit-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creditScore,
        bankId,
        timestamp
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request credit check');
    }

    const result = await response.json();
    console.log('Credit check response:', result);
    return result;
  }
}

export default APIService; 