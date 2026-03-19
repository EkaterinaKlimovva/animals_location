import type { Request } from 'express';
import type {
  CreateAnimalInput,
  UpdateAnimalInput,
  CreateAccountInput,
  CreateAccountWithAnimalsInput,
  CreateAnimalTypeInput,
  UpdateAnimalTypeInput,
  CreateLocationPointInput,
  UpdateLocationPointInput,
} from '../validation';
import type { RegisterDto } from './account';
import type {
  IdParams,
  AnimalIdParams,
  AnimalIdAndTypeParams,
  AnimalTypeParams,
  LocationPointParams,
  AnimalVisitedLocationParams,
  AnimalVisitedLocationWithLocationIdParams,
  VisitedLocationIdParams,
} from './params';
import type {
  ListAccountsQuery,
  SearchAccountsQuery,
  SearchAnimalsQuery,
  ListVisitedLocationsQuery,
} from './query';
import type {
  UpdateAccountBody,
  AddAnimalTypeBody,
  ChangeAnimalTypeBody,
  CreateVisitedLocationBody,
  UpdateVisitedLocationBody,
} from './body';

// ==============================
// Express Request Types
// ==============================

// Account request types
export type ListAccountsRequest = Request<unknown, unknown, unknown, ListAccountsQuery>;
export type SearchAccountsRequest = Request<unknown, unknown, unknown, SearchAccountsQuery>;
export type GetAccountRequest = Request<IdParams>;
export type UpdateAccountRequest = Request<IdParams, unknown, UpdateAccountBody>;
export type DeleteAccountRequest = Request<IdParams>;
export type CreateAccountRequest = Request<unknown, unknown, CreateAccountInput>;
export type CreateAccountWithAnimalsRequest = Request<unknown, unknown, CreateAccountWithAnimalsInput>;

// Animal request types
export type GetAnimalRequest = Request<AnimalIdParams>;
export type SearchAnimalsRequest = Request<unknown, unknown, unknown, SearchAnimalsQuery>;
export type CreateAnimalRequest = Request<unknown, unknown, CreateAnimalInput>;
export type UpdateAnimalRequest = Request<AnimalIdParams, unknown, UpdateAnimalInput>;
export type DeleteAnimalRequest = Request<AnimalIdParams>;
export type AddAnimalTypeRequest = Request<AnimalIdParams, unknown, AddAnimalTypeBody>;
export type RemoveAnimalTypeRequest = Request<AnimalIdAndTypeParams>;
export type ChangeAnimalTypeRequest = Request<AnimalIdParams, unknown, ChangeAnimalTypeBody>;

// Animal type request types
export type GetAnimalTypeRequest = Request<AnimalTypeParams>;
export type CreateAnimalTypeRequest = Request<unknown, unknown, CreateAnimalTypeInput>;
export type UpdateAnimalTypeRequest = Request<AnimalTypeParams, unknown, UpdateAnimalTypeInput>;
export type DeleteAnimalTypeRequest = Request<AnimalTypeParams>;

// Location request types
export type GetLocationPointRequest = Request<LocationPointParams>;
export type CreateLocationPointRequest = Request<unknown, unknown, CreateLocationPointInput>;
export type UpdateLocationPointRequest = Request<LocationPointParams, unknown, UpdateLocationPointInput>;
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
