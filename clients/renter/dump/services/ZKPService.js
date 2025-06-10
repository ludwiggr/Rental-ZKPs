const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

class LandlordZKPService {
  constructor(landlordId) {
    this.landlordId = landlordId;
    this.scriptsDir = path.join(__dirname, '../../../shared/role-scripts');
  }

  async generatePropertyProof(governmentId, propertyAddress, ownerName, propertyType) {
    try {
      const scriptPath = path.join(this.scriptsDir, 'government-verify.sh');
      const output = await execPromise(`${scriptPath} "${governmentId}" "${propertyAddress}" "${ownerName}" "${propertyType}" "$(date +%Y-%m-%d)" "500000" "Paid" "$(date +%Y-%m-%d)"`);
      
      // Read the generated proof
      const proofPath = path.join(process.cwd(), 'property_presentation.json');
      const proof = await fs.readFile(proofPath, 'utf8');
      
      return JSON.parse(proof);
    } catch (error) {
      throw new Error(`Failed to generate property proof: ${error.message}`);
    }
  }

  async verifyIncomeProof(proofPath) {
    try {
      const scriptPath = path.join(this.scriptsDir, 'verify-proof.sh');
      const { stdout } = await execPromise(`${scriptPath} "${proofPath}"`);
      
      return stdout.includes('Proof is valid');
    } catch (error) {
      throw new Error(`Failed to verify income proof: ${error.message}`);
    }
  }

  async verifyCreditProof(proofPath) {
    try {
      const scriptPath = path.join(this.scriptsDir, 'verify-proof.sh');
      const { stdout } = await execPromise(`${scriptPath} "${proofPath}"`);
      
      return stdout.includes('Proof is valid');
    } catch (error) {
      throw new Error(`Failed to verify credit proof: ${error.message}`);
    }
  }
}

module.exports = { LandlordZKPService }; 