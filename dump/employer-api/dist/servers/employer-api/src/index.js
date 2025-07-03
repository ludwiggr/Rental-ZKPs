import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4003;
// Mock database of income records
const incomeRecords = new Map();
// Initialize Heimdall
const heimdall = new Heimdall();
// Create income verification circuit
const incomeCircuit = await Heimdall.createCircuit('income');
// Endpoint to verify and issue income proof
app.post('/api/verify-income', async (req, res) => {
    try {
        const { employerId, monthlyIncome, currency } = req.body;
        // Store income record (in real app, this would be in a database)
        incomeRecords.set(employerId, monthlyIncome);
        // Generate verification ID
        const verificationId = `EMP-${Date.now()}`;
        // Generate proof
        const { proof, publicInputs } = await incomeCircuit.prove({
            privateInputs: {
                monthlyIncome: parseInt(monthlyIncome)
            },
            publicInputs: {
                employerId,
                verificationId,
                currency
            }
        });
        const response = {
            success: true,
            message: 'Income proof verified successfully',
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
            error: 'Failed to verify income'
        });
    }
});
// Endpoint to verify an income proof
app.post('/api/verify-proof', async (req, res) => {
    try {
        const { proof, publicInputs } = req.body;
        const isValid = await incomeCircuit.verify(proof, publicInputs);
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
    console.log(`Employer API server running on port ${PORT}`);
});
