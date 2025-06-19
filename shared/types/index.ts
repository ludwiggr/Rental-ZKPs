export interface PropertyProof {
  propertyHash: string;
  proof: any; // Heimdall proof
  publicInputs: {
    city: string;
    propertyType: string;
    governmentVerificationId: string;
  };
}

export interface IncomeProof {
  incomeHash: string;
  proof: any; // Heimdall proof
  publicInputs: {
    employerId: string;
    verificationId: string;
    currency: string;
  };
}

export interface CreditScoreProof {
  scoreHash: string;
  proof: any; // Heimdall proof
  publicInputs: {
    bankId: string;
    verificationId: string;
    scoreCategory: string; // e.g., "excellent", "good", "fair"
  };
}

export interface VerificationResult {
  isValid: boolean;
  message: string;
  verificationId: string;
}

export interface ServerResponse {
  success: boolean;
  message: string;
  data: {
    verificationId: string;
    timestamp: string;
    signature: string;
    proof?: any;
    publicInputs?: any;
  };
} 