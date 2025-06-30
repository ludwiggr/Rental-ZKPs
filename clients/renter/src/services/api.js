const API_BASE_URL = '/api';

export const api = {
    async getListings(token) {
        const res = await fetch(`${API_BASE_URL}/listings?mine=false`, {
            method: 'GET',
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

    async applyToListing(listingId, token) {
        console.log(listingId);
        try {

            const response = await fetch(`${API_BASE_URL}/listings/${listingId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
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