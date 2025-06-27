const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);
const HEIMDALLJS_PATH = path.join(__dirname, 'heimdall', 'heimdalljs', 'cli');
const TEMP_DIR = path.join(process.cwd(), 'temp');

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors({
    origin: '*',
    credentials: true
}));

const VALID_BANK_ID = '12345';
const MIN_CREDIT_SCORE = 300;
const MAX_CREDIT_SCORE = 850;

app.post('/request-credit-check', async (req, res) => {
    try {
        const { creditScore, bankId, timestamp } = req.body;

        if (bankId !== VALID_BANK_ID) {
            return res.status(400).json({
                success: false,
                error: 'Invalid bank ID'
            });
        }

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

        const workDir = path.join(__dirname, '..', 'temp');
        await fs.mkdir(workDir, { recursive: true });

        const requestTimestamp = Date.now();

        const attrPath = path.join(workDir, 'bank_attr_issuer.json');
        const attributes = [
            creditScoreValue.toString(),
            bankId,
            "John",
            "Doe",
            "Good Standing",
            "Verified",
            "",
            ""
        ];
        await fs.writeFile(attrPath, JSON.stringify(attributes));

        try {
            const issuerKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} bank_issuer`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'bank_issuer_sk.txt'), issuerKeyOutput.stdout);

            const issuerSkPath = path.join(workDir, 'temp_issuer_sk.txt');
            await fs.writeFile(issuerSkPath, issuerKeyOutput.stdout);
            const issuerPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < temp_issuer_sk.txt`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'bank_issuer_pk.json'), issuerPubKeyOutput.stdout);
            await fs.unlink(issuerSkPath);

            const holderKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} bank_holder`, { cwd: workDir });
            const holderSkPath = path.join(workDir, 'temp_holder_sk.txt');
            await fs.writeFile(holderSkPath, holderKeyOutput.stdout);
            await fs.writeFile(path.join(workDir, 'bank_holder_sk.txt'), holderKeyOutput.stdout);

            const holderPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < temp_holder_sk.txt`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'bank_holder_pk.json'), holderPubKeyOutput.stdout);
            await fs.unlink(holderSkPath);

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

            const presentationFileName = 'bank_pres_attribute.json';
            await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-pres-attribute.js')} 8 \
        --expiration 100 \
        --challenge ${requestTimestamp} \
        --credential ${path.join(workDir, 'bank_cred_holder.json')} \
        --destination ${path.join(workDir, 'bank_pres_attribute.json')} \
        --secretKey ${path.join(workDir, 'bank_holder_sk.txt')} \
        --issuerPK ${path.join(workDir, 'bank_issuer_pk.json')}`, { cwd: workDir, maxBuffer: 1024 * 1024 * 32 });

            const proofPath = path.join(workDir, presentationFileName);
            await fs.access(proofPath);
            const proof = await fs.readFile(proofPath, 'utf-8');
            const proofJson = JSON.parse(proof);
            res.json({
                success: true,
                proof: proofJson
            });
        } catch (execError) {
            res.status(500).json({
                success: false,
                error: execError.message || 'Failed to generate credit score proof'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate credit score proof'
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Bank API server running at http://localhost:${port}`);
});