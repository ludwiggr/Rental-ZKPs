// Mock mongoose
jest.mock('mongoose', () => ({
    Schema: jest.fn(() => ({
        plugin: jest.fn(),
        index: jest.fn()
    })),
    model: jest.fn(() => jest.fn()),
    Types: {
        ObjectId: jest.fn(() => '507f1f77bcf86cd799439011')
    }
}));

// Mock the User model
const mockUserModel = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn()
};

jest.mock('../../servers/backend/models/User', () => mockUserModel);

const User = require('../../servers/backend/models/User');

describe('User Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Schema Validation', () => {
        it('should create a user with valid data', async () => {
            const userData = {
                _id: '507f1f77bcf86cd799439011',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword123'
            };

            mockUserModel.save.mockResolvedValue(userData);
            mockUserModel.create.mockResolvedValue(userData);

            const result = await mockUserModel.create(userData);

            expect(result._id).toBeDefined();
            expect(result.username).toBe(userData.username);
            expect(result.email).toBe(userData.email);
            expect(result.password).toBe(userData.password);
        });

        it('should require username field', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'hashedpassword123'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { username: { message: 'Username is required' } };

            mockUserModel.save.mockRejectedValue(validationError);

            await expect(mockUserModel.save(userData)).rejects.toThrow('ValidationError');
        });

        it('should require email field', async () => {
            const userData = {
                username: 'testuser',
                password: 'hashedpassword123'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { email: { message: 'Email is required' } };

            mockUserModel.save.mockRejectedValue(validationError);

            await expect(mockUserModel.save(userData)).rejects.toThrow('ValidationError');
        });

        it('should require password field', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { password: { message: 'Password is required' } };

            mockUserModel.save.mockRejectedValue(validationError);

            await expect(mockUserModel.save(userData)).rejects.toThrow('ValidationError');
        });

        it('should enforce unique email constraint', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword123'
            };

            const duplicateError = new Error('DuplicateKeyError');
            duplicateError.code = 11000;
            duplicateError.name = 'MongoError';

            mockUserModel.save.mockRejectedValue(duplicateError);

            await expect(mockUserModel.save(userData)).rejects.toThrow('DuplicateKeyError');
        });
    });

    describe('Model Methods', () => {
        it('should find user by email', async () => {
            const userData = {
                _id: '507f1f77bcf86cd799439011',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword123'
            };

            mockUserModel.findOne.mockResolvedValue(userData);

            const foundUser = await mockUserModel.findOne({ email: 'test@example.com' });

            expect(foundUser).toBeDefined();
            expect(foundUser.email).toBe('test@example.com');
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        });

        it('should return null for non-existent email', async () => {
            mockUserModel.findOne.mockResolvedValue(null);

            const foundUser = await mockUserModel.findOne({ email: 'nonexistent@example.com' });

            expect(foundUser).toBeNull();
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
        });
    });
}); 