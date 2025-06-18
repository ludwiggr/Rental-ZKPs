"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const app = (0, express_1.default)();
const port = process.env.PORT || 3004;
// Configure CORS
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
// Store received proofs
const receivedProofs = [];
// Receive proof from renter
app.post('/receive-proof', async (req, res) => {
    try {
        console.log('Received proof from renter:', req.body);
        const { proof } = req.body;
        if (!proof) {
            return res.status(400).json({
                success: false,
                error: 'No proof provided'
            });
        }
        // Store the proof
        receivedProofs.push({
            proof,
            timestamp: new Date().toISOString(),
            verified: false
        });
        res.json({
            success: true,
            message: 'Proof received successfully'
        });
    }
    catch (error) {
        console.error('Error receiving proof:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to receive proof'
        });
    }
});
// Get all received proofs
app.get('/proofs', (req, res) => {
    res.json({
        success: true,
        proofs: receivedProofs
    });
});
// Verify a specific proof
app.post('/verify-proof/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (isNaN(index) || index < 0 || index >= receivedProofs.length) {
            return res.status(400).json({
                success: false,
                error: 'Invalid proof index'
            });
        }
        const proof = receivedProofs[index].proof;
        console.log('Verifying proof:', proof);
        // Create working directory for verification
        const workDir = path_1.default.join(process.cwd(), 'temp');
        await promises_1.default.mkdir(workDir, { recursive: true });
        // Save proof to file
        const proofPath = path_1.default.join(workDir, 'proof_to_verify.json');
        await promises_1.default.writeFile(proofPath, JSON.stringify(proof));
        // Verify the proof
        const result = await execAsync('heimdalljs pres verify proof_to_verify.json', {
            cwd: workDir
        });
        const verificationResult = result.stdout.includes('Verification successful');
        receivedProofs[index].verified = verificationResult;
        res.json({
            success: true,
            verified: verificationResult
        });
    }
    catch (error) {
        console.error('Error verifying proof:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify proof'
        });
    }
});
app.listen(port, () => {
    console.log(`Landlord API server running at http://localhost:${port}`);
});
