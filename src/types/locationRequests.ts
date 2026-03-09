import type { Request } from 'express';
import type { CreateLocationPointInput, UpdateLocationPointInput } from '../validation';

// Parameter Types
export type LocationPointParams = { id: string };

// Request Types
export type GetLocationPointRequest = Request<LocationPointParams>;
export type CreateLocationPointRequest = Request<unknown, unknown, CreateLocationPointInput>;
export type UpdateLocationPointRequest = Request<LocationPointParams, unknown, UpdateLocationPointInput>;
export type DeleteLocationPointRequest = Request<LocationPointParams>;
