import { jest } from '@jest/globals';
import {
  listVisitedLocations,
  createVisitedLocation,
  updateVisitedLocation,
  deleteVisitedLocation,
} from '../../../src/controllers/animalVisitedLocationController';
import { animalVisitedLocationService } from '../../../src/services/animalVisitedLocationService';
import { animalService } from '../../../src/services/animalService';
import { JestTestHelpers } from '../utils/jest-test-helpers';
import { createMockRequest, createMockResponse } from '../utils/mock-express';

// Mock dependencies
jest.mock('../../../src/services/animalVisitedLocationService');
jest.mock('../../../src/services/animalService');

// Type assertions for mocked functions
const mockAnimalVisitedLocationService = animalVisitedLocationService as jest.Mocked<typeof animalVisitedLocationService>;
const mockAnimalService = animalService as jest.Mocked<typeof animalService>;

describe('Animal Visited Location Controller Tests', () => {
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
  });

  describe('listVisitedLocations', () => {
    it('should return visited locations when valid animal ID is provided', async () => {
      const animalId = 1;
      const visitedLocations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(2, animalId, 2),
      ];

      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(visitedLocations);

      const mockRequest = createMockRequest({ params: { animalId: animalId.toString() } });

      await (listVisitedLocations as any)(mockRequest, mockResponse);

      expect(mockAnimalVisitedLocationService.listByAnimal).toHaveBeenCalledWith(animalId);
      expect(mockResponse.getStatusCode()).toBe(200);
      expect(Array.isArray(mockResponse.getData())).toBe(true);
      expect(mockResponse.getData()).toHaveLength(2);
    });

    it('should handle empty visited locations list', async () => {
      const animalId = 1;
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue([]);

      const mockRequest = createMockRequest({ params: { animalId: animalId.toString() } });

      await (listVisitedLocations as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData()).toEqual([]);
    });

    it('should handle invalid animal ID parameter', async () => {
      const mockRequest = createMockRequest({ params: { animalId: 'invalid' } });

      await (listVisitedLocations as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle service errors during location listing', async () => {
      const animalId = 1;
      (mockAnimalVisitedLocationService.listByAnimal as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ params: { animalId: animalId.toString() } });

      await (listVisitedLocations as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle zero or negative animal ID', async () => {
      const invalidIds = ['0', '-1', '-999'];

      for (const id of invalidIds) {
        const mockRequest = createMockRequest({ params: { animalId: id } });
        await (listVisitedLocations as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });
  });

  describe('createVisitedLocation', () => {
    it('should create visited location when valid data is provided', async () => {
      const animalId = 1;
      const locationId = 2;
      const visitedAt = '2023-01-01T12:00:00.000Z';
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      (animal as any).visitedLocations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 3),
      ];
      animal.chippingLocationId = 1;
      const existingLocations = [animal.visitedLocations[0]];
      const createdLocation = JestTestHelpers.generateTestVisitedLocation(2, animalId, locationId);

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(existingLocations);
      (mockAnimalVisitedLocationService.create as any).mockResolvedValue(createdLocation);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: locationId.toString() },
        body: { visitedAt },
      });

      await (createVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalVisitedLocationService.listByAnimal).toHaveBeenCalledWith(animalId);
      expect(mockAnimalVisitedLocationService.create).toHaveBeenCalledWith({
        animalId,
        locationPointId: Number(locationId),
        visitedAt: new Date(visitedAt),
      });
      expect(mockResponse.getStatusCode()).toBe(201);
    });

    it('should return 404 when animal does not exist', async () => {
      const animalId = 999;
      const locationId = 2;

      (mockAnimalService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: locationId.toString() },
        body: {},
      });

      await (createVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
      expect(mockResponse.getData().message).toContain('Animal not found');
    });

    it('should return 400 when animal has not left chipping location', async () => {
      const animalId = 1;
      const locationId = 1; // Same as chipping location
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      (animal as any).visitedLocations = []; // No visited locations
      animal.chippingLocationId = 1; // Same as requested location

      (mockAnimalService.getById as any).mockResolvedValue(animal);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: locationId.toString() },
        body: {},
      });

      await (createVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('not left the chipping location');
    });

    it('should return 400 when new location is same as last visited', async () => {
      const animalId = 1;
      const locationId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      (animal as any).visitedLocations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 2), // Last visited is same as new
      ];
      animal.chippingLocationId = 1;
      const existingLocations = animal.visitedLocations;

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(existingLocations);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: locationId.toString() },
        body: {},
      });

      await (createVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('same as the last one');
    });

    it('should handle invalid animal ID or location ID', async () => {
      const invalidCombinations = [
        { animalId: 'invalid', locationId: '1' },
        { animalId: '1', locationId: 'invalid' },
        { animalId: '0', locationId: '1' },
        { animalId: '1', locationId: '0' },
      ];

      for (const params of invalidCombinations) {
        const mockRequest = createMockRequest({
          params,
          body: {},
        });
        await (createVisitedLocation as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle invalid visitedAt date', async () => {
      const animalId = 1;
      const locationId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      (animal as any).visitedLocations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 3),
      ];
      animal.chippingLocationId = 1;

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(animal.visitedLocations);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: locationId.toString() },
        body: { visitedAt: 'invalid-date' },
      });

      await (createVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle service errors during visited location creation', async () => {
      const animalId = 1;
      const locationId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      (animal as any).visitedLocations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 3),
      ];
      animal.chippingLocationId = 1;

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(animal.visitedLocations);
      (mockAnimalVisitedLocationService.create as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: locationId.toString() },
        body: {},
      });

      await (createVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('updateVisitedLocation', () => {
    it('should update visited location when valid data is provided', async () => {
      const animalId = 1;
      const visitedLocationPointId = 2;
      const locationPointId = 3;
      const visitedAt = '2023-01-01T12:00:00.000Z';
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      animal.chippingLocationId = 1;
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(visitedLocationPointId, animalId, 2),
        JestTestHelpers.generateTestVisitedLocation(3, animalId, 4),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);
      (mockAnimalVisitedLocationService.update as any).mockResolvedValue({
        status: 200,
        data: { ...locations[1], locationPointId, visitedAt: new Date(visitedAt) },
      });

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString() },
        body: { visitedLocationPointId, locationPointId, visitedAt },
      });

      await (updateVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalVisitedLocationService.listByAnimal).toHaveBeenCalledWith(animalId);
      expect(mockAnimalVisitedLocationService.update).toHaveBeenCalledWith(animalId, visitedLocationPointId, {
        locationPointId,
        visitedAt: new Date(visitedAt),
      });
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should return 404 when animal does not exist', async () => {
      const animalId = 999;
      const visitedLocationPointId = 2;
      const locationPointId = 3;

      (mockAnimalService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString() },
        body: { visitedLocationPointId, locationPointId },
      });

      await (updateVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
      expect(mockResponse.getData().message).toContain('Animal not found');
    });

    it('should return 404 when visited location not found', async () => {
      const animalId = 1;
      const visitedLocationPointId = 999;
      const locationPointId = 3;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(2, animalId, 2),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString() },
        body: { visitedLocationPointId, locationPointId },
      });

      await (updateVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
      expect(mockResponse.getData().message).toContain('Visited location not found');
    });

    it('should return 400 when updating first visited location to chipping location', async () => {
      const animalId = 1;
      const visitedLocationPointId = 1;
      const locationPointId = 1; // Same as chipping location
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      animal.chippingLocationId = 1;
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(visitedLocationPointId, animalId, 2),
        JestTestHelpers.generateTestVisitedLocation(2, animalId, 3),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString() },
        body: { visitedLocationPointId, locationPointId },
      });

      await (updateVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Cannot update the first visited location');
    });

    it('should return 400 when new location is same as current', async () => {
      const animalId = 1;
      const visitedLocationPointId = 2;
      const locationPointId = 2; // Same as current
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(visitedLocationPointId, animalId, locationPointId),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString() },
        body: { visitedLocationPointId, locationPointId },
      });

      await (updateVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('same as the current one');
    });

    it('should return 400 when new location is same as previous', async () => {
      const animalId = 1;
      const visitedLocationPointId = 2;
      const locationPointId = 1; // Same as previous
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, locationPointId),
        JestTestHelpers.generateTestVisitedLocation(visitedLocationPointId, animalId, 2),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString() },
        body: { visitedLocationPointId, locationPointId },
      });

      await (updateVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('same as the previous one');
    });

    it('should return 400 when new location is same as next', async () => {
      const animalId = 1;
      const visitedLocationPointId = 2;
      const locationPointId = 3; // Same as next
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(visitedLocationPointId, animalId, 2),
        JestTestHelpers.generateTestVisitedLocation(3, animalId, locationPointId),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString() },
        body: { visitedLocationPointId, locationPointId },
      });

      await (updateVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('same as the next one');
    });

    it('should handle invalid update data', async () => {
      const animalId = 1;
      const invalidData = [
        { visitedLocationPointId: 'invalid', locationPointId: 1 },
        { visitedLocationPointId: 1, locationPointId: 'invalid' },
        { visitedLocationPointId: 0, locationPointId: 1 },
        { visitedLocationPointId: 1, locationPointId: 0 },
        { visitedLocationPointId: -1, locationPointId: 1 },
        { visitedLocationPointId: 1, locationPointId: -1 },
        { visitedLocationPointId: 1, locationPointId: 1, visitedAt: 'invalid-date' },
      ];

      for (const data of invalidData) {
        const mockRequest = createMockRequest({
          params: { animalId: animalId.toString() },
          body: data,
        });
        await (updateVisitedLocation as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });
  });

  describe('deleteVisitedLocation', () => {
    it('should delete visited location when valid data is provided', async () => {
      const animalId = 1;
      const visitedPointId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(visitedPointId, animalId, 2),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);
      (mockAnimalVisitedLocationService.delete as any).mockResolvedValue({
        status: 200,
        message: 'Visited location deleted successfully',
      });

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: visitedPointId.toString() },
      });

      await (deleteVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockAnimalService.getById).toHaveBeenCalledWith(animalId);
      expect(mockAnimalVisitedLocationService.listByAnimal).toHaveBeenCalledWith(animalId);
      expect(mockAnimalVisitedLocationService.delete).toHaveBeenCalledWith(animalId, Number(visitedPointId));
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should return 404 when animal does not exist', async () => {
      const animalId = 999;
      const visitedPointId = 2;

      (mockAnimalService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: visitedPointId.toString() },
      });

      await (deleteVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
      expect(mockResponse.getData().message).toContain('Animal not found');
    });

    it('should handle cascade delete when first location is deleted and second is chipping location', async () => {
      const animalId = 1;
      const visitedPointId = 1; // First location
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      animal.chippingLocationId = 3;
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(visitedPointId, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(2, animalId, animal.chippingLocationId), // Second is chipping location
        JestTestHelpers.generateTestVisitedLocation(3, animalId, 4),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);
      (mockAnimalVisitedLocationService.delete as any)
        .mockResolvedValueOnce({ status: 200, message: 'Deleted' }) // Delete second location
        .mockResolvedValueOnce({ status: 200, message: 'Deleted' }); // Delete first location

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: visitedPointId.toString() },
      });

      await (deleteVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockAnimalVisitedLocationService.delete).toHaveBeenCalledWith(animalId, locations[1].id);
      expect(mockAnimalVisitedLocationService.delete).toHaveBeenCalledWith(animalId, Number(visitedPointId));
      expect(mockResponse.getStatusCode()).toBe(200);
    });

    it('should handle invalid animal ID or location ID', async () => {
      const invalidCombinations = [
        { animalId: 'invalid', locationId: '1' },
        { animalId: '1', locationId: 'invalid' },
        { animalId: '0', locationId: '1' },
        { animalId: '1', locationId: '0' },
      ];

      for (const params of invalidCombinations) {
        const mockRequest = createMockRequest({ params });
        await (deleteVisitedLocation as any)(mockRequest, mockResponse);
        expect(mockResponse.getStatusCode()).toBe(400);
        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle service errors during visited location deletion', async () => {
      const animalId = 1;
      const visitedPointId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      const locations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 1),
        JestTestHelpers.generateTestVisitedLocation(visitedPointId, animalId, 2),
      ];

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(locations);
      (mockAnimalVisitedLocationService.delete as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({
        params: { animalId: animalId.toString(), locationId: visitedPointId.toString() },
      });

      await (deleteVisitedLocation as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent visited location operations', async () => {
      const animalId = 1;
      const locationId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      (animal as any).visitedLocations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 3),
      ];
      animal.chippingLocationId = 1;
      const existingLocations = animal.visitedLocations;
      const createdLocation = JestTestHelpers.generateTestVisitedLocation(2, animalId, locationId);

      (mockAnimalService.getById as any).mockResolvedValue(animal);
      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(existingLocations);
      (mockAnimalVisitedLocationService.create as any).mockResolvedValue(createdLocation);

      const promises = Array.from({ length: 10 }, () => {
        const mockRequest = createMockRequest({
          params: { animalId: animalId.toString(), locationId: locationId.toString() },
          body: {},
        });
        const mockResponse = createMockResponse();
        return (createVisitedLocation as any)(mockRequest, mockResponse as any).then(() => mockResponse);
      });

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.getStatusCode()).toBe(201);
      });
    });

    it('should handle large visited location lists', async () => {
      const animalId = 1;
      const largeLocationList = Array.from({ length: 1000 }, (_, index) =>
        JestTestHelpers.generateTestVisitedLocation(index + 1, animalId, index + 2),
      );

      (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(largeLocationList);

      const mockRequest = createMockRequest({ params: { animalId: animalId.toString() } });

      await (listVisitedLocations as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData()).toHaveLength(1000);
    });

    it('should handle date edge cases', async () => {
      const animalId = 1;
      const locationId = 2;
      const animal = JestTestHelpers.generateTestAnimal(animalId);
      (animal as any).visitedLocations = [
        JestTestHelpers.generateTestVisitedLocation(1, animalId, 3),
      ];
      animal.chippingLocationId = 1;
      const existingLocations = animal.visitedLocations;

      const edgeCaseDates = [
        '2023-01-01T00:00:00.000Z', // Start of year
        '2023-12-31T23:59:59.999Z', // End of year
        '1970-01-01T00:00:00.000Z', // Unix epoch
        '2038-01-19T03:14:07.000Z', // Near 32-bit timestamp limit
      ];

      for (const visitedAt of edgeCaseDates) {
        (mockAnimalService.getById as any).mockResolvedValue(animal);
        (mockAnimalVisitedLocationService.listByAnimal as any).mockResolvedValue(existingLocations);
        (mockAnimalVisitedLocationService.create as any).mockResolvedValue(
          JestTestHelpers.generateTestVisitedLocation(2, animalId, locationId),
        );

        const mockRequest = createMockRequest({
          params: { animalId: animalId.toString(), locationId: locationId.toString() },
          body: { visitedAt },
        });
        await (createVisitedLocation as any)(mockRequest, mockResponse);

        expect(mockResponse.getStatusCode()).toBe(201);

        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });
  });
});
