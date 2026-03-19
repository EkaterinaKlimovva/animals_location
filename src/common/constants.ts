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

// Authentication constants
export const AUTH_CONSTANTS = {
  SALT_ROUNDS: 10,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  LOCATION_POINT_COORDINATES_EXIST: 'Location point with these coordinates already exists',
  LOCATION_POINT_NOT_FOUND: 'Location point not found',
  CANNOT_ADD_VISITED_LOCATION_TO_DEAD_ANIMAL: 'Cannot add visited location to a dead animal',
  CANNOT_SET_CHIPPING_LOCATION_ID_TO_FIRST_VISITED_LOCATION: 'Cannot set chippingLocationId to the first visited location',
  ANIMAL_ALREADY_HAS_TYPE: 'Animal already has this type',
  ANIMAL_DOES_NOT_HAVE_TYPE: (typeId: number) => `Animal does not have type ${typeId}`,
  ANIMAL_ALREADY_HAS_TYPE_ID: (typeId: number) => `Animal already has type ${typeId}`,
  CANNOT_UPDATE_FIRST_VISITED_LOCATION_TO_CHIPPING_LOCATION: 'Cannot update first visited location to chipping location',
  NEW_LOCATION_POINT_MATCHES_ADJACENT_VISITED_LOCATION: 'New location point matches adjacent visited location',
  ANIMALS_WITH_IDS_NOT_FOUND: (invalidIds: number[]) => `Animals with IDs [${invalidIds.join(', ')}] not found`,
  CANNOT_DELETE_ANIMAL_TYPE_HAS_DEPENDENT_ANIMALS: 'Cannot delete animal type: it has dependent animals',
  ANIMAL_TYPE_ALREADY_EXISTS: 'Animal type already exists',
  TYPE_REQUIRED_FOR_UPDATE: 'Type is required for update',
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

// Controller prefix constants for logging and error handling
export const CONTROLLER_PREFIXES = {
  ACCOUNT: '[ACCOUNT_CONTROLLER]',
  ANIMAL: '[ANIMAL_CONTROLLER]',
  ANIMAL_TYPE: '[ANIMAL_TYPE_CONTROLLER]',
  LOCATION_POINT: '[LOCATION_POINT_CONTROLLER]',
  AUTH: '[AUTH_CONTROLLER]',
} as const;
