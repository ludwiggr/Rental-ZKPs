// Mock Bank API User model
const mockBankUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
};

// Mock User constructor
const mockUserInstance = {
    save: jest.fn()
};

jest.mock('../../../servers/bank-api/models/User', () => {
    const mockUser = jest.fn().mockImplementation((userData) => {
        Object.assign(mockUserInstance, userData);
        return mockUserInstance;
    });
    mockUser.findOne = mockBankUserModel.findOne;
    mockUser.create = mockBankUserModel.create;
    return mockUser;
});

const request = require('supertest');
const express = require('express');
const User = require('../../../servers/bank-api/models/User');
const userRouter = require('../../../servers/bank-api/routes/user');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/user', userRouter);

describe('Bank API User Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /', () => {
        it('should create a user with random income and credit score', async () => {
            const userData = {
                id: 'testuser123'
            };

            const createdUser = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 45000,
                creditScore: 550
            };

            // Mock user not existing
            mockBankUserModel.findOne.mockResolvedValue(null);
            mockUserInstance.save.mockResolvedValue(createdUser);

            const response = await request(app)
                .post('/api/user')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.id).toBe('testuser123');
            expect(response.body.user.income).toBeGreaterThanOrEqual(20000);
            expect(response.body.user.income).toBeLessThanOrEqual(70000);
            expect(response.body.user.creditScore).toBeGreaterThanOrEqual(300);
            expect(response.body.user.creditScore).toBeLessThanOrEqual(700);

            // Verify user was created
            expect(mockUserInstance.save).toHaveBeenCalled();
        });

        it('should reject creation with missing id', async () => {
            const response = await request(app)
                .post('/api/user')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Missing required fields');
        });

        it('should generate different random values for different users', async () => {
            const user1Data = { id: 'user1' };
            const user2Data = { id: 'user2' };

            const createdUser1 = {
                _id: '507f1f77bcf86cd799439011',
                id: 'user1',
                income: 45000,
                creditScore: 550
            };

            const createdUser2 = {
                _id: '507f1f77bcf86cd799439012',
                id: 'user2',
                income: 60000,
                creditScore: 650
            };

            // Mock users not existing
            mockBankUserModel.findOne.mockResolvedValue(null);
            mockUserInstance.save
                .mockResolvedValueOnce(createdUser1)
                .mockResolvedValueOnce(createdUser2);

            const response1 = await request(app)
                .post('/api/user')
                .send(user1Data);

            const response2 = await request(app)
                .post('/api/user')
                .send(user2Data);

            expect(response1.status).toBe(201);
            expect(response2.status).toBe(201);

            // Values should be different
            const values1 = { income: response1.body.user.income, creditScore: response1.body.user.creditScore };
            const values2 = { income: response2.body.user.income, creditScore: response2.body.user.creditScore };

            // At least one value should be different
            expect(values1.income !== values2.income || values1.creditScore !== values2.creditScore).toBe(true);
        });

        it('should generate values within expected ranges', async () => {
            const userData = { id: 'rangetest' };

            const createdUser = {
                _id: '507f1f77bcf86cd799439011',
                id: 'rangetest',
                income: 45000,
                creditScore: 550
            };

            // Mock user not existing
            mockBankUserModel.findOne.mockResolvedValue(null);
            mockUserInstance.save.mockResolvedValue(createdUser);

            const response = await request(app)
                .post('/api/user')
                .send(userData);

            expect(response.status).toBe(201);

            const { income, creditScore } = response.body.user;

            // Income should be between 20000 and 70000
            expect(income).toBeGreaterThanOrEqual(20000);
            expect(income).toBeLessThanOrEqual(70000);

            // Credit score should be between 300 and 700
            expect(creditScore).toBeGreaterThanOrEqual(300);
            expect(creditScore).toBeLessThanOrEqual(700);
        });

        it('should handle duplicate user creation', async () => {
            const userData = { id: 'duplicateuser' };

            // Simulate that user already exists by making save throw an error
            mockBankUserModel.findOne.mockResolvedValue(null);
            mockUserInstance.save.mockImplementation(() => { throw new Error('duplicate key error'); });

            const response = await request(app)
                .post('/api/user')
                .send(userData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });
}); 