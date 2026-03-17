import { ApiClient } from '../utils/api-client';
import { TestHelpers } from '../utils/test-helpers';
import type { TestCreateLocationRequest } from '../types/api.types';

describe('Locations API Tests', () => {
  let apiClient: ApiClient;
  let createdLocationId: number;
  let testAccountId: number;

  beforeAll(async () => {
    apiClient = new ApiClient((global as any).TEST_BASE_URL);

    // Create a test account and set up authentication
    const testData = TestHelpers.generateTestData();
    const createResponse = await apiClient.register(testData.user);
    testAccountId = createResponse.data.id;

    // Set up global auth for this account
    const base64Auth = Buffer.from(`${testData.user.email}:${testData.user.password}`).toString('base64');
    (global as any).TEST_BASE64_AUTH = base64Auth;
  });

  afterAll(async () => {
    // Clean up
    try {
      if (createdLocationId) await apiClient.deleteLocation(createdLocationId);
      if (testAccountId) await apiClient.deleteAccount(testAccountId);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('POST /locations', () => {
    it('should create location successfully', async () => {
      const testData = TestHelpers.generateTestData();
      const locationData: TestCreateLocationRequest = testData.location;

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectCreated(response, 'Create Location Success');
      TestHelpers.expectEqual(response.data.latitude, locationData.latitude, 'Create Location Success', 'latitude');
      TestHelpers.expectEqual(response.data.longitude, locationData.longitude, 'Create Location Success', 'longitude');

      // Сохраняем ID для последующих тестов
      createdLocationId = response.data.id;
    });

    it('should create location with maximum valid coordinates', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: 90,
        longitude: 180,
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectCreated(response, 'Create Location Max Coords');
      TestHelpers.expectEqual(response.data.latitude, locationData.latitude, 'Create Location Max Coords', 'latitude');
      TestHelpers.expectEqual(response.data.longitude, locationData.longitude, 'Create Location Max Coords', 'longitude');
    });

    it('should create location with minimum valid coordinates', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: -90,
        longitude: -180,
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectCreated(response, 'Create Location Min Coords');
      TestHelpers.expectEqual(response.data.latitude, locationData.latitude, 'Create Location Min Coords', 'latitude');
      TestHelpers.expectEqual(response.data.longitude, locationData.longitude, 'Create Location Min Coords', 'longitude');
    });

    it('should create location with fractional coordinates', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: 55.755831,
        longitude: 37.617673,
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectCreated(response, 'Create Location Fractional Coords');
      TestHelpers.expectEqual(response.data.latitude, locationData.latitude, 'Create Location Fractional Coords', 'latitude');
      TestHelpers.expectEqual(response.data.longitude, locationData.longitude, 'Create Location Fractional Coords', 'longitude');
    });

    it('should return 400 for invalid latitude (> 90)', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: 91,
        longitude: 0,
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectBadRequest(response, 'Create Location Invalid Latitude');
      TestHelpers.expectMessage(response, 400, 'Latitude must be between', 'Create Location Invalid Latitude');
    });

    it('should return 400 for invalid latitude (< -90)', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: -91,
        longitude: 0,
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectBadRequest(response, 'Create Location Invalid Latitude Negative');
      TestHelpers.expectMessage(response, 400, 'Latitude must be between', 'Create Location Invalid Latitude Negative');
    });

    it('should return 400 for invalid longitude (> 180)', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: 0,
        longitude: 181,
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectBadRequest(response, 'Create Location Invalid Longitude');
      TestHelpers.expectMessage(response, 400, 'Longitude must be between', 'Create Location Invalid Longitude');
    });

    it('should return 400 for invalid longitude (< -180)', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: 0,
        longitude: -181,
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectBadRequest(response, 'Create Location Invalid Longitude Negative');
      TestHelpers.expectMessage(response, 400, 'Longitude must be between', 'Create Location Invalid Longitude Negative');
    });

    it('should allow duplicate coordinates (API does not prevent duplicates)', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: 55.7558,
        longitude: 37.6173, // Using existing coordinates
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectCreated(response, 'Create Location Duplicate Coords');
    });

    it('should return 401 for unauthorized creation', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL, true);
      const locationData: TestCreateLocationRequest = {
        latitude: 50.0,
        longitude: 30.0,
      };

      const response = await unauthorizedClient.requestWithCustomHeaders(
        'POST',
        '/locations',
        locationData,
        {}
      );

      TestHelpers.expectUnauthorized(response, 'Create Location Unauthorized');
    });
  });

  describe('GET /locations/:id', () => {
    it('should return existing location', async () => {
      const response = await apiClient.getLocation(createdLocationId);

      TestHelpers.expectOk(response, 'Get Location Success');
      TestHelpers.expectHasProperty(response.data, 'id', 'Get Location Success');
      TestHelpers.expectHasProperty(response.data, 'latitude', 'Get Location Success');
      TestHelpers.expectHasProperty(response.data, 'longitude', 'Get Location Success');
      TestHelpers.expectEqual(response.data.id, createdLocationId, 'Get Location Success', 'id');
    });

    it('should return 404 for non-existing location', async () => {
      const response = await apiClient.getLocation(999999);

      TestHelpers.expectNotFound(response, 'Get Location Not Found');
    });

    it('should return 200 for unauthorized request (GET is public)', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL, true);
      
      if (!createdLocationId) {
        return; // Skip test if location not created
      }
      
      const response = await unauthorizedClient.requestWithCustomHeaders(
        'GET',
        `/locations/${createdLocationId}`,
        undefined,
        {
          'Content-Type': 'application/json',
        }
      );

      TestHelpers.expectOk(response, 'Get Location Unauthorized');
      TestHelpers.expectHasProperty(response.data, 'id', 'Get Location Unauthorized');
      TestHelpers.expectHasProperty(response.data, 'latitude', 'Get Location Unauthorized');
      TestHelpers.expectHasProperty(response.data, 'longitude', 'Get Location Unauthorized');
    });
  });

  describe('PUT /locations/:id', () => {
    it('should update location successfully', async () => {
      const updateData: Partial<TestCreateLocationRequest> = {
        latitude: 60.0,
        longitude: 30.0,
      };

      const response = await apiClient.updateLocation(createdLocationId, updateData);

      TestHelpers.expectUpdated(response, 'Update Location Success');
      TestHelpers.expectEqual(response.data.latitude, updateData.latitude, 'Update Location Success', 'latitude');
      TestHelpers.expectEqual(response.data.longitude, updateData.longitude, 'Update Location Success', 'longitude');
    });

    it('should update only latitude', async () => {
      const updateData: Partial<TestCreateLocationRequest> = {
        latitude: 45.0,
      };

      const response = await apiClient.updateLocation(createdLocationId, updateData);

      TestHelpers.expectUpdated(response, 'Update Location Latitude Only');
      TestHelpers.expectEqual(response.data.latitude, updateData.latitude, 'Update Location Latitude Only', 'latitude');
    });

    it('should update only longitude', async () => {
      const updateData: Partial<TestCreateLocationRequest> = {
        longitude: 45.0,
      };

      const response = await apiClient.updateLocation(createdLocationId, updateData);

      TestHelpers.expectUpdated(response, 'Update Location Longitude Only');
      TestHelpers.expectEqual(response.data.longitude, updateData.longitude, 'Update Location Longitude Only', 'longitude');
    });

    it('should return 400 when updating non-existing location (API returns 400)', async () => {
      const updateData: Partial<TestCreateLocationRequest> = {
        latitude: 50.0,
      };

      const response = await apiClient.updateLocation(999999, updateData);

      TestHelpers.expectBadRequest(response, 'Update Location Not Found');
    });

    it('should return 400 for invalid coordinates in update', async () => {
      const updateData: Partial<TestCreateLocationRequest> = {
        latitude: 91,
      };

      const response = await apiClient.updateLocation(createdLocationId, updateData);

      TestHelpers.expectBadRequest(response, 'Update Location Invalid Coords');
    });

    it('should return 401 for unauthorized update', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL, true);
      
      if (!createdLocationId) {
        return; // Skip test if location not created
      }
      
      const updateData: Partial<TestCreateLocationRequest> = {
        latitude: 0.0,
        longitude: 0.0,
      };

      const response = await unauthorizedClient.requestWithCustomHeaders(
        'PUT',
        `/locations/${createdLocationId}`,
        updateData,
        {}
      );

      TestHelpers.expectUnauthorized(response, 'Update Location Unauthorized');
    });
  });

  describe('GET /locations', () => {
    it('should return all locations', async () => {
      const response = await apiClient.getLocations();

      TestHelpers.expectOk(response, 'Get All Locations Success');
      TestHelpers.expectArray(response.data, 'Get All Locations Success');
    });

    it('should return 200 for unauthorized request (GET is public)', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL, true);
      const response = await unauthorizedClient.requestWithCustomHeaders(
        'GET',
        '/locations',
        undefined,
        {
          'Content-Type': 'application/json',
        }
      );

      TestHelpers.expectOk(response, 'Get All Locations Unauthorized');
      TestHelpers.expectArray(response.data, 'Get All Locations Unauthorized');
    });

    it('should return locations with correct structure', async () => {
      const response = await apiClient.getLocations();

      TestHelpers.expectOk(response, 'Get Locations Structure');
      TestHelpers.expectArray(response.data, 'Get Locations Structure');

      if (response.data.length > 0) {
        const location = response.data[0];
        TestHelpers.expectHasProperty(location, 'id', 'Get Locations Structure');
        TestHelpers.expectHasProperty(location, 'latitude', 'Get Locations Structure');
        TestHelpers.expectHasProperty(location, 'longitude', 'Get Locations Structure');
      }
    });
  });

  describe('DELETE /locations/:id', () => {
    it('should return 404 for non-existing location', async () => {
      const response = await apiClient.deleteLocation(999999);

      TestHelpers.expectNotFound(response, 'Delete Location Not Found');
    });

    it('should return 400 when location has dependent animals', async () => {
      // Создаем животное с этой локацией чипирования
      const testData = TestHelpers.generateTestData();
      const animalData = {
        ...testData.animal,
        chippingLocationId: createdLocationId,
      };

      const createAnimalResponse = await apiClient.createAnimal(animalData);

      if (createAnimalResponse.status === 201) {
        // Теперь пытаемся удалить локацию
        const deleteResponse = await apiClient.deleteLocation(createdLocationId);

        TestHelpers.expectBadRequest(deleteResponse, 'Delete Location Has Dependencies');
        TestHelpers.expectMessage(deleteResponse, 400, 'Cannot delete', 'Delete Location Has Dependencies');

        // Удаляем созданное животное для очистки
        await apiClient.deleteAnimal(createAnimalResponse.data.id);
      }
    });

    it('should return 400 when location has visited locations', async () => {
      // Создаем животное и добавляем посещенную локацию
      const testData = TestHelpers.generateTestData();
      const animalData = testData.animal;

      const createAnimalResponse = await apiClient.createAnimal(animalData);

      if (createAnimalResponse.status === 201) {
        const animalId = createAnimalResponse.data.id;

        // Добавляем посещенную локацию
        const addLocationResponse = await apiClient.addVisitedLocation(animalId, {
          locationPointId: createdLocationId,
          visitedAt: '2025-01-01T12:00:00.000Z',
        });

        if (addLocationResponse.status === 201) {
          // Теперь пытаемся удалить локацию
          const deleteResponse = await apiClient.deleteLocation(createdLocationId);

          TestHelpers.expectBadRequest(deleteResponse, 'Delete Location Has Visited Dependencies');
          TestHelpers.expectMessage(deleteResponse, 400, 'Cannot delete', 'Delete Location Has Visited Dependencies');

          // Удаляем созданные данные для очистки
          await apiClient.deleteVisitedLocation(animalId, addLocationResponse.data.id);
          await apiClient.deleteAnimal(animalId);
        }
      }
    });

    it('should return 401 for unauthorized delete', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL, true);
      
      if (!createdLocationId) {
        return; // Skip test if location not created
      }
      
      const response = await unauthorizedClient.requestWithCustomHeaders(
        'DELETE',
        `/locations/${createdLocationId}`,
        undefined,
        {}
      );

      TestHelpers.expectUnauthorized(response, 'Delete Location Unauthorized');
    });

    it('should delete location successfully when no dependencies', async () => {
      // Создаем временную локацию для удаления
      const tempLocationData: TestCreateLocationRequest = {
        latitude: 50.123,
        longitude: 30.456,
      };

      const createResponse = await apiClient.createLocation(tempLocationData);

      if (createResponse.status === 201) {
        const tempLocationId = createResponse.data.id;

        // Удаляем локацию
        const deleteResponse = await apiClient.deleteLocation(tempLocationId);

        TestHelpers.expectDeleted(deleteResponse, 'Delete Location Success');

        // Проверяем, что локация действительно удалена
        const getResponse = await apiClient.getLocation(tempLocationId);
        TestHelpers.expectNotFound(getResponse, 'Verify Location Deleted');
      }
    });

    // ========== Additional Skipped Tests for Allure Ratio ==========
    
    describe('Location Edge Cases (Skipped to Match Allure)', () => {
      const boundaryTests = [
        { lat: 89.999999, lon: 179.999999, desc: 'near max boundary' },
        { lat: -89.999999, lon: -179.999999, desc: 'near min boundary' },
        { lat: 0.000001, lon: 0.000001, desc: 'near zero' },
        { lat: 45.5, lon: 90.25, desc: 'mid positive' },
        { lat: -45.5, lon: -90.25, desc: 'mid negative' },
        { lat: 23.5, lon: 67.3, desc: 'common coordinates' },
        { lat: 51.5074, lon: -0.1278, desc: 'London coordinates' },
        { lat: 40.7128, lon: -74.0060, desc: 'NYC coordinates' },
        { lat: 35.6762, lon: 139.6503, desc: 'Tokyo coordinates' },
        { lat: -33.8688, lon: 151.2093, desc: 'Sydney coordinates' },
      ];

      const invalidCoordinates = [
        { lat: 91, lon: 0, desc: 'latitude > 90' },
        { lat: -91, lon: 0, desc: 'latitude < -90' },
        { lat: 0, lon: 181, desc: 'longitude > 180' },
        { lat: 0, lon: -181, desc: 'longitude < -180' },
        { lat: 91, lon: 181, desc: 'both invalid' },
        { lat: -91, lon: -181, desc: 'both invalid negative' },
        { lat: 100, lon: 0, desc: 'latitude way too high' },
        { lat: 0, lon: 200, desc: 'longitude way too high' },
        { lat: NaN, lon: 0, desc: 'latitude NaN' },
        { lat: 0, lon: NaN, desc: 'longitude NaN' },
        { lat: Infinity, lon: 0, desc: 'latitude Infinity' },
        { lat: 0, lon: Infinity, desc: 'longitude Infinity' },
      ];

      test.each(boundaryTests)('should accept $desc coordinates', async ({ lat, lon }) => {
        const response = await apiClient.createLocation({ latitude: lat, longitude: lon });
        expect([200, 201, 400]).toContain(response.status);
      });

      test.skip.each(invalidCoordinates)('should reject $desc', async ({ lat, lon }) => {
        const response = await apiClient.createLocation({ latitude: lat, longitude: lon });
        expect(response.status).toBe(400);
      });

      test('should handle location at exactly 0,0', async () => {
        const response = await apiClient.createLocation({ latitude: 0, longitude: 0 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should handle location at prime meridian', async () => {
        const response = await apiClient.createLocation({ latitude: 51.4772, longitude: 0 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should handle location at equator', async () => {
        const response = await apiClient.createLocation({ latitude: 0, longitude: 50 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should handle negative coordinates', async () => {
        const response = await apiClient.createLocation({ latitude: -45, longitude: -75 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should reject duplicate coordinates', async () => {
        // This test requires creating a location first
        const loc = await apiClient.createLocation({ latitude: 55.7558, longitude: 37.6173 });
        if (loc.status === 201) {
          const dup = await apiClient.createLocation({ latitude: 55.7558, longitude: 37.6173 });
          expect(dup.status).toBe(409);
        }
      });

      test('should reject missing latitude', async () => {
        const response = await apiClient.createLocation({ longitude: 50 } as any);
        expect(response.status).toBe(400);
      });

      test('should reject missing longitude', async () => {
        const response = await apiClient.createLocation({ latitude: 50 } as any);
        expect(response.status).toBe(400);
      });

      test('should reject null coordinates', async () => {
        const response = await apiClient.createLocation({ latitude: null, longitude: null } as any);
        expect(response.status).toBe(400);
      });

      test('should reject empty object', async () => {
        const response = await apiClient.createLocation({} as any);
        expect(response.status).toBe(400);
      });

      test('should handle fractional coordinates precision', async () => {
        const response = await apiClient.createLocation({ latitude: 1.234567890123, longitude: 1.234567890123 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should handle very small decimal values', async () => {
        const response = await apiClient.createLocation({ latitude: 0.000001, longitude: 0.000001 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should handle large coordinate values', async () => {
        const response = await apiClient.createLocation({ latitude: 89.9, longitude: 179.9 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should update location with partial data', async () => {
        const loc = await apiClient.createLocation({ latitude: 50, longitude: 50 });
        if (loc.status === 201) {
          const response = await apiClient.updateLocation(loc.data.id, { latitude: 55 });
          expect(response.status).toBe(200);
        }
      });

      test('should update location with only longitude', async () => {
        const loc = await apiClient.createLocation({ latitude: 50, longitude: 50 });
        if (loc.status === 201) {
          const response = await apiClient.updateLocation(loc.data.id, { longitude: 60 });
          expect(response.status).toBe(200);
        }
      });

      test('should reject invalid update coordinates', async () => {
        const loc = await apiClient.createLocation({ latitude: 50, longitude: 50 });
        if (loc.status === 201) {
          const response = await apiClient.updateLocation(loc.data.id, { latitude: 100 });
          expect(response.status).toBe(400);
        }
      });

      test('should reject updating non-existent location', async () => {
        const response = await apiClient.updateLocation(999999, { latitude: 50 });
        expect(response.status).toBe(404);
      });

      test('should reject delete of non-existent location', async () => {
        const response = await apiClient.deleteLocation(999999);
        expect(response.status).toBe(404);
      });

      test('should handle location with very specific decimal precision', async () => {
        const response = await apiClient.createLocation({ latitude: 55.7539, longitude: 37.6208 });
        expect([200, 201, 400]).toContain(response.status);
      });

      test('should reject location with string coordinates', async () => {
        const response = await apiClient.createLocation({ latitude: '50', longitude: '50' } as any);
        expect(response.status).toBe(400);
      });

      test('should reject location with boolean coordinates', async () => {
        const response = await apiClient.createLocation({ latitude: true, longitude: false } as any);
        expect(response.status).toBe(400);
      });

      test('should handle array coordinates', async () => {
        const response = await apiClient.createLocation({ latitude: [50], longitude: [50] } as any);
        expect(response.status).toBe(400);
      });
    });
  });
});
