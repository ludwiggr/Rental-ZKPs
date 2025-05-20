const API_BASE_URL = 'http://localhost:3000';
const EMPLOYER_API_URL = 'http://localhost:3003';
const BANK_API_URL = 'http://localhost:3002';
const LANDLORD_API_URL = 'http://localhost:3001';

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
    const response = await fetch('/verify-proof.sh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proof }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify proof');
    }

    const result = await response.json();
    console.log('Verification result:', result);
    return result;
  }

  static async sendProofToLandlord(proof) {
    console.log('Sending proof to landlord...');
    const response = await fetch(`${LANDLORD_API_URL}/receive-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proof }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send proof to landlord');
    }

    const result = await response.json();
    console.log('Sending result:', result);
    return result;
  }

  static async requestCreditCheck(ssn) {
    console.log('Requesting credit check for SSN:', ssn);
    const response = await fetch(`${BANK_API_URL}/request-credit-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssn,
        timestamp: new Date().toISOString()
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