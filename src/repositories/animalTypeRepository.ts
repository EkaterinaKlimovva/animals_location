import { prisma } from '../app/database';

export class AnimalTypeRepository {
  findById(id: number) {
    return prisma.animalType.findUnique({ where: { id } });
  }

  findByType(type: string) {
    return prisma.animalType.findUnique({ where: { type } });
  }

  create(type: string) {
    return prisma.animalType.create({ data: { type } });
  }

  update(id: number, type: string) {
    return prisma.animalType.update({
      where: { id },
      data: { type },
    });
  }

  delete(id: number) {
    return prisma.animalType.delete({ where: { id } });
  }

  async hasDependentAnimals(id: number): Promise<boolean> {
    const count = await prisma.animalOnType.count({
      where: { typeId: id },
    });
    return count > 0;
  }
}

export const animalTypeRepository = new AnimalTypeRepository();

