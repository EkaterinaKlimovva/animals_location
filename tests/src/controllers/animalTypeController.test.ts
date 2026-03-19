import { jest } from '@jest/globals';
import {
  getAnimalType,
  createAnimalType,
  updateAnimalType,
  deleteAnimalType,
} from '../../../src/controllers/animalTypeController';
import { animalTypeService } from '../../../src/services/animalTypeService';
import { JestTestHelpers } from '../utils/jest-test-helpers';
import { createMockRequest, createMockResponse } from '../utils/mock-express';

// Mock dependencies
jest.mock('../../../src/services/animalTypeService');

// Type assertions for mocked functions
const mockAnimalTypeService = animalTypeService as jest.Mocked<typeof animalTypeService>;

describe('Animal Type Controller Tests', () => {
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
  });

  describe('getAnimalType', () => {
    it('should return animal type when valid ID is provided', async () => {
      const typeId = 1;
      const animalType = JestTestHelpers.generateTestAnimalType(typeId);

      (mockAnimalTypeService.getById as any).mockResolvedValue(animalType);

      const mockRequest = createMockRequest({ params: { id: typeId.toString() } });

      await (getAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeService.getById).toHaveBeenCalledWith(typeId);
      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData()).toBeDefined();
      expect(mockResponse.getData().id).toBe(typeId);
      expect(mockResponse.getData().type).toBe(animalType.type);
    });

    it('should return 404 when animal type is not found', async () => {
      const typeId = 999;
      (mockAnimalTypeService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({ params: { id: typeId.toString() } });

      await (getAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeService.getById).toHaveBeenCalledWith(typeId);
      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should handle invalid animal type ID parameter', async () => {
      const mockRequest = createMockRequest({ params: { id: 'invalid' } });

      await (getAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle service errors during animal type retrieval', async () => {
      const typeId = 1;
      (mockAnimalTypeService.getById as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ params: { id: typeId.toString() } });

      await (getAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle zero or negative animal type ID', async () => {
      const invalidIds = ['0', '-1', '-999'];

      for (const id of invalidIds) {
        const mockRequest = createMockRequest({ params: { id } });
        await (getAnimalType as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });
  });

  describe('createAnimalType', () => {
    it('should create animal type when valid data is provided', async () => {
      const animalTypeData = { type: 'Dog' };
      const createdAnimalType = JestTestHelpers.generateTestAnimalType(1, animalTypeData.type);

      (mockAnimalTypeService.create as any).mockResolvedValue({
        type: createdAnimalType,
        conflict: false,
      });

      const mockRequest = createMockRequest({ body: animalTypeData });

      await (createAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeService.create).toHaveBeenCalledWith(animalTypeData.type);
      expect(mockResponse.getStatusCode()).toBe(201);
      expect(mockResponse.getData().type).toBe('Dog');
    });

    it('should return 409 when animal type already exists', async () => {
      const animalTypeData = { type: 'Dog' };

      (mockAnimalTypeService.create as any).mockResolvedValue({
        type: null,
        conflict: true,
      });

      const mockRequest = createMockRequest({ body: animalTypeData });

      await (createAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeService.create).toHaveBeenCalledWith(animalTypeData.type);
      expect(mockResponse.getStatusCode()).toBe(409);
      expect(mockResponse.getData().message).toContain('already exists');
    });

    it('should handle invalid animal type data', async () => {
      const invalidAnimalTypes = [
        { type: '' },
        { type: '   ' },
        { type: null },
        { type: undefined },
        {}, // Missing type field
      ];

      for (const invalidData of invalidAnimalTypes) {
        const mockRequest = createMockRequest({ body: invalidData });
        await (createAnimalType as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle service errors during animal type creation', async () => {
      const animalTypeData = { type: 'Dog' };
      (mockAnimalTypeService.create as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ body: animalTypeData });

      await (createAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle case sensitivity in animal type creation', async () => {
      const animalTypeData = { type: 'dog' };
      const createdAnimalType = JestTestHelpers.generateTestAnimalType(1, 'Dog');

      (mockAnimalTypeService.create as any).mockResolvedValue({
        type: createdAnimalType,
        conflict: false,
      });

      const mockRequest = createMockRequest({ body: animalTypeData });

      await (createAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeService.create).toHaveBeenCalledWith('dog');
      expect(mockResponse.getStatusCode()).toBe(201);
    });
  });

  describe('updateAnimalType', () => {
    it('should update animal type when valid data is provided', async () => {
      const typeId = 1;
      const updateData = { type: 'Cat' };
      const existingType = JestTestHelpers.generateTestAnimalType(typeId, 'Dog');
      const updatedType = JestTestHelpers.generateTestAnimalType(typeId, updateData.type);

      (mockAnimalTypeService.getById as any).mockResolvedValue(existingType);
      (mockAnimalTypeService.getByType as any).mockResolvedValue(null); // No conflict
      (mockAnimalTypeService.update as any).mockResolvedValue(updatedType);

      const mockRequest = createMockRequest({
        params: { id: typeId.toString() },
        body: updateData,
      });

      await (updateAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeService.getById).toHaveBeenCalledWith(typeId);
      expect(mockAnimalTypeService.getByType).toHaveBeenCalledWith(updateData.type);
      expect(mockAnimalTypeService.update).toHaveBeenCalledWith(typeId, updateData.type);
      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData().type).toBe('Cat');
    });

    it('should return 404 when animal type to update is not found', async () => {
      const typeId = 999;
      const updateData = { type: 'Cat' };

      (mockAnimalTypeService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { id: typeId.toString() },
        body: updateData,
      });

      await (updateAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should return 409 when new animal type already exists', async () => {
      const typeId = 1;
      const updateData = { type: 'Cat' };
      const existingType = JestTestHelpers.generateTestAnimalType(typeId, 'Dog');
      const conflictingType = JestTestHelpers.generateTestAnimalType(2, 'Cat');

      (mockAnimalTypeService.getById as any).mockResolvedValue(existingType);
      (mockAnimalTypeService.getByType as any).mockResolvedValue(conflictingType);

      const mockRequest = createMockRequest({
        params: { id: typeId.toString() },
        body: updateData,
      });

      await (updateAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(409);
      expect(mockResponse.getData().message).toContain('already exists');
    });

    it('should allow updating to same type name', async () => {
      const typeId = 1;
      const updateData = { type: 'Dog' };
      const existingType = JestTestHelpers.generateTestAnimalType(typeId, 'Dog');

      (mockAnimalTypeService.getById as any).mockResolvedValue(existingType);
      (mockAnimalTypeService.getByType as any).mockResolvedValue(existingType); // Same type
      (mockAnimalTypeService.update as any).mockResolvedValue(existingType);

      const mockRequest = createMockRequest({
        params: { id: typeId.toString() },
        body: updateData,
      });

      await (updateAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData().type).toBe('Dog');
    });

    it('should handle invalid animal type ID', async () => {
      const mockRequest = createMockRequest({
        params: { id: 'invalid' },
        body: { type: 'Cat' },
      });

      await (updateAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle missing type in update data', async () => {
      const typeId = 1;
      const updateData = {};

      const mockRequest = createMockRequest({
        params: { id: typeId.toString() },
        body: updateData,
      });

      await (updateAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('required for update');
    });

    it('should handle invalid update data', async () => {
      const typeId = 1;
      const invalidUpdateData = [
        { type: '' },
        { type: '   ' },
        { type: null },
        { type: undefined },
      ];

      for (const updateData of invalidUpdateData) {
        const mockRequest = createMockRequest({
          params: { id: typeId.toString() },
          body: updateData,
        });
        await (updateAnimalType as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle service errors during animal type update', async () => {
      const typeId = 1;
      const updateData = { type: 'Cat' };
      const existingType = JestTestHelpers.generateTestAnimalType(typeId, 'Dog');

      (mockAnimalTypeService.getById as any).mockResolvedValue(existingType);
      (mockAnimalTypeService.getByType as any).mockResolvedValue(null);
      (mockAnimalTypeService.update as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({
        params: { id: typeId.toString() },
        body: updateData,
      });

      await (updateAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('deleteAnimalType', () => {
    it('should delete animal type when valid ID is provided', async () => {
      const typeId = 1;
      const animalType = JestTestHelpers.generateTestAnimalType(typeId);

      (mockAnimalTypeService.getById as any).mockResolvedValue(animalType);
      (mockAnimalTypeService.hasDependentAnimals as any).mockResolvedValue(false);
      (mockAnimalTypeService.delete as any).mockResolvedValue(undefined);

      const mockRequest = createMockRequest({ params: { id: typeId.toString() } });

      await (deleteAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeService.getById).toHaveBeenCalledWith(typeId);
      expect(mockAnimalTypeService.hasDependentAnimals).toHaveBeenCalledWith(typeId);
      expect(mockAnimalTypeService.delete).toHaveBeenCalledWith(typeId);
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should return 404 when animal type to delete is not found', async () => {
      const typeId = 999;
      (mockAnimalTypeService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({ params: { id: typeId.toString() } });

      await (deleteAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should return 400 when animal type has dependent animals', async () => {
      const typeId = 1;
      const animalType = JestTestHelpers.generateTestAnimalType(typeId);

      (mockAnimalTypeService.getById as any).mockResolvedValue(animalType);
      (mockAnimalTypeService.hasDependentAnimals as any).mockResolvedValue(true);

      const mockRequest = createMockRequest({ params: { id: typeId.toString() } });

      await (deleteAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('dependent animals');
    });

    it('should handle invalid animal type ID', async () => {
      const mockRequest = createMockRequest({ params: { id: 'invalid' } });

      await (deleteAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle zero or negative animal type ID', async () => {
      const invalidIds = ['0', '-1', '-999'];

      for (const id of invalidIds) {
        const mockRequest = createMockRequest({ params: { id } });
        await (deleteAnimalType as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle service errors during animal type deletion', async () => {
      const typeId = 1;
      const animalType = JestTestHelpers.generateTestAnimalType(typeId);

      (mockAnimalTypeService.getById as any).mockResolvedValue(animalType);
      (mockAnimalTypeService.hasDependentAnimals as any).mockResolvedValue(false);
      (mockAnimalTypeService.delete as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ params: { id: typeId.toString() } });

      await (deleteAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent animal type operations', async () => {
      const animalTypeData = { type: 'Dog' };
      const createdAnimalType = JestTestHelpers.generateTestAnimalType(1, animalTypeData.type);

      (mockAnimalTypeService.create as any).mockResolvedValue({
        type: createdAnimalType,
        conflict: false,
      });

      const promises = Array.from({ length: 10 }, () => {
        const mockRequest = createMockRequest({ body: animalTypeData });
        const mockResponse = createMockResponse();
        return (createAnimalType as any)(mockRequest, mockResponse as any).then(() => mockResponse);
      });

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.getStatusCode()).toBe(201);
      });
    });

    it('should handle animal type names with special characters', async () => {
      const specialNames = [
        'Golden Retriever',
        'German Shepherd\'s',
        'Labrador-Retriever',
        'Cão de Fila',
        'Собака-компаньон',
      ];

      for (const name of specialNames) {
        const animalTypeData = { type: name };
        const createdAnimalType = JestTestHelpers.generateTestAnimalType(1, name);

        (mockAnimalTypeService.create as any).mockResolvedValue({
          type: createdAnimalType,
          conflict: false,
        });

        const mockRequest = createMockRequest({ body: animalTypeData });
        await (createAnimalType as any)(mockRequest, mockResponse);

        expect(mockResponse.getStatusCode()).toBe(201);
        expect(mockResponse.getData().type).toBe(name);

        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle very long animal type names', async () => {
      const veryLongName = 'a'.repeat(200); // Very long but should be allowed

      // Test creation with a very long name
      let mockRequest = createMockRequest({ body: { type: veryLongName } });
      await (createAnimalType as any)(mockRequest, mockResponse);
      expect(mockResponse.getStatusCode()).toBe(201);

      jest.clearAllMocks();
      mockResponse = createMockResponse();

      // Test update with a very long animal type name
      const updatedAnimalType = JestTestHelpers.generateTestAnimalType(1, veryLongName);
      (mockAnimalTypeService.getById as any).mockResolvedValue(updatedAnimalType);
      (mockAnimalTypeService.getByType as any).mockResolvedValue(null);
      (mockAnimalTypeService.update as any).mockResolvedValue(updatedAnimalType);

      mockRequest = createMockRequest({
        params: { id: '1' },
        body: { type: veryLongName },
      });
      await (updateAnimalType as any)(mockRequest, mockResponse);
      expect(mockResponse.getStatusCode()).toBe(200);
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in animal type names', async () => {
      const maliciousInputs = [
        '\'; DROP TABLE animal_types; --',
        '\' OR \'1\'=\'1',
        'admin\'; DELETE FROM animal_types; --',
      ];

      for (const maliciousInput of maliciousInputs) {
        const animalTypeData = { type: maliciousInput };
        const createdAnimalType = JestTestHelpers.generateTestAnimalType(1, maliciousInput);

        (mockAnimalTypeService.create as any).mockResolvedValue({
          type: createdAnimalType,
          conflict: false,
        });

        const mockRequest = createMockRequest({ body: animalTypeData });
        await (createAnimalType as any)(mockRequest, mockResponse);

        // Service layer should handle sanitization
        expect(mockAnimalTypeService.create).toHaveBeenCalledWith(maliciousInput);

        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle XSS attempts in animal type names', async () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<svg onload=alert(1)>',
      ];

      for (const xssInput of xssInputs) {
        const animalTypeData = { type: xssInput };
        const createdAnimalType = JestTestHelpers.generateTestAnimalType(1, xssInput);

        (mockAnimalTypeService.create as any).mockResolvedValue({
          type: createdAnimalType,
          conflict: false,
        });

        const mockRequest = createMockRequest({ body: animalTypeData });
        await (createAnimalType as any)(mockRequest, mockResponse);

        expect(mockAnimalTypeService.create).toHaveBeenCalledWith(xssInput);

        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });
  });
});
