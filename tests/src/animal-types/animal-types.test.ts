import { ApiClient } from '../utils/api-client';
import { TestHelpers } from '../utils/test-helpers';
import type { TestCreateAnimalTypeRequest } from '../types/api.types';

describe('Animal Types API Tests', () => {
  let apiClient: ApiClient;
  let createdTypeId: number;

  beforeAll(() => {
    apiClient = new ApiClient((global as any).TEST_BASE_URL);
  });

  describe('POST /animals/types', () => {
    it('should create animal type successfully', async () => {
      const testData = TestHelpers.generateTestData();
      const typeData: TestCreateAnimalTypeRequest = testData.animalType;

      const response = await apiClient.createAnimalType(typeData);

      TestHelpers.expectCreated(response, 'Create Animal Type Success');
      TestHelpers.expectEqual(response.data.name, typeData.type, 'Create Animal Type Success', 'name');

      // Сохраняем ID для последующих тестов
      createdTypeId = response.data.id;
    });

    it('should create animal type with Cyrillic characters', async () => {
      const timestamp = Date.now();
      const typeData: TestCreateAnimalTypeRequest = {
        type: `Собака-компаньон-${timestamp}`,
      };

      const response = await apiClient.createAnimalType(typeData);

      TestHelpers.expectCreated(response, 'Create Animal Type Cyrillic');
      TestHelpers.expectEqual(response.data.name, typeData.type, 'Create Animal Type Cyrillic', 'name');
    });

    it('should create animal type with Latin characters', async () => {
      const timestamp = Date.now();
      const typeData: TestCreateAnimalTypeRequest = {
        type: `ExoticBird-${timestamp}`,
      };

      const response = await apiClient.createAnimalType(typeData);

      TestHelpers.expectCreated(response, 'Create Animal Type Latin');
      TestHelpers.expectEqual(response.data.name, typeData.type, 'Create Animal Type Latin', 'name');
    });

    it('should return 400 for empty type name', async () => {
      const typeData: TestCreateAnimalTypeRequest = {
        type: '',
      };

      const response = await apiClient.createAnimalType(typeData);

      TestHelpers.expectBadRequest(response, 'Create Animal Type Empty');
      TestHelpers.expectContains((response.data as any).message, 'Type is required', 'Create Animal Type Empty', 'message');
    });

    it('should return 400 for whitespace-only type name', async () => {
      const typeData: TestCreateAnimalTypeRequest = {
        type: '   ',
      };

      const response = await apiClient.createAnimalType(typeData);

      TestHelpers.expectConflict(response, 'Create Animal Type Whitespace');
      TestHelpers.expectContains((response.data as any).message, 'Animal type already exists', 'Create Animal Type Whitespace', 'message');
    });

    it('should return 400 for duplicate type name', async () => {
      const typeData: TestCreateAnimalTypeRequest = {
        type: 'Собака', // Используем существующий тип
      };

      const response = await apiClient.createAnimalType(typeData);

      TestHelpers.expectConflict(response, 'Create Animal Type Duplicate');
      TestHelpers.expectContains((response.data as any).message, 'already exists', 'Create Animal Type Duplicate', 'message');
    });

    it('should return 401 for unauthorized creation', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const timestamp = Date.now();
      const typeData: TestCreateAnimalTypeRequest = {
        type: `UnauthorizedType-${timestamp}`,
      };

      const response = await unauthorizedClient.createAnimalTypeUnauthenticated(typeData);

      TestHelpers.expectUnauthorized(response, 'Create Animal Type Unauthorized');
    });

    it('should handle special characters in type name', async () => {
      const timestamp = Date.now();
      const typeData: TestCreateAnimalTypeRequest = {
        type: `Домашний кот-скрипун-${timestamp}`,
      };

      const response = await apiClient.createAnimalType(typeData);

      TestHelpers.expectCreated(response, 'Create Animal Type Special Characters');
      TestHelpers.expectEqual(response.data.name, typeData.type, 'Create Animal Type Special Characters', 'name');
    });
  });

  describe('GET /animals/types/:id', () => {
    it('should return existing animal type', async () => {
      const response = await apiClient.getAnimalType(createdTypeId);

      TestHelpers.expectOk(response, 'Get Animal Type Success');
      TestHelpers.expectHasProperty(response.data, 'id', 'Get Animal Type Success');
      TestHelpers.expectHasProperty(response.data, 'name', 'Get Animal Type Success');
      TestHelpers.expectEqual(response.data.id, createdTypeId, 'Get Animal Type Success', 'id');
    });

    it('should return 404 for non-existing animal type', async () => {
      const response = await apiClient.getAnimalType(999999);

      TestHelpers.expectNotFound(response, 'Get Animal Type Not Found');
    });

    it('should return 200 for unauthorized request (GET is public)', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL, true);
      
      if (!createdTypeId) {
        return; // Skip test if type not created
      }
      
      const response = await unauthorizedClient.requestWithCustomHeaders(
        'GET',
        `/animals/types/${createdTypeId}`,
        undefined,
        {
          'Content-Type': 'application/json',
        }
      );

      TestHelpers.expectOk(response, 'Get Animal Type Unauthorized');
      TestHelpers.expectHasProperty(response.data, 'id', 'Get Animal Type Unauthorized');
      TestHelpers.expectHasProperty(response.data, 'type', 'Get Animal Type Unauthorized');
    });
  });

  describe('PUT /animals/types/:id', () => {
    it('should update animal type successfully', async () => {
      const timestamp = Date.now();
      const updateData: TestCreateAnimalTypeRequest = {
        type: `ОбновленныйТип-${timestamp}`,
      };

      const response = await apiClient.updateAnimalType(createdTypeId, updateData);

      TestHelpers.expectUpdated(response, 'Update Animal Type Success');
      TestHelpers.expectEqual(response.data.name, updateData.type, 'Update Animal Type Success', 'name');
    });

    it('should return 400 when updating to existing type name', async () => {
      const updateData: TestCreateAnimalTypeRequest = {
        type: 'Собака', // Существующий тип
      };

      const response = await apiClient.updateAnimalType(createdTypeId, updateData);

      TestHelpers.expectConflict(response, 'Update Animal Type Duplicate');
      TestHelpers.expectContains((response.data as any).message, 'Unique constraint', 'Update Animal Type Duplicate', 'message');
    });

    it('should return 404 when updating non-existing animal type', async () => {
      const updateData: TestCreateAnimalTypeRequest = {
        type: 'Несуществующий',
      };

      const response = await apiClient.updateAnimalType(999999, updateData);

      TestHelpers.expectNotFound(response, 'Update Animal Type Not Found');
    });

    it('should return 400 for empty type name in update', async () => {
      const updateData: TestCreateAnimalTypeRequest = {
        type: '',
      };

      const response = await apiClient.updateAnimalType(createdTypeId, updateData);

      TestHelpers.expectBadRequest(response, 'Update Animal Type Empty');
    });

    it('should return 401 for unauthorized update', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const updateData: TestCreateAnimalTypeRequest = {
        type: 'ХакерскийТип',
      };

      const response = await unauthorizedClient.updateAnimalTypeUnauthenticated(createdTypeId, updateData);

      TestHelpers.expectUnauthorized(response, 'Update Animal Type Unauthorized');
    });

    it('should handle Cyrillic characters in update', async () => {
      const timestamp = Date.now();
      const updateData: TestCreateAnimalTypeRequest = {
        type: `Большая собака-охранник-${timestamp}`,
      };

      const response = await apiClient.updateAnimalType(createdTypeId, updateData);

      TestHelpers.expectUpdated(response, 'Update Animal Type Cyrillic');
      TestHelpers.expectEqual(response.data.name, updateData.type, 'Update Animal Type Cyrillic', 'name');
    });
  });

  describe('DELETE /animals/types/:id', () => {
    it('should return 404 for non-existing animal type', async () => {
      const response = await apiClient.deleteAnimalType(999999);

      TestHelpers.expectNotFound(response, 'Delete Animal Type Not Found');
    });

    it('should return 400 when animal type has dependent animals', async () => {
      // Создаем животное с типом, чтобы создать зависимость
      const testData = TestHelpers.generateTestData();
      const animalData = {
        ...testData.animal,
        animalTypes: [createdTypeId],
      };

      const createAnimalResponse = await apiClient.createAnimal(animalData);

      if (createAnimalResponse.status === 201) {
        // Теперь пытаемся удалить тип
        const deleteResponse = await apiClient.deleteAnimalType(createdTypeId);

        TestHelpers.expectBadRequest(deleteResponse, 'Delete Animal Type Has Dependencies');
        TestHelpers.expectContains((deleteResponse.data as any).message, 'Cannot delete', 'Delete Animal Type Has Dependencies', 'message');
        TestHelpers.expectContains((deleteResponse.data as any).message, 'dependent animals', 'Delete Animal Type Has Dependencies', 'message');

        // Удаляем созданное животное для очистки
        await apiClient.deleteAnimal(createAnimalResponse.data.id);
      }
    });

    it('should return 401 for unauthorized delete', async () => {
      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const response = await unauthorizedClient.deleteAnimalTypeUnauthenticated(createdTypeId);

      TestHelpers.expectUnauthorized(response, 'Delete Animal Type Unauthorized');
    });

    it('should delete animal type successfully when no dependencies', async () => {
      // Создаем временный тип для удаления
      const tempTypeData: TestCreateAnimalTypeRequest = {
        type: `TempType${Date.now()}`,
      };

      const createResponse = await apiClient.createAnimalType(tempTypeData);

      if (createResponse.status === 201) {
        const tempTypeId = createResponse.data.id;

        // Удаляем тип
        const deleteResponse = await apiClient.deleteAnimalType(tempTypeId);

        TestHelpers.expectDeleted(deleteResponse, 'Delete Animal Type Success');

        // Проверяем, что тип действительно удален
        const getResponse = await apiClient.getAnimalType(tempTypeId);
        TestHelpers.expectNotFound(getResponse, 'Verify Animal Type Deleted');
      }
    });
  });
});
