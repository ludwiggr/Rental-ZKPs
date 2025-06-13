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
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Generate income proof
app.post('/generate-income-proof', (req, res) => {
  const { income, employerId, timestamp } = req.body;
  
  // In a real application, this would generate a ZKP
  const proof = {
    type: 'income',
    income,
    employerId,
    timestamp,
    signature: 'mock-signature'
  };

  res.json({
    success: true,
    proof
  });
});

// Request credit check
app.post('/request-credit-check', (req, res) => {
  const { creditScore, bankId, timestamp } = req.body;
  
  // In a real application, this would generate a ZKP
  const check = {
    type: 'credit',
    creditScore,
    bankId,
    timestamp,
    signature: 'mock-signature'
  };

  res.json({
    success: true,
    check
  });
});

// Verify income proof
app.post('/verify-income', (req, res) => {
  const { proof } = req.body;
  
  // In a real application, this would verify the ZKP
  const isValid = proof && proof.type === 'income';

  res.json({
    success: true,
    isValid
  });
});

// Verify credit check
app.post('/verify-credit', (req, res) => {
  const { check } = req.body;
  
  // In a real application, this would verify the ZKP
  const isValid = check && check.type === 'credit';

  res.json({
    success: true,
    isValid
  });
});

app.listen(port, () => {
  console.log(`Bank API server running at http://localhost:${port}`);
}); 