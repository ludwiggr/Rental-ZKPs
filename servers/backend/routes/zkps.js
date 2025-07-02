
// Verify application proofs
import path from "path";
import fs from "fs/promises";

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
        const employerIssuerPkPath = path.join(process.cwd(), '..', 'employer-backend_api', 'temp', 'employer_issuer_pk.json');
        const bankIssuerPkPath = path.join(process.cwd(), '..', 'bank-backend_api', 'temp', 'bank_issuer_pk.json');
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

        // Verify proofs based on listing requirements
        const incomeRequirement = listing.proofRequirements.find(req => req.type === 'income');
        const creditRequirement = listing.proofRequirements.find(req => req.type === 'creditScore');

        let incomeResult = null;
        let creditResult = null;

        // Verify income proof if required
        if (incomeRequirement && application.incomeProof) {
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
        }

        // Verify credit score proof if required
        if (creditRequirement && application.creditScoreProof) {
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
        }

        // Determine overall verification result
        let verificationResult = true;
        const details: any = {};

        if (incomeRequirement) {
            if (!application.incomeProof) {
                verificationResult = false;
                details.incomeVerification = false;
                details.incomeError = 'Income proof is required but not provided';
            } else {
                details.incomeVerification = incomeResult?.stdout.includes('true') || false;
                if (!details.incomeVerification) {
                    verificationResult = false;
                }
            }
        }

        if (creditRequirement) {
            if (!application.creditScoreProof) {
                verificationResult = false;
                details.creditVerification = false;
                details.creditError = 'Credit score proof is required but not provided';
            } else {
                details.creditVerification = creditResult?.stdout.includes('true') || false;
                if (!details.creditVerification) {
                    verificationResult = false;
                }
            }
        }

        application.verificationResult = verificationResult;

        res.json({
            success: true,
            verified: verificationResult,
            details
        });
    } catch (error) {
        console.error('Error verifying application:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify application'
        });
    }
});