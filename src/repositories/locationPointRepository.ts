import { prisma } from '../prisma';

export class LocationPointRepository {
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
}

export const locationPointRepository = new LocationPointRepository();

