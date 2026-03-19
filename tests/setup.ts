import { beforeAll, afterAll, afterEach } from '@jest/globals';

// Global test configuration
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';

  // Global test constants
  (global as any).TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  (global as any).TEST_TIMEOUT = process.env.TEST_TIMEOUT || '30000';
  (global as any).TEST_MAX_RETRIES = process.env.TEST_MAX_RETRIES || '3';
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Cleanup global state
  delete (global as any).TEST_BASE_URL;
  delete (global as any).TEST_BASE64_AUTH;
  delete (global as any).TEST_TIMEOUT;
  delete (global as any).TEST_MAX_RETRIES;
});
