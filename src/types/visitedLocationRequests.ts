import type { Request } from 'express';

// Parameter Types
export type AnimalVisitedLocationParams = { animalId: string };
export type VisitedLocationIdParams = { id: string };

// Body Types
export interface CreateVisitedLocationBody {
  locationPointId: number;
  visitedAt?: string;
}

export type UpdateVisitedLocationBody = Pick<
  CreateVisitedLocationBody,
  'locationPointId' | 'visitedAt'
>;

// Query Types
export type ListVisitedLocationsQuery = {
  startDateTime?: string;
  endDateTime?: string;
  from?: string;
  size?: string;
};

// Request Types
export type ListVisitedLocationsRequest = Request<AnimalVisitedLocationParams, unknown, unknown, ListVisitedLocationsQuery>;
export type CreateVisitedLocationRequest = Request<
  AnimalVisitedLocationParams,
  unknown,
  CreateVisitedLocationBody
>;
export type UpdateVisitedLocationRequest = Request<VisitedLocationIdParams, unknown, UpdateVisitedLocationBody>;
export type DeleteVisitedLocationRequest = Request<{ id: string }>;
