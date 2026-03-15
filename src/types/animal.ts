import type { Animal, AnimalOnType, AnimalVisitedLocation, AnimalType, LocationPoint, Account } from '../generated/prisma/client';

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
