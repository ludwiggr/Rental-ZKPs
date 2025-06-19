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

// Configure middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());

// Store received proofs and listings
const receivedProofs = [];
let listings = [];
const DATA_FILE = path_1.default.join(process.cwd(), 'data', 'listings.json');

// Load data from file
async function loadData() {
    try {
        const data = await promises_1.default.readFile(DATA_FILE, 'utf-8');
        listings = JSON.parse(data);
        console.log('Loaded listings data:', listings);
    }
    catch (error) {
        console.log('No existing data found, starting with empty listings');
        listings = [
            {
                id: '1',
                name: 'Modern City Apartment',
                address: '123 Urban Street, City Center',
                size: 75,
                price: 1200,
                type: 'apartment',
                applications: []
            },
            {
                id: '2',
                name: 'Cozy Suburban House',
                address: '456 Quiet Lane, Suburbs',
                size: 120,
                price: 1800,
                type: 'house',
                applications: []
            }
        ];
        await saveData();
    }
}

// Save data to file
async function saveData() {
    try {
        await promises_1.default.writeFile(DATA_FILE, JSON.stringify(listings, null, 2));
        console.log('Saved listings data');
    }
    catch (error) {
        console.error('Error saving data:', error);
    }
}

// Initialize data
loadData();

// Get all listings
app.get('/listings', (req, res) => {
    res.json({
        success: true,
        listings
    });
});

// Get a specific listing
app.get('/listings/:id', (req, res) => {
    const listing = listings.find(l => l.id === req.params.id);
    if (!listing) {
        return res.status(404).json({
            success: false,
            error: 'Listing not found'
        });
    }
    res.json({
        success: true,
        listing
    });
});

// Get applications for a specific listing
app.get('/listings/:id/applications', (req, res) => {
    const listing = listings.find(l => l.id === req.params.id);
    if (!listing) {
        return res.status(404).json({
            success: false,
            error: 'Listing not found'
        });
    }
    res.json({
        success: true,
        applications: listing.applications
    });
});

// Submit application for a listing
app.post('/listings/:id/apply', async (req, res) => {
    try {
        const listing = listings.find(l => l.id === req.params.id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }
        const { incomeProof, creditScoreProof } = req.body;
        if (!incomeProof || !creditScoreProof) {
            return res.status(400).json({
                success: false,
                error: 'Both income and credit score proofs are required'
            });
        }
        const application = {
            id: `${listing.id}-${listing.applications.length + 1}`,
            timestamp: new Date().toISOString(),
            status: 'pending',
            incomeProof,
            creditScoreProof,
            verificationResult: undefined
        };
        listing.applications.push(application);
        await saveData();
        res.status(201).json({
            success: true,
            application
        });
    }
    catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit application'
        });
    }
});

// Verify application proofs
app.post('/listings/:listingId/applications/:applicationId/verify', async (req, res) => {
    try {
        const listing = listings.find(l => l.id === req.params.listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }
        const application = listing.applications.find(a => a.id === req.params.applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        // Create working directory for verification
        const workDir = path_1.default.join(process.cwd(), 'temp');
        await promises_1.default.mkdir(workDir, { recursive: true });
        // Get paths to issuer public keys
        const employerIssuerPkPath = path_1.default.join(process.cwd(), '..', 'employer-api', 'temp', 'employer_issuer_pk.json');
        const bankIssuerPkPath = path_1.default.join(process.cwd(), '..', 'bank-api', 'temp', 'bank_issuer_pk.json');
        // Check if issuer public keys exist
        try {
            await promises_1.default.access(employerIssuerPkPath);
            await promises_1.default.access(bankIssuerPkPath);
        }
        catch (error) {
            console.error('Error accessing issuer public keys:', error);
            return res.status(500).json({
                success: false,
                error: 'Issuer public keys not found. Please ensure both employer and bank services have generated their keys.'
            });
        }
        // Copy issuer public keys to working directory
        try {
            const employerIssuerPk = await promises_1.default.readFile(employerIssuerPkPath, 'utf-8');
            const bankIssuerPk = await promises_1.default.readFile(bankIssuerPkPath, 'utf-8');
            await promises_1.default.writeFile(path_1.default.join(workDir, 'employer_issuer_pk.json'), employerIssuerPk);
            await promises_1.default.writeFile(path_1.default.join(workDir, 'bank_issuer_pk.json'), bankIssuerPk);
        }
        catch (error) {
            console.error('Error copying issuer public keys:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to copy issuer public keys'
            });
        }
        // Verify income proof
        let incomeResult;
        try {
            const incomeProofPath = path_1.default.join(workDir, 'income_proof.json');
            await promises_1.default.writeFile(incomeProofPath, JSON.stringify(application.incomeProof));
            incomeResult = await execAsync(`heimdalljs pres attribute verify --presentation ${incomeProofPath} --issuerPK employer_issuer_pk.json`, {
                cwd: workDir
            });
            console.log('Income proof verification result:', incomeResult.stdout);
        }
        catch (error) {
            console.error('Error verifying income proof:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to verify income proof'
            });
        }
        // Verify credit score proof
        let creditResult;
        try {
            const creditProofPath = path_1.default.join(workDir, 'credit_proof.json');
            await promises_1.default.writeFile(creditProofPath, JSON.stringify(application.creditScoreProof));
            creditResult = await execAsync(`heimdalljs pres attribute verify --presentation ${creditProofPath} --issuerPK bank_issuer_pk.json`, {
                cwd: workDir
            });
            console.log('Credit score proof verification result:', creditResult.stdout);
        }
        catch (error) {
            console.error('Error verifying credit score proof:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to verify credit score proof'
            });
        }
        const verificationResult = incomeResult.stdout.includes('Verification successful') &&
            creditResult.stdout.includes('Verification successful');
        application.verificationResult = verificationResult;
        await saveData(); // Save the verification result
        res.json({
            success: true,
            verified: verificationResult,
            details: {
                incomeVerification: incomeResult.stdout.includes('Verification successful'),
                creditVerification: creditResult.stdout.includes('Verification successful')
            }
        });
    }
    catch (error) {
        console.error('Error verifying application:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify application'
        });
    }
});

// Update application status
app.patch('/listings/:listingId/applications/:applicationId', (req, res) => {
    const listing = listings.find(l => l.id === req.params.listingId);
    if (!listing) {
        return res.status(404).json({
            success: false,
            error: 'Listing not found'
        });
    }
    const application = listing.applications.find(a => a.id === req.params.applicationId);
    if (!application) {
        return res.status(404).json({
            success: false,
            error: 'Application not found'
        });
    }
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status'
        });
    }
    application.status = status;
    saveData();
    res.json({
        success: true,
        application
    });
});

// Delete a listing
app.delete('/listings/:id', (req, res) => {
    const listingIndex = listings.findIndex(l => l.id === req.params.id);
    if (listingIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Listing not found'
        });
    }
    listings.splice(listingIndex, 1);
    saveData();
    res.json({
        success: true,
        message: 'Listing deleted successfully'
    });
});

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Get current port
app.get('/port', (req, res) => {
    // The port will be set in the app.listen callback
    res.json({ port: app.get('port') });
});

// Start the server
app.listen(port, () => {
    console.log(`Landlord API server running at http://localhost:${port}`);
});
