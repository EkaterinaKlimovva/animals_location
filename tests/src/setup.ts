import 'dotenv/config';
import 'jest-extended';
import { jest } from '@jest/globals';
import type {} from 'jest-extended';

// Глобальные настройки для тестов
process.env.NODE_ENV = 'test';

// Расширяем глобальный объект TypeScript
declare global {
  var TEST_BASE_URL: string;
  var TEST_AUTH: { username: string; password: string };
  var TEST_BASE64_AUTH: string;
}

// Export to make it a module
export {};

// Глобальные переменные для тестов
global.TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
global.TEST_AUTH = {
  username: process.env.TEST_USERNAME || 'admin@mail.com',
  password: process.env.TEST_PASSWORD || 'admin',
};
global.TEST_BASE64_AUTH = Buffer.from(`${global.TEST_AUTH.username}:${global.TEST_AUTH.password}`).toString('base64');

// Расширенные настройки jest-extended
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Глобальные хуки для всех тестов
beforeAll(() => {
  console.log('Тестовая среда запущена');
});

afterAll(() => {
  console.log('Тестовая среда завершена');
});

beforeEach(() => {
  // Сбрасываем все моки перед каждым тестом
  jest.resetAllMocks();
});

afterEach(() => {
  // Очищаем все моки после каждого теста
  jest.clearAllMocks();

  // Дополнительная очистка, если API возвращает кэшированные данные
  if (typeof (global as any).TEST_CACHE !== 'undefined') {
    (global as any).TEST_CACHE = {};
  }
});

// Глобальные утилиты для тестов
(global as any).testHelpers = {
  // Создание тестового заголовка авторизации
  createAuthHeader: () => ({
    Authorization: `Basic ${global.TEST_BASE64_AUTH}`,
  }),

  // Валидация структуры объекта
  validateObjectStructure: (obj: any, expectedKeys: string[], testName: string) => {
    for (const key of expectedKeys) {
      if (!obj.hasOwnProperty(key)) {
        throw new Error(`${testName}: Expected object to have property "${key}"`);
      }
    }
  },

  // Ожидание выполнения условия с таймаутом
  waitForCondition: async (condition: () => boolean, timeout: number = 5000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (condition()) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },
};

// Обработчик необработанных исключений в тестах
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
