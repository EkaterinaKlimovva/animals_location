import { prisma } from '../prisma';

export class AnimalTypeRepository {
  findById(id: number) {
    return prisma.animalType.findUnique({ where: { id } });
  }

  findByName(name: string) {
    return prisma.animalType.findUnique({ where: { name } });
  }

  create(name: string) {
    return prisma.animalType.create({ data: { name } });
  }

  update(id: number, name: string) {
    return prisma.animalType.update({
      where: { id },
      data: { name },
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

