import { prisma } from '../prisma';

export class AnimalOnTypeRepository {
  createRelation(animalId: number, typeId: number) {
    return prisma.animalOnType.create({
      data: {
        animal: { connect: { id: animalId } },
        type: { connect: { id: typeId } },
      },
    });
  }

  deleteRelation(animalId: number, typeId: number) {
    return prisma.animalOnType.delete({
      where: { animalId_typeId: { animalId, typeId } },
    });
  }
}

export const animalOnTypeRepository = new AnimalOnTypeRepository();

