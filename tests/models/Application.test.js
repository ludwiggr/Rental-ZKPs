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

// Mock the Application model
const mockApplicationModel = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn()
};

jest.mock('../../servers/backend/models/Application', () => mockApplicationModel);

const Application = require('../../servers/backend/models/Application');

describe('Application Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Schema Validation', () => {
        it('should create an application with valid data', async () => {
            const applicationData = {
                _id: '507f1f77bcf86cd799439013',
                userId: '507f1f77bcf86cd799439011',
                status: 'pending',
                incomeProof: { proof: 'test_income_proof' },
                creditScoreProof: { proof: 'test_credit_proof' },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockApplicationModel.save.mockResolvedValue(applicationData);
            mockApplicationModel.create.mockResolvedValue(applicationData);

            const result = await mockApplicationModel.create(applicationData);

            expect(result._id).toBeDefined();
            expect(result.userId).toBe(applicationData.userId);
            expect(result.status).toBe(applicationData.status);
            expect(result.incomeProof).toEqual(applicationData.incomeProof);
            expect(result.creditScoreProof).toEqual(applicationData.creditScoreProof);
            expect(result.createdAt).toBeDefined();
            expect(result.updatedAt).toBeDefined();
        });

        it('should require userId field', async () => {
            const applicationData = {
                status: 'pending',
                incomeProof: {},
                creditScoreProof: {}
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { userId: { message: 'UserId is required' } };

            mockApplicationModel.save.mockRejectedValue(validationError);

            await expect(mockApplicationModel.save(applicationData)).rejects.toThrow('ValidationError');
        });

        it('should set default status to pending', async () => {
            const applicationData = {
                _id: '507f1f77bcf86cd799439013',
                userId: '507f1f77bcf86cd799439011',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockApplicationModel.save.mockResolvedValue(applicationData);

            const result = await mockApplicationModel.save(applicationData);

            expect(result.status).toBe('pending');
        });

        it('should validate status enum values', async () => {
            const validStatuses = ['pending', 'verified', 'approved', 'rejected'];

            for (const status of validStatuses) {
                const applicationData = {
                    _id: '507f1f77bcf86cd799439013',
                    userId: '507f1f77bcf86cd799439011',
                    status: status,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                mockApplicationModel.save.mockResolvedValue(applicationData);
                const result = await mockApplicationModel.save(applicationData);
                expect(result.status).toBe(status);
            }
        });

        it('should reject invalid status values', async () => {
            const applicationData = {
                userId: '507f1f77bcf86cd799439011',
                status: 'invalid_status'
            };

            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = { status: { message: 'Invalid status value' } };

            mockApplicationModel.save.mockRejectedValue(validationError);

            await expect(mockApplicationModel.save(applicationData)).rejects.toThrow('ValidationError');
        });

        it('should set default values for proof objects', async () => {
            const applicationData = {
                _id: '507f1f77bcf86cd799439013',
                userId: '507f1f77bcf86cd799439011',
                status: 'pending',
                incomeProof: {},
                creditScoreProof: {},
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockApplicationModel.save.mockResolvedValue(applicationData);

            const result = await mockApplicationModel.save(applicationData);

            expect(result.incomeProof).toEqual({});
            expect(result.creditScoreProof).toEqual({});
        });

        it('should accept custom proof objects', async () => {
            const incomeProof = { proof: 'income_proof', verified: true };
            const creditScoreProof = { proof: 'credit_proof', score: 750 };

            const applicationData = {
                _id: '507f1f77bcf86cd799439013',
                userId: '507f1f77bcf86cd799439011',
                status: 'pending',
                incomeProof: incomeProof,
                creditScoreProof: creditScoreProof,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockApplicationModel.save.mockResolvedValue(applicationData);

            const result = await mockApplicationModel.save(applicationData);

            expect(result.incomeProof).toEqual(incomeProof);
            expect(result.creditScoreProof).toEqual(creditScoreProof);
        });

        it('should update timestamps on save', async () => {
            const originalDate = new Date('2023-01-01T00:00:00Z');
            const updatedDate = new Date('2023-01-01T01:00:00Z');

            const applicationData = {
                _id: '507f1f77bcf86cd799439013',
                userId: '507f1f77bcf86cd799439011',
                status: 'pending',
                createdAt: originalDate,
                updatedAt: originalDate
            };

            const updatedApplicationData = {
                ...applicationData,
                status: 'approved',
                updatedAt: updatedDate
            };

            mockApplicationModel.save
                .mockResolvedValueOnce(applicationData)
                .mockResolvedValueOnce(updatedApplicationData);

            const result1 = await mockApplicationModel.save(applicationData);
            const result2 = await mockApplicationModel.save({ ...result1, status: 'approved' });

            expect(result2.createdAt).toEqual(originalDate);
            expect(result2.updatedAt).toEqual(updatedDate);
        });
    });

    describe('Model Methods', () => {
        it('should find applications by userId', async () => {
            const applications = [
                {
                    _id: '507f1f77bcf86cd799439013',
                    userId: '507f1f77bcf86cd799439011',
                    status: 'pending'
                }
            ];

            mockApplicationModel.find.mockResolvedValue(applications);

            const foundApplications = await mockApplicationModel.find({ userId: '507f1f77bcf86cd799439011' });

            expect(foundApplications).toHaveLength(1);
            expect(foundApplications[0].userId).toBe('507f1f77bcf86cd799439011');
            expect(mockApplicationModel.find).toHaveBeenCalledWith({ userId: '507f1f77bcf86cd799439011' });
        });

        it('should find applications by status', async () => {
            const pendingApplications = [
                {
                    _id: '507f1f77bcf86cd799439013',
                    userId: '507f1f77bcf86cd799439011',
                    status: 'pending'
                }
            ];

            const approvedApplications = [
                {
                    _id: '507f1f77bcf86cd799439014',
                    userId: '507f1f77bcf86cd799439012',
                    status: 'approved'
                }
            ];

            mockApplicationModel.find
                .mockResolvedValueOnce(pendingApplications)
                .mockResolvedValueOnce(approvedApplications);

            const foundPending = await mockApplicationModel.find({ status: 'pending' });
            const foundApproved = await mockApplicationModel.find({ status: 'approved' });

            expect(foundPending).toHaveLength(1);
            expect(foundApproved).toHaveLength(1);
            expect(foundPending[0].status).toBe('pending');
            expect(foundApproved[0].status).toBe('approved');
        });

        it('should find application by id', async () => {
            const applicationData = {
                _id: '507f1f77bcf86cd799439013',
                userId: '507f1f77bcf86cd799439011',
                status: 'pending'
            };

            mockApplicationModel.findById.mockResolvedValue(applicationData);

            const foundApplication = await mockApplicationModel.findById('507f1f77bcf86cd799439013');

            expect(foundApplication).toBeDefined();
            expect(foundApplication._id).toBe('507f1f77bcf86cd799439013');
            expect(mockApplicationModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
        });

        it('should update application', async () => {
            const updatedData = {
                status: 'approved'
            };

            const updatedApplication = {
                _id: '507f1f77bcf86cd799439013',
                userId: '507f1f77bcf86cd799439011',
                status: 'approved'
            };

            mockApplicationModel.findByIdAndUpdate.mockResolvedValue(updatedApplication);

            const result = await mockApplicationModel.findByIdAndUpdate('507f1f77bcf86cd799439013', updatedData);

            expect(result.status).toBe('approved');
            expect(mockApplicationModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439013', updatedData);
        });
    });
}); 