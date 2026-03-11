export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
    '^.+\\.js$': ['babel-jest', {
      presets: ['@babel/preset-env'],
    }],
  },
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.spec.ts', '<rootDir>/**/*.test.ts', '<rootDir>/**/*.spec.ts'],
  collectCoverageFrom: [
    '../src/**/*.ts',
    '!../src/**/*.d.ts',
    '!../src/**/*.test.ts',
    '!../src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts', 'jest-extended'],
  testTimeout: 10000,
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)\\.js$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports',
      filename: 'test-report.html',
      expand: true,
      openReport: false,
    }],
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
