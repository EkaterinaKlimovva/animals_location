import { jest } from '@jest/globals';
import {
  createLocationPoint,
  getLocationPoint,
} from '../../../src/controllers/locationPointController';
import { locationPointService } from '../../../src/services/locationPointService';
import { createMockRequest, createMockResponse } from '../utils/mock-express';

// Mock dependencies
jest.mock('../../../src/services/locationPointService');

// Type assertions for mocked functions
const mockLocationPointService = locationPointService as jest.Mocked<typeof locationPointService>;

describe('Location Point Controller Tests', () => {
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
  });

  describe('createLocationPoint', () => {
    it('should create location point when valid data is provided', async () => {
      const locationData = {
        latitude: 55.7558,
        longitude: 37.6173,
      };

      const createdLocation = {
        id: 1,
        ...locationData,
      };

      (mockLocationPointService.create as any).mockResolvedValue(createdLocation);

      const mockRequest = createMockRequest({ body: locationData });

      await (createLocationPoint as any)(mockRequest, mockResponse);

      expect(mockLocationPointService.create).toHaveBeenCalledWith(locationData);
      expect(mockResponse.getStatusCode()).toBe(201);
      expect(mockResponse.getData()).toBeDefined();
      expect(mockResponse.getData().id).toBe(1);
    });

    it('should handle invalid location data', async () => {
      const invalidLocationData = {
        latitude: 'invalid',
        longitude: 37.6173,
      };

      // Mock service to throw error for invalid data
      (mockLocationPointService.create as any).mockRejectedValue(new Error('Invalid coordinates'));

      const mockRequest = createMockRequest({ body: invalidLocationData });

      await (createLocationPoint as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle service errors during location creation', async () => {
      const locationData = {
        latitude: 55.7558,
        longitude: 37.6173,
      };

      (mockLocationPointService.create as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ body: locationData });

      await (createLocationPoint as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });

  describe('getLocationPoint', () => {
    it('should return location point when valid ID is provided', async () => {
      const locationId = 1;
      const location = {
        id: locationId,
        latitude: 55.7558,
        longitude: 37.6173,
      };

      (mockLocationPointService.getById as any).mockResolvedValue(location);

      const mockRequest = createMockRequest({ params: { id: locationId.toString() } });

      await (getLocationPoint as any)(mockRequest, mockResponse);

      expect(mockLocationPointService.getById).toHaveBeenCalledWith(locationId);
      expect(mockResponse.getStatusCode()).toBe(200);
      expect(mockResponse.getData()).toBeDefined();
      expect(mockResponse.getData().id).toBe(locationId);
    });

    it('should return 404 when location point is not found', async () => {
      const locationId = 999;
      (mockLocationPointService.getById as any).mockResolvedValue(null);

      const mockRequest = createMockRequest({ params: { id: locationId.toString() } });

      await (getLocationPoint as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(404);
    });

    it('should handle invalid location ID parameter', async () => {
      const mockRequest = createMockRequest({ params: { id: 'invalid' } });

      await (getLocationPoint as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });

    it('should handle service errors during location retrieval', async () => {
      const locationId = 1;
      (mockLocationPointService.getById as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ params: { id: locationId.toString() } });

      await (getLocationPoint as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
    });
  });
});
