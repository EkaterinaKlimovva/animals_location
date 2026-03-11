import { animalRepository } from '../repositories/animalRepository';
import { animalOnTypeRepository } from '../repositories/animalOnTypeRepository';

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
  getById(id: number) {
    return animalRepository.findById(id);
  }

  search(filters: AnimalFilters) {
    return animalRepository.findManyByFilters(filters);
  }

  async create(data: CreateAnimalData) {
    return animalRepository.create({
      ...data,
      lifeStatus: 'ALIVE',
      chippingDateTime: new Date(),
    });
  }

  async update(id: number, data: UpdateAnimalData) {
    // If lifeStatus is being set to DEAD, set deathDateTime
    if (data.lifeStatus === 'DEAD') {
      data.deathDateTime = new Date().toISOString();
    }

    return animalRepository.update(id, data);
  }

  async delete(id: number) {
    return animalRepository.delete(id);
  }

  async hasDependents(id: number): Promise<boolean> {
    return animalRepository.hasDependents(id);
  }

  async addTypeToAnimal(animalId: number, typeId: number) {
    return animalOnTypeRepository.createRelation(animalId, typeId);
  }

  async removeTypeFromAnimal(animalId: number, typeId: number) {
    return animalOnTypeRepository.deleteRelation(animalId, typeId);
  }
}

export const animalService = new AnimalService();

