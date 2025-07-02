const API_BASE_URL = '/api';

export const backend_api = {
    async getListings(token) {
        console.log(token);
        const res = await fetch(`${API_BASE_URL}/listings?mine=false`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch listings');
        }
        console.log(res);

        return await res.json();
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

    async applyToListing(listingId, token, proofs = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/listings/${listingId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(proofs),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            alert('Successfully applied to the listing');
        } catch (error) {
            console.error('Error applying:', error);
            alert(error.message);
        }
    },
}