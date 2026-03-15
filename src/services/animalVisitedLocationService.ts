import { animalVisitedLocationRepository, type VisitedLocationResponse } from '../repositories/animalVisitedLocationRepository';
import type { AnimalVisitedLocation } from '../generated/prisma/client';

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
  async listByAnimal(animalId: number): Promise<VisitedLocationResponse[]> {
    const animalExists = await animalVisitedLocationRepository.findAnimalById(animalId);
    if (!animalExists) {
      throw new Error('Animal not found');
    }
    return animalVisitedLocationRepository.findManyByAnimal(animalId);
  }

  async create(data: CreateVisitedLocationData): Promise<VisitedLocationResponse> {
    const animalExists = await animalVisitedLocationRepository.findAnimalById(data.animalId);
    if (!animalExists) {
      throw new Error('Animal not found');
    }

    const locationExists = await animalVisitedLocationRepository.findLocationById(data.locationPointId);
    if (!locationExists) {
      throw new Error('Location point not found');
    }

    const existingVisit = await animalVisitedLocationRepository.findExistingVisit(data.animalId, data.locationPointId);
    if (existingVisit) {
      throw new Error('Location already visited by this animal');
    }

    // Check if the animal is trying to add its chipping location as a visited location
    // and hasn't left the chipping location yet
    const animalWithDetails = await animalVisitedLocationRepository.findAnimalWithDetails(data.animalId);
    if (animalWithDetails && animalWithDetails.chippingLocationId === data.locationPointId) {
      // Check if the animal has any visited locations
      if (animalWithDetails.visitedLocations.length === 0) {
        throw new Error('Cannot add chipping location as visited location when animal has not left it');
      }
    }

    return animalVisitedLocationRepository.create(data);
  }

  update(id: number, data: UpdateVisitedLocationData): Promise<VisitedLocationResponse> {
    return animalVisitedLocationRepository.update(id, data);
  }

  delete(id: number): Promise<AnimalVisitedLocation> {
    return animalVisitedLocationRepository.delete(id);
  }
}

export const animalVisitedLocationService =
  new AnimalVisitedLocationService();

