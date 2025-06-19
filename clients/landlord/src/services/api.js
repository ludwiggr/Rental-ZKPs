const API_BASE_URL = 'http://localhost:3004';

export const api = {
    async getListings() {
        const response = await fetch(`${API_BASE_URL}/listings`);
        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }
        return response.json();
    },

    async createListing(listingData) {
        const response = await fetch(`${API_BASE_URL}/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listingData),
        });
        if (!response.ok) {
            throw new Error('Failed to create listing');
        }
        return response.json();
    },

    async getListing(id) {
        const response = await fetch(`${API_BASE_URL}/listings/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch listing');
        }
        return response.json();
    },

    async getListingApplications(listingId) {
        const response = await fetch(`${API_BASE_URL}/listings/${listingId}/applications`);
        if (!response.ok) {
            throw new Error('Failed to fetch listing applications');
        }
        return response.json();
    },

    async verifyApplication(listingId, applicationId) {
        const response = await fetch(`${API_BASE_URL}/listings/${listingId}/applications/${applicationId}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Failed to verify application');
        }
        return response.json();
    },

    async updateApplicationStatus(listingId, applicationId, status) {
        const response = await fetch(`${API_BASE_URL}/listings/${listingId}/applications/${applicationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            throw new Error('Failed to update application status');
        }
        return response.json();
    },

    async deleteListing(id) {
        const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete listing');
        }
        return response.json();
    }
}; 