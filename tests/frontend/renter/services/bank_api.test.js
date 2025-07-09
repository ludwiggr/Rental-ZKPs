import { bank_api } from '../../../../clients/renter/src/services/bank_api';

// Mock fetch globally
global.fetch = jest.fn();

describe('Renter Bank API Service', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe('generateProof', () => {
        test('generates income proof successfully', async () => {
            const mockProof = {
                success: true,
                proof: { type: 'income', value: 50000 }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockProof
            });

            const result = await bank_api.generateProof('user123', 'income', 50000);

            expect(fetch).toHaveBeenCalledWith('/bank/proofs/generateProof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'user123',
                    type: 'income',
                    targetValue: 50000
                })
            });
            expect(result).toEqual(mockProof);
        });

        test('generates credit score proof successfully', async () => {
            const mockProof = {
                success: true,
                proof: { type: 'creditScore', value: 650 }
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockProof
            });

            const result = await bank_api.generateProof('user123', 'creditScore', 650);

            expect(fetch).toHaveBeenCalledWith('/bank/proofs/generateProof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'user123',
                    type: 'creditScore',
                    targetValue: 650
                })
            });
            expect(result).toEqual(mockProof);
        });

        test('throws error when fetch fails with status text', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Request',
                error: 'Invalid parameters'
            });

            await expect(bank_api.generateProof('user123', 'income', 50000))
                .rejects.toThrow('Error: Bad Request, Message: Invalid parameters');
        });

        test('throws error when fetch fails without error property', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error'
            });

            await expect(bank_api.generateProof('user123', 'income', 50000))
                .rejects.toThrow('Error: Internal Server Error, Message: undefined');
        });

        test('throws error when network error occurs', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(bank_api.generateProof('user123', 'income', 50000))
                .rejects.toThrow('Network error');
        });

        test('handles different proof types', async () => {
            const mockProof = { success: true, proof: {} };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockProof
            });

            await bank_api.generateProof('user123', 'income', 50000);
            expect(fetch).toHaveBeenCalledWith('/bank/proofs/generateProof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'user123',
                    type: 'income',
                    targetValue: 50000
                })
            });

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockProof
            });

            await bank_api.generateProof('user123', 'creditScore', 650);
            expect(fetch).toHaveBeenCalledWith('/bank/proofs/generateProof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'user123',
                    type: 'creditScore',
                    targetValue: 650
                })
            });
        });

        test('handles different target values', async () => {
            const mockProof = { success: true, proof: {} };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockProof
            });

            await bank_api.generateProof('user123', 'income', 75000);

            expect(fetch).toHaveBeenCalledWith('/bank/proofs/generateProof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'user123',
                    type: 'income',
                    targetValue: 75000
                })
            });
        });
    });
}); 