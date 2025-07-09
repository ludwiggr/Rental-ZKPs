// Mock Bank API User model
const mockBankUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
};

jest.mock('../../../servers/bank-api/models/User', () => mockBankUserModel);

// Mock exec for heimdall commands
const { exec } = require('child_process');
jest.mock('child_process');

// Mock fs.promises
const fs = require('fs').promises;
jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn(),
        writeFile: jest.fn(),
        access: jest.fn(),
        readFile: jest.fn(),
        unlink: jest.fn()
    }
}));

const request = require('supertest');
const express = require('express');
const User = require('../../../servers/bank-api/models/User');
const proofRouter = require('../../../servers/bank-api/routes/proof');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/proof', proofRouter);

describe('Bank API Proof Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        exec.mockClear();
        fs.mkdir.mockClear();
        fs.writeFile.mockClear();
        fs.access.mockClear();
        fs.readFile.mockClear();
        fs.unlink.mockClear();
    });

    describe('POST /generateProof', () => {
        it('should generate income proof successfully', async () => {
            // Mock test user
            const user = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.findOne.mockResolvedValue(user);

            // Mock successful heimdall operations
            exec.mockImplementation((command, options, callback) => {
                if (command.includes('heimdalljs-key-new.js')) {
                    callback(null, { stdout: 'test_private_key', stderr: '' });
                } else if (command.includes('heimdalljs-key-pub.js')) {
                    callback(null, { stdout: '{"publicKey": "test_public_key"}', stderr: '' });
                } else if (command.includes('heimdalljs-cred-new.js')) {
                    callback(null, { stdout: '', stderr: '' });
                } else if (command.includes('heimdalljs-pres-attribute.js')) {
                    callback(null, { stdout: '', stderr: '' });
                }
            });

            fs.readFile.mockResolvedValue('{"proof": "test_proof_data"}');

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'income',
                    targetValue: 50000
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.proof).toBeDefined();
            expect(response.body.proof.proof).toBe('test_proof_data');
            expect(mockBankUserModel.findOne).toHaveBeenCalledWith({ id: 'testuser123' });
        });

        it('should generate credit score proof successfully', async () => {
            // Mock test user
            const user = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.findOne.mockResolvedValue(user);

            // Mock successful heimdall operations
            exec.mockImplementation((command, options, callback) => {
                if (command.includes('heimdalljs-key-new.js')) {
                    callback(null, { stdout: 'test_private_key', stderr: '' });
                } else if (command.includes('heimdalljs-key-pub.js')) {
                    callback(null, { stdout: '{"publicKey": "test_public_key"}', stderr: '' });
                } else if (command.includes('heimdalljs-cred-new.js')) {
                    callback(null, { stdout: '', stderr: '' });
                } else if (command.includes('heimdalljs-pres-attribute.js')) {
                    callback(null, { stdout: '', stderr: '' });
                }
            });

            fs.readFile.mockResolvedValue('{"proof": "test_proof_data"}');

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'creditScore',
                    targetValue: 700
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.proof).toBeDefined();
        });

        it('should reject proof generation for non-existent user', async () => {
            mockBankUserModel.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'nonexistent',
                    type: 'income',
                    targetValue: 50000
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('User not found');
            expect(mockBankUserModel.findOne).toHaveBeenCalledWith({ id: 'nonexistent' });
        });

        it('should reject invalid proof type', async () => {
            // Mock test user to exist first
            const user = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.findOne.mockResolvedValue(user);

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'invalid_type',
                    targetValue: 50000
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid type, must be income or creditScore');
        });

        it('should reject income proof when income is below target', async () => {
            // Mock test user with low income
            const user = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 30000,
                creditScore: 750
            };

            mockBankUserModel.findOne.mockResolvedValue(user);

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'income',
                    targetValue: 50000
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Income is below the target value');
        });

        it('should reject credit score proof when credit score is below target', async () => {
            // Mock test user with low credit score
            const user = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 75000,
                creditScore: 600
            };

            mockBankUserModel.findOne.mockResolvedValue(user);

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'creditScore',
                    targetValue: 700
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Credit score is below the target value');
        });

        it('should reject request with missing userId', async () => {
            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    type: 'income',
                    targetValue: 50000
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Missing required fields');
        });

        it('should reject request with missing type', async () => {
            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    targetValue: 50000
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Missing required fields');
        });

        it('should reject request with missing targetValue', async () => {
            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'income'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Missing required fields');
        });

        it('should handle heimdall command failures', async () => {
            // Mock test user
            const user = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.findOne.mockResolvedValue(user);

            // Mock failed heimdall operations
            exec.mockImplementation((command, options, callback) => {
                callback(new Error('Heimdall command failed'), { stdout: '', stderr: 'Command failed' });
            });

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'income',
                    targetValue: 50000
                });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Heimdall command failed');
        });

        it('should handle file system errors', async () => {
            // Mock test user
            const user = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.findOne.mockResolvedValue(user);

            // Mock successful heimdall operations
            exec.mockImplementation((command, options, callback) => {
                callback(null, { stdout: 'success', stderr: '' });
            });

            // Mock file system error
            fs.readFile.mockRejectedValue(new Error('File read error'));

            const response = await request(app)
                .post('/api/proof/generateProof')
                .send({
                    userId: 'testuser123',
                    type: 'income',
                    targetValue: 50000
                });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('File read error');
        });
    });
}); 