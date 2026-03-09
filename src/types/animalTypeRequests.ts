import type { Request } from 'express';
import type { CreateAnimalTypeInput, UpdateAnimalTypeInput } from '../validation';

// Parameter Types
export type AnimalTypeParams = { id: string };

// Request Types
export type GetAnimalTypeRequest = Request<AnimalTypeParams>;
export type CreateAnimalTypeRequest = Request<unknown, unknown, CreateAnimalTypeInput>;
export type UpdateAnimalTypeRequest = Request<AnimalTypeParams, unknown, UpdateAnimalTypeInput>;
export type DeleteAnimalTypeRequest = Request<AnimalTypeParams>;
