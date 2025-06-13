import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4004;
// Mock database of property records
const propertyRecords = new Map();
// Initialize Heimdall
const heimdall = new Heimdall();
// Create property ownership verification circuit
const propertyCircuit = await Heimdall.createCircuit('property');
// Endpoint to verify and issue property ownership proof
app.post('/api/verify-property', async (req, res) => {
    try {
        const { propertyAddress, city, propertyType, governmentId } = req.body;
        // Store property record (in real app, this would be in a database)
        propertyRecords.set(governmentId, {
            address: propertyAddress,
            city,
            propertyType
        });
        // Generate verification ID
        const verificationId = `GOV-${Date.now()}`;
        // Generate proof
        const { proof, publicInputs } = await propertyCircuit.prove({
            privateInputs: {
                propertyAddress
            },
            publicInputs: {
                city,
                propertyType,
                governmentVerificationId: verificationId
            }
        });
        const response = {
            success: true,
            message: 'Property proof verified successfully',
            data: {
                verificationId,
                timestamp: new Date().toISOString(),
                signature: 'signature',
                proof,
                publicInputs
            }
        };
        res.json(response);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to verify property ownership'
        });
    }
});
// Endpoint to verify a property ownership proof
app.post('/api/verify-proof', async (req, res) => {
    try {
        const { proof, publicInputs } = req.body;
        const isValid = await propertyCircuit.verify(proof, publicInputs);
        res.json({
            success: true,
            isValid,
            message: isValid ? 'Proof is valid' : 'Proof is invalid'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to verify proof'
        });
    }
});
app.listen(PORT, () => {
    console.log(`Government API server running on port ${PORT}`);
});
