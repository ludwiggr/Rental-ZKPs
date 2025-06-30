const API_BASE_URL = '/api';

export const api = {
    async getListings(token) {
        const res = await fetch(`${API_BASE_URL}/listings?mine=true`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch listings');
        }
        const data = await res.json();
        console.log(data);
        return data;
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