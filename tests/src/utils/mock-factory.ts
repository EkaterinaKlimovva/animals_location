import type { SinonStub } from 'sinon';
import sinon from 'sinon';
import type { ApiClient } from './api-client.js';
import type { ApiResponse, TestUser, TestAnimalType, TestLocation, TestAnimal, TestVisitedLocation, TestAnimalTypeLink } from '@/types/api.types.js';

/**
 * Factory для создания моков HTTP клиента с использованием Sinon
 */
export class MockFactory {
  /**
   * Создать мок HttpClient с за-stуббированными методами
   */
  static createHttpClientMock(): ApiClient {
    // Создаем частичный мок - реальный объект с замененными методами
    const mock = {
      register: sinon.stub(),
      getAccount: sinon.stub(),
      searchAccounts: sinon.stub(),
      updateAccount: sinon.stub(),
      deleteAccount: sinon.stub(),
      createAnimalType: sinon.stub(),
      getAnimalType: sinon.stub(),
      updateAnimalType: sinon.stub(),
      deleteAnimalType: sinon.stub(),
      createLocation: sinon.stub(),
      getLocation: sinon.stub(),
      updateLocation: sinon.stub(),
      deleteLocation: sinon.stub(),
      getLocations: sinon.stub(),
      createAnimal: sinon.stub(),
      getAnimal: sinon.stub(),
      updateAnimal: sinon.stub(),
      deleteAnimal: sinon.stub(),
      searchAnimals: sinon.stub(),
      addAnimalType: sinon.stub(),
      removeAnimalType: sinon.stub(),
      addVisitedLocation: sinon.stub(),
      getVisitedLocations: sinon.stub(),
      updateVisitedLocation: sinon.stub(),
      deleteVisitedLocation: sinon.stub(),
    } as unknown as ApiClient;

    return mock;
  }

  /**
   * Создать мок успешного ответа
   */
  static createSuccessResponse<T>(data: T, status: number = 200): ApiResponse<T> {
    return {
      status,
      data,
      headers: {},
    };
  }

  /**
   * Создать мок ответа с ошибкой
   */
  static createErrorResponse(status: number, message: string, error?: string): ApiResponse<any> {
    return {
      status,
      data: {
        error: error || 'Error',
        message,
      },
      error: message,
    };
  }

  /**
   * Создать мок ответа валидации
   */
  static createValidationError(details: Array<{ code: string; path: string[]; message: string }>): ApiResponse<any> {
    return {
      status: 400,
      data: {
        error: 'Validation failed',
        details,
      },
      error: 'Validation failed',
    };
  }

  /**
   * Создать мок пользователя
   */
  static createMockUser(overrides?: Partial<TestUser>): TestUser {
    return {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'USER',
      ...overrides,
    };
  }

  /**
    * Создать мок типа животного
    */
  static createMockAnimalType(overrides?: Partial<TestAnimalType>): TestAnimalType {
    return {
      id: 1,
      name: 'Test Type',
      ...overrides,
    };
  }

  /**
   * Создать мок связи типа животного
   */
  static createMockAnimalTypeLink(overrides?: Partial<TestAnimalTypeLink>): TestAnimalTypeLink {
    return {
      animalId: 1,
      typeId: 1,
      type: this.createMockAnimalType(),
      ...overrides,
    };
  }

  /**
   * Создать мок локации
   */
  static createMockLocation(overrides?: Partial<TestLocation>): TestLocation {
    return {
      id: 1,
      latitude: 55.7558,
      longitude: 37.6173,
      ...overrides,
    };
  }

  /**
   * Создать мок животного
   */
  static createMockAnimal(overrides?: Partial<TestAnimal>): TestAnimal {
    return {
      id: 1,
      types: [this.createMockAnimalTypeLink()],
      weight: 5.0,
      length: 0.5,
      height: 0.3,
      gender: 'MALE',
      lifeStatus: 'ALIVE',
      chipperId: 1,
      chippingLocationId: 1,
      chippingDateTime: '2025-03-09T12:00:00.000Z',
      visitedLocations: [],
      ...overrides,
    };
  }

  /**
   * Создать мок посещенной локации
   */
  static createMockVisitedLocation(overrides?: Partial<TestVisitedLocation>): TestVisitedLocation {
    return {
      id: 1,
      animalId: 1,
      locationPointId: 1,
      visitedAt: '2025-01-01T12:00:00.000Z',
      locationPoint: this.createMockLocation(),
      ...overrides,
    };
  }

