import { jest } from '@jest/globals';
import {
  getAnimal,
  searchAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  addAnimalType,
  removeAnimalType,
  changeAnimalType,
} from '../../../src/controllers/animalController';
import { animalService } from '../../../src/services/animalService';
import { animalTypeRepository } from '../../../src/repositories/animalTypeRepository';
import { animalOnTypeRepository } from '../../../src/repositories/animalOnTypeRepository';
import { locationPointRepository } from '../../../src/repositories/locationPointRepository';
import { accountRepository } from '../../../src/repositories/accountRepository';
import { JestTestHelpers } from '../utils/jest-test-helpers';
import { createMockRequest, createMockResponse } from '../utils/mock-express';

// Mock dependencies
jest.mock('../../../src/services/animalService');
jest.mock('../../../src/repositories/animalTypeRepository');
jest.mock('../../../src/repositories/animalOnTypeRepository');
jest.mock('../../../src/repositories/locationPointRepository');
jest.mock('../../../src/repositories/accountRepository');

// Type assertions for mocked functions
const mockAnimalService = animalService as jest.Mocked<typeof animalService>;
const mockAnimalTypeRepository = animalTypeRepository as jest.Mocked<typeof animalTypeRepository>;
const mockAnimalOnTypeRepository = animalOnTypeRepository as jest.Mocked<typeof animalOnTypeRepository>;
const mockLocationPointRepository = locationPointRepository as jest.Mocked<typeof locationPointRepository>;
const mockAccountRepository = accountRepository as jest.Mocked<typeof accountRepository>;

