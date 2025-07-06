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
        return data;
    },

    async getListingById(listingId, token) {
        const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            throw new Error('Failed to fetch listing');
        }
        const data = await res.json();
        return data.listing;
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

    async verifyApplication(applicationId, listingId, token) {

        const response = await fetch(`${API_BASE_URL}/applications/verify`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({applicationId, listingId})
        });
        if (!response.ok) {
            throw new Error('Failed to verify application');
        }
        return response.json();
    },

    async deleteListing(id, token) {
        const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete listing');
        }
        return response.json();
    },

    async setApplicationStatus(applicationId, status, token) {

        try {
            const response = await fetch(`${API_BASE_URL}/applications/updateStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ applicationId, status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
        } catch (error) {
            alert(error.message);
        }
    }
}; 