import { api } from '../../../../clients/landlord/src/services/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('Landlord API Service', () => {
    beforeEach(() => {
        fetch.mockClear();
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

            const result = await api.getListings('test-token');

            expect(fetch).toHaveBeenCalledWith('/api/listings?mine=true', {
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

            await expect(api.getListings('test-token')).rejects.toThrow('Failed to fetch listings');
        });

        test('throws error when network error occurs', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(api.getListings('test-token')).rejects.toThrow('Network error');
        });
    });

    describe('getListingById', () => {
        test('fetches single listing successfully', async () => {
            const mockListing = { id: '1', name: 'Test Listing' };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ listing: mockListing })
            });

            const result = await api.getListingById('1', 'test-token');

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

            await expect(api.getListingById('1', 'test-token')).rejects.toThrow('Failed to fetch listing');
        });
    });

    describe('createListing', () => {
        test('creates listing successfully', async () => {
            const listingData = {
                name: 'New Listing',
                address: '123 Test St',
                size: '100',
                price: 1500,
                type: 'apartment'
            };

            const mockResponse = { id: '1', ...listingData };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await api.createListing(listingData);

            expect(fetch).toHaveBeenCalledWith('/api/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listingData),
            });
            expect(result).toEqual(mockResponse);
        });

        test('throws error when creation fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            const listingData = { name: 'Test' };
            await expect(api.createListing(listingData)).rejects.toThrow('Failed to create listing');
        });
    });

    describe('verifyApplication', () => {
        test('verifies application successfully', async () => {
            const mockResponse = { success: true, verified: true };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await api.verifyApplication('app1', 'listing1', 'test-token');

            expect(fetch).toHaveBeenCalledWith('/api/applications/verify', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer test-token',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ applicationId: 'app1', listingId: 'listing1' })
            });
            expect(result).toEqual(mockResponse);
        });

        test('throws error when verification fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            await expect(api.verifyApplication('app1', 'listing1', 'test-token')).rejects.toThrow('Failed to verify application');
        });
    });

    describe('deleteListing', () => {
        test('deletes listing successfully', async () => {
            const mockResponse = { message: 'Listing deleted successfully' };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await api.deleteListing('1', 'test-token');

            expect(fetch).toHaveBeenCalledWith('/api/listings/1', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token',
                }
            });
            expect(result).toEqual(mockResponse);
        });

        test('throws error when deletion fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: 'Forbidden'
            });

            await expect(api.deleteListing('1', 'test-token')).rejects.toThrow('Failed to delete listing');
        });
    });

    describe('setApplicationStatus', () => {
        test('sets application status successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            await api.setApplicationStatus('app1', 'approved', 'test-token');

            expect(fetch).toHaveBeenCalledWith('/api/applications/updateStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer test-token',
                },
                body: JSON.stringify({ applicationId: 'app1', status: 'approved' }),
            });
        });

        test('handles error response', async () => {
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Application not found' })
            });

            await api.setApplicationStatus('app1', 'approved', 'test-token');

            expect(alertSpy).toHaveBeenCalledWith('Application not found');
            alertSpy.mockRestore();
        });

        test('handles network error', async () => {
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

            fetch.mockRejectedValueOnce(new Error('Network error'));

            await api.setApplicationStatus('app1', 'approved', 'test-token');

            expect(alertSpy).toHaveBeenCalledWith('Network error');
            alertSpy.mockRestore();
        });
    });
}); 