import { prisma } from '../app/database';
import type { Prisma, Animal, AnimalOnType, AnimalVisitedLocation, AnimalType, LocationPoint, Account } from '../generated/prisma/client';

const animalInclude = {
  types: {
    include: { type: true },
  },
  visitedLocations: {
    include: { locationPoint: true },
    orderBy: { visitedAt: 'asc' as const },
  },
  chipper: true,
  chippingLocation: true,
} satisfies Prisma.AnimalInclude;

export class AnimalRepository {
  findById(id: number): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  }) | null> {
    return prisma.animal.findUnique({
      where: { id },
      include: animalInclude,
    });
  }

  findManyByFilters(filters: {
    chipperId?: number;
    chippingLocationId?: number;
    startDateTime?: string;
    endDateTime?: string;
    lifeStatus?: 'ALIVE' | 'DEAD';
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    from?: number;
    size?: number;
  }): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  })[]> {
    const { chipperId, chippingLocationId, startDateTime, endDateTime, lifeStatus, gender, from = 0, size = 10 } = filters;

    const where: Prisma.AnimalWhereInput = {};

    if (chipperId !== undefined) where.chipperId = chipperId;
    if (chippingLocationId !== undefined) where.chippingLocationId = chippingLocationId;
    if (lifeStatus !== undefined) where.lifeStatus = lifeStatus;
    if (gender !== undefined) where.gender = gender;

    if (startDateTime || endDateTime) {
      where.chippingDateTime = {};
      if (startDateTime) where.chippingDateTime.gte = new Date(startDateTime);
      if (endDateTime) where.chippingDateTime.lte = new Date(endDateTime);
    }

    return prisma.animal.findMany({
      where,
      skip: from,
      take: size,
      orderBy: { id: 'asc' },
      include: animalInclude,
    });
  }

  create(data: {
    animalTypes: number[];
    weight: number;
    length: number;
    height: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    chipperId: number;
    chippingLocationId: number;
    lifeStatus: string;
    chippingDateTime: Date;
  }): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  })> {
    const { animalTypes, ...rest } = data;

    return prisma.animal.create({
      data: {
        ...rest,
        types: {
          create: animalTypes.map((typeId) => ({
            type: { connect: { id: typeId } },
          })),
        },
      },
      include: animalInclude,
    });
  }

  update(
    id: number,
    data: {
      animalTypes?: number[];
      weight?: number;
      length?: number;
      height?: number;
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
      lifeStatus?: 'ALIVE' | 'DEAD';
      chipperId?: number;
      chippingLocationId?: number;
      deathDateTime?: string;
    },
  ): Promise<(Animal & {
    types: (AnimalOnType & {
      type: AnimalType;
    })[];
    visitedLocations: (AnimalVisitedLocation & {
      locationPoint: LocationPoint;
    })[];
    chipper: Account | null;
    chippingLocation: LocationPoint | null;
  })> {
    const { animalTypes, deathDateTime, ...rest } = data;

    return prisma.animal.update({
      where: { id },
      data: {
        ...rest,
        deathDateTime: deathDateTime ? new Date(deathDateTime) : undefined,
        types: animalTypes
          ? {
            deleteMany: {},
            create: animalTypes.map((typeId) => ({
              type: { connect: { id: typeId } },
            })),
          }
          : undefined,
      },
      include: animalInclude,
    });
  }

  async delete(id: number): Promise<Animal> {
    // Delete related records first due to foreign key constraints
    await prisma.animalOnType.deleteMany({
      where: { animalId: id }
    });
    
    await prisma.animalVisitedLocation.deleteMany({
      where: { animalId: id }
    });
    
    return prisma.animal.delete({ where: { id } });
  }

  async hasDependentVisitedLocations(id: number): Promise<boolean> {
    const count = await prisma.animalVisitedLocation.count({ where: { animalId: id } });
    return count > 0;
  }

  async hasDependentTypes(id: number): Promise<boolean> {
    const count = await prisma.animalOnType.count({ where: { animalId: id } });
    return count > 0;
  }

  async hasDependents(id: number): Promise<boolean> {
    const [hasVisitedLocations, hasTypes] = await Promise.all([
      this.hasDependentVisitedLocations(id),
      this.hasDependentTypes(id),
    ]);
    return hasVisitedLocations || hasTypes;
  }
}

export const animalRepository = new AnimalRepository();
