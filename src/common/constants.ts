// Application constants

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  INVALID_ID: 'Invalid id',
  INVALID_TYPE_ID: 'Invalid typeId',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_NAME: 'Name is required and must be less than 50 characters',
  INVALID_COORDINATES: 'Invalid coordinates',
  INVALID_PAGINATION: 'Invalid pagination params',
  INVALID_GENDER: 'Invalid gender value',
  INVALID_DATE_FORMAT: 'Date must be in ISO-8601 format',
  POSITIVE_NUMBER: 'Value must be positive',
  AT_LEAST_ONE: 'At least one item is required',
  VALIDATION_ERROR: 'Validation error',
  SERVICE_ERROR: 'Service error',
} as const;

// Entity Names
export const ENTITY_NAMES = {
  ANIMAL: 'Animal',
  ACCOUNT: 'Account',
  LOCATION_POINT: 'Location point',
  ANIMAL_TYPE: 'Animal type',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: (entity: string) => `${entity} created successfully`,
  UPDATED: (entity: string) => `${entity} updated successfully`,
  DELETED: (entity: string) => `${entity} deleted successfully`,
  FOUND: (entity: string) => `${entity} found`,
  SEARCH_SUCCESSFUL: (count: number, entity: string) => `Search successful - found ${count} ${entity}`,
} as const;

// Gender enum values
export const GENDER_VALUES = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

// Life status enum values
export const LIFE_STATUS_VALUES = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD',
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  FROM: 0,
  SIZE: 10,
  MAX_SIZE: 100,
} as const;

// Coordinate validation constants
export const COORDINATE_LIMITS = {
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
} as const;

// Authentication constants
export const AUTH_CONSTANTS = {
  BASIC_AUTH_PREFIX: 'Basic ',
  UNAUTHORIZED_MESSAGE: 'Unauthorized',
} as const;
