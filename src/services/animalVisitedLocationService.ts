import { animalVisitedLocationRepository } from '../repositories/animalVisitedLocationRepository';

interface CreateVisitedLocationData {
  animalId: number;
  locationPointId: number;
  visitedAt?: Date;
}

interface UpdateVisitedLocationData {
  locationPointId?: number;
  visitedAt?: Date;
}

export class AnimalVisitedLocationService {
  listByAnimal(animalId: number) {
    return animalVisitedLocationRepository.findManyByAnimal(animalId);
  }

  create(data: CreateVisitedLocationData) {
    return animalVisitedLocationRepository.create(data);
  }

  update(id: number, data: UpdateVisitedLocationData) {
    return animalVisitedLocationRepository.update(id, data);
  }

  delete(id: number) {
    return animalVisitedLocationRepository.delete(id);
  }
}

export const animalVisitedLocationService =
  new AnimalVisitedLocationService();

