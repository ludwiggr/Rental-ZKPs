"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs/promises');
const execAsync = promisify(exec);
const HEIMDALLJS_PATH = path.join(__dirname, '..', '..', '..', 'heimdall', 'heimdalljs', 'heimdall', 'cli');
dotenv.config();
const app = express();
const port = process.env.PORT || 3003;
// Configure CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
// Constants for verification
const VALID_EMPLOYER_ID = '42';
const MAX_INCOME = 3000;
// Generate income proof
app.post('/verify-income', async (req, res) => {
    try {
        console.log('Received income verification request:', req.body);
        const { income, employerId, timestamp } = req.body;
        // Validate employer ID
        if (employerId !== VALID_EMPLOYER_ID) {
            console.log('Invalid employer ID:', employerId);
            return res.status(400).json({
                success: false,
                error: 'Invalid employer ID'
            });
        }
        // Validate income
        const incomeValue = parseFloat(income);
        if (isNaN(incomeValue)) {
            console.log('Invalid income value:', income);
            return res.status(400).json({
                success: false,
                error: 'Invalid income value'
            });
        }
        if (incomeValue > MAX_INCOME) {
            console.log('Income exceeds maximum:', incomeValue);
            return res.status(400).json({
                success: false,
                error: 'Income exceeds maximum allowed amount'
            });
        }
        console.log('Generating ZKP for income:', incomeValue);
        // Create working directory for files
        const workDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(workDir, { recursive: true });
        console.log('Working directory:', workDir);
        // Generate unique timestamp for this request
        const requestTimestamp = Date.now();
        console.log('Using timestamp:', requestTimestamp);
        // Create attributes file for ZKP
        const attrPath = path.join(workDir, 'employer_attr_issuer.json');
        const attributes = [
            incomeValue.toString(), // 0 <-- income value
            "John", // 1
            "Jones", // 2
            "Income", // 3
            "2020-01-01", // 4
            "present", // 5
            "", // 6
            "", // 7
        ];
        console.log('Writing attributes:', attributes);
        await fs.writeFile(attrPath, JSON.stringify(attributes));
        try {
            // Generate keys
            console.log('Generating issuer key...');
            const issuerKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} employer_issuer`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'employer_issuer_sk.txt'), issuerKeyOutput.stdout);
            console.log('Issuer key generated');
            console.log('Generating issuer public key...');
            const issuerSkPath = path.join(workDir, 'temp_issuer_sk.txt');
            await fs.writeFile(issuerSkPath, issuerKeyOutput.stdout);
            const issuerPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < ${issuerSkPath}`, {
                cwd: workDir
            });
            await fs.writeFile(path.join(workDir, 'employer_issuer_pk.json'), issuerPubKeyOutput.stdout);
            await fs.unlink(issuerSkPath); // Clean up temp file
            console.log('Issuer public key generated');
            console.log('Generating holder key...');
            const holderKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} employer_holder`, { cwd: workDir });
            const holderSkPath = path.join(workDir, 'temp_holder_sk.txt');
            await fs.writeFile(holderSkPath, holderKeyOutput.stdout);
            await fs.writeFile(path.join(workDir, 'employer_holder_sk.txt'), holderKeyOutput.stdout);
            console.log('Holder key generated');
            console.log('Generating holder public key...');
            const holderPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < ${holderSkPath}`, {
                cwd: workDir
            });
            await fs.writeFile(path.join(workDir, 'employer_holder_pk.json'), holderPubKeyOutput.stdout);
            await fs.unlink(holderSkPath); // Clean up temp file
            console.log('Holder public key generated');
            // Create credential
            console.log('Creating credential...');
            const credentialFileName = `employer_cred_holder_${requestTimestamp}.json`;
            const credentialOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-cred-new.js')} \
        --attributes employer_attr_issuer.json \
        --id ${requestTimestamp} \
        --publicKey employer_holder_pk.json \
        --expiration 365 \
        --type Income \
        --delegatable 0 \
        --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
        --secretKey employer_issuer_sk.txt \
        --destination ${credentialFileName}`, { cwd: workDir });
            console.log('Credential created');
            // Generate presentation
            const presentationFileName = `employer_pres_attribute.json`;
            console.log('Generating presentation...');
            const presentationCmd = `node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-pres-attribute.js')} 0 \
        --expiration 100 \
        --challenge ${requestTimestamp} \
        --credential ${presentationFileName} \
        --destination ${presentationFileName}\`, { cwd: workDir });
        --secretKey employer_holder_sk.txt \
        --issuerPK employer_issuer_pk.json`;
            console.log('Running command:', presentationCmd);
            const presentationOutput = await execAsync(presentationCmd, {
                cwd: workDir,
                maxBuffer: 1024 * 1024 * 32 // Increase buffer size
            });
            console.log('Presentation command output:', presentationOutput.stdout);
            console.log('Presentation command error:', presentationOutput.stderr);
            console.log('Presentation generated');
            // List all files in temp directory before and after presentation generation
            console.log('Files in temp directory before presentation:');
            const filesBefore = await fs.readdir(workDir);
            console.log(filesBefore);
            // Wait a moment to ensure file is written
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Files in temp directory after presentation:');
            const filesAfter = await fs.readdir(workDir);
            console.log(filesAfter);
            // Read the generated proof
            console.log('Reading generated proof...');
            const proofPath = path.join(workDir, 'employer_pres_attribute.json');
            console.log('Proof path:', proofPath);
            console.log('Current working directory:', workDir);
            // Check if file exists
            try {
                await fs.access(proofPath);
                console.log('Proof file exists');
            }
            catch (err) {
                console.error('Proof file does not exist at path:', proofPath);
                console.error('Directory contents:', await fs.readdir(workDir));
                throw new Error('Proof file was not generated');
            }
            const proof = await fs.readFile(proofPath, 'utf-8');
            console.log('Proof content length:', proof.length);
            console.log('Proof generated successfully');
            // Clean up temporary files
            await fs.rm(workDir, { recursive: true, force: true });
            console.log('Cleaned up temporary files');
            const proofJson = JSON.parse(proof);
            console.log('Proof parsed successfully, keys:', Object.keys(proofJson));
            res.json({
                success: true,
                proof: proofJson
            });
        }
        catch (execError) {
            console.error('Error executing heimdalljs command:', execError);
            console.error('Command output:', execError.stdout);
            console.error('Command error:', execError.stderr);
            throw execError;
        }
    }
    catch (error) {
        console.error('Error generating income proof:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate income proof'
        });
    }
});
app.listen(port, () => {
    console.log(`Employer API server running at http://localhost:${port}`);
});
