const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

class RenterZKPService {
  constructor(renterId) {
    this.renterId = renterId;
    this.scriptsDir = path.join(__dirname, '../../../shared/role-scripts');
  }

  async generateIncomeProof(employerId, monthlyIncome, position, startDate) {
    try {
      const scriptPath = path.join(this.scriptsDir, 'employer-verify.sh');
      const output = await execPromise(`${scriptPath} "${employerId}" "John Doe" "${position}" "${monthlyIncome}" "${startDate}" "Full-time" "Engineering" "$(date +%Y-%m-%d)"`);
      
      // Read the generated proof
      const proofPath = path.join(process.cwd(), 'income_presentation.json');
      const proof = await fs.readFile(proofPath, 'utf8');
      
      return JSON.parse(proof);
    } catch (error) {
      throw new Error(`Failed to generate income proof: ${error.message}`);
    }
  }

  async generateCreditProof(bankId, creditScore, creditHistory, income) {
    try {
      const scriptPath = path.join(this.scriptsDir, 'bank-verify.sh');
      const output = await execPromise(`${scriptPath} "${bankId}" "${creditScore}" "${creditHistory}" "${income}" "$(date +%Y-%m-%d)" "Active" "0.3" "Good"`);
      
      // Read the generated proof
      const proofPath = path.join(process.cwd(), 'credit_presentation.json');
      const proof = await fs.readFile(proofPath, 'utf8');
      
      return JSON.parse(proof);
    } catch (error) {
      throw new Error(`Failed to generate credit proof: ${error.message}`);
    }
  }

  async verifyPropertyProof(proofPath) {
    try {
      const scriptPath = path.join(this.scriptsDir, 'verify-proof.sh');
      const { stdout } = await execPromise(`${scriptPath} "${proofPath}"`);
      
      return stdout.includes('Proof is valid');
    } catch (error) {
      throw new Error(`Failed to verify property proof: ${error.message}`);
    }
  }
}

module.exports = { RenterZKPService }; 