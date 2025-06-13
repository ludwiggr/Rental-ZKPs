export interface RentalProof {
    proof: any;
    publicInputs: any;
    renterId: string;
    timestamp: string;
}
export interface LandlordProof {
    proof: any;
    publicInputs: any;
    landlordId: string;
    propertyId: string;
    timestamp: string;
}
export interface ProofRequest {
    type: 'landlord' | 'rental';
    criteria: {
        minPropertyValue?: number;
        minIncome?: number;
        minCreditScore?: number;
    };
    timestamp: string;
}
export interface ProofResponse {
    success: boolean;
    data?: {
        verificationId: string;
        timestamp: string;
        signature: string;
        proof?: any;
        publicInputs?: any;
    };
    error?: string;
}
