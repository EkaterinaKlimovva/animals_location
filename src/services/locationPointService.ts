import { locationPointRepository } from '../repositories/locationPointRepository';

export class LocationPointService {
  getById(id: number) {
    return locationPointRepository.findById(id);
  }

  create(data: { latitude: number; longitude: number }) {
    return locationPointRepository.create(data);
  }

  update(
    id: number,
    data: {
      latitude?: number;
      longitude?: number;
    },
  ) {
    return locationPointRepository.update(id, data);
  }

  delete(id: number) {
    return locationPointRepository.delete(id);
  }
}

export const locationPointService = new LocationPointService();

