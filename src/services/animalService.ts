import { animalRepository } from '../repositories/animalRepository';
import { animalTypeRepository } from '../repositories/animalTypeRepository';
import { animalOnTypeRepository } from '../repositories/animalOnTypeRepository';
import { locationPointRepository } from '../repositories/locationPointRepository';
import { accountRepository } from '../repositories/accountRepository';
import { AppError, ERROR_CODES, createNotFoundError } from '../common';
import type { Animal, AnimalType, LocationPoint, Account, AnimalOnType, AnimalVisitedLocation } from '../generated/prisma/client';
import type { CreateAnimalInput, UpdateAnimalInput } from '../validation';

interface AnimalFilters {
  chipperId?: number;
  chippingLocationId?: number;
  startDateTime?: string;
  endDateTime?: string;
}


export class AnimalService {
  getById(id: number): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  }) | null> {
    return animalRepository.findById(id);
  }

  search(filters: AnimalFilters): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  })[]> {
    return animalRepository.findManyByFilters(filters);
  }

  async create(data: CreateAnimalInput): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  })> {
    // Validate that all animal types exist
    for (const typeId of data.animalTypes) {
      const animalType = await animalTypeRepository.findById(typeId);
      if (!animalType) {
        throw createNotFoundError('Animal type', typeId);
      }
    }

    // Validate that chipping location exists
    const chippingLocation = await locationPointRepository.findById(data.chippingLocationId);
    if (!chippingLocation) {
      throw createNotFoundError('Location point', data.chippingLocationId);
    }

    // Validate that chipper exists if chipperId is provided
    if (data.chipperId !== undefined && data.chipperId !== null) {
      const chipper = await accountRepository.findById(data.chipperId);
      if (!chipper) {
        throw createNotFoundError('Account', data.chipperId);
      }
    }

    return animalRepository.create({
      ...data,
      lifeStatus: 'ALIVE',
      chippingDateTime: new Date(),
    });
  }

  async update(id: number, data: UpdateAnimalInput): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  })> {
    // If animalTypes are being updated, validate they exist
    if (data.animalTypes && data.animalTypes.length > 0) {
      for (const typeId of data.animalTypes) {
        const animalType = await animalTypeRepository.findById(typeId);
        if (!animalType) {
          throw createNotFoundError('Animal type', typeId);
        }
      }
    }

    // If chippingLocationId is being updated, validate it exists
    if (data.chippingLocationId !== undefined) {
      const chippingLocation = await locationPointRepository.findById(data.chippingLocationId);
      if (!chippingLocation) {
        throw createNotFoundError('Location point', data.chippingLocationId);
      }
      // Check if the new chippingLocationId matches the first visited location
      const animal = await animalRepository.findById(id);
      if (animal && animal.visitedLocations.length > 0) {
        const firstVisitedLocation = animal.visitedLocations[0];
        if (firstVisitedLocation.locationPointId === data.chippingLocationId) {
          throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Cannot set chippingLocationId to the first visited location');
        }
      }
    }

    // If chipperId is being updated, validate it exists
    if (data.chipperId !== undefined && data.chipperId !== null) {
      const chipper = await accountRepository.findById(data.chipperId);
      if (!chipper) {
        throw createNotFoundError('Account', data.chipperId);
      }
    }

    // If lifeStatus is being set to DEAD, set deathDateTime
    if (data.lifeStatus === 'DEAD') {
      data.deathDateTime = new Date().toISOString();
    }

    return animalRepository.update(id, data);
  }

  async delete(id: number): Promise<Animal> {
    return animalRepository.delete(id);
  }

  async hasDependents(id: number): Promise<boolean> {
    return animalRepository.hasDependents(id);
  }

  async canDeleteAnimal(id: number): Promise<boolean> {
    const animal = await this.getById(id);
    if (!animal) {
      return false;
    }

    // If animal has no visited locations, it can be deleted (still at chipping location)
    if (animal.visitedLocations.length === 0) {
      return true;
    }

    // If animal has exactly 1 visited location and it's the chipping location, it can be deleted
    if (animal.visitedLocations.length === 1) {
      const firstVisitedLocation = animal.visitedLocations[0];
      return firstVisitedLocation.locationPointId === animal.chippingLocationId;
    }

    // If animal has more than 1 visited location, it has left the chipping location
    // and cannot be deleted
    return false;
  }

  async addTypeToAnimal(animalId: number, typeId: number): Promise<AnimalOnType> {
    // Validate that the animal exists
    const animal = await animalRepository.findById(animalId);
    if (!animal) {
      throw createNotFoundError('Animal', animalId);
    }

    // Validate that the animal type exists
    const animalType = await animalTypeRepository.findById(typeId);
    if (!animalType) {
      throw createNotFoundError('Animal type', typeId);
    }

    // Check if animal already has this type
    const existingRelation = await animalOnTypeRepository.findRelation(animalId, typeId);
    if (existingRelation) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'Animal already has this type');
    }

    return animalOnTypeRepository.createRelation(animalId, typeId);
  }

  async removeTypeFromAnimal(animalId: number, typeId: number): Promise<AnimalOnType> {
    // Validate that the animal exists
    const animal = await animalRepository.findById(animalId);
    if (!animal) {
      throw createNotFoundError('Animal', animalId);
    }

    // Validate that the animal type exists
    const animalType = await animalTypeRepository.findById(typeId);
    if (!animalType) {
      throw createNotFoundError('Animal type', typeId);
    }

    return animalOnTypeRepository.deleteRelation(animalId, typeId);
  }

  async changeTypeOfAnimal(animalId: number, oldTypeId: number, newTypeId: number): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  })> {
    // Validate that the animal exists
    const animal = await animalRepository.findById(animalId);
    if (!animal) {
      throw createNotFoundError('Animal', animalId);
    }

    // Validate that the old animal type exists
    const oldAnimalType = await animalTypeRepository.findById(oldTypeId);
    if (!oldAnimalType) {
      throw createNotFoundError('Animal type', oldTypeId);
    }

    // Validate that the new animal type exists
    const newAnimalType = await animalTypeRepository.findById(newTypeId);
    if (!newAnimalType) {
      throw createNotFoundError('Animal type', newTypeId);
    }

    // Check if animal has the old type
    const hasOldType = await animalOnTypeRepository.findRelation(animalId, oldTypeId);
    if (!hasOldType) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, `Animal does not have type ${oldTypeId}`);
    }

    // Check if animal already has the new type
    const hasNewType = await animalOnTypeRepository.findRelation(animalId, newTypeId);
    if (hasNewType) {
      throw new AppError(ERROR_CODES.ANIMAL_ALREADY_HAS_TYPE, `Animal already has type ${newTypeId}`);
    }

    // Remove old type and add new type
    await animalOnTypeRepository.deleteRelation(animalId, oldTypeId);
    await animalOnTypeRepository.createRelation(animalId, newTypeId);

    // Return updated animal
    const updatedAnimal = await animalRepository.findById(animalId);
    if (!updatedAnimal) {
      throw createNotFoundError('Animal', animalId);
    }
    return updatedAnimal;
  }
}

export const animalService = new AnimalService();

