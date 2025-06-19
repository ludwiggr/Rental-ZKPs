import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HEIMDALLJS_PATH = path.join(__dirname, '..', '..', '..', 'heimdall', 'heimdalljs', 'cli');
const TEMP_DIR = path.join(process.cwd(), 'temp');
dotenv.config();
const app = express();
const port = process.env.PORT || 3002;
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
const VALID_BANK_ID = '12345';
const MIN_CREDIT_SCORE = 300;
const MAX_CREDIT_SCORE = 850;
app.post('/request-credit-check', async (req, res) => {
    try {
        const { creditScore, bankId, timestamp } = req.body;
        // Validate bank ID
        if (bankId !== VALID_BANK_ID) {
            return res.status(400).json({
                success: false,
                error: 'Invalid bank ID'
            });
        }
        // Validate credit score
        const creditScoreValue = parseInt(creditScore);
        if (isNaN(creditScoreValue)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credit score value'
            });
        }
        if (creditScoreValue < MIN_CREDIT_SCORE || creditScoreValue > MAX_CREDIT_SCORE) {
            return res.status(400).json({
                success: false,
                error: 'Credit score out of valid range (300-850)'
            });
        }
        // Create working directory for files
        const workDir = path.join(__dirname, '..', 'temp');
        await fs.mkdir(workDir, { recursive: true });
        // Generate unique timestamp for this request
        const requestTimestamp = Date.now();
        // Create attributes file for ZKP (padded to 8 elements for total of 16 attributes)
        const attrPath = path.join(workDir, 'bank_attr_issuer.json');
        const attributes = [
            creditScoreValue.toString(), // 0: credit score value
            bankId, // 1: bank ID
            "John", // 2: first name
            "Doe", // 3: last name
            "Good Standing", // 4: account status
            "Verified", // 5: verification status
            "", // 6: empty (padding)
            "" // 7: empty (padding)
        ];
        await fs.writeFile(attrPath, JSON.stringify(attributes));
        try {
            // Generate issuer key
            const issuerKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} bank_issuer`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'bank_issuer_sk.txt'), issuerKeyOutput.stdout);
            // Generate issuer public key (using temp file)
            const issuerSkPath = path.join(workDir, 'temp_issuer_sk.txt');
            await fs.writeFile(issuerSkPath, issuerKeyOutput.stdout);
            const issuerPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < temp_issuer_sk.txt`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'bank_issuer_pk.json'), issuerPubKeyOutput.stdout);
            await fs.unlink(issuerSkPath); // Clean up temp file
            // Generate holder key
            const holderKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} bank_holder`, { cwd: workDir });
            const holderSkPath = path.join(workDir, 'temp_holder_sk.txt');
            await fs.writeFile(holderSkPath, holderKeyOutput.stdout);
            await fs.writeFile(path.join(workDir, 'bank_holder_sk.txt'), holderKeyOutput.stdout);
            // Generate holder public key (using temp file)
            const holderPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < temp_holder_sk.txt`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'bank_holder_pk.json'), holderPubKeyOutput.stdout);
            await fs.unlink(holderSkPath); // Clean up temp file
            // Create credential
            const credentialFileName = 'bank_cred_holder.json';
            await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-cred-new.js')} \
        --attributes bank_attr_issuer.json \
        --id 67890 \
        --publicKey bank_holder_pk.json \
        --expiration 365 \
        --type CreditScore \
        --delegatable 0 \
        --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
        --secretKey bank_issuer_sk.txt \
        --destination ${credentialFileName}`, { cwd: workDir });
            // Generate presentation
            const presentationFileName = 'bank_pres_attribute.json';
            await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-pres-attribute.js')} 8 \
        --expiration 100 \
        --challenge ${requestTimestamp} \
        --credential ${path.join(workDir, 'bank_cred_holder.json')} \
        --destination ${path.join(workDir, 'bank_pres_attribute.json')} \
        --secretKey ${path.join(workDir, 'bank_holder_sk.txt')} \
        --issuerPK ${path.join(workDir, 'bank_issuer_pk.json')}`, { cwd: workDir, maxBuffer: 1024 * 1024 * 32 });
            // Read the generated proof
            const proofPath = path.join(workDir, presentationFileName);
            await fs.access(proofPath);
            const proof = await fs.readFile(proofPath, 'utf-8');
            const proofJson = JSON.parse(proof);
            res.json({
                success: true,
                proof: proofJson
            });
        }
        catch (execError) {
            res.status(500).json({
                success: false,
                error: execError.message || 'Failed to generate credit score proof'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate credit score proof'
        });
    }
});
app.listen(port, () => {
    console.log(`Bank API server running at http://localhost:${port}`);
});
