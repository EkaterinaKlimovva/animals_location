# Jest Testing Guide

This project uses Jest for unit testing with JUnit XML reporting integration. Here's how to run and work with the tests.

## Available Test Scripts

### Basic Commands

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (re-runs on file changes)
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:unit` - Run only unit tests (controller tests)
- `npm run test:integration` - Run only integration tests
- `npm run test:verbose` - Run tests with verbose output
- `npm run test:detailed` - Run tests with coverage and verbose output

### Test Reports

Coverage reports are generated in the `coverage/` directory:
- HTML report: `coverage/lcov-report/index.html`
- LCOV format: `coverage/lcov.info`
- JSON format: `coverage/coverage-final.json`

JUnit XML reports are generated in the `test-results/` directory:
- `test-results/junit.xml` - Standard JUnit format for CI/CD integration

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── src/
│   ├── controllers/           # Controller unit tests
│   │   ├── animalController.test.ts
│   │   ├── accountController.test.ts
│   │   ├── animalTypeController.test.ts
│   │   ├── locationPointController.test.ts
│   │   └── animalVisitedLocationController.test.ts
│   └── utils/
│       ├── jest-test-helpers.ts  # Test utilities and helpers
│       ├── mock-express.ts        # Express mock objects
│       └── allure-config.ts       # Test configuration utilities
```

## Test Categories

The tests are organized into the following categories:

- **Happy Path Tests** - Valid inputs, successful operations
- **Error Handling Tests** - Error scenario tests (404, 400, 403, 409)
- **Data Validation Tests** - Input validation tests
- **Security Tests** - Authentication, authorization, data exposure tests
- **Business Logic Tests** - Complex validation and business rules
- **Edge Cases** - Boundary values and special conditions

## Test Helpers

The `JestTestHelpers` class provides common utilities:

- `generateTestUser()` - Creates test user data
- `generateTestAnimalData()` - Creates test animal data
- `generateTestLocationData()` - Creates test location data
- `expectValidUser()` - Validates user response structure
- `expectValidAnimal()` - Validates animal response structure
- `expectValidLocation()` - Validates location response structure
- `expectError()` - Validates error responses
- `expectValidationError()` - Validates validation errors

### Mock Express Objects

The `mock-express.ts` provides:
- `createMockRequest()` - Creates Express request mocks
- `createMockResponse()` - Creates Express response mocks with status tracking

### Test Configuration

The `allure-config.ts` provides:
- Test metadata helpers
- Standardized categories and labels
- Test organization utilities

## Writing New Tests

### Controller Test Pattern

```typescript
import { jest } from '@jest/globals';
import { JestTestHelpers } from '../utils/jest-test-helpers';
import { createMockRequest, createMockResponse } from '../utils/mock-express';

// Mock dependencies
jest.mock('../../services/yourService');

describe('Your Controller Tests', () => {
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
  });

  describe('GET /endpoint', () => {
    it('should return data when valid request', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test' };
      mockService.getById.mockResolvedValue(mockData);

      const mockRequest = createMockRequest({ params: { id: '1' } });

      // Act
      await yourController(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.getStatusCode()).toBe(200);
      JestTestHelpers.expectValidYourStructure(mockResponse.getData());
      expect(mockService.getById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when resource not found', async () => {
      // Arrange
      mockService.getById.mockResolvedValue(null);
      const mockRequest = createMockRequest({ params: { id: '999' } });

      // Act
      await yourController(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.getStatusCode()).toBe(404);
    });
  });
});
```

### Test Categories

1. **Happy Path Tests** - Valid inputs, successful operations
2. **Validation Tests** - Invalid inputs, validation errors
3. **Error Handling Tests** - Not found, unauthorized, etc.
4. **Edge Case Tests** - Boundary values, special conditions
5. **Security Tests** - Authentication, authorization, data exposure
6. **Business Logic Tests** - Complex validation rules

## Test Organization

Tests are organized with clear naming conventions:
- `should [expected behavior] when [condition]` for happy path
- `should return [error] when [invalid condition]` for error cases
- `should handle [edge case]` for boundary conditions

## Running Tests in Development

1. Start the test runner in watch mode:
   ```bash
   npm run test:watch
   ```

2. Run tests with detailed output:
   ```bash
   npm run test:detailed
   ```

3. Run specific test file:
   ```bash
   npm test -- animalController.test.ts
   ```

4. Run tests matching a pattern:
   ```bash
   npm test -- --testNamePattern="should create"
   ```

5. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

## Coverage Goals

- Aim for >90% line coverage
- Focus on testing business logic, not just trivial cases
- Test error paths and edge cases
- Ensure all critical paths are covered

## CI/CD Integration

The JUnit XML output can be integrated with:
- **Jenkins** - Publish JUnit test results
- **GitHub Actions** - Upload test results
- **GitLab CI** - Publish test reports
- **Azure DevOps** - Publish test results

### Example GitHub Actions Integration
```yaml
- name: Run tests
  run: npm run test:detailed

- name: Upload coverage reports
  uses: codecov/codecov-action@v3

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

## Debugging Tests

1. Use `console.log` for debugging (will show in test output)
2. Run tests in verbose mode:
   ```bash
   npm test -- --verbose
   ```
3. Run specific test with debugging:
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand animalController.test.ts
   ```

## Best Practices

1. **Mock External Dependencies**: Always mock services, databases, and external APIs
2. **Test Structure**: Follow Arrange-Act-Assert pattern
3. **Descriptive Names**: Use clear, descriptive test names
4. **Independent Tests**: Each test should be independent and not rely on others
5. **Cleanup**: Use `beforeEach` and `afterEach` for setup/teardown
6. **Error Testing**: Test both success and failure scenarios
7. **Test Data**: Use helper functions to generate consistent test data
8. **Coverage**: Focus on meaningful coverage, not just percentages

## Environment Variables

Tests use these environment variables (can be overridden in `.env.test`):

- `NODE_ENV=test`
- `TEST_BASE_URL=http://localhost:3000`
- `TEST_TIMEOUT=30000`
- `TEST_MAX_RETRIES=3`

## Continuous Integration

Tests are configured to run in CI environments with:
- Automatic test execution
- Coverage reporting
- JUnit XML output for test result integration
- Test result formatting for CI systems

## Troubleshooting

### Common Issues

1. **Module Resolution Errors**: Ensure `moduleNameMapping` in jest.config.js is correct
2. **TypeScript Compilation**: Check tsconfig.json paths and include/exclude patterns
3. **Mock Issues**: Verify mock implementations match actual service interfaces
4. **Async Tests**: Use `async/await` properly and handle promises
5. **JUnit Report**: Ensure `jest-junit` is installed as a dev dependency

### Getting Help

1. Check Jest documentation: https://jestjs.io/docs/getting-started
2. Review existing test patterns in the codebase
3. Use verbose output to see detailed test execution information
4. Check coverage reports for untested code areas
