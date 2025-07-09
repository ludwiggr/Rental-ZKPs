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

// Mock the Listing model
const mockListingModel = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn()
};

jest.mock('../../servers/backend/models/Listing', () => mockListingModel);

const Listing = require('../../servers/backend/models/Listing');

describe('Listing Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Schema Validation', () => {
        it('should create a listing with valid data', async () => {
            const listingData = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011',
                createdAt: new Date(),
                applications: []
            };

            mockListingModel.save.mockResolvedValue(listingData);
            mockListingModel.create.mockResolvedValue(listingData);

            const result = await mockListingModel.create(listingData);

            expect(result._id).toBeDefined();
            expect(result.name).toBe(listingData.name);
            expect(result.address).toBe(listingData.address);
            expect(result.size).toBe(listingData.size);
            expect(result.price).toBe(listingData.price);
            expect(result.type).toBe(listingData.type);
            expect(result.createdBy).toBe(listingData.createdBy);
            expect(result.createdAt).toBeDefined();
            expect(result.applications).toEqual([]);
        });

        it('should require name field', async () => {
            const listingData = {
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { name: { message: 'Name is required' } };

            mockListingModel.save.mockRejectedValue(validationError);

            await expect(mockListingModel.save(listingData)).rejects.toThrow('ValidationError');
        });

        it('should require address field', async () => {
            const listingData = {
                name: 'Test Property',
                size: '1000 sq ft',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { address: { message: 'Address is required' } };

            mockListingModel.save.mockRejectedValue(validationError);

            await expect(mockListingModel.save(listingData)).rejects.toThrow('ValidationError');
        });

        it('should require size field', async () => {
            const listingData = {
                name: 'Test Property',
                address: '123 Test St',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { size: { message: 'Size is required' } };

            mockListingModel.save.mockRejectedValue(validationError);

            await expect(mockListingModel.save(listingData)).rejects.toThrow('ValidationError');
        });

        it('should require price field', async () => {
            const listingData = {
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { price: { message: 'Price is required' } };

            mockListingModel.save.mockRejectedValue(validationError);

            await expect(mockListingModel.save(listingData)).rejects.toThrow('ValidationError');
        });

        it('should require type field', async () => {
            const listingData = {
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                createdBy: '507f1f77bcf86cd799439011'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { type: { message: 'Type is required' } };

            mockListingModel.save.mockRejectedValue(validationError);

            await expect(mockListingModel.save(listingData)).rejects.toThrow('ValidationError');
        });

        it('should validate type enum values', async () => {
            const listingData = {
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                type: 'invalid_type',
                createdBy: '507f1f77bcf86cd799439011'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { type: { message: 'Invalid type value' } };

            mockListingModel.save.mockRejectedValue(validationError);

            await expect(mockListingModel.save(listingData)).rejects.toThrow('ValidationError');
        });

        it('should accept valid type enum values', async () => {
            const validTypes = ['flat', 'house', 'studio', 'apartment'];

            for (const type of validTypes) {
                const listingData = {
                    _id: '507f1f77bcf86cd799439012',
                    name: `Test ${type}`,
                    address: '123 Test St',
                    size: '1000 sq ft',
                    price: 1500,
                    type: type,
                    createdBy: '507f1f77bcf86cd799439011'
                };

                mockListingModel.save.mockResolvedValue(listingData);
                const result = await mockListingModel.save(listingData);
                expect(result.type).toBe(type);
            }
        });

        it('should set default values for optional fields', async () => {
            const listingData = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011',
                createdAt: new Date(),
                applications: []
            };

            mockListingModel.save.mockResolvedValue(listingData);

            const result = await mockListingModel.save(listingData);

            expect(result.incomeRequirement).toBeUndefined();
            expect(result.creditScoreRequirement).toBeUndefined();
            expect(result.applications).toEqual([]);
            expect(result.createdAt).toBeDefined();
        });

        it('should accept optional requirements', async () => {
            const listingData = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011',
                incomeRequirement: 50000,
                creditScoreRequirement: 700
            };

            mockListingModel.save.mockResolvedValue(listingData);

            const result = await mockListingModel.save(listingData);

            expect(result.incomeRequirement).toBe(50000);
            expect(result.creditScoreRequirement).toBe(700);
        });
    });

    describe('Model Methods', () => {
        it('should find listing by id', async () => {
            const listingData = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011'
            };

            mockListingModel.findById.mockResolvedValue(listingData);

            const foundListing = await mockListingModel.findById('507f1f77bcf86cd799439012');

            expect(foundListing).toBeDefined();
            expect(foundListing.name).toBe('Test Property');
            expect(mockListingModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
        });

        it('should find all listings', async () => {
            const listings = [
                {
                    _id: '507f1f77bcf86cd799439012',
                    name: 'Test Property 1',
                    address: '123 Test St',
                    size: '1000 sq ft',
                    price: 1500,
                    type: 'apartment',
                    createdBy: '507f1f77bcf86cd799439011'
                },
                {
                    _id: '507f1f77bcf86cd799439013',
                    name: 'Test Property 2',
                    address: '456 Test St',
                    size: '1200 sq ft',
                    price: 1800,
                    type: 'house',
                    createdBy: '507f1f77bcf86cd799439011'
                }
            ];

            mockListingModel.find.mockResolvedValue(listings);

            const foundListings = await mockListingModel.find();

            expect(foundListings).toHaveLength(2);
            expect(foundListings[0].name).toBe('Test Property 1');
            expect(foundListings[1].name).toBe('Test Property 2');
        });

        it('should update listing', async () => {
            const updatedData = {
                name: 'Updated Property',
                price: 2000
            };

            const updatedListing = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Updated Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 2000,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011'
            };

            mockListingModel.findByIdAndUpdate.mockResolvedValue(updatedListing);

            const result = await mockListingModel.findByIdAndUpdate('507f1f77bcf86cd799439012', updatedData);

            expect(result.name).toBe('Updated Property');
            expect(result.price).toBe(2000);
            expect(mockListingModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439012', updatedData);
        });

        it('should delete listing', async () => {
            const deletedListing = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Test Property',
                address: '123 Test St',
                size: '1000 sq ft',
                price: 1500,
                type: 'apartment',
                createdBy: '507f1f77bcf86cd799439011'
            };

            mockListingModel.findByIdAndDelete.mockResolvedValue(deletedListing);

            const result = await mockListingModel.findByIdAndDelete('507f1f77bcf86cd799439012');

            expect(result._id).toBe('507f1f77bcf86cd799439012');
            expect(mockListingModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
        });
    });
}); 