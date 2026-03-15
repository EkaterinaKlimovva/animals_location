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

  deleteRelation(animalId: number, typeId: number): Promise<AnimalOnType> {
    return prisma.animalOnType.delete({
      where: { animalId_typeId: { animalId, typeId } },
    });
  }
}

export const animalOnTypeRepository = new AnimalOnTypeRepository();

