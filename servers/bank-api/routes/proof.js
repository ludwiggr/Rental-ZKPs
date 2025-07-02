const express = require('express');
const router = express.Router();

const path = require("path");
const fs = require("fs").promises;

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const User = require('../models/User');
const HEIMDALLJS_PATH = path.join('..', 'heimdall', 'heimdalljs', 'cli');



const TEMP_DIR = path.join(process.cwd(), 'temp');

router.post('/generateProof', async (req, res) => {
    console.log("POST request received", req.body);
    console.log(HEIMDALLJS_PATH);
    try {
        const { userId, type, targetValue } = req.body;

        if (!userId || !type || !targetValue) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });

        }

        const user = await User.findOne({id: userId});

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (type !== 'income' && type !== 'creditScore') {
            return res.status(400).json({ success: false, error: 'Invalid type, must be income or creditScore' });
        }

        if (type === 'creditScore') {
            if (user.creditScore < targetValue) {
                return res.status(400).json({ success: false, error: 'Credit score is below the target value' });
            }
        } else if (type === 'income') {
            if (user.income < targetValue) {
                return res.status(400).json({ success: false, error: 'Income is below the target value' });
            }
        }

        const workDir = path.join(__dirname, '..', 'temp');
        await fs.mkdir(workDir, { recursive: true });

        const requestTimestamp = Date.now();

        const attrPath = path.join(workDir, 'bank_attr_issuer.json');
        const attributes = [
            targetValue,
            '12345',
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
            // const bankPK = await fs.readFile(path.join(workDir, 'bank_issuer_pk.json'), 'utf-8');
            // const bankJson = JSON.parse(proofJson);
            res.json({
                success: true,
                proof: proofJson,
                // bankPK: JSON.stringify(bankJson)
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


module.exports = router;