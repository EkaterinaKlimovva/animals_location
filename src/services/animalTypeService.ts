import { animalTypeRepository } from '../repositories/animalTypeRepository';
import type { CreateAnimalTypeResponse } from '../types';

export class AnimalTypeService {
  async getById(id: number) {
    return animalTypeRepository.findById(id);
  }

  async getByType(type: string) {
    return animalTypeRepository.findByType(type);
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
