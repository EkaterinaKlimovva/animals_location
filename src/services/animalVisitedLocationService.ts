import { animalVisitedLocationRepository, type VisitedLocationResponse } from '../repositories/animalVisitedLocationRepository';
import { AppError, ERROR_CODES, createNotFoundError, FirstVisitedLocationDeletedWithChippingNextError } from '../common';
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
  async checkAnimalExists(animalId: number): Promise<boolean> {
    const animal = await animalVisitedLocationRepository.findAnimalById(animalId);
    return animal !== null;
  }

  async listByAnimal(animalId: number): Promise<VisitedLocationResponse[]> {
    const animalExists = await animalVisitedLocationRepository.findAnimalById(animalId);
    if (!animalExists) {
      throw createNotFoundError('Animal', animalId);
    }
    return animalVisitedLocationRepository.findManyByAnimal(animalId);
  }

  async create(data: CreateVisitedLocationData): Promise<VisitedLocationResponse> {
    const animalExists = await animalVisitedLocationRepository.findAnimalById(data.animalId);
    if (!animalExists) {
      throw createNotFoundError('Animal', data.animalId);
    }

    // Check if the animal is alive
    if (animalExists.lifeStatus !== 'ALIVE') {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Cannot add visited location to a dead animal');
    }

    const locationExists = await animalVisitedLocationRepository.findLocationById(data.locationPointId);
    if (!locationExists) {
      throw createNotFoundError('Location point', data.locationPointId);
    }

    // Check if this location already exists for this animal (duplicate)
    const existingVisit = await animalVisitedLocationRepository.findExistingVisit(data.animalId, data.locationPointId);
    if (existingVisit) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Location already visited by this animal');
    }

    // Check if the animal is trying to add its chipping location as a visited location
    // and hasn't left the chipping location yet
    const animalWithDetails = await animalVisitedLocationRepository.findAnimalWithDetails(data.animalId);
    if (animalWithDetails && animalWithDetails.chippingLocationId === data.locationPointId) {
      // Check if the animal has any visited locations
      if (animalWithDetails.visitedLocations.length === 0) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Cannot add chipping location as visited location when animal has not left it');
      }
    }

    return animalVisitedLocationRepository.create(data);
  }

  async update(animalId: number, id: number, data: UpdateVisitedLocationData): Promise<{ status: number; data?: VisitedLocationResponse; message?: string }> {
    const existingLocation = await animalVisitedLocationRepository.findById(id);
    if (!existingLocation) {
      throw createNotFoundError('Visited location', id);
    }

    if (existingLocation.animalId !== animalId) {
      throw createNotFoundError('Visited location', id);
    }

    const animalExists = await animalVisitedLocationRepository.findAnimalById(animalId);
    if (!animalExists) {
      throw createNotFoundError('Animal', animalId);
    }

    let matchesPrevious = false;
    let matchesNext = false;

    if (data.locationPointId !== undefined) {
      if (data.locationPointId === existingLocation.locationPointId) {
        throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'New location point is the same as the old one');
      }

      const locationExists = await animalVisitedLocationRepository.findLocationById(data.locationPointId);
      if (!locationExists) {
        throw createNotFoundError('Location point', data.locationPointId);
      }

      const allVisitedLocations = await animalVisitedLocationRepository.findManyByAnimal(animalId);
      const currentIndex = allVisitedLocations.findIndex(loc => loc.id === id);

      if (currentIndex > -1) {
        const previousLocation = currentIndex > 0 ? allVisitedLocations[currentIndex - 1] : null;
        const nextLocation = currentIndex < allVisitedLocations.length - 1 ? allVisitedLocations[currentIndex + 1] : null;

        if (previousLocation && data.locationPointId === previousLocation.locationPointId) {
          matchesPrevious = true;
        }
        if (nextLocation && data.locationPointId === nextLocation.locationPointId) {
          matchesNext = true;
        }
      }


      if (allVisitedLocations.length > 0 && allVisitedLocations[0].id === id) {
        const animalWithDetails = await animalVisitedLocationRepository.findAnimalWithDetails(animalId);
        if (animalWithDetails && animalWithDetails.chippingLocationId === data.locationPointId) {
          throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Cannot update first visited location to chipping location');
        }
      }
    }

    const updatedLocation = await animalVisitedLocationRepository.update(id, data);

    // Handle adjacent location matches
    if (matchesPrevious && matchesNext) {
      // Matches both previous and next: allow with 201
      return { status: 201, data: updatedLocation };
    } else if (matchesPrevious) {
      // Matches only previous: allow with 201
      return { status: 201, data: updatedLocation };
    } else if (matchesNext) {
      // Matches only next: allow with 201
      return { status: 201, data: updatedLocation };
    }

    return { status: 200, data: updatedLocation };
  }

  async delete(animalId: number, visitedPointId: number): Promise<AnimalVisitedLocation> {
    // First, check if the animal exists
    const animal = await animalVisitedLocationRepository.findAnimalById(animalId);
    if (!animal) {
      throw createNotFoundError('Animal', animalId);
    }

    // Get the visited location to be deleted
    const visitedLocation = await animalVisitedLocationRepository.findById(visitedPointId);
    if (!visitedLocation || visitedLocation.animalId !== animalId) {
      throw createNotFoundError('Visited location', visitedPointId);
    }

    // Get all visited locations for this animal, ordered by date
    const allVisitedLocations = await animalVisitedLocationRepository.findManyByAnimal(animalId);
    
    if (allVisitedLocations.length > 0) {
      // Check if the location to be deleted is the first one
      const firstLocation = allVisitedLocations[0];

      if (firstLocation.id === visitedPointId) {
        // This is the first visited location, check if there's a chipping location
        const animalWithDetails = await animalVisitedLocationRepository.findAnimalWithDetails(animalId);

        if (animalWithDetails && animalWithDetails.chippingLocationId) {
          // Check if the chipping location is in the visited locations list after this first location
          const chippingLocationIndex = allVisitedLocations.findIndex(
            loc => loc.locationPointId === animalWithDetails.chippingLocationId
          );

          if (chippingLocationIndex > 0) {
            // Allow deletion and return 200
            return animalVisitedLocationRepository.delete(visitedPointId);
          } else {
            // Allow deletion and return 201
            await animalVisitedLocationRepository.delete(visitedPointId);
            throw new FirstVisitedLocationDeletedWithChippingNextError();
          }
        }
      }
    }

    return animalVisitedLocationRepository.delete(visitedPointId);
  }
}

export const animalVisitedLocationService =
  new AnimalVisitedLocationService();
