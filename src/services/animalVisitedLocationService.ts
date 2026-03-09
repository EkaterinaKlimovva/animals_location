import { animalVisitedLocationRepository } from '../repositories/animalVisitedLocationRepository';

export class AnimalVisitedLocationService {
  listByAnimal(animalId: number) {
    return animalVisitedLocationRepository.findManyByAnimal(animalId);
  }

  create(data: {
    animalId: number;
    locationPointId: number;
    visitedAt?: Date;
  }) {
    return animalVisitedLocationRepository.create(data);
  }

  update(
    id: number,
    data: {
      locationPointId?: number;
      visitedAt?: Date;
    },
  ) {
    return animalVisitedLocationRepository.update(id, data);
  }

  delete(id: number) {
    return animalVisitedLocationRepository.delete(id);
  }
}

export const animalVisitedLocationService =
  new AnimalVisitedLocationService();

