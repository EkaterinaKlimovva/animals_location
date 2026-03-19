import { animalVisitedLocationRepository, type VisitedLocationResponse } from '../repositories/animalVisitedLocationRepository';
import { AppError, ERROR_CODES, createNotFoundError, LIFE_STATUS_VALUES, ERROR_MESSAGES } from '../common';
import type { CreateVisitedLocationData, UpdateVisitedLocationData } from '../types';

export class AnimalVisitedLocationService {
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
    if (animalExists.lifeStatus !== LIFE_STATUS_VALUES.ALIVE) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, ERROR_MESSAGES.CANNOT_ADD_VISITED_LOCATION_TO_DEAD_ANIMAL);
    }

    const locationExists = await animalVisitedLocationRepository.findLocationById(data.locationPointId);
    if (!locationExists) {
      throw createNotFoundError('Location point', data.locationPointId);
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
          throw new AppError(ERROR_CODES.VALIDATION_ERROR, ERROR_MESSAGES.CANNOT_UPDATE_FIRST_VISITED_LOCATION_TO_CHIPPING_LOCATION);
        }
      }
    }

    const updatedLocation = await animalVisitedLocationRepository.update(id, data);

    // Handle adjacent location matches
    if (matchesPrevious && matchesNext) {
      // Matches both previous and next: allow with 201
      return { status: 201, data: updatedLocation };
    } else if (matchesPrevious || matchesNext) {
      // Matches previous or next: not allowed
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, ERROR_MESSAGES.NEW_LOCATION_POINT_MATCHES_ADJACENT_VISITED_LOCATION);
    }

    return { status: 200, data: updatedLocation };
  }

  async delete(animalId: number, visitedPointId: number): Promise<{ status: number }> {
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
          await animalVisitedLocationRepository.delete(visitedPointId);
          return { status: 200 };
        }
      }
    }

    await animalVisitedLocationRepository.delete(visitedPointId);
    return { status: 200 };
  }
}

export const animalVisitedLocationService =
  new AnimalVisitedLocationService();
