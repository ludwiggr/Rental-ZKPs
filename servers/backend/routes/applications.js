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
        console.log(application);

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({error: 'Listing not found'});
        }
        console.log(listing);

        let verificationResult = true;
        if (listing.incomeRequirement !== undefined && application.incomeProof!== undefined ) {
            const incomeProof = application.incomeProof;
            console.log(incomeProof);
            if (!incomeProof || !incomeProof.proof) {
                return res.status(400).json({error: 'Income proof is missing'});
            }
            proof = incomeProof.proof;
            console.log('Proof to verify:', proof);
            verificationResult = await verifyProof(proof);
            console.log(verificationResult);
        }
        if (listing.creditScoreRequirement !== undefined  && application.creditScoreProof !== undefined ) {
            const creditScoreProof = application.creditScoreProof;
            console.log(creditScoreProof);
            if (!creditScoreProof || !creditScoreProof.proof) {
                return res.status(400).json({error: 'Credit score proof is missing'});
            }
            proof = creditScoreProof.proof;
            console.log('Proof to verify:', proof);
            verificationResult = await verifyProof(proof);
            console.log(verificationResult);
        }

        res.json({
            success: true,
            verified: verificationResult
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: `Server error: ${err.message}`});
    }


});

async function verifyProof(proof) {
    const workDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(workDir, {recursive: true});

    const heimdallPath = path.join(process.cwd(), '..', '..', 'heimdall', 'heimdalljs', 'cli');
    console.log('Verifying proof:', proof);

    // Save proof to file
    const proofPath = path.join(workDir, 'proof_to_verify.json');
    await fs.writeFile(proofPath, JSON.stringify(proof));

    // Verify the proof
    const result = await execAsync(`node ${path.join(heimdallPath, 'heimdalljs-verify.js')} ${proofPath}`, {
        cwd: workDir
    });

    const verificationResult = result.stdout.includes('Verification successful');
    console.log(verificationResult);
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