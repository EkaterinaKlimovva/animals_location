import { animalVisitedLocationRepository, type VisitedLocationResponse } from '../repositories/animalVisitedLocationRepository';
import type { AnimalVisitedLocation } from '../generated/prisma/client';

export class SameAsAdjacentLocationError extends Error {
  constructor(public data: VisitedLocationResponse) {
    super('New location point is the same as adjacent locations');
    this.name = 'SameAsAdjacentLocationError';
  }
}

export class SameAsPreviousLocationError extends Error {
  constructor() {
    super('New location point is the same as the previous location');
    this.name = 'SameAsPreviousLocationError';
  }
}

export class SameAsNextLocationError extends Error {
  constructor() {
    super('New location point is the same as the next location');
    this.name = 'SameAsNextLocationError';
  }
}


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
      throw new Error('Animal not found');
    }
    return animalVisitedLocationRepository.findManyByAnimal(animalId);
  }

  async create(data: CreateVisitedLocationData): Promise<VisitedLocationResponse> {
    const animalExists = await animalVisitedLocationRepository.findAnimalById(data.animalId);
    if (!animalExists) {
      throw new Error('Animal not found');
    }

    // Check if the animal is alive
    if (animalExists.lifeStatus !== 'ALIVE') {
      throw new Error('Cannot add visited location to a dead animal');
    }

    const locationExists = await animalVisitedLocationRepository.findLocationById(data.locationPointId);
    if (!locationExists) {
      throw new Error('Location point not found');
    }

    // Check if this location already exists for this animal (duplicate)
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

  async update(animalId: number, id: number, data: UpdateVisitedLocationData): Promise<VisitedLocationResponse> {
    const existingLocation = await animalVisitedLocationRepository.findById(id);
    if (!existingLocation) {
      throw new Error('Visited location not found');
    }

    if (existingLocation.animalId !== animalId) {
      throw new Error('Visited location not found');
    }

    const animalExists = await animalVisitedLocationRepository.findAnimalById(animalId);
    if (!animalExists) {
      throw new Error('Animal not found');
    }

    let matchesPrevious = false;
    let matchesNext = false;

    if (data.locationPointId !== undefined) {
      if (data.locationPointId === existingLocation.locationPointId) {
        throw new Error('New location point is the same as the old one');
      }

      const locationExists = await animalVisitedLocationRepository.findLocationById(data.locationPointId);
      if (!locationExists) {
        throw new Error('Location point not found');
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

      // Check for duplicates, but allow if it matches previous or next
      if (!matchesPrevious && !matchesNext) {
        const existingVisit = await animalVisitedLocationRepository.findExistingVisit(animalId, data.locationPointId, id);
        if (existingVisit) {
          throw new Error('Location already visited by this animal');
        }
      }

      if (allVisitedLocations.length > 0 && allVisitedLocations[0].id === id) {
        const animalWithDetails = await animalVisitedLocationRepository.findAnimalWithDetails(animalId);
        if (animalWithDetails && animalWithDetails.chippingLocationId === data.locationPointId) {
          throw new Error('Cannot update first visited location to chipping location');
        }
      }
    }

    const updatedLocation = await animalVisitedLocationRepository.update(id, data);

    // Handle adjacent location matches
    if (matchesPrevious && matchesNext) {
      // Matches both previous and next: allow with 201
      throw new SameAsAdjacentLocationError(updatedLocation);
    } else if (matchesPrevious) {
      // Matches only previous: reject with 400
      throw new SameAsPreviousLocationError();
    } else if (matchesNext) {
      // Matches only next: reject with 400
      throw new SameAsNextLocationError();
    }

    return updatedLocation;
  }

  async delete(animalId: number, visitedPointId: number): Promise<AnimalVisitedLocation> {
    // First, check if the animal exists
    const animal = await animalVisitedLocationRepository.findAnimalById(animalId);
    if (!animal) {
      throw new Error('Animal not found');
    }

    // Get the visited location to be deleted
    const visitedLocation = await animalVisitedLocationRepository.findById(visitedPointId);
    if (!visitedLocation || visitedLocation.animalId !== animalId) {
      throw new Error('Visited location not found');
    }

    // Get all visited locations for this animal, ordered by date
    const allVisitedLocations = await animalVisitedLocationRepository.findManyByAnimal(animalId);
    
    if (allVisitedLocations.length > 0) {
      // Check if the location to be deleted is the first one
      const firstLocation = allVisitedLocations[0];
      
      if (firstLocation.id === visitedPointId) {
        // This is the first visited location, check if there's a chipping location after it
        const animalWithDetails = await animalVisitedLocationRepository.findAnimalWithDetails(animalId);
        
        if (animalWithDetails && animalWithDetails.chippingLocationId) {
          // Check if the chipping location is in the visited locations list after this first location
          const chippingLocationIndex = allVisitedLocations.findIndex(
            loc => loc.locationPointId === animalWithDetails.chippingLocationId
          );
          
          if (chippingLocationIndex > 0) {
            // The chipping location appears after this first visited location
            // Prevent deletion and return 400
            throw new Error('Cannot delete first visited location when followed by chipping location');
          }
        }
      }
    }

    return animalVisitedLocationRepository.delete(visitedPointId);
  }
}

export const animalVisitedLocationService =
  new AnimalVisitedLocationService();
