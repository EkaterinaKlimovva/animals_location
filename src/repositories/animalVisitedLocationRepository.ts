import { prisma } from '../app/database';
import type { AnimalVisitedLocation, LocationPoint, Animal } from '../generated/prisma/client';

export interface VisitedLocationResponse {
  id: number;
  locationPointId: number;
  dateTimeOfVisitLocationPoint: string;
}

export class AnimalVisitedLocationRepository {
  async findManyByAnimal(animalId: number): Promise<VisitedLocationResponse[]> {
    const locations = await prisma.animalVisitedLocation.findMany({
      where: { animalId },
      include: { locationPoint: true },
      orderBy: { id: 'asc' },
    });
    return locations.map(this.transformToResponse);
  }

  async findLocationById(locationPointId: number): Promise<LocationPoint | null> {
    return prisma.locationPoint.findUnique({
      where: { id: locationPointId },
    });
  }

  async findById(id: number): Promise<AnimalVisitedLocation | null> {
    return prisma.animalVisitedLocation.findUnique({
      where: { id },
    });
  }

  async findAnimalById(animalId: number): Promise<Animal | null> {
    return prisma.animal.findUnique({
      where: { id: animalId },
    });
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

  async create(data: {
    animalId: number;
    locationPointId: number;
    visitedAt?: Date;
  }): Promise<VisitedLocationResponse> {
    const location = await prisma.animalVisitedLocation.create({
      data: {
        animal: { connect: { id: data.animalId } },
        locationPoint: { connect: { id: data.locationPointId } },
        visitedAt: data.visitedAt,
      },
    });
    return this.transformToResponse(location);
  }

  async update(
    id: number,
    data: { locationPointId?: number; visitedAt?: Date },
  ): Promise<VisitedLocationResponse> {
    const location = await prisma.animalVisitedLocation.update({
      where: { id },
      data,
    });
    return this.transformToResponse(location);
  }

  async delete(id: number): Promise<AnimalVisitedLocation> {
    return prisma.animalVisitedLocation.delete({ where: { id } });
  }
}

export const animalVisitedLocationRepository =
  new AnimalVisitedLocationRepository();
