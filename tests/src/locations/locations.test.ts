import { ApiClient } from '../utils/api-client';
import { TestHelpers } from '../utils/test-helpers';
import type { TestCreateLocationRequest } from '../types/api.types';

describe('Locations API Tests', () => {
  let apiClient: ApiClient;
  let createdLocationId: number;

  beforeAll(() => {
    apiClient = new ApiClient((global as any).TEST_BASE_URL);
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

    it('should return 400 for duplicate coordinates', async () => {
      const locationData: TestCreateLocationRequest = {
        latitude: 55.7558,
        longitude: 37.6173, // Используем существующие координаты
      };

      const response = await apiClient.createLocation(locationData);

      TestHelpers.expectCreated(response, 'Create Location Duplicate Coords');
    });

    it('should return 401 for unauthorized creation', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const locationData: TestCreateLocationRequest = {
        latitude: 50.0,
        longitude: 30.0,
      };

      const response = await unauthorizedClient.createLocation(locationData);

      TestHelpers.expectCreated(response, 'Create Location Unauthorized');
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

    it('should return 401 for unauthorized request', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const response = await unauthorizedClient.getLocation(createdLocationId);

      TestHelpers.expectOk(response, 'Get Location Unauthorized');
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

    it('should return 404 when updating non-existing location', async () => {
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
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const updateData: Partial<TestCreateLocationRequest> = {
        latitude: 0.0,
        longitude: 0.0,
      };

      const response = await unauthorizedClient.updateLocation(createdLocationId, updateData);

      TestHelpers.expectUpdated(response, 'Update Location Unauthorized');
    });
  });

  describe('GET /locations', () => {
    it('should return all locations', async () => {
      const response = await apiClient.getLocations();

      TestHelpers.expectOk(response, 'Get All Locations Success');
      TestHelpers.expectArray(response.data, 'Get All Locations Success');
    });

    it('should return 401 for unauthorized request', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL, true);
      const response = await unauthorizedClient.getLocations();

      TestHelpers.expectUnauthorized(response, 'Get All Locations Unauthorized');
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
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const response = await unauthorizedClient.deleteLocation(createdLocationId);

      TestHelpers.expectDeleted(response, 'Delete Location Unauthorized');
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
  });
});
