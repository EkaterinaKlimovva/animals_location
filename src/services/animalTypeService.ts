import { animalTypeRepository } from '../repositories/animalTypeRepository';
import type { AnimalType } from '../generated/prisma/client';

interface CreateAnimalTypeResult {
  conflict: true;
  type: AnimalType;
}

interface CreateAnimalTypeSuccess {
  conflict: false;
  type: AnimalType;
}

type CreateAnimalTypeResponse = CreateAnimalTypeResult | CreateAnimalTypeSuccess;

export class AnimalTypeService {
  async getById(id: number) {
    return animalTypeRepository.findById(id);
  }

  async create(type: string): Promise<CreateAnimalTypeResponse> {
    const existing = await animalTypeRepository.findByType(type);
    if (existing) {
      return { conflict: true as const, type: existing };
    }

    const created = await animalTypeRepository.create(type);
    return { conflict: false as const, type: created };
  }

  async update(id: number, type: string) {
    return animalTypeRepository.update(id, type);
  }

  async delete(id: number) {
    return animalTypeRepository.delete(id);
  }

  async hasDependentAnimals(id: number): Promise<boolean> {
    return animalTypeRepository.hasDependentAnimals(id);
  }
}

export const animalTypeService = new AnimalTypeService();

