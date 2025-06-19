import ProofService from './ProofService';

class APIService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.proofService = new ProofService();
  }

  async requestProof(proofRequest) {
    try {
      const { role, attributes } = proofRequest;
      
      // Generate keys if needed
      await this.proofService.generateKeys(role);
      
      // Request proof from the role
      const result = await this.proofService.requestProof(role, attributes);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Store the proof in the backend
      const response = await fetch(`${this.baseUrl}/api/proofs/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role,
          credential: result.credential 
        })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message || error };
    }
  }

  async submitProof(proofData, type) {
    try {
      const { role, credential, attributeIndex, challenge } = proofData;
      
      // Create proof presentation
      const result = await this.proofService.createProofPresentation(
        role,
        credential,
        attributeIndex,
        challenge
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Submit the proof to the backend
      const response = await fetch(`${this.baseUrl}/api/proofs/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          proofData: result.presentation,
          type 
        })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message || error };
    }
  }

  async verifyProof(proof, type) {
    try {
      const { role, presentation } = proof;
      
      // Verify the proof locally
      const result = await this.proofService.verifyProof(role, presentation);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Verify the proof on the backend
      const response = await fetch(`${this.baseUrl}/api/proofs/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof, type })
      });
      
      const backendResult = await response.json();
      return backendResult.isValid && result.isValid;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }
}

export default APIService; 