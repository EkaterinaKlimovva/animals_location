interface AnimalWithRelations {
  id: number;
  weight: number | null;
  length: number | null;
  height: number | null;
  gender: string;
  lifeStatus: string;
  chippingDateTime: Date;
  chipperId: number | null;
  chippingLocationId: number;
  deathDateTime: Date | null;
  types: Array<{
    animalId: number;
    typeId: number;
    type: {
      id: number;
      type: string;
    };
  }>;
  visitedLocations: Array<{
    id: number;
    animalId: number;
    locationPointId: number;
    visitedAt: Date;
    locationPoint?: {
      id: number;
      latitude: number;
      longitude: number;
    };
  }>;
  chipper?: {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  chippingLocation?: {
    id: number;
    latitude: number;
    longitude: number;
  };
}

export function transformAnimalResponse(animal: AnimalWithRelations) {
  return {
    id: animal.id,
    animalTypes: animal.types.map(t => t.type.id),
    weight: animal.weight,
    length: animal.length,
    height: animal.height,
    gender: animal.gender,
    lifeStatus: animal.lifeStatus,
    chippingDateTime: animal.chippingDateTime.toISOString(),
    chipperId: animal.chipperId,
    chippingLocationId: animal.chippingLocationId,
    visitedLocations: animal.visitedLocations.map(vl => vl.locationPointId),
    deathDateTime: animal.deathDateTime ? animal.deathDateTime.toISOString() : null,
  };
}
