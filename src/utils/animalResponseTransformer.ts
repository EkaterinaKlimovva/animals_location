import type { AnimalWithRelations, AnimalResponse } from '../types';

export function transformAnimalResponse(animal: AnimalWithRelations): AnimalResponse {
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
    visitedLocations: animal.visitedLocations.map(vl => vl.id),
    deathDateTime: animal.deathDateTime ? animal.deathDateTime.toISOString() : null,
  };
}
