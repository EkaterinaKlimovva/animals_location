import { prisma } from '../prisma';

export class AnimalRepository {
  findById(id: number) {
    return prisma.animal.findUnique({
      where: { id },
      include: {
        types: {
          include: {
            type: true,
          },
        },
        visitedLocations: {
          include: {
            locationPoint: true,
          },
          orderBy: {
            visitedAt: 'asc',
          },
        },
        chipper: true,
        chippingLocation: true,
      },
    });
  }

  findManyByFilters(filters: { chipperId?: number; chippingLocationId?: number }) {
    const where: any = {};

    if (filters.chipperId !== undefined) {
      where.chipperId = filters.chipperId;
    }

    if (filters.chippingLocationId !== undefined) {
      where.chippingLocationId = filters.chippingLocationId;
    }

    return prisma.animal.findMany({
      where,
      include: {
        types: {
          include: {
            type: true,
          },
        },
        visitedLocations: {
          include: {
            locationPoint: true,
          },
          orderBy: {
            visitedAt: 'asc',
          },
        },
        chipper: true,
        chippingLocation: true,
      },
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
  }) {
    const { animalTypes, ...rest } = data;

    return prisma.animal.create({
      data: {
        ...rest,
        types: animalTypes
          ? {
            create: animalTypes.map((typeId) => ({
              type: { connect: { id: typeId } },
            })),
          }
          : undefined,
      },
      include: {
        types: {
          include: {
            type: true,
          },
        },
        visitedLocations: {
          include: {
            locationPoint: true,
          },
          orderBy: {
            visitedAt: 'asc',
          },
        },
        chipper: true,
        chippingLocation: true,
      },
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
  ) {
    const { animalTypes, ...rest } = data;

    return prisma.animal.update({
      where: { id },
      data: {
        ...rest,
        deathDateTime: data.deathDateTime ? new Date(data.deathDateTime) : undefined,
        types: animalTypes
          ? {
            deleteMany: {},
            create: animalTypes.map((typeId) => ({
              type: { connect: { id: typeId } },
            })),
          }
          : undefined,
      },
      include: {
        types: {
          include: {
            type: true,
          },
        },
        visitedLocations: {
          include: {
            locationPoint: true,
          },
          orderBy: {
            visitedAt: 'asc',
          },
        },
        chipper: true,
        chippingLocation: true,
      },
    });
  }

  delete(id: number) {
    return prisma.animal.delete({ where: { id } });
  }
}

export const animalRepository = new AnimalRepository();

