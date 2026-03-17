export enum ERROR_CODES {
  // Entity not found errors
  ANIMAL_NOT_FOUND = 'ANIMAL_NOT_FOUND',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  ANIMAL_TYPE_NOT_FOUND = 'ANIMAL_TYPE_NOT_FOUND',
  LOCATION_POINT_NOT_FOUND = 'LOCATION_POINT_NOT_FOUND',
  VISITED_LOCATION_NOT_FOUND = 'VISITED_LOCATION_NOT_FOUND',
  NOT_FOUND = 'NOT_FOUND',
  
  // Validation errors
  INVALID_ANIMAL_ID = 'INVALID_ANIMAL_ID',
  INVALID_ACCOUNT_ID = 'INVALID_ACCOUNT_ID',
  INVALID_TYPE_ID = 'INVALID_TYPE_ID',
  INVALID_LOCATION_ID = 'INVALID_LOCATION_ID',
  INVALID_DATE_TIME = 'INVALID_DATE_TIME',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Business logic errors
  ANIMAL_CANNOT_BE_DELETED = 'ANIMAL_CANNOT_BE_DELETED',
  CANNOT_REMOVE_ONLY_ANIMAL_TYPE = 'CANNOT_REMOVE_ONLY_ANIMAL_TYPE',
  ANIMAL_ALREADY_HAS_TYPE = 'ANIMAL_ALREADY_HAS_TYPE',
  FIRST_VISITED_LOCATION_DELETED = 'FIRST_VISITED_LOCATION_DELETED',
  ACCOUNT_HAS_DEPENDENT_ANIMALS = 'ACCOUNT_HAS_DEPENDENT_ANIMALS',
  
  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Conflict errors
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // General errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export interface ErrorDetails {
  code: ERROR_CODES;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: ERROR_CODES;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: ERROR_CODES, message?: string, statusCode?: number, details?: Record<string, unknown>) {
    super(message || '');
    
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode || this.getDefaultStatusCode(code);
    this.details = details;
    
    // Set message if not provided
    if (!message) {
      this.message = this.getDefaultMessage(code);
    }
  }

  private getDefaultMessage(code: ERROR_CODES): string {
    switch (code) {
      case ERROR_CODES.ANIMAL_NOT_FOUND:
        return 'Animal not found';
      case ERROR_CODES.ACCOUNT_NOT_FOUND:
        return 'Account not found';
      case ERROR_CODES.ANIMAL_TYPE_NOT_FOUND:
        return 'Animal type not found';
      case ERROR_CODES.LOCATION_POINT_NOT_FOUND:
        return 'Location point not found';
      case ERROR_CODES.VISITED_LOCATION_NOT_FOUND:
        return 'Visited location not found';
      case ERROR_CODES.NOT_FOUND:
        return 'Resource not found';
      case ERROR_CODES.INVALID_ANIMAL_ID:
        return 'Invalid animal ID';
      case ERROR_CODES.INVALID_ACCOUNT_ID:
        return 'Invalid account ID';
      case ERROR_CODES.INVALID_TYPE_ID:
        return 'Invalid type ID';
      case ERROR_CODES.INVALID_LOCATION_ID:
        return 'Invalid location ID';
      case ERROR_CODES.INVALID_DATE_TIME:
        return 'Invalid date/time format';
      case ERROR_CODES.VALIDATION_ERROR:
        return 'Validation failed';
      case ERROR_CODES.ANIMAL_CANNOT_BE_DELETED:
        return 'Animal cannot be deleted: it has left the chipping location and has other visited points';
      case ERROR_CODES.CANNOT_REMOVE_ONLY_ANIMAL_TYPE:
        return 'Cannot remove the only animal type';
      case ERROR_CODES.ANIMAL_ALREADY_HAS_TYPE:
        return 'Animal already has this type';
      case ERROR_CODES.FIRST_VISITED_LOCATION_DELETED:
        return 'Cannot delete first visited location when it is also the chipping location';
      case ERROR_CODES.ACCOUNT_HAS_DEPENDENT_ANIMALS:
        return 'Cannot delete account: it has dependent animals';
      case ERROR_CODES.UNAUTHORIZED:
        return 'Unauthorized access';
      case ERROR_CODES.FORBIDDEN:
        return 'Access forbidden';
      case ERROR_CODES.INVALID_TOKEN:
        return 'Invalid or expired token';
      case ERROR_CODES.CONFLICT:
        return 'Resource conflict';
      case ERROR_CODES.DUPLICATE_ENTRY:
        return 'Duplicate entry';
      case ERROR_CODES.INTERNAL_SERVER_ERROR:
        return 'Internal server error';
      case ERROR_CODES.DATABASE_ERROR:
        return 'Database operation failed';
      default:
        return 'Unknown error occurred';
    }
  }

  private getDefaultStatusCode(code: ERROR_CODES): number {
    switch (code) {
      case ERROR_CODES.ANIMAL_NOT_FOUND:
      case ERROR_CODES.ACCOUNT_NOT_FOUND:
      case ERROR_CODES.ANIMAL_TYPE_NOT_FOUND:
      case ERROR_CODES.LOCATION_POINT_NOT_FOUND:
      case ERROR_CODES.VISITED_LOCATION_NOT_FOUND:
      case ERROR_CODES.NOT_FOUND:
        return 404;
      case ERROR_CODES.INVALID_ANIMAL_ID:
      case ERROR_CODES.INVALID_ACCOUNT_ID:
      case ERROR_CODES.INVALID_TYPE_ID:
      case ERROR_CODES.INVALID_LOCATION_ID:
      case ERROR_CODES.INVALID_DATE_TIME:
      case ERROR_CODES.VALIDATION_ERROR:
      case ERROR_CODES.ANIMAL_CANNOT_BE_DELETED:
      case ERROR_CODES.CANNOT_REMOVE_ONLY_ANIMAL_TYPE:
      case ERROR_CODES.FIRST_VISITED_LOCATION_DELETED:
      case ERROR_CODES.ACCOUNT_HAS_DEPENDENT_ANIMALS:
        return 400;
      case ERROR_CODES.UNAUTHORIZED:
      case ERROR_CODES.INVALID_TOKEN:
        return 401;
      case ERROR_CODES.FORBIDDEN:
        return 403;
      case ERROR_CODES.CONFLICT:
      case ERROR_CODES.DUPLICATE_ENTRY:
      case ERROR_CODES.ANIMAL_ALREADY_HAS_TYPE:
        return 409;
      case ERROR_CODES.INTERNAL_SERVER_ERROR:
      case ERROR_CODES.DATABASE_ERROR:
        return 500;
      default:
        return 500;
    }
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Helper functions to create specific errors
export const createNotFoundError = (entity: string, id?: number): AppError => {
  const code = getNotFoundErrorCode(entity);
  return new AppError(code, id ? `${entity} with id ${id} not found` : undefined);
};

export const createValidationError = (field: string, message?: string): AppError => {
  const code = getValidationErrorCode(field);
  return new AppError(code, message || `Invalid ${field}`);
};

export const createBusinessLogicError = (code: ERROR_CODES, message?: string): AppError => {
  return new AppError(code, message);
};

export const createAuthError = (code: ERROR_CODES.UNAUTHORIZED | ERROR_CODES.FORBIDDEN | ERROR_CODES.INVALID_TOKEN, message?: string): AppError => {
  return new AppError(code, message);
};

// Helper functions to map entity names to error codes
function getNotFoundErrorCode(entity: string): ERROR_CODES {
  switch (entity.toLowerCase()) {
    case 'animal':
      return ERROR_CODES.ANIMAL_NOT_FOUND;
    case 'account':
      return ERROR_CODES.ACCOUNT_NOT_FOUND;
    case 'animaltype':
    case 'animal type':
      return ERROR_CODES.ANIMAL_TYPE_NOT_FOUND;
    case 'locationpoint':
    case 'location point':
      return ERROR_CODES.LOCATION_POINT_NOT_FOUND;
    case 'visitedlocation':
    case 'visited location':
      return ERROR_CODES.VISITED_LOCATION_NOT_FOUND;
    default:
      return ERROR_CODES.NOT_FOUND;
  }
}

function getValidationErrorCode(field: string): ERROR_CODES {
  switch (field.toLowerCase()) {
    case 'animalid':
    case 'animal id':
      return ERROR_CODES.INVALID_ANIMAL_ID;
    case 'accountid':
    case 'account id':
      return ERROR_CODES.INVALID_ACCOUNT_ID;
    case 'typeid':
    case 'type id':
      return ERROR_CODES.INVALID_TYPE_ID;
    case 'locationid':
    case 'location id':
      return ERROR_CODES.INVALID_LOCATION_ID;
    case 'datetime':
    case 'date time':
      return ERROR_CODES.INVALID_DATE_TIME;
    default:
      return ERROR_CODES.VALIDATION_ERROR;
  }
}
