const Listing = require('../models/Listing');
const Application = require('../models/Application');
const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/config');

// Verify application proofs
const path = require("path");
const fs = require("fs").promises;


// Update application status
router.post("/updateStatus", async (req, res) => {
    console.log("POST request received", req.body);

    let userId;
    try {
        userId = check_authorization(req) // ToDO Refactor
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }

    try {
        const {applicationId, status} = req.body;

        if (!applicationId || !status) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({error: 'Application not found'});
        }

        application.status = status;
        await application.save();

        res.json({
            success: true,
            message: 'Application status updated successfully',
            application
        });

    } catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}`});
    }
});


// Verify application
router.post("/verify", async (req, res) => {
    console.log("POST request received", req.body);

    let userId;
    try {
        userId = check_authorization(req) // ToDO Refactor
    } catch (err) {
        return res.status(401).json({message: 'Authorization failed'});
    }

    try {
        const {applicationId, listingId} = req.body;

        if (!applicationId || !listingId) {
            return res.status(400).json({error: 'Missing required fields'});
        }

        const application = Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({error: 'Application not found'});
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({error: 'Listing not found'});
        }

        let verificationResult = true;
        if (listing.incomeRequirement !== undefined && application.incomeProof!== undefined ) {
            const incomeProof = application.incomeProof;
            if (!incomeProof || !incomeProof.proof) {
                return res.status(400).json({error: 'Income proof is missing'});
            }
            proof = incomeProof.proof;
            verificationResult = await verifyProof(proof);
        }
        if (listing.creditScoreRequirement !== undefined  && application.creditScoreProof !== undefined ) {
            const creditScoreProof = application.creditScoreProof;
            if (!creditScoreProof || !creditScoreProof.proof) {
                return res.status(400).json({error: 'Credit score proof is missing'});
            }
            proof = creditScoreProof.proof;
            verificationResult = await verifyProof(proof);
        }

        res.json({
            success: true,
            verified: verificationResult
        });

    } catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}`});
    }


});

async function verifyProof(proof) {
    const workDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(workDir, {recursive: true});

    const heimdallPath = path.join(process.cwd(), '..', '..', 'heimdall', 'heimdalljs', 'cli');

    // Save proof to file
    const proofPath = path.join(workDir, 'proof_to_verify.json');
    await fs.writeFile(proofPath, JSON.stringify(proof));

    // Verify the proof
    const result = await execAsync(`node ${path.join(heimdallPath, 'heimdalljs-verify.js')} ${proofPath}`, {
        cwd: workDir
    });

    const verificationResult = result.stdout.includes('Verification successful');
    return verificationResult;
}

function check_authorization(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Missing token');

    const token = authHeader.split(' ')[1];


    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
}

module.exports = router;