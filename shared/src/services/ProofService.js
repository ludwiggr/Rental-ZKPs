import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class ProofService {
  constructor() {
    this.scriptsDir = path.join(process.cwd(), 'shared', 'role-scripts');
  }

  async generateKeys(role) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${role}.sh`);
      await execAsync(`chmod +x ${scriptPath}`);
      await execAsync(`${scriptPath}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async requestProof(role, attributes) {
    try {
      // Create attributes file
      const attrPath = path.join(process.cwd(), `${role}_attr_issuer.json`);
      await fs.writeFile(attrPath, JSON.stringify(attributes, null, 2));

      // Generate credential
      const scriptPath = path.join(this.scriptsDir, `${role}.sh`);
      await execAsync(`${scriptPath}`);

      // Read the generated credential
      const credPath = path.join(process.cwd(), `${role}_cred_holder.json`);
      const credential = JSON.parse(await fs.readFile(credPath, 'utf8'));

      return { success: true, credential };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createProofPresentation(role, credential, attributeIndex, challenge) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${role}.sh`);
      await execAsync(`${scriptPath}`);

      // Read the generated presentation
      const presPath = path.join(process.cwd(), `${role}_pres_attribute.json`);
      const presentation = JSON.parse(await fs.readFile(presPath, 'utf8'));

      return { success: true, presentation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async verifyProof(role, presentation) {
    try {
      const scriptPath = path.join(this.scriptsDir, `${role}.sh`);
      await execAsync(`${scriptPath}`);

      // Read the verification result
      const result = await execAsync(`heimdalljs verify ${role}_pres_attribute.json`);
      const isValid = result.stdout.includes('true');

      return { success: true, isValid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default ProofService; 