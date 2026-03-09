import { animalRepository } from '../repositories/animalRepository';
import { animalOnTypeRepository } from '../repositories/animalOnTypeRepository';

export class AnimalService {
  getById(id: number) {
    return animalRepository.findById(id);
  }

  search(filters: {
    chipperId?: number;
    chippingLocationId?: number;
    startDateTime?: string;
    endDateTime?: string;
  }) {
    return animalRepository.findManyByFilters(filters);
  }

  async create(data: {
    animalTypes: number[];
    weight: number;
    length: number;
    height: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    chipperId: number;
    chippingLocationId: number;
  }) {
    return animalRepository.create({
      ...data,
      lifeStatus: 'ALIVE',
      chippingDateTime: new Date(),
    });
  }

  async update(
    id: number,
    data: {
      animalTypes?: number[];
      weight?: number;
      length?: number;
      height?: number;
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
      lifeStatus?: 'ALIVE' | 'DEAD';
      chipperId?: number;
      chippingLocationId?: number;
      deathDateTime?: string;
    },
  ) {
    // If lifeStatus is being set to DEAD, set deathDateTime
    if (data.lifeStatus === 'DEAD') {
      data.deathDateTime = new Date().toISOString();
    }

    return animalRepository.update(id, data);
  }

  delete(id: number) {
    return animalRepository.delete(id);
  }

  addTypeToAnimal(animalId: number, typeId: number) {
    return animalOnTypeRepository.createRelation(animalId, typeId);
  }

  removeTypeFromAnimal(animalId: number, typeId: number) {
    return animalOnTypeRepository.deleteRelation(animalId, typeId);
  }
}

export const animalService = new AnimalService();

