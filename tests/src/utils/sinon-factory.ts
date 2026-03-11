import type { SinonStub } from 'sinon';
import { stub, restore, spy } from 'sinon';
import type { ApiClient } from './api-client.js';
import type { ApiResponse, TestUser, TestAnimalType, TestLocation, TestAnimal, TestVisitedLocation, TestAnimalTypeLink } from '../types/api.types.js';

/**
 * Factory для создания моков и стабов с использованием Sinon
 */
export class SinonFactory {
  private static stubs: Map<string, SinonStub> = new Map();

  /**
   * Создать stub для HttpClient
   */
  static createHttpClientStub(): Partial<ApiClient> {
    const httpClientStub = {} as Partial<ApiClient>;

    // Создаем stubs для всех методов HttpClient
    httpClientStub.register = stub().resolves();
    httpClientStub.getAccount = stub().resolves();
    httpClientStub.searchAccounts = stub().resolves();
    httpClientStub.updateAccount = stub().resolves();
    httpClientStub.deleteAccount = stub().resolves();
    httpClientStub.createAnimalType = stub().resolves();
    httpClientStub.getAnimalType = stub().resolves();
    httpClientStub.updateAnimalType = stub().resolves();
    httpClientStub.deleteAnimalType = stub().resolves();
    httpClientStub.createLocation = stub().resolves();
    httpClientStub.getLocation = stub().resolves();
    httpClientStub.updateLocation = stub().resolves();
    httpClientStub.deleteLocation = stub().resolves();
    httpClientStub.getLocations = stub().resolves();
    httpClientStub.createAnimal = stub().resolves();
    httpClientStub.getAnimal = stub().resolves();
    httpClientStub.updateAnimal = stub().resolves();
    httpClientStub.deleteAnimal = stub().resolves();
    httpClientStub.searchAnimals = stub().resolves();
    httpClientStub.addAnimalType = stub().resolves();
    httpClientStub.removeAnimalType = stub().resolves();
    httpClientStub.addVisitedLocation = stub().resolves();
    httpClientStub.getVisitedLocations = stub().resolves();
    httpClientStub.updateVisitedLocation = stub().resolves();
    httpClientStub.deleteVisitedLocation = stub().resolves();

    return httpClientStub;
  }

  /**
   * Создать успешный ответ
   */
  static createSuccessResponse<T>(data: T, status: number = 200): ApiResponse<T> {
    return {
      status,
      data,
      headers: {},
    };
  }

  /**
   * Создать ответ с ошибкой
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
   * Создать ответ валидации
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
   * Настроить stub для успешного ответа
   */
  static setupSuccessResponse<T>(
    stub: Partial<ApiClient>,
    method: keyof ApiClient,
    returnValue: ApiResponse<T>,
  ): void {
    const methodStub = stub[method] as SinonStub;
    if (methodStub) {
      methodStub.resolves(returnValue);
      this.stubs.set(method as string, methodStub);
    }
  }

  /**
   * Настроить stub для ответа с ошибкой
   */
  static setupErrorResponse(
    stub: Partial<ApiClient>,
    method: keyof ApiClient,
    errorResponse: ApiResponse<any>,
  ): void {
    const methodStub = stub[method] as SinonStub;
    if (methodStub) {
      methodStub.resolves(errorResponse);
      this.stubs.set(method as string, methodStub);
    }
  }

  /**
   * Настроить stub для исключения
   */
  static setupException<_T>(
    stub: Partial<ApiClient>,
    method: keyof ApiClient,
    error: Error,
  ): void {
    const methodStub = stub[method] as SinonStub;
    if (methodStub) {
      methodStub.rejects(error);
      this.stubs.set(method as string, methodStub);
    }
  }

  /**
   * Проверить, что метод был вызван с определенными аргументами
   */
  static verifyCalledWith(stub: Partial<ApiClient>, method: keyof ApiClient, ...args: any[]): void {
    const methodStub = stub[method] as SinonStub;
    if (methodStub) {
      methodStub.calledOnceWith(...args);
    }
  }

  /**
   * Проверить, что метод был вызван определенное количество раз
   */
  static verifyCalledTimes(stub: Partial<ApiClient>, method: keyof ApiClient, times: number): void {
    const methodStub = stub[method] as SinonStub;
    if (methodStub) {
      if (times === 0) {
        expect(methodStub.called).toBe(false);
      } else if (times === 1) {
        expect(methodStub.calledOnce).toBe(true);
      } else {
        expect(methodStub.callCount).toBe(times);
      }
    }
  }

  /**
   * Сбросить все stubs
   */
  static resetAllStubs(): void {
    restore();
    this.stubs.clear();
  }

  /**
   * Сбросить конкретный stub
   */
  static resetStub<_T>(stub: _T): void {
    if (stub && typeof stub === 'object') {
      Object.values(stub).forEach(method => {
        if (method && typeof method === 'object' && 'reset' in method) {
          (method as any).reset();
        }
      });
    }
  }

  /**
   * Создать spy для реального объекта
   */
  static createSpy<T extends object>(object: T): T {
    return spy(object) as T;
  }
}

/**
 * Утилиты для работы с моками в тестах
 */
export class SinonUtils {
  /**
   * Создать тестовый контекст с stubs
   */
  static createTestContext() {
    const httpClientStub = SinonFactory.createHttpClientStub();

    return {
      httpClientStub,
      sinonFactory: SinonFactory,

      // Удобные методы для настройки
      success: <T>(data: T, status = 200) => SinonFactory.createSuccessResponse(data, status),
      error: (status: number, message: string, error?: string) => SinonFactory.createErrorResponse(status, message, error),
      validation: (details: Array<{ code: string; path: string[]; message: string }>) => SinonFactory.createValidationError(details),

      // Удобные методы для создания данных
      user: (overrides?: Partial<TestUser>) => SinonFactory.createMockUser(overrides),
      animalType: (overrides?: Partial<TestAnimalType>) => SinonFactory.createMockAnimalType(overrides),
      location: (overrides?: Partial<TestLocation>) => SinonFactory.createMockLocation(overrides),
      animal: (overrides?: Partial<TestAnimal>) => SinonFactory.createMockAnimal(overrides),
      visitedLocation: (overrides?: Partial<TestVisitedLocation>) => SinonFactory.createMockVisitedLocation(overrides),

      // Методы верификации
      verify: {
        called: (method: keyof ApiClient, ...args: any[]) => SinonFactory.verifyCalledWith(httpClientStub, method, ...args),
        calledTimes: (method: keyof ApiClient, times: number) => SinonFactory.verifyCalledTimes(httpClientStub, method, times),
      },

      // Методы настройки
      setup: {
        success: <T>(method: keyof ApiClient, data: T, status = 200) => {
          SinonFactory.setupSuccessResponse(httpClientStub, method, SinonFactory.createSuccessResponse(data, status));
        },
        error: (method: keyof ApiClient, status: number, message: string, error?: string) => {
          SinonFactory.setupErrorResponse(httpClientStub, method, SinonFactory.createErrorResponse(status, message, error));
        },
        exception: <_T>(method: keyof ApiClient, error: Error) => {
          SinonFactory.setupException(httpClientStub, method, error);
        },
      },

      // Сброс
      reset: () => SinonFactory.resetStub(httpClientStub),
      resetAll: () => SinonFactory.resetAllStubs(),
    };
  }
}
