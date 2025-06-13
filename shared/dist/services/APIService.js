"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIService = void 0;
class APIService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async requestProof(request) {
        try {
            const response = await fetch(`${this.baseUrl}/api/proofs/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    async submitProof(proof, type) {
        try {
            const response = await fetch(`${this.baseUrl}/api/proofs/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ proof, type }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    async verifyProof(proof, type) {
        try {
            const response = await fetch(`${this.baseUrl}/api/proofs/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ proof, type }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.valid;
        }
        catch (error) {
            throw new Error(`Failed to verify proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.APIService = APIService;
