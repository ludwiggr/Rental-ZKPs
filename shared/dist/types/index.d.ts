export interface ServerResponse {
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
