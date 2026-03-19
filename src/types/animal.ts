import type {
  Animal,
  AnimalOnType,
  AnimalVisitedLocation,
  AnimalType,
  LocationPoint,
  Account,
} from '../generated/prisma/client';

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
// Response Types
// ==============================

export interface AnimalResponse {
  id: number;
  animalTypes: number[];
  weight: number | null;
  length: number | null;
  height: number | null;
  gender: string;
  lifeStatus: string;
  chippingDateTime: string;
  chipperId: number | null;
  chippingLocationId: number | null;
  visitedLocations: number[];
  deathDateTime: string | null;
}