describe('Animal Controller Tests', () => {
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
  });

  describe('getAnimal', () => {
    it('should return animal when valid ID is provided', async () => {
      const animalId = 1;
      const animal = JestTestHelpers.generateTestAnimal(animalId);

      (mockAnimalService.getById as any).mockResolvedValue(animal);

      const mockRequest = createMockRequest({ params: { id: animalId.toString() } });

      await (getAnimal as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData()).toBeDefined();
      expect(mockResponse.getData().id).toBe(animalId);
    });

    it('should return 404 when animal is not found', async () => {
      const animalId = 999;
      (mockAnimalService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({ params: { id: animalId.toString() } });

      await (getAnimal as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should handle invalid animal ID parameter', async () => {
      const mockRequest = createMockRequest({ params: { id: 'invalid' } });

      await (getAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle service errors during animal retrieval', async () => {
      const animalId = 1;
      (mockAnimalService.getById as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ params: { id: animalId.toString() } });

      await (getAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('searchAnimals', () => {
    it('should return animals when valid search parameters are provided', async () => {
      const searchParams = {
        startDateTime: '2023-01-01T00:00:00.000Z',
        endDateTime: '2023-12-31T23:59:59.999Z',
        chipperId: '1',
        chippingLocationId: '1',
        lifeStatus: 'ALIVE',
        gender: 'MALE',
        from: '0',
        size: '10',
      };
      const animals = [
        JestTestHelpers.generateTestAnimal(1),
        JestTestHelpers.generateTestAnimal(2),
      ];

      (mockAnimalService.search as any).mockResolvedValue(animals);

      const mockRequest = createMockRequest({ query: searchParams });

      await (searchAnimals as any)(mockRequest, mockResponse);

      expect(mockAnimalService.search).toHaveBeenCalledWith({
        ...searchParams,
        chipperId: 1,
        chippingLocationId: 1,
        from: 0,
        size: 10,
      });
      expect(mockResponse.getStatusCode()).toBe(200);
      expect(Array.isArray(mockResponse.getData())).toBe(true);
      expect(mockResponse.getData()).toHaveLength(2);
    });

    it('should handle empty search results', async () => {
      const searchParams = { from: '0', size: '10' };
      (mockAnimalService.search as any).mockResolvedValue([]);

      const mockRequest = createMockRequest({ query: searchParams });

      await (searchAnimals as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData()).toEqual([]);
    });

    it('should handle invalid search parameters', async () => {
      const mockRequest = createMockRequest({
        query: { from: '-1', size: '0' },
      });

      await (searchAnimals as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle service errors during animal search', async () => {
      (mockAnimalService.search as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ query: { from: '0', size: '10' } });

      await (searchAnimals as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('createAnimal', () => {
    it('should create animal when valid data is provided', async () => {
      const animalData = JestTestHelpers.generateTestAnimalCreateData();
      const createdAnimal = JestTestHelpers.generateTestAnimal(1, animalData);

      // Mock repository validations
      (mockAnimalTypeRepository.findById as any).mockResolvedValue({ id: 1, type: 'Dog' });
      (mockLocationPointRepository.findById as any).mockResolvedValue({ id: 1, latitude: 55.7558, longitude: 37.6173 });
      (mockAccountRepository.findById as any).mockResolvedValue({ id: 1, email: 'test@example.com' });
      (mockAnimalService.create as any).mockResolvedValue(createdAnimal);

      const mockRequest = createMockRequest({ body: animalData });

      await (createAnimal as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeRepository.findById).toHaveBeenCalledTimes(3); // 3 animal types
      expect(mockLocationPointRepository.findById).toHaveBeenCalledWith(animalData.chippingLocationId);
      expect(mockAccountRepository.findById).toHaveBeenCalledWith(animalData.chipperId);
      expect(mockAnimalService.create).toHaveBeenCalledWith(animalData);
      expect(mockResponse.getStatusCode()).toBe(201);
    });

    it('should return 404 when animal type does not exist', async () => {
      const animalData = JestTestHelpers.generateTestAnimalCreateData();
      animalData.animalTypes = [1, 999]; // One invalid type

      (mockAnimalTypeRepository.findById as any)
        .mockResolvedValueOnce({ id: 1, type: 'Dog' })
        .mockResolvedValueOnce(null); // Invalid type

      const mockRequest = createMockRequest({ body: animalData });

      await (createAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
      expect(mockResponse.getData().message).toContain('Animal type');
    });

    it('should return 404 when chipping location does not exist', async () => {
      const animalData = JestTestHelpers.generateTestAnimalCreateData();

      (mockAnimalTypeRepository.findById as any).mockResolvedValue({ id: 1, type: 'Dog' });
      (mockLocationPointRepository.findById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({ body: animalData });

      await (createAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
      expect(mockResponse.getData().message).toContain('Location point');
    });

    it('should return 404 when chipper does not exist', async () => {
      const animalData = JestTestHelpers.generateTestAnimalCreateData();

      (mockAnimalTypeRepository.findById as any).mockResolvedValue({ id: 1, type: 'Dog' });
      (mockLocationPointRepository.findById as any).mockResolvedValue({ id: 1, latitude: 55.7558, longitude: 37.6173 });
      (mockAccountRepository.findById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({ body: animalData });

      await (createAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
      expect(mockResponse.getData().message).toContain('Account');
    });

    it('should handle invalid animal data', async () => {
      const invalidAnimalData = {
        weight: -10,
        length: -5,
        height: 0,
        gender: 'INVALID',
        chipperId: -1,
        chippingLocationId: 0,
        animalTypes: [],
      };

      const mockRequest = createMockRequest({ body: invalidAnimalData });

      await (createAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('updateAnimal', () => {
    it('should update animal when valid data is provided', async () => {
      const animalId = 1;
      const updateData = {
        weight: 25.5,
        length: 60,
        height: 40,
        gender: 'FEMALE',
      };
      const existingAnimal = JestTestHelpers.generateTestAnimal(animalId);
      const updatedAnimal = { ...existingAnimal, ...updateData };

      (mockAnimalService.getById as any).mockResolvedValue(existingAnimal);
      (mockAnimalService.update as any).mockResolvedValue(updatedAnimal);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: updateData,
      });

      await (updateAnimal as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalService.update).toHaveBeenCalledWith(animalId, updateData);
      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData().weight).toBe(25.5);
    });

    it('should return 404 when animal to update is not found', async () => {
      const animalId = 999;
      const updateData = { weight: 25.5 };

      (mockAnimalService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: updateData,
      });

      await (updateAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should validate animal types when updating', async () => {
      const animalId = 1;
      const updateData = { animalTypes: [1, 2] };
      const existingAnimal = JestTestHelpers.generateTestAnimal(animalId);

      (mockAnimalService.getById as any).mockResolvedValue(existingAnimal);
      (mockAnimalTypeRepository.findById as any).mockResolvedValue({ id: 1, type: 'Dog' });
      (mockAnimalService.update as any).mockResolvedValue({ ...existingAnimal, ...updateData });

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: updateData,
      });

      await (updateAnimal as any)(mockRequest, mockResponse);

      expect(mockAnimalTypeRepository.findById).toHaveBeenCalledWith(1);
      expect(mockAnimalTypeRepository.findById).toHaveBeenCalledWith(2);
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should handle invalid animal ID', async () => {
      const mockRequest = createMockRequest({
        params: { id: 'invalid' },
        body: { weight: 25.5 },
      });

      await (updateAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('deleteAnimal', () => {
    it('should delete animal when valid ID is provided', async () => {
      const animalId = 1;
      const animal = JestTestHelpers.generateTestAnimal(animalId);

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalService.canDeleteAnimal as any).mockResolvedValue(true);
      (mockAnimalService.delete as any).mockResolvedValue(undefined);

      const mockRequest = createMockRequest({ params: { id: animalId.toString() } });

      await (deleteAnimal as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalService.canDeleteAnimal).toHaveBeenCalledWith(animalId);
      expect(mockAnimalService.delete).toHaveBeenCalledWith(animalId);
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should return 404 when animal to delete is not found', async () => {
      const animalId = 999;
      (mockAnimalService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({ params: { id: animalId.toString() } });

      await (deleteAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should return 400 when animal cannot be deleted', async () => {
      const animalId = 1;
      const animal = JestTestHelpers.generateTestAnimal(animalId);

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalService.canDeleteAnimal as any).mockResolvedValue(false);

      const mockRequest = createMockRequest({ params: { id: animalId.toString() } });

      await (deleteAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('cannot be deleted');
    });

    it('should handle invalid animal ID', async () => {
      const mockRequest = createMockRequest({ params: { id: 'invalid' } });

      await (deleteAnimal as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('addAnimalType', () => {
    it('should add animal type when valid data is provided', async () => {
      const animalId = 1;
      const typeId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const updatedAnimal = { ...animal, types: [...animal.types, { id: typeId, type: 'Cat' }] };

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any).mockResolvedValue({ id: typeId, type: 'Cat' });
      (mockAnimalService.addTypeToAnimal as any).mockResolvedValue(undefined);
      (mockAnimalService.getById as any).mockResolvedValue(updatedAnimal);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: { typeId },
      });

      await (addAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalTypeRepository.findById).toHaveBeenCalledWith(typeId);
      expect(mockAnimalService.addTypeToAnimal).toHaveBeenCalledWith(animalId, typeId);
      expect(mockResponse.getStatusCode()).toBe(201);
    });

    it('should return 404 when animal does not exist', async () => {
      const animalId = 999;
      const typeId = 2;

      (mockAnimalService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: { typeId },
      });

      await (addAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should return 404 when animal type does not exist', async () => {
      const animalId = 1;
      const typeId = 999;
      const animal = JestTestHelpers.generateTestAnimal(animalId);

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: { typeId },
      });

      await (addAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });
  });

  describe('removeAnimalType', () => {
    it('should remove animal type when valid data is provided', async () => {
      const animalId = 1;
      const typeId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const animalType = { id: typeId, type: 'Cat' };

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any).mockResolvedValue(animalType);
      (mockAnimalOnTypeRepository.findRelation as any).mockResolvedValue(true);
      (mockAnimalOnTypeRepository.findByAnimalId as any).mockResolvedValue([
        { typeId: 1 },
        { typeId: 2 },
        { typeId: 3 },
      ]); // Multiple types
      (mockAnimalService.removeTypeFromAnimal as any).mockResolvedValue(undefined);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString(), typeId: typeId.toString() },
      });

      await (removeAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalTypeRepository.findById).toHaveBeenCalledWith(typeId);
      expect(mockAnimalOnTypeRepository.findRelation).toHaveBeenCalledWith(animalId, typeId);
      expect(mockAnimalService.removeTypeFromAnimal).toHaveBeenCalledWith(animalId, typeId);
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should return 400 when trying to remove the only animal type', async () => {
      const animalId = 1;
      const typeId = 1;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const animalType = { id: typeId, type: 'Dog' };

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any).mockResolvedValue(animalType);
      (mockAnimalOnTypeRepository.findRelation as any).mockResolvedValue(true);
      (mockAnimalOnTypeRepository.findByAnimalId as any).mockResolvedValue([
        { typeId: 1 },
      ]); // Only one type

      const mockRequest = createMockRequest({
        params: { id: animalId.toString(), typeId: typeId.toString() },
      });

      await (removeAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('only animal type');
    });

    it('should return 404 when animal type is not associated with animal', async () => {
      const animalId = 1;
      const typeId = 999;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const animalType = { id: typeId, type: 'Cat' };

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any).mockResolvedValue(animalType);
      (mockAnimalOnTypeRepository.findRelation as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString(), typeId: typeId.toString() },
      });

      await (removeAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });
  });

  describe('changeAnimalType', () => {
    it('should change animal type when valid data is provided', async () => {
      const animalId = 1;
      const oldTypeId = 1;
      const newTypeId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const oldAnimalType = { id: oldTypeId, type: 'Dog' };
      const newAnimalType = { id: newTypeId, type: 'Cat' };
      const updatedAnimal = { ...animal, animalTypes: [newAnimalType] };

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any)
        .mockResolvedValueOnce(oldAnimalType)
        .mockResolvedValueOnce(newAnimalType);
      (mockAnimalOnTypeRepository.findRelation as any)
        .mockResolvedValueOnce(true) // Has old type
        .mockResolvedValueOnce(false); // Doesn't have new type
      (mockAnimalService.changeTypeOfAnimal as any).mockResolvedValue(updatedAnimal);

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: { oldTypeId, newTypeId },
      });

      await (changeAnimalType as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalTypeRepository.findById).toHaveBeenCalledWith(oldTypeId);
      expect(mockAnimalTypeRepository.findById).toHaveBeenCalledWith(newTypeId);
      expect(mockAnimalOnTypeRepository.findRelation).toHaveBeenCalledWith(animalId, oldTypeId);
      expect(mockAnimalOnTypeRepository.findRelation).toHaveBeenCalledWith(animalId, newTypeId);
      expect(mockAnimalService.changeTypeOfAnimal).toHaveBeenCalledWith(animalId, oldTypeId, newTypeId);
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should return 409 when animal already has the new type', async () => {
      const animalId = 1;
      const oldTypeId = 1;
      const newTypeId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const oldAnimalType = { id: oldTypeId, type: 'Dog' };
      const newAnimalType = { id: newTypeId, type: 'Cat' };

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any)
        .mockResolvedValueOnce(oldAnimalType)
        .mockResolvedValueOnce(newAnimalType);
      (mockAnimalOnTypeRepository.findRelation as any)
        .mockResolvedValueOnce(true) // Has old type
        .mockResolvedValueOnce(true); // Already has new type

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: { oldTypeId, newTypeId },
      });

      await (changeAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(409);
      expect(mockResponse.getData().message).toContain('already has this type');
    });

    it('should return 404 when animal does not have the old type', async () => {
      const animalId = 1;
      const oldTypeId = 999;
      const newTypeId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const oldAnimalType = { id: oldTypeId, type: 'Unknown' };
      const newAnimalType = { id: newTypeId, type: 'Cat' };

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalTypeRepository.findById as any)
        .mockResolvedValueOnce(oldAnimalType)
        .mockResolvedValueOnce(newAnimalType);
      (mockAnimalOnTypeRepository.findRelation as any).mockResolvedValue(false); // Doesn't have old type

      const mockRequest = createMockRequest({
        params: { id: animalId.toString() },
        body: { oldTypeId, newTypeId },
      });

      await (changeAnimalType as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent animal operations', async () => {
      const animalData = JestTestHelpers.generateTestAnimalCreateData();
      const createdAnimal = JestTestHelpers.generateTestAnimal(1, animalData);

      (mockAnimalTypeRepository.findById as any).mockResolvedValue({ id: 1, type: 'Dog' });
      (mockLocationPointRepository.findById as any).mockResolvedValue({ id: 1, latitude: 55.7558, longitude: 37.6173 });
      (mockAccountRepository.findById as any).mockResolvedValue({ id: 1, email: 'test@example.com' });
      (mockAnimalService.create as any).mockResolvedValue(createdAnimal);

      const promises = Array.from({ length: 10 }, () => {
        const mockRequest = createMockRequest({ body: animalData });
        const mockResponse = createMockResponse();
        return (createAnimal as any)(mockRequest, mockResponse as any).then(() => mockResponse);
      });

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.getStatusCode()).toBe(201);
      });
    });

    it('should handle large animal lists in search', async () => {
      const largeAnimalList = Array.from({ length: 1000 }, (_, index) =>
        JestTestHelpers.generateTestAnimal(index + 1),
      );

      (mockAnimalService.search as any).mockResolvedValue(largeAnimalList);

      const mockRequest = createMockRequest({ query: { from: '0', size: '1000' } });

      await (searchAnimals as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData()).toHaveLength(1000);
    });
  });
});
