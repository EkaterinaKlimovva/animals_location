import type { Request } from 'express';
import type { 
  Account, 
  Animal, 
  AnimalOnType, 
  AnimalVisitedLocation, 
  AnimalType, 
  LocationPoint 
} from '../generated/prisma/client';

// ==============================
// Core Entity Types
// ==============================

/**
 * Safe account model - excludes sensitive fields (password, timestamps)
 * Used for API responses to protect user data
 */
export interface SafeAccount {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Legacy type alias for backward compatibility
export type SafeAccountLegacy = Omit<Account, 'password' | 'createdAt' | 'updatedAt'>;

export type AnimalWithRelations = Animal & {
  types: (AnimalOnType & {
    type: AnimalType;
  })[];
  visitedLocations: (AnimalVisitedLocation & {
    locationPoint: LocationPoint;
  })[];
  chipper: Account | null;
  chippingLocation: LocationPoint | null;
};

// ==============================
// Authentication Types
// ==============================

interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// ==============================
// Request Parameter Types
// ==============================

// Common parameter types
export type IdParams = { id: string };

// Entity-specific parameter types
export type AnimalIdParams = { id: string };
export type AnimalIdAndTypeParams = { id: string; typeId: string };
export type AnimalTypeParams = { id: string };
export type LocationPointParams = { id: string };
export type AnimalVisitedLocationParams = { animalId: string };
export type AnimalVisitedLocationWithLocationIdParams = { animalId: string; locationId: string };
export type VisitedLocationIdParams = { id: string };

// ==============================
// Query Types
// ==============================

export type ListAccountsQuery = { email?: string };
export type SearchAccountsQuery = {
  email?: string;
  firstName?: string;
  lastName?: string;
  from?: string;
  size?: string;
};

export type SearchAnimalsQuery = {
  chipperId?: string;
  chippingLocationId?: string;
  startDateTime?: string;
  endDateTime?: string;
  from?: string;
  size?: string;
};

export type ListVisitedLocationsQuery = {
  startDateTime?: string;
  endDateTime?: string;
  from?: string;
  size?: string;
};

// ==============================
// Body Types
// ==============================

export type UpdateAccountBody = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}>;

export type AddAnimalTypeBody = { typeId: number };
export type ChangeAnimalTypeBody = { oldTypeId: number; newTypeId: number };

export interface CreateVisitedLocationBody {
  visitedAt?: string;
}

export interface UpdateVisitedLocationBody {
  visitedLocationPointId: number;
  locationPointId?: number;
  visitedAt?: string;
}

// ==============================
// Express Request Types
// ==============================

// Account request types
export type ListAccountsRequest = Request<unknown, unknown, unknown, ListAccountsQuery>;
export type SearchAccountsRequest = Request<unknown, unknown, unknown, SearchAccountsQuery>;
export type GetAccountRequest = Request<IdParams>;
export type UpdateAccountRequest = Request<IdParams, unknown, UpdateAccountBody>;
export type DeleteAccountRequest = Request<IdParams>;

// Animal request types
export type GetAnimalRequest = Request<AnimalIdParams>;
export type SearchAnimalsRequest = Request<unknown, unknown, unknown, SearchAnimalsQuery>;
export type CreateAnimalRequest = Request<unknown, unknown, any>; // CreateAnimalInput from validation
export type UpdateAnimalRequest = Request<AnimalIdParams, unknown, any>; // UpdateAnimalInput from validation
export type DeleteAnimalRequest = Request<AnimalIdParams>;
export type AddAnimalTypeRequest = Request<AnimalIdParams, unknown, AddAnimalTypeBody>;
export type RemoveAnimalTypeRequest = Request<AnimalIdAndTypeParams>;
export type ChangeAnimalTypeRequest = Request<AnimalIdParams, unknown, ChangeAnimalTypeBody>;

// Animal type request types
export type GetAnimalTypeRequest = Request<AnimalTypeParams>;
export type CreateAnimalTypeRequest = Request<unknown, unknown, any>; // CreateAnimalTypeInput from validation
export type UpdateAnimalTypeRequest = Request<AnimalTypeParams, unknown, any>; // UpdateAnimalTypeInput from validation
export type DeleteAnimalTypeRequest = Request<AnimalTypeParams>;

// Location request types
export type GetLocationPointRequest = Request<LocationPointParams>;
export type CreateLocationPointRequest = Request<unknown, unknown, any>; // CreateLocationPointInput from validation
export type UpdateLocationPointRequest = Request<LocationPointParams, unknown, any>; // UpdateLocationPointInput from validation
export type DeleteLocationPointRequest = Request<LocationPointParams>;

// Visited location request types
export type ListVisitedLocationsRequest = Request<AnimalVisitedLocationParams, unknown, unknown, ListVisitedLocationsQuery>;
export type CreateVisitedLocationRequest = Request<
  AnimalVisitedLocationWithLocationIdParams,
  unknown,
  CreateVisitedLocationBody
>;
export type UpdateVisitedLocationRequest = Request<AnimalVisitedLocationParams, unknown, UpdateVisitedLocationBody>;
export type DeleteVisitedLocationRequest = Request<AnimalVisitedLocationParams & VisitedLocationIdParams>;

// Auth request types
export type RegisterRequest = Request<unknown, unknown, RegisterDto>;

// ==============================
// Pagination Types
// ==============================

export interface PaginationParams {
  from?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  from: number;
  size: number;
}

// ==============================
// API Response Types
// ==============================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
}
