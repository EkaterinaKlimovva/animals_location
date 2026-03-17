import { prisma } from '../app/database';
import type { AnimalVisitedLocation, LocationPoint, Animal } from '../generated/prisma/client';

export interface VisitedLocationResponse {
  id: number;
  locationPointId: number;
  dateTimeOfVisitLocationPoint: string;
}

export class AnimalVisitedLocationRepository {
  findManyByAnimal(animalId: number): Promise<VisitedLocationResponse[]> {
    return prisma.animalVisitedLocation.findMany({
      where: { animalId },
      include: { locationPoint: true },
      orderBy: { id: 'asc' },
    }).then(locations => locations.map(this.transformToResponse));
  }

  async findLocationById(locationPointId: number): Promise<LocationPoint | null> {
    const location = await prisma.locationPoint.findUnique({
      where: { id: locationPointId },
    });
    return location;
  }

  async findExistingVisit(animalId: number, locationPointId: number, excludeId?: number): Promise<AnimalVisitedLocation | null> {
    return prisma.animalVisitedLocation.findFirst({
      where: {
        animalId,
        locationPointId,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async findById(id: number): Promise<AnimalVisitedLocation | null> {
    return prisma.animalVisitedLocation.findUnique({
      where: { id },
    });
  }

  async findAnimalById(animalId: number): Promise<Animal | null> {
    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
    });
    return animal;
  }

  async findAnimalWithDetails(animalId: number): Promise<(Animal & {
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chippingLocation: LocationPoint | null;
  }) | null> {
    return prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        visitedLocations: {
          include: { locationPoint: true },
          orderBy: { id: 'asc' },
        },
        chippingLocation: true,
      },
    });
  }

  transformToResponse(location: {
    id: number;
    locationPointId: number;
    visitedAt: Date;
  }): VisitedLocationResponse {
    return {
      id: location.id,
      locationPointId: location.locationPointId,
      dateTimeOfVisitLocationPoint: location.visitedAt.toISOString(),
    };
  }

  create(data: {
    animalId: number;
    locationPointId: number;
    visitedAt?: Date;
  }): Promise<VisitedLocationResponse> {
    return prisma.animalVisitedLocation.create({
      data: {
        animal: { connect: { id: data.animalId } },
        locationPoint: { connect: { id: data.locationPointId } },
        visitedAt: data.visitedAt,
      },
    }).then(location => this.transformToResponse(location));
  }

  update(
    id: number,
    data: { locationPointId?: number; visitedAt?: Date },
  ): Promise<VisitedLocationResponse> {
    return prisma.animalVisitedLocation.update({
      where: { id },
      data,
    }).then(location => this.transformToResponse(location));
  }

  delete(id: number): Promise<AnimalVisitedLocation> {
    return prisma.animalVisitedLocation.delete({ where: { id } });
  }
}

export const animalVisitedLocationRepository =
  new AnimalVisitedLocationRepository();

