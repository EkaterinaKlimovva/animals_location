import { animalTypeRepository } from '../repositories/animalTypeRepository';

interface CreateAnimalTypeResult {
  conflict: true;
  type: any;
}

interface CreateAnimalTypeSuccess {
  conflict: false;
  type: any;
}

type CreateAnimalTypeResponse = CreateAnimalTypeResult | CreateAnimalTypeSuccess;

export class AnimalTypeService {
  async getById(id: number) {
    return animalTypeRepository.findById(id);
  }

  async create(name: string): Promise<CreateAnimalTypeResponse> {
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

  async hasDependentAnimals(id: number): Promise<boolean> {
    return animalTypeRepository.hasDependentAnimals(id);
  }
}

export const animalTypeService = new AnimalTypeService();

