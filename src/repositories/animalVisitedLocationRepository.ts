import { prisma } from '../prisma';

export class AnimalVisitedLocationRepository {
  findManyByAnimal(animalId: number) {
    return prisma.animalVisitedLocation.findMany({
      where: { animalId },
      include: { locationPoint: true },
      orderBy: { visitedAt: 'asc' },
    });
  }

  create(data: {
    animalId: number;
    locationPointId: number;
    visitedAt?: Date;
  }) {
    return prisma.animalVisitedLocation.create({
      data: {
        animal: { connect: { id: data.animalId } },
        locationPoint: { connect: { id: data.locationPointId } },
        visitedAt: data.visitedAt,
      },
    });
  }

  update(
    id: number,
    data: { locationPointId?: number; visitedAt?: Date },
  ) {
    return prisma.animalVisitedLocation.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return prisma.animalVisitedLocation.delete({ where: { id } });
  }
}

export const animalVisitedLocationRepository =
  new AnimalVisitedLocationRepository();

