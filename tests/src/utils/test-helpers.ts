import axios from 'axios';
import type { ApiResponse } from '../types/api.types';

/**
 * Расширенные утилиты для тестирования API
 */
export class TestHelpers {
  /**
   * Создание авторизованного клиента API
   */
  static createAuthenticatedClient(baseUrl: string) {
    return axios.create({
      baseURL: baseUrl,
      timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${(global as any).TEST_BASE64_AUTH}`,
      },
    });
  }

  /**
   * Создание неавторизованного клиента API
   */
  static createUnauthenticatedClient(baseUrl: string) {
    return axios.create({
      baseURL: baseUrl,
      timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Выполнение запроса с повторными попытками при временных ошибках
   */
  static async executeWithRetry<T>(
    operation: () => Promise<ApiResponse<T>>,
    maxRetries: number = parseInt(process.env.TEST_MAX_RETRIES || '3'),
    delay: number = 1000,
  ): Promise<ApiResponse<T>> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error: unknown) {
        const status = (error as any).status || (error as any).response?.status;

        // Если ошибка временная (сервер занят, таймаут, etc.), повторяем
        if (status >= 500 || status === 0) {
          if (attempt === maxRetries) {
            throw error;
          }
          await this.sleep(delay * attempt); // Увеличиваем задержку с каждой попыткой
          continue;
        }

        // Если ошибка не временная, сразу выбрасываем
        throw error;
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Проверка структуры ответа API
   */
  static validateApiResponseStructure(
    response: ApiResponse<any>,
    expectedKeys: string[],
    optionalKeys: string[] = [],
  ) {
    expect(response).toBeDefined();
    expect(response).toHaveProperty('status');
    expect(response.status).toBeNumber();

    if (response.status >= 200 && response.status < 300) {
      expect(response).toHaveProperty('data');
      expect(response.data).toBeDefined();

      // Проверка обязательных полей
      for (const key of expectedKeys) {
        expect(response.data).toHaveProperty(key);
      }

      // Проверка, что нет неожиданных полей (кроме optional)
      const allExpectedKeys = new Set([...expectedKeys, ...optionalKeys]);
      const responseKeys = Object.keys(response.data);
      for (const key of responseKeys) {
        if (!allExpectedKeys.has(key) && !key.startsWith('_')) {
          expect(allExpectedKeys).toContain(key);
        }
      }
    }
  }

  /**
   * Проверка пагинации в ответе
   */
  static validatePagination(response: ApiResponse<any[]>) {
    expect(response.data).toBeArray();

    // Проверка, что элементы имеют правильную структуру
    if (response.data.length > 0) {
      const firstItem = response.data[0];
      expect(firstItem).toBeObject();
      expect(firstItem).toHaveProperty('id');
      expect(firstItem.id).toBeNumber();
      expect(firstItem.id).toBePositive();
    }
  }

  /**
   * Валидация структуры пользователя
   */
  static validateUserStructure(user: any) {
    expect(user).toBeObject();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('firstName');
    expect(user).toHaveProperty('lastName');
    expect(user).toHaveProperty('email');

    expect(user.id).toBeNumber();
    expect(user.id).toBePositive();
    expect(user.firstName).toBeString();
    expect(user.firstName).not.toBeEmpty();
    expect(user.lastName).toBeString();
    expect(user.lastName).not.toBeEmpty();
    expect(user.email).toBeString();
    expect(user.email).toBeEmail();
  }

  /**
   * Валидация структуры животного
   */
  static validateAnimalStructure(animal: any) {
    expect(animal).toBeObject();
    expect(animal).toHaveProperty('id');
    expect(animal).toHaveProperty('animalTypes');
    expect(animal).toHaveProperty('weight');
    expect(animal).toHaveProperty('length');
    expect(animal).toHaveProperty('height');
    expect(animal).toHaveProperty('gender');
    expect(animal).toHaveProperty('chipperId');
    expect(animal).toHaveProperty('chippingLocationId');
    expect(animal).toHaveProperty('chippingDateTime');
    expect(animal).toHaveProperty('lifeStatus');

    expect(animal.id).toBeNumber();
    expect(animal.id).toBePositive();
    expect(animal.animalTypes).toBeArray();
    expect(animal.weight).toBeNumber();
    expect(animal.weight).toBePositive();
    expect(animal.length).toBeNumber();
    expect(animal.length).toBePositive();
    expect(animal.height).toBeNumber();
    expect(animal.height).toBePositive();
    expect(animal.gender).toBeString();
    expect(animal.gender).toBeOneOf(['MALE', 'FEMALE', 'OTHER']);
    expect(animal.chipperId).toBeNumber();
    expect(animal.chipperId).toBePositive();
    expect(animal.chippingLocationId).toBeNumber();
    expect(animal.chippingLocationId).toBePositive();
    expect(animal.chippingDateTime).toBeString();
    expect(animal.chippingDateTime).toBeISODate();
    expect(animal.lifeStatus).toBeString();
    expect(animal.lifeStatus).toBeOneOf(['ALIVE', 'DEAD']);
  }

  /**
   * Валидация структуры типа животного
   */
  static validateAnimalTypeStructure(animalType: any) {
    expect(animalType).toBeObject();
    expect(animalType).toHaveProperty('id');
    expect(animalType).toHaveProperty('type');

    expect(animalType.id).toBeNumber();
    expect(animalType.id).toBePositive();
    expect(animalType.type).toBeString();
    expect(animalType.type).not.toBeEmpty();
  }

  /**
   * Валидация структуры локации
   */
  static validateLocationStructure(location: any) {
    expect(location).toBeObject();
    expect(location).toHaveProperty('id');
    expect(location).toHaveProperty('latitude');
    expect(location).toHaveProperty('longitude');

    expect(location.id).toBeNumber();
    expect(location.id).toBePositive();
    expect(location.latitude).toBeNumber();
    expect(location.latitude).toBeWithin(-90, 90);
    expect(location.longitude).toBeNumber();
    expect(location.longitude).toBeWithin(-180, 180);
  }

  /**
   * Генерация тестовых данных
   */
  static generateTestData() {
    const timestamp = Date.now();
    return {
      user: {
        firstName: 'Test',
        lastName: `User${timestamp}`,
        email: `test.user.${timestamp}@example.com`,
        password: 'TestPassword123',
      },
      animalType: {
        type: `TestType${timestamp}`,
      },
      location: {
        latitude: 55.7558 + Math.random() * 0.01,
        longitude: 37.6173 + Math.random() * 0.01,
      },
      animal: {
        animalTypes: [], // Will be populated dynamically
        weight: 5.0 + Math.random() * 10,
        length: 0.5 + Math.random() * 0.5,
        height: 0.3 + Math.random() * 0.3,
        gender: 'MALE' as const,
        chipperId: 0, // Will be populated dynamically
        chippingLocationId: 0, // Will be populated dynamically
      },
    };
  }

  /**
   * Проверка статуса ответа с использованием расширенных матчеров
   */
  static expectStatus(actual: number, expected: number, _testName: string): void {
    expect(actual).toBe(expected);
  }

  /**
   * Проверка статуса ответа с автоматическим выводом сообщения об ошибке
   */
  static expectStatusAuto(response: ApiResponse<any>, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      const errorMessage = `Expected status ${expectedStatus}, but received ${response.status}. Error: ${response.error || 'No error message'}`;
      throw new Error(errorMessage);
    }
    expect(response.status).toBe(expectedStatus);
  }

  /**
   * Проверка наличия свойства в объекте с расширенными матчерами
   */
  static expectHasProperty(obj: any, property: string, _testName: string): void {
    expect(obj).toBeDefined();
    expect(obj).toHaveProperty(property);
  }

  /**
   * Проверка равенства значений с расширенными матчерами
   */
  static expectEqual<T>(actual: T, expected: T, _testName: string, _field?: string): void {
    expect(actual).toEqual(expected);
  }

  /**
   * Проверка наличия подстроки с расширенными матчерами
   */
  static expectContains(actual: string, expected: string, _testName: string, _field?: string): void {
    expect(actual).toBeDefined();
    expect(typeof actual).toBe('string');
    expect(actual).toContain(expected);
  }

  /**
   * Проверка типа массива с расширенными матчерами
   */
  static expectArray(arr: any, _testName: string): void {
    expect(arr).toBeDefined();
    expect(Array.isArray(arr)).toBe(true);
  }

  /**
   * Проверка длины массива с расширенными матчерами
   */
  static expectArrayLength(arr: any[], expectedLength: number, _testName: string): void {
    expect(arr).toBeDefined();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(expectedLength);
  }

  /**
   * Проверка диапазона числового значения
   */
  static expectInRange(actual: number, min: number, max: number): void {
    expect(actual).toBeDefined();
    expect(typeof actual).toBe('number');
    expect(actual >= min && actual <= max).toBe(true);
  }

  /**
   * Проверка UUID формата
   */
  static expectUUID(uuid: string): void {
    expect(uuid).toBeDefined();
    expect(typeof uuid).toBe('string');
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  }

  /**
   * Проверка email формата
   */
  static expectEmail(email: string): void {
    expect(email).toBeDefined();
    expect(typeof email).toBe('string');
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  /**
   * Проверка даты в формате ISO
   */
  static expectISODate(dateString: string): void {
    expect(dateString).toBeDefined();
    expect(typeof dateString).toBe('string');
    const date = new Date(dateString);
    expect(date.toISOString()).toEqual(dateString);
  }

  /**
   * Проверка ответа с ошибкой с расширенными матчерами
   */
  static expectError(response: ApiResponse<any>, expectedStatus: number, _testName: string): void {
    this.expectStatusAuto(response, expectedStatus);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    expect(response.data).toHaveProperty('error');
    expect(typeof response.data.error).toBe('string');
  }

  /**
   * Проверка деталей валидации с расширенными матчерами
   */
  static expectValidationError(response: ApiResponse<any>, expectedDetailsCount: number, _testName: string): void {
    this.expectStatusAuto(response, 400);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');

    // Check for both old format (error property) and new format (error with details)
    if ('error' in response.data) {
      expect(typeof response.data.error).toBe('string');
      const error = response.data.error || '';
      expect(error.includes('Validation failed') || error.includes('Error') || error.includes('validation')).toBe(true);
    }

    // Check for details array in new format
    if ('details' in response.data) {
      this.expectArray(response.data.details || [], _testName);
      this.expectArrayLength(response.data.details || [], expectedDetailsCount, _testName);
    }
  }


  /**
   * Проверка успешного создания (status 201) с расширенными матчерами
   */
  static expectCreated(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 201);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    expect(response.data).toHaveProperty('id');
    expect(typeof (response.data as any).id).toBe('number');
    expect((response.data as any).id > 0).toBe(true);
  }

  /**
   * Проверка успешного получения (status 200) с расширенными матчерами
   */
  static expectOk(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 200);
    expect(response.data).toBeDefined();
  }

  /**
   * Проверка успешного обновления (status 200) с расширенными матчерами
   */
  static expectUpdated(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 200);
    expect(response.data).toBeDefined();
  }

  /**
   * Проверка успешного удаления (status 204) с расширенными матчерами
   */
  static expectDeleted(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 204);
    // Для статуса 204 тело ответа может быть пустым или содержать пустую строку
    if (response.data !== undefined && response.data !== null) {
      expect(response.data).toBe('');
    }
  }

  /**
   * Проверка NotFound (status 404) с расширенными матчерами
   */
  static expectNotFound(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 404);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    expect(response.data).toHaveProperty('message');
    expect(typeof response.data.message).toBe('string');
    expect(response.data.message.toLowerCase()).toContain('not found');
  }

  /**
   * Проверка Unauthorized (status 401) с расширенными матчерами
   */
  static expectUnauthorized(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 401);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    expect(response.data).toHaveProperty('message');
    expect(typeof response.data.message).toBe('string');
    const message = response.data.message.toLowerCase();
    expect(message.includes('unauthorized') || message.includes('authorization required')).toBe(true);
  }

  /**
   * Проверка Forbidden (status 403)
   */
  static expectForbidden(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 403);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    expect(response.data).toHaveProperty('message');
    expect(typeof response.data.message).toBe('string');
  }

  /**
   * Проверка Conflict (status 409) с расширенными матчерами
   */
  static expectConflict(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 409);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    expect(response.data).toHaveProperty('message');
    expect(typeof response.data.message).toBe('string');
    const message = response.data.message.toLowerCase();
    expect(message.includes('conflict') || message.includes('already exists') || message.includes('unique constraint violation')).toBe(true);
  }

  /**
   * Проверка Bad Request (status 400) с расширенными матчерами
   */
  static expectBadRequest(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 400);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');

    // Check for both old format (message) and new format (error with details)
    if ('message' in response.data) {
      expect(typeof response.data.message).toBe('string');
      const message = response.data.message.toLowerCase();
      // Проверяем наличие хотя бы одного из ожидаемых сообщений об ошибках
      const hasExpectedError = message.includes('bad request') ||
                              message.includes('validation failed') ||
                              message.includes('error') ||
                              message.includes('invalid') ||
                              message.includes('cannot') ||
                              message.includes('failed') ||
                              message.includes('unique constraint') ||
                              message.includes('not found') ||
                              message.includes('invalid input') ||
                              message.includes('operation failed') ||
                              message.includes('latitude') ||
                              message.includes('longitude') ||
                              message.includes('type is required');
      expect(hasExpectedError).toBe(true);
    } else if ('error' in response.data) {
      expect(typeof response.data.error).toBe('string');
      // For new format, check that error is present
      expect(response.data.error).toBeDefined();
      // If details exist, check they are an array
      if ('details' in response.data) {
        expect(Array.isArray(response.data.details)).toBe(true);
        expect(response.data.details.length).toBeGreaterThan(0);
      }
    } else {
      throw new Error('Expected either \'message\' or \'error\' property in response data');
    }
  }

  /**
   * Проверка ответа с сообщением с расширенными матчерами
   */
  static expectMessage(response: ApiResponse<any>, expectedStatus: number, expectedMessage: string, _testName: string): void {
    this.expectStatusAuto(response, expectedStatus);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');

    // Check for both old format (message) and new format (error)
    if ('message' in response.data) {
      expect(typeof response.data.message).toBe('string');
      expect(response.data.message).toContain(expectedMessage);
    } else if ('error' in response.data) {
      expect(typeof response.data.error).toBe('string');
      expect(response.data.error).toContain(expectedMessage);
    } else {
      throw new Error('Expected either \'message\' or \'error\' property in response data');
    }
  }


  /**
   * Утилита для очистки тестовых данных
   */
  static async cleanupTestData(client: any, endpoint: string, ids: number[]) {
    for (const id of ids) {
      try {
        await client.delete(`${endpoint}/${id}`);
      } catch (error: unknown) {
        // Игнорируем ошибки при удалении (возможно, уже удалено)
        console.warn(`Failed to cleanup ${endpoint}/${id}:`, (error as Error).message);
      }
    }
  }

  /**
   * Ожидание выполнения условия
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Логирование тестовых шагов
   */
  static logStep(step: string, data?: any) {
    if (process.env.TEST_LOG_LEVEL === 'debug') {
      console.log(`[TEST STEP]: ${step}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

export default TestHelpers;
