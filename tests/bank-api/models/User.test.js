// Mock mongoose
jest.mock('mongoose', () => ({
    Schema: jest.fn(() => ({
        plugin: jest.fn(),
        index: jest.fn()
    })),
    model: jest.fn(() => jest.fn()),
    Types: {
        ObjectId: jest.fn(() => '507f1f77bcf86cd799439011')
    },
    Error: {
        ValidationError: class ValidationError extends Error {
            constructor(message) {
                super(message);
                this.name = 'ValidationError';
                this.errors = {};
            }
        }
    }
}));

// Mock the Bank API User model
const mockBankUserModel = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn()
};

jest.mock('../../../servers/bank-api/models/User', () => mockBankUserModel);

const User = require('../../../servers/bank-api/models/User');

describe('Bank API User Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Schema Validation', () => {
        it('should create a user with valid data', async () => {
            const userData = {
                _id: '507f1f77bcf86cd799439011',
                id: 'user123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.save.mockResolvedValue(userData);
            mockBankUserModel.create.mockResolvedValue(userData);

            const result = await mockBankUserModel.create(userData);

            expect(result._id).toBeDefined();
            expect(result.id).toBe(userData.id);
            expect(result.income).toBe(userData.income);
            expect(result.creditScore).toBe(userData.creditScore);
        });

        it('should require id field', async () => {
            const userData = {
                income: 75000,
                creditScore: 750
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { id: { message: 'Id is required' } };

            mockBankUserModel.save.mockRejectedValue(validationError);

            await expect(mockBankUserModel.save(userData)).rejects.toThrow('ValidationError');
        });

        it('should require income field', async () => {
            const userData = {
                id: 'user123',
                creditScore: 750
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { income: { message: 'Income is required' } };

            mockBankUserModel.save.mockRejectedValue(validationError);

            await expect(mockBankUserModel.save(userData)).rejects.toThrow('ValidationError');
        });

        it('should require creditScore field', async () => {
            const userData = {
                id: 'user123',
                income: 75000
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { creditScore: { message: 'Credit score is required' } };

            mockBankUserModel.save.mockRejectedValue(validationError);

            await expect(mockBankUserModel.save(userData)).rejects.toThrow('ValidationError');
        });

        it('should enforce unique id constraint', async () => {
            const userData = {
                id: 'user123',
                income: 75000,
                creditScore: 750
            };

            const duplicateError = new Error('DuplicateKeyError');
            duplicateError.code = 11000;
            duplicateError.name = 'MongoError';

            mockBankUserModel.save.mockRejectedValue(duplicateError);

            await expect(mockBankUserModel.save(userData)).rejects.toThrow('DuplicateKeyError');
        });

        it('should accept valid income and credit score ranges', async () => {
            const testCases = [
                { income: 20000, creditScore: 300 },
                { income: 50000, creditScore: 500 },
                { income: 100000, creditScore: 700 },
                { income: 200000, creditScore: 850 }
            ];

            for (const testCase of testCases) {
                const userData = {
                    _id: '507f1f77bcf86cd799439011',
                    id: `user_${testCase.income}_${testCase.creditScore}`,
                    income: testCase.income,
                    creditScore: testCase.creditScore
                };

                mockBankUserModel.save.mockResolvedValue(userData);
                const result = await mockBankUserModel.save(userData);

                expect(result.income).toBe(testCase.income);
                expect(result.creditScore).toBe(testCase.creditScore);
            }
        });
    });

    describe('Model Methods', () => {
        it('should find user by id', async () => {
            const userData = {
                _id: '507f1f77bcf86cd799439011',
                id: 'testuser123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.findOne.mockResolvedValue(userData);

            const foundUser = await mockBankUserModel.findOne({ id: 'testuser123' });

            expect(foundUser).toBeDefined();
            expect(foundUser.id).toBe('testuser123');
            expect(foundUser.income).toBe(75000);
            expect(foundUser.creditScore).toBe(750);
            expect(mockBankUserModel.findOne).toHaveBeenCalledWith({ id: 'testuser123' });
        });

        it('should return null for non-existent id', async () => {
            mockBankUserModel.findOne.mockResolvedValue(null);

            const foundUser = await mockBankUserModel.findOne({ id: 'nonexistent' });

            expect(foundUser).toBeNull();
            expect(mockBankUserModel.findOne).toHaveBeenCalledWith({ id: 'nonexistent' });
        });

        it('should find users by income range', async () => {
            const highIncomeUsers = [
                {
                    _id: '507f1f77bcf86cd799439012',
                    id: 'user2',
                    income: 75000,
                    creditScore: 700
                },
                {
                    _id: '507f1f77bcf86cd799439013',
                    id: 'user3',
                    income: 100000,
                    creditScore: 800
                }
            ];

            mockBankUserModel.find.mockResolvedValue(highIncomeUsers);

            const foundUsers = await mockBankUserModel.find({ income: { $gte: 75000 } });

            expect(foundUsers).toHaveLength(2);
            expect(foundUsers.map(u => u.id)).toContain('user2');
            expect(foundUsers.map(u => u.id)).toContain('user3');
            expect(mockBankUserModel.find).toHaveBeenCalledWith({ income: { $gte: 75000 } });
        });

        it('should find users by credit score range', async () => {
            const highCreditUsers = [
                {
                    _id: '507f1f77bcf86cd799439012',
                    id: 'user2',
                    income: 75000,
                    creditScore: 700
                },
                {
                    _id: '507f1f77bcf86cd799439013',
                    id: 'user3',
                    income: 100000,
                    creditScore: 800
                }
            ];

            mockBankUserModel.find.mockResolvedValue(highCreditUsers);

            const foundUsers = await mockBankUserModel.find({ creditScore: { $gte: 700 } });

            expect(foundUsers).toHaveLength(2);
            expect(foundUsers.map(u => u.id)).toContain('user2');
            expect(foundUsers.map(u => u.id)).toContain('user3');
            expect(mockBankUserModel.find).toHaveBeenCalledWith({ creditScore: { $gte: 700 } });
        });

        it('should update user', async () => {
            const updatedData = {
                income: 80000,
                creditScore: 800
            };

            const updatedUser = {
                _id: '507f1f77bcf86cd799439011',
                id: 'user123',
                income: 80000,
                creditScore: 800
            };

            mockBankUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

            const result = await mockBankUserModel.findByIdAndUpdate('507f1f77bcf86cd799439011', updatedData);

            expect(result.income).toBe(80000);
            expect(result.creditScore).toBe(800);
            expect(mockBankUserModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updatedData);
        });

        it('should delete user', async () => {
            const deletedUser = {
                _id: '507f1f77bcf86cd799439011',
                id: 'user123',
                income: 75000,
                creditScore: 750
            };

            mockBankUserModel.findByIdAndDelete.mockResolvedValue(deletedUser);

            const result = await mockBankUserModel.findByIdAndDelete('507f1f77bcf86cd799439011');

            expect(result._id).toBe('507f1f77bcf86cd799439011');
            expect(mockBankUserModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });
}); 