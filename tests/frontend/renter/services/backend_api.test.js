import { backend_api } from '../../../../clients/renter/src/services/backend_api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

describe('Renter Backend API Service', () => {
    beforeEach(() => {
        fetch.mockClear();
        alert.mockClear();
    });

    describe('getListings', () => {
        test('fetches listings successfully', async () => {
            const mockListings = [
                { id: '1', name: 'Test Listing' }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ listings: mockListings })
            });

            const result = await backend_api.getListings('test-token');

            expect(fetch).toHaveBeenCalledWith('/api/listings?mine=false', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test-token',
                },
            });
            expect(result).toEqual({ listings: mockListings });
        });

        test('throws error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(backend_api.getListings('test-token')).rejects.toThrow('Failed to fetch listings');
        });

        test('throws error when network error occurs', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(backend_api.getListings('test-token')).rejects.toThrow('Network error');
        });
    });

    describe('getListingById', () => {
        test('fetches single listing successfully', async () => {
            const mockListing = { id: '1', name: 'Test Listing' };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ listing: mockListing })
            });

            const result = await backend_api.getListingById('1', 'test-token');

            expect(fetch).toHaveBeenCalledWith('/api/listings/1', {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer test-token',
                },
            });
            expect(result).toEqual(mockListing);
        });

        test('throws error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            await expect(backend_api.getListingById('1', 'test-token')).rejects.toThrow('Failed to fetch listing');
        });
    });

    describe('applyToListing', () => {
        test('applies to listing successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Successfully applied' })
            });

            await backend_api.applyToListing('1', 'test-token', { incomeProof: {}, creditScoreProof: {} });

            expect(fetch).toHaveBeenCalledWith('/api/listings/1/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token',
                },
                body: JSON.stringify({ incomeProof: {}, creditScoreProof: {} }),
            });
            expect(alert).toHaveBeenCalledWith('Successfully applied to the listing');
        });

        test('applies to listing with default empty proofs', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Successfully applied' })
            });

            await backend_api.applyToListing('1', 'test-token');

            expect(fetch).toHaveBeenCalledWith('/api/listings/1/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token',
                },
                body: JSON.stringify({}),
            });
        });

        test('handles error response', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Already applied' })
            });

            await backend_api.applyToListing('1', 'test-token');

            expect(alert).toHaveBeenCalledWith('Already applied');
        });

        test('handles network error', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await backend_api.applyToListing('1', 'test-token');

            expect(alert).toHaveBeenCalledWith('Network error');
        });

        test('handles response without message', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({})
            });

            await backend_api.applyToListing('1', 'test-token');

            expect(alert).toHaveBeenCalledWith('Something went wrong');
        });
    });
}); 