import { prisma } from '../app/database';
import type { LocationPoint } from '../generated/prisma/client';

export class LocationPointRepository {
  findAll(): Promise<LocationPoint[]> {
    return prisma.locationPoint.findMany();
  }

  findById(id: number): Promise<LocationPoint | null> {
    return prisma.locationPoint.findUnique({ where: { id } });
  }

  findByCoordinates(latitude: number, longitude: number): Promise<LocationPoint | null> {
    return prisma.locationPoint.findUnique({
      where: {
        latitude_longitude: {
          latitude,
          longitude,
        },
      },
    });
  }

  create(data: { latitude: number; longitude: number }): Promise<LocationPoint> {
    return prisma.locationPoint.create({ data });
  }

  update(
    id: number,
    data: {
      latitude?: number;
      longitude?: number;
    },
  ): Promise<LocationPoint> {
    return prisma.locationPoint.update({
      where: { id },
      data,
    });
  }

  delete(id: number): Promise<LocationPoint> {
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

