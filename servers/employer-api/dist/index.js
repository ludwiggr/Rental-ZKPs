"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs'); // Add sync version of fs
const execAsync = promisify(exec);
const HEIMDALLJS_PATH = path.join(__dirname, '..', '..', '..', 'heimdall', 'heimdalljs', 'heimdall', 'cli');
const TEMP_DIR = path.join(process.cwd(), 'temp');
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
// Constants for file names
const FILES = {
    ISSUER_SK: 'issuer_sk.txt',
    ISSUER_PK: 'issuer_pk.json',
    HOLDER_SK: 'holder_sk.txt',
    HOLDER_PK: 'holder_pk.json',
    CREDENTIAL: 'cred_holder.json',
    ATTRIBUTES: 'attr_issuer.json',
    PRESENTATION: 'employer_pres_attribute.json'
};
// Helper function to get absolute path for a file
const getFilePath = (filename) => path.join(TEMP_DIR, FILES[filename]);
// Helper function to execute heimdalljs commands
async function executeHeimdallCommand(command, args) {
    const fullCommand = `node ${path.join(HEIMDALLJS_PATH, command)} ${args.join(' ')}`;
    console.log('Executing command:', fullCommand);
    const { stdout, stderr } = await execAsync(fullCommand, { cwd: TEMP_DIR });
    if (stderr) {
        console.error('Command stderr:', stderr);
    }
    return stdout.trim();
}
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
        const workDir = path.join(__dirname, '..', 'temp');
        await fs.mkdir(workDir, { recursive: true });
        console.log('Working directory:', workDir);
        // Generate unique timestamp for this request
        const requestTimestamp = Date.now();
        console.log('Using timestamp:', requestTimestamp);
        // Create attributes file for ZKP (padded to 8 elements for total of 16 attributes)
        const attrPath = path.join(workDir, 'employer_attr_issuer.json');
        const attributes = [
            incomeValue.toString(), // 0: income value
            "John", // 1: first name
            "Jones", // 2: last name
            "No Debt", // 3: status
            "Rich", // 4: status2
            "", // 5: empty (padding)
            "", // 6: empty (padding)
            "" // 7: empty (padding)
        ];
        console.log('Writing attributes:', attributes);
        await fs.writeFile(attrPath, JSON.stringify(attributes));
        try {
            // Generate issuer key
            console.log('Generating issuer key...');
            const issuerKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} employer_issuer`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'employer_issuer_sk.txt'), issuerKeyOutput.stdout);
            console.log('Issuer key generated');
            // Generate issuer public key (using temp file)
            const issuerSkPath = path.join(workDir, 'temp_issuer_sk.txt');
            await fs.writeFile(issuerSkPath, issuerKeyOutput.stdout);
            const issuerPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < temp_issuer_sk.txt`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'employer_issuer_pk.json'), issuerPubKeyOutput.stdout);
            await fs.unlink(issuerSkPath); // Clean up temp file
            console.log('Issuer public key generated');
            // Generate holder key
            console.log('Generating holder key...');
            const holderKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-new.js')} employer_holder`, { cwd: workDir });
            const holderSkPath = path.join(workDir, 'temp_holder_sk.txt');
            await fs.writeFile(holderSkPath, holderKeyOutput.stdout);
            await fs.writeFile(path.join(workDir, 'employer_holder_sk.txt'), holderKeyOutput.stdout);
            console.log('Holder key generated');
            // Generate holder public key (using temp file)
            const holderPubKeyOutput = await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-key-pub.js')} < temp_holder_sk.txt`, { cwd: workDir });
            await fs.writeFile(path.join(workDir, 'employer_holder_pk.json'), holderPubKeyOutput.stdout);
            await fs.unlink(holderSkPath); // Clean up temp file
            console.log('Holder public key generated');
            // Create credential with smaller ID to fit in revocation tree
            console.log('Creating credential...');
            const credentialFileName = 'employer_cred_holder.json';
            await execAsync(`node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-cred-new.js')} \
        --attributes employer_attr_issuer.json \
        --id 12345 \
        --publicKey employer_holder_pk.json \
        --expiration 365 \
        --type Income \
        --delegatable 0 \
        --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
        --secretKey employer_issuer_sk.txt \
        --destination ${credentialFileName}`, { cwd: workDir });
            console.log('Credential created');
            // Generate presentation
            const presentationFileName = 'employer_pres_attribute.json';
            console.log('Generating presentation...');
            // Create a temporary script to generate the presentation
            const presentationScriptPath = path.join(workDir, 'generate_presentation.js');
            const presentationScript = `
const fs = require("fs");
const { execSync } = require("child_process");

try {
  console.log("Generate presentation");
  const credential = JSON.parse(fs.readFileSync("employer_cred_holder.json", "utf8"));

  execSync([
    "node ${path.join(HEIMDALLJS_PATH, 'heimdalljs-pres-attribute.js')} 8",
    "--expiration 100",
    "--challenge ${requestTimestamp}",
    "--credential ${path.join(workDir, 'employer_cred_holder.json')}",
    "--destination ${path.join(workDir, 'employer_pres_attribute.json')}",
    "--secretKey ${path.join(workDir, 'employer_holder_sk.txt')}",
    "--issuerPK ${path.join(workDir, 'employer_issuer_pk.json')}"
  ].join(" "), { stdio: 'inherit' });

  if (!fs.existsSync("employer_pres_attribute.json")) {
    console.error("Presentation file missing — generation failed");
    process.exit(1);
  }

  console.log("Presentation generated successfully");
} catch (err) {
  console.error("Error:", err.message || err);
  process.exit(1);
}`;
            await fs.writeFile(presentationScriptPath, presentationScript);
            console.log('Running presentation generation script...');
            await execAsync(`node ${presentationScriptPath}`, { cwd: workDir, maxBuffer: 1024 * 1024 * 32 });
            console.log('Presentation generation completed');
            // Clean up the temporary script
            await fs.unlink(presentationScriptPath);
            // Read the generated proof
            const proofPath = path.join(workDir, presentationFileName);
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
            // Clean up temporary files (optional, comment out if you want to keep for debugging)
            // await fs.rm(workDir, { recursive: true, force: true });
            // console.log('Cleaned up temporary files');
            const proofJson = JSON.parse(proof);
            console.log('Proof parsed successfully, keys:', Object.keys(proofJson));
            res.json({
                success: true,
                proof: proofJson
            });
        }
        catch (execError) {
            console.error('Error executing heimdalljs command:', execError);
            if (execError.stdout)
                console.error('Command output:', execError.stdout);
            if (execError.stderr)
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
