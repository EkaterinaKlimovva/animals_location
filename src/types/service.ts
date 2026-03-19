import type { Account, AnimalType } from '../generated/prisma/client';

// ==============================
// Service Types
// ==============================

// Auth service types
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResult {
  conflict: true;
  account: Account;
}

export interface RegisterSuccess {
  conflict: false;
  account: Account;
}

export type RegisterResponse = RegisterResult | RegisterSuccess;

// Animal service types
export interface AnimalFilters {
  chipperId?: number;
  chippingLocationId?: number;
  startDateTime?: string;
  endDateTime?: string;
}

// Animal type service types
export interface CreateAnimalTypeResult {
  conflict: true;
  type: AnimalType;
}

export interface CreateAnimalTypeSuccess {
  conflict: false;
  type: AnimalType;
}

export type CreateAnimalTypeResponse = CreateAnimalTypeResult | CreateAnimalTypeSuccess;

// Location point service types
export interface CreateLocationPointData {
  latitude: number;
  longitude: number;
}

export interface UpdateLocationPointData {
  latitude?: number;
  longitude?: number;
}

// Animal visited location service types
export interface CreateVisitedLocationData {
  animalId: number;
  locationPointId: number;
  visitedAt?: Date;
}

export interface UpdateVisitedLocationData {
  locationPointId?: number;
  visitedAt?: Date;
}
