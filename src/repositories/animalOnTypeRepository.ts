import { prisma } from '../app/database';
import type { AnimalOnType } from '../generated/prisma/client';

export class AnimalOnTypeRepository {
  createRelation(animalId: number, typeId: number): Promise<AnimalOnType> {
    return prisma.animalOnType.create({
      data: {
        animal: { connect: { id: animalId } },
        type: { connect: { id: typeId } },
      },
    });
  }

  async findRelation(animalId: number, typeId: number): Promise<AnimalOnType | null> {
    return prisma.animalOnType.findUnique({
      where: { animalId_typeId: { animalId, typeId } },
    });
  }

  async findByAnimalId(animalId: number): Promise<AnimalOnType[]> {
    return prisma.animalOnType.findMany({
      where: { animalId },
    });
  }

  deleteRelation(animalId: number, typeId: number): Promise<AnimalOnType> {
    return prisma.animalOnType.delete({
      where: { animalId_typeId: { animalId, typeId } },
    });
  }
}

export const animalOnTypeRepository = new AnimalOnTypeRepository();

