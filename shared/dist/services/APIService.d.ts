import { ProofRequest, ProofResponse } from '../types/zkp';
export declare class APIService {
    private readonly baseUrl;
    constructor(baseUrl: string);
    requestProof(request: ProofRequest): Promise<ProofResponse>;
    submitProof(proof: string, type: 'RENTAL' | 'LANDLORD'): Promise<ProofResponse>;
    verifyProof(proof: string, type: 'RENTAL' | 'LANDLORD'): Promise<boolean>;
}
