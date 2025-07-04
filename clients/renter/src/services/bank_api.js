const BANK_API_BASE_URL = '/bank';

export const bank_api = {
    async generateProof(userId, type, targetValue) {
        const res = await fetch(`${BANK_API_BASE_URL}/proofs/generateProof`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId, type, targetValue})
        });


        if (!res.ok) {
            throw new Error(`Error: ${res.statusText}, Message: ${res.error}`);
        }

        return await res.json();
    }
}