  /**
   * Настроить мок для успешного ответа
   */
  static setupSuccessResponse<T>(
    mock: ApiClient,
    method: keyof ApiClient,
    returnValue: ApiResponse<T>,
  ): void {
    (mock[method] as SinonStub).resolves(returnValue);
  }

  /**
   * Настроить мок для ответа с ошибкой
   */
  static setupErrorResponse(
    mock: ApiClient,
    method: keyof ApiClient,
    errorResponse: ApiResponse<any>,
  ): void {
    (mock[method] as SinonStub).resolves(errorResponse);
  }

  /**
   * Настроить мок для исключения
   */
  static setupException<_T>(
    mock: ApiClient,
    method: keyof ApiClient,
    error: Error,
  ): void {
    (mock[method] as SinonStub).rejects(error);
  }

  /**
   * Проверить, что метод был вызван
   */
  static verifyCalled(mock: ApiClient, method: keyof ApiClient): void {
    const stub = mock[method] as SinonStub;
    sinon.assert.calledOnce(stub);
  }

  /**
   * Проверить, что метод был вызван с определенными аргументами
   */
  static verifyCalledWith(mock: ApiClient, method: keyof ApiClient, ...args: any[]): void {
    const stub = mock[method] as SinonStub;
    sinon.assert.calledWith(stub, ...args);
  }

  /**
   * Проверить, что метод был вызван определенное количество раз
   */
  static verifyCalledTimes(mock: ApiClient, method: keyof ApiClient, times: number): void {
    const stub = mock[method] as SinonStub;
    sinon.assert.callCount(stub, times);
  }

  /**
   * Сбросить все моки
   */
  static resetAllMocks(): void {
    sinon.restore();
  }

  /**
   * Сбросить конкретный мок
   */
  static resetMock(mock: ApiClient): void {
    // Сброс всех стабов
    Object.keys(mock).forEach(key => {
      const stub = (mock as any)[key] as SinonStub;
      if (stub && typeof stub.reset === 'function') {
        stub.reset();
      }
    });
  }
}

/**
 * Утилиты для работы с моками в тестах
 */
export class MockUtils {
  /**
   * Создать тестовый контекст с моками
   */
  static createTestContext() {
    const httpClientMock = MockFactory.createHttpClientMock();

    return {
      httpClientMock,
      mockFactory: MockFactory,

      // Удобные методы для настройки
      success: <T>(data: T, status = 200) => MockFactory.createSuccessResponse(data, status),
      error: (status: number, message: string, error?: string) => MockFactory.createErrorResponse(status, message, error),
      validation: (details: Array<{ code: string; path: string[]; message: string }>) => MockFactory.createValidationError(details),

      // Методы для настройки моков
      setupSuccessResponse: <T>(method: keyof ApiClient, returnValue: ApiResponse<T>) =>
        MockFactory.setupSuccessResponse(httpClientMock, method, returnValue),
      setupErrorResponse: (method: keyof ApiClient, errorResponse: ApiResponse<any>) =>
        MockFactory.setupErrorResponse(httpClientMock, method, errorResponse),
      setupException: (method: keyof ApiClient, error: Error) =>
        MockFactory.setupException(httpClientMock, method, error),

      // Удобные методы для создания данных
      user: (overrides?: Partial<TestUser>) => MockFactory.createMockUser(overrides),
      animalType: (overrides?: Partial<TestAnimalType>) => MockFactory.createMockAnimalType(overrides),
      location: (overrides?: Partial<TestLocation>) => MockFactory.createMockLocation(overrides),
      animal: (overrides?: Partial<TestAnimal>) => MockFactory.createMockAnimal(overrides),
      visitedLocation: (overrides?: Partial<TestVisitedLocation>) => MockFactory.createMockVisitedLocation(overrides),

      // Методы верификации
      verify: {
        called: (method: keyof ApiClient, ...args: any[]) => MockFactory.verifyCalledWith(httpClientMock, method, ...args),
        calledWith: (method: keyof ApiClient, ...args: any[]) => MockFactory.verifyCalledWith(httpClientMock, method, ...args),
        calledTimes: (method: keyof ApiClient, times: number) => MockFactory.verifyCalledTimes(httpClientMock, method, times),
      },

      // Сброс
      reset: () => MockFactory.resetMock(httpClientMock),
      resetAll: () => MockFactory.resetAllMocks(),
    };
  }
}
