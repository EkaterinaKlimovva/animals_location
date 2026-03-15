import type { Request } from 'express';

// Parameter Types
export type AnimalVisitedLocationParams = { animalId: string };
export type AnimalVisitedLocationWithLocationIdParams = { animalId: string; locationId: string };
export type VisitedLocationIdParams = { id: string };

// Body Types
export interface CreateVisitedLocationBody {
  visitedAt?: string;
}

export interface UpdateVisitedLocationBody {
  visitedLocationPointId: number;
  locationPointId?: number;
  visitedAt?: string;
}

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
  AnimalVisitedLocationWithLocationIdParams,
  unknown,
  CreateVisitedLocationBody
>;
export type UpdateVisitedLocationRequest = Request<AnimalVisitedLocationParams, unknown, UpdateVisitedLocationBody>;
export type DeleteVisitedLocationRequest = Request<AnimalVisitedLocationParams & VisitedLocationIdParams>;
