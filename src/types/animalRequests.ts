import type { Request } from 'express';
import type { CreateAnimalInput, UpdateAnimalInput } from '../validation';

// Parameter Types
export type AnimalIdParams = { id: string };
export type AnimalIdAndTypeParams = { id: string; typeId: string };

// Query Types
export type SearchAnimalsQuery = {
  chipperId?: string;
  chippingLocationId?: string;
  startDateTime?: string;
  endDateTime?: string;
};

// Body Types
export type AddAnimalTypeBody = { typeId: number };
export type ChangeAnimalTypeBody = { oldTypeId: number; newTypeId: number };

// Request Types
export type GetAnimalRequest = Request<AnimalIdParams>;
export type SearchAnimalsRequest = Request<unknown, unknown, unknown, SearchAnimalsQuery>;
export type CreateAnimalRequest = Request<unknown, unknown, CreateAnimalInput>;
export type UpdateAnimalRequest = Request<AnimalIdParams, unknown, UpdateAnimalInput>;
export type DeleteAnimalRequest = Request<AnimalIdParams>;
export type AddAnimalTypeRequest = Request<AnimalIdParams, unknown, AddAnimalTypeBody>;
export type RemoveAnimalTypeRequest = Request<AnimalIdAndTypeParams>;
export type ChangeAnimalTypeRequest = Request<AnimalIdParams, unknown, ChangeAnimalTypeBody>;
