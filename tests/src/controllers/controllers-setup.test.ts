
import { JestTestHelpers } from '../utils/jest-test-helpers';
import { createMockRequest, createMockResponse } from '../utils/mock-express';

// Simple test to verify setup works
describe('Controllers Test Setup', () => {
  it('should demonstrate Jest test structure', () => {
    expect(true).toBe(true);
  });

  it('should demonstrate async test structure', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  it('should demonstrate mocking structure', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should create mock request/response objects', () => {
    const req = createMockRequest({
      params: { id: '1' },
      query: { search: 'test' },
      body: { name: 'Test' },
    });
    const res = createMockResponse();

    expect(req.params.id).toBe('1');
    expect(req.query.search).toBe('test');
    expect(req.body.name).toBe('Test');
    expect(res.getStatusCode()).toBe(200);
    expect(res.getData()).toBeDefined();
  });

  it('should use JestTestHelpers for validation', () => {
    const testData = JestTestHelpers.generateTestAnimalData();
    expect(testData).toHaveProperty('weight');
    expect(testData).toHaveProperty('length');
    expect(testData).toHaveProperty('height');
    expect(testData).toHaveProperty('gender');
  });
});
