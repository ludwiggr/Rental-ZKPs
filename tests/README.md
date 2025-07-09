# Rental ZKPs Test Suite

This directory contains comprehensive unit and integration tests for the Rental ZKPs system, covering backend APIs, bank API, and data models.

## 🧪 Test Coverage

### ✅ **Currently Covered**

#### **Backend Models** (3/3)
- ✅ `models/User.test.js` - User model validation and methods
- ✅ `models/Listing.test.js` - Listing model validation and methods  
- ✅ `models/Application.test.js` - Application model validation and methods

#### **Bank API** (3/3)
- ✅ `bank-api/models/User.test.js` - Bank User model validation and methods
- ✅ `bank-api/routes/user.test.js` - Bank user creation and management
- ✅ `bank-api/routes/proof.test.js` - Zero-knowledge proof generation and validation

### ❌ **Not Currently Covered**

#### **Backend Routes** (0/4)
- ❌ Login route (`/api/login`) - JWT authentication and user login
- ❌ Register route (`/api/register`) - User registration and bank API integration
- ❌ Listings routes (`/api/listings`) - Property listing CRUD operations
- ❌ Applications routes (`/api/applications`) - Rental application management

#### **Frontend Components** (0/∞)
- ❌ React components and pages
- ❌ Frontend services and utilities
- ❌ Client-side state management

#### **Heimdall Core** (0/∞)
- ❌ Zero-knowledge proof circuits
- ❌ Credential management
- ❌ Proof verification logic

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
cd tests
npm install
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- models/User.test.js

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📁 Test Structure

```
tests/
├── models/                    # Backend model tests
│   ├── User.test.js
│   ├── Listing.test.js
│   └── Application.test.js
├── bank-api/                  # Bank API tests
│   ├── models/
│   │   └── User.test.js
│   └── routes/
│       ├── user.test.js
│       └── proof.test.js
├── setup-mocks.js            # Global test mocks and utilities
├── package.json              # Test dependencies
└── README.md                 # This file
```

## 🔧 Test Configuration

### Mock Strategy
- **Database**: MongoDB Memory Server for isolated testing
- **External APIs**: Mocked with Jest
- **Authentication**: JWT tokens mocked for testing
- **File System**: Mocked for proof generation tests

### Test Utilities
- `setup-mocks.js`: Global mock configuration
- Shared test data and helper functions
- Consistent test patterns across all test files

## 📊 Test Results

### Current Status
- **Total Test Suites**: 6
- **Total Tests**: 61
- **Passing**: 61 ✅
- **Failing**: 0 ❌
- **Coverage**: Backend models and Bank API (100%)

### Performance
- **Average Test Runtime**: ~0.4 seconds
- **Memory Usage**: Minimal (using mocks)
- **CI/CD Ready**: All tests pass consistently

## 🛠️ Development Guidelines

### Adding New Tests
1. Follow the existing naming convention: `*.test.js`
2. Use descriptive test names and group related tests
3. Mock external dependencies appropriately
4. Include both positive and negative test cases
5. Test edge cases and error conditions

### Test Patterns
```javascript
describe('Component Name', () => {
    beforeEach(() => {
        // Setup mocks and test data
    });

    describe('Method Name', () => {
        it('should handle valid input', async () => {
            // Test implementation
        });

        it('should handle invalid input', async () => {
            // Error case test
        });
    });
});
```

### Mock Guidelines
- Mock at the module level, not implementation level
- Use consistent mock data across tests
- Reset mocks between tests
- Document complex mock setups

## 🔍 Debugging Tests

### Common Issues
1. **Mock not applied**: Ensure mocks are defined before imports
2. **Async test failures**: Use proper async/await patterns
3. **Database connection**: Check MongoDB Memory Server setup
4. **JWT issues**: Verify JWT secret and token format

### Debug Commands
```bash
# Run single test with verbose output
npm test -- --verbose --testNamePattern="specific test name"

# Run tests with console output
npm test -- --silent=false

# Debug specific test file
npm test -- --testPathPattern="models/User.test.js"
```

## 📈 Future Enhancements

### Priority 1: Backend Routes
- [ ] Fix JWT authentication mocking for route tests
- [ ] Add comprehensive route testing
- [ ] Test middleware and error handling

### Priority 2: Frontend Testing
- [ ] Set up React Testing Library
- [ ] Add component unit tests
- [ ] Add integration tests for user flows

### Priority 3: Heimdall Integration
- [ ] Test zero-knowledge proof generation
- [ ] Validate proof verification logic
- [ ] Test credential management

## 🤝 Contributing

When adding new tests:
1. Follow the existing patterns and conventions
2. Ensure all tests pass before committing
3. Update this README with new coverage information
4. Add appropriate documentation for complex test scenarios

## 📝 Notes

- All tests use Jest as the testing framework
- MongoDB Memory Server provides isolated database testing
- Mocks are used extensively to avoid external dependencies
- Test data is consistent and reusable across test files
- Performance is optimized for fast feedback during development 