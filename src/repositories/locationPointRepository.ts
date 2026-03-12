import { prisma } from '../app/database';

export class LocationPointRepository {
  findAll() {
    return prisma.locationPoint.findMany();
  }

  findById(id: number) {
    return prisma.locationPoint.findUnique({ where: { id } });
  }

  create(data: { latitude: number; longitude: number }) {
    return prisma.locationPoint.create({ data });
  }

  update(
    id: number,
    data: {
      latitude?: number;
      longitude?: number;
    },
  ) {
    return prisma.locationPoint.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return prisma.locationPoint.delete({ where: { id } });
  }

  async hasDependentAnimals(id: number): Promise<boolean> {
    const count = await prisma.animal.count({
      where: { chippingLocationId: id },
    });
    return count > 0;
  }

  async hasDependentVisitedLocations(id: number): Promise<boolean> {
    const count = await prisma.animalVisitedLocation.count({
      where: { locationPointId: id },
    });
    return count > 0;
  }

  async hasDependents(id: number): Promise<boolean> {
    const [hasAnimals, hasVisitedLocations] = await Promise.all([
      this.hasDependentAnimals(id),
      this.hasDependentVisitedLocations(id),
    ]);
    return hasAnimals || hasVisitedLocations;
  }
}

export const locationPointRepository = new LocationPointRepository();

