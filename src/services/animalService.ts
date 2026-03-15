import { animalRepository } from '../repositories/animalRepository';
import { animalTypeRepository } from '../repositories/animalTypeRepository';
import { animalOnTypeRepository } from '../repositories/animalOnTypeRepository';
import { locationPointRepository } from '../repositories/locationPointRepository';
import { accountRepository } from '../repositories/accountRepository';
import type { Animal, AnimalType, LocationPoint, Account, AnimalOnType, AnimalVisitedLocation } from '../generated/prisma/client';

export class AnimalTypeNotFoundError extends Error {
  constructor(typeId: number) {
    super(`AnimalType with id ${typeId} not found`);
    this.name = 'AnimalTypeNotFoundError';
  }
}

export class LocationPointNotFoundError extends Error {
  constructor(locationId: number) {
    super(`LocationPoint with id ${locationId} not found`);
    this.name = 'LocationPointNotFoundError';
  }
}

export class AccountNotFoundError extends Error {
  constructor(accountId: number) {
    super(`Account with id ${accountId} not found`);
    this.name = 'AccountNotFoundError';
  }
}

export class AnimalNotFoundError extends Error {
  constructor(id: number) {
    super(`Animal with id ${id} not found`);
    this.name = 'AnimalNotFoundError';
  }
}

interface AnimalFilters {
  chipperId?: number;
  chippingLocationId?: number;
  startDateTime?: string;
  endDateTime?: string;
}

interface CreateAnimalData {
  animalTypes: number[];
  weight: number;
  length: number;
  height: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  chipperId: number;
  chippingLocationId: number;
}

interface UpdateAnimalData {
  animalTypes?: number[];
  weight?: number;
  length?: number;
  height?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  lifeStatus?: 'ALIVE' | 'DEAD';
  chipperId?: number;
  chippingLocationId?: number;
  deathDateTime?: string;
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

  async create(data: CreateAnimalData): Promise<(Animal & {
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
        throw new AnimalTypeNotFoundError(typeId);
      }
    }

    // Validate that chipping location exists
    const chippingLocation = await locationPointRepository.findById(data.chippingLocationId);
    if (!chippingLocation) {
      throw new LocationPointNotFoundError(data.chippingLocationId);
    }

    // Validate that chipper exists if chipperId is provided
    if (data.chipperId !== undefined && data.chipperId !== null) {
      const chipper = await accountRepository.findById(data.chipperId);
      if (!chipper) {
        throw new AccountNotFoundError(data.chipperId);
      }
    }

    return animalRepository.create({
      ...data,
      lifeStatus: 'ALIVE',
      chippingDateTime: new Date(),
    });
  }

  async update(id: number, data: UpdateAnimalData): Promise<(Animal & {
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
          throw new AnimalTypeNotFoundError(typeId);
        }
      }
    }

    // If chippingLocationId is being updated, validate it exists
    if (data.chippingLocationId !== undefined) {
      const chippingLocation = await locationPointRepository.findById(data.chippingLocationId);
      if (!chippingLocation) {
        throw new LocationPointNotFoundError(data.chippingLocationId);
      }
    }

    // If chipperId is being updated, validate it exists
    if (data.chipperId !== undefined && data.chipperId !== null) {
      const chipper = await accountRepository.findById(data.chipperId);
      if (!chipper) {
        throw new AccountNotFoundError(data.chipperId);
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

    // If animal has no visited locations other than chipping location, it can be deleted
    if (animal.visitedLocations.length === 0) {
      return true;
    }

    // Check if animal has left the chipping location
    // The first visited location should be the chipping location
    // If there are other visited locations, it means the animal has left
    return animal.visitedLocations.length <= 1;
  }

  async addTypeToAnimal(animalId: number, typeId: number): Promise<AnimalOnType> {
    // Validate that the animal exists
    const animal = await animalRepository.findById(animalId);
    if (!animal) {
      throw new AnimalNotFoundError(animalId);
    }

    // Validate that the animal type exists
    const animalType = await animalTypeRepository.findById(typeId);
    if (!animalType) {
      throw new AnimalTypeNotFoundError(typeId);
    }

    return animalOnTypeRepository.createRelation(animalId, typeId);
  }

  async removeTypeFromAnimal(animalId: number, typeId: number): Promise<AnimalOnType> {
    // Validate that the animal exists
    const animal = await animalRepository.findById(animalId);
    if (!animal) {
      throw new AnimalNotFoundError(animalId);
    }

    // Validate that the animal type exists
    const animalType = await animalTypeRepository.findById(typeId);
    if (!animalType) {
      throw new AnimalTypeNotFoundError(typeId);
    }

    return animalOnTypeRepository.deleteRelation(animalId, typeId);
  }
}

export const animalService = new AnimalService();

