import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

interface Application {
  id: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  incomeProof: any;
  creditScoreProof: any;
  verificationResult?: boolean;
}

interface Listing {
  id: string;
  name: string;
  address: string;
  size: number;
  price: number;
  type: string;
  applications: Application[];
}

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3004;

// Configure CORS - more permissive during development
app.use(cors());

app.use(express.json());

// Store received proofs and listings
const receivedProofs: any[] = [];
const listings: Listing[] = [
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

    const application: Application = {
      id: `${listing.id}-${listing.applications.length + 1}`,
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
      incomeProof,
      creditScoreProof,
      verificationResult: undefined
    };

    listing.applications.push(application);

    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
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
    const workDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(workDir, { recursive: true });

    // Get paths to issuer public keys
    const employerIssuerPkPath = path.join(process.cwd(), '..', 'employer-api', 'temp', 'employer_issuer_pk.json');
    const bankIssuerPkPath = path.join(process.cwd(), '..', 'bank-api', 'temp', 'bank_issuer_pk.json');
    const heimdallPath = path.join(process.cwd(), '..', '..', 'heimdall', 'heimdalljs', 'cli');

    // Check if issuer public keys exist
    try {
      await fs.access(employerIssuerPkPath);
      await fs.access(bankIssuerPkPath);
    } catch (error) {
      console.error('Error accessing issuer public keys:', error);
      return res.status(500).json({
        success: false,
        error: 'Issuer public keys not found. Please ensure both employer and bank services have generated their keys.'
      });
    }

    // Copy issuer public keys to working directory
    try {
      const employerIssuerPk = await fs.readFile(employerIssuerPkPath, 'utf-8');
      const bankIssuerPk = await fs.readFile(bankIssuerPkPath, 'utf-8');

      await fs.writeFile(path.join(workDir, 'employer_issuer_pk.json'), employerIssuerPk);
      await fs.writeFile(path.join(workDir, 'bank_issuer_pk.json'), bankIssuerPk);
    } catch (error) {
      console.error('Error copying issuer public keys:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to copy issuer public keys'
      });
    }

    // Verify income proof
    let incomeResult;
    try {
      const incomeProofPath = path.join(workDir, 'income_proof.json');
      await fs.writeFile(incomeProofPath, JSON.stringify(application.incomeProof));

      incomeResult = await execAsync(`node ${path.join(heimdallPath, 'heimdalljs-verify.js')} ${incomeProofPath}`, {
        cwd: workDir
      });
      console.log('Income proof verification result:', incomeResult.stdout);
    } catch (error) {
      console.error('Error verifying income proof:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify income proof'
      });
    }

    // Verify credit score proof
    let creditResult;
    try {
      const creditProofPath = path.join(workDir, 'credit_proof.json');
      await fs.writeFile(creditProofPath, JSON.stringify(application.creditScoreProof));

      creditResult = await execAsync(`node ${path.join(heimdallPath, 'heimdalljs-verify.js')} ${creditProofPath}`, {
        cwd: workDir
      });
      console.log('Credit score proof verification result:', creditResult.stdout);
    } catch (error) {
      console.error('Error verifying credit score proof:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify credit score proof'
      });
    }

    const verificationResult =
      incomeResult.stdout.includes('true') &&
      creditResult.stdout.includes('true');

    application.verificationResult = verificationResult;

    res.json({
      success: true,
      verified: verificationResult,
      details: {
        incomeVerification: incomeResult.stdout.includes('true'),
        creditVerification: creditResult.stdout.includes('true')
      }
    });
  } catch (error) {
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
  } catch (error) {
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

    const workDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(workDir, { recursive: true });

    const heimdallPath = path.join(process.cwd(), '..', '..', 'heimdall', 'heimdalljs', 'cli');
    const proof = receivedProofs[index].proof;
    console.log('Verifying proof:', proof);

    // Save proof to file
    const proofPath = path.join(workDir, 'proof_to_verify.json');
    await fs.writeFile(proofPath, JSON.stringify(proof));

    // Verify the proof
    const result = await execAsync(`node ${path.join(heimdallPath, 'heimdalljs-verify.js')} ${proofPath}`, {
      cwd: workDir
    });

    const verificationResult = result.stdout.includes('Verification successful');
    receivedProofs[index].verified = verificationResult;

    res.json({
      success: true,
      verified: verificationResult
    });
  } catch (error) {
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