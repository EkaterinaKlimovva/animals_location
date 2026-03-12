import type { ApiResponse } from '@/types/api.types.js';

export class ValidationHelpers {
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
   * Проверка успешного создания (status 201) с расширенными матчерами
   */
  static expectCreated<T>(response: ApiResponse<T>, _testName: string): void {
    this.expectStatusAuto(response, 201);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    // Проверяем наличие id, но не требуем его обязательности для всех типов данных
    if (response.data && typeof response.data === 'object' && 'id' in response.data) {
      expect(typeof (response.data as any).id).toBe('number');
      expect((response.data as any).id > 0).toBe(true);
    }
    // Проверяем наличие role, но не требуем его обязательности
    if (response.data && typeof response.data === 'object' && 'role' in response.data) {
      expect(typeof (response.data as any).role).toBe('string');
    }
    // Проверяем наличие type, но не требуем его обязательности
    if (response.data && typeof response.data === 'object' && 'type' in response.data) {
      expect(typeof (response.data as any).type).toBe('string');
    }
  }

  /**
   * Проверка успешного получения (status 200) с расширенными матчерами
   */
  static expectOk<T>(response: ApiResponse<T>, _testName: string): void {
    this.expectStatusAuto(response, 200);
    expect(response.data).toBeDefined();
  }

  /**
   * Проверка успешного обновления (status 200) с расширенными матчерами
   */
  static expectUpdated<T>(response: ApiResponse<T>, _testName: string): void {
    this.expectStatusAuto(response, 200);
    expect(response.data).toBeDefined();
  }

  /**
   * Проверка успешного удаления (status 204) с расширенными матчерами
   */
  static expectDeleted(response: ApiResponse<void>, _testName: string): void {
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
   * Проверка Conflict (status 409) с расширенными матчерами
   */
  static expectConflict(response: ApiResponse<any>, _testName: string): void {
    this.expectStatusAuto(response, 409);
    expect(response.data).toBeDefined();
    expect(typeof response.data).toBe('object');
    expect(response.data).toHaveProperty('message');
    expect(typeof response.data.message).toBe('string');
    const message = response.data.message.toLowerCase();
    expect(message.includes('conflict') || message.includes('already exists')).toBe(true);
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
                              message.includes('longitude');
      expect(hasExpectedError).toBe(true);
    } else if ('error' in response.data && 'details' in response.data) {
      expect(typeof response.data.error).toBe('string');
      expect(Array.isArray(response.data.details)).toBe(true);
      // For new format, just check that error is present and details is array
      expect(response.data.error).toBeDefined();
      expect(response.data.details.length).toBeGreaterThan(0);
    } else {
      throw new Error('Expected either \'message\' or \'error\' property in response data');
    }
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
        animalTypes: [1],
        weight: 5.0 + Math.random() * 10,
        length: 0.5 + Math.random() * 0.5,
        height: 0.3 + Math.random() * 0.3,
        gender: 'MALE' as const,
        chipperId: 1,
        chippingLocationId: 1,
      },
    };
  }

  /**
   * Ожидание для асинхронных операций
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
