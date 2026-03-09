import { animalTypeRepository } from '../repositories/animalTypeRepository';

export class AnimalTypeService {
  async getById(id: number) {
    return animalTypeRepository.findById(id);
  }

  async create(name: string) {
    const existing = await animalTypeRepository.findByName(name);
    if (existing) {
      return { conflict: true as const, type: existing };
    }

    const created = await animalTypeRepository.create(name);
    return { conflict: false as const, type: created };
  }

  async update(id: number, name: string) {
    return animalTypeRepository.update(id, name);
  }

  async delete(id: number) {
    return animalTypeRepository.delete(id);
  }
}

export const animalTypeService = new AnimalTypeService();

