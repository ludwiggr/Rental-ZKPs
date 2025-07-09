// Mock-based test setup - no database required
const mongoose = require('mongoose');

// Mock mongoose connection
jest.mock('mongoose', () => ({
    connect: jest.fn().mockResolvedValue({}),
    connection: {
        collections: {},
        readyState: 1,
        close: jest.fn().mockResolvedValue({})
    },
    Types: {
        ObjectId: jest.fn(() => '507f1f77bcf86cd799439011')
    }
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedpassword123'),
    compare: jest.fn().mockResolvedValue(true)
}));

// Mock config module
jest.mock('../servers/backend/config/config', () => ({
    JWT_SECRET: 'test-secret-key',
    JWT_EXPIRES_IN: '1h'
}));

// Mock jsonwebtoken with proper verification handling
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
    verify: jest.fn().mockImplementation((token, secret) => {
        // Return the expected structure that check_authorization expects
        return { userId: '507f1f77bcf86cd799439011' };
    })
}));

// Global test utilities
global.generateTestToken = (userId) => {
    return 'mock.jwt.token';
};

global.createTestUser = async (User, userData = {}) => {
    const defaultUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123'
    };
    return { ...defaultUser, ...userData };
};

global.createTestListing = async (Listing, listingData = {}) => {
    const defaultListing = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Property',
        address: '123 Test St',
        size: '1000 sq ft',
        price: 1500,
        type: 'apartment',
        createdBy: '507f1f77bcf86cd799439011'
    };
    return { ...defaultListing, ...listingData };
};

global.createTestApplication = async (Application, applicationData = {}) => {
    const defaultApplication = {
        _id: '507f1f77bcf86cd799439013',
        userId: '507f1f77bcf86cd799439011',
        status: 'pending',
        incomeProof: {},
        creditScoreProof: {}
    };
    return { ...defaultApplication, ...applicationData };
};

// Setup and teardown
beforeAll(async () => {
    // No database setup needed with mocks
});

afterEach(async () => {
    // Clear all mocks after each test
    jest.clearAllMocks();
});

afterAll(async () => {
    // No cleanup needed with mocks
}); 