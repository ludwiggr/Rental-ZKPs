import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

dotenv.config();

const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

// Government-specific endpoints
app.post('/api/government/verify-property', async (req, res) => {
  try {
    const { propertyAddress, ownerId } = req.body;
    
    // Create attributes file
    const attrPath = path.join(process.cwd(), 'gov_attr_issuer.json');
    await fs.writeFile(attrPath, JSON.stringify([
      "John",
      "Jones",
      "1980-01-01",
      "123 Main St, New York, NY, 10001, USA",
      "SSN123456789"
    ]));

    // Generate keys
    await execAsync('heimdalljs key new gov_issuer > gov_issuer_sk.txt');
    await execAsync('heimdalljs key pub < gov_issuer_sk.txt > gov_issuer_pk.json');
    await execAsync('heimdalljs key new gov_holder > gov_holder_sk.txt');
    await execAsync('heimdalljs key pub < gov_holder_sk.txt > gov_holder_pk.json');

    // Create credential
    await execAsync(`heimdalljs cred new \
      --attributes gov_attr_issuer.json \
      --id ${Date.now()} \
      --publicKey gov_holder_pk.json \
      --expiration 365 \
      --type GovernmentID \
      --delegatable 0 \
      --registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/ \
      --secretKey gov_issuer_sk.txt \
      --destination gov_cred_holder.json`);

    // Generate presentation
    await execAsync(`heimdalljs pres attribute 3 \
      --expiration 100 \
      --challenge ${Date.now()} \
      --credential gov_cred_holder.json \
      --destination gov_pres_attribute.json \
      --secretKey gov_holder_sk.txt \
      --issuerPK gov_issuer_pk.json`);

    // Verify the presentation
    const { stdout } = await execAsync('heimdalljs verify gov_pres_attribute.json');
    const isValid = stdout.includes('true');

    res.json({ success: true, isValid });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Government API server running on port ${port}`);
}); 