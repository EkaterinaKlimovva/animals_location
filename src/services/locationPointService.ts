import { locationPointRepository } from '../repositories/locationPointRepository';

interface CreateLocationPointData {
  latitude: number;
  longitude: number;
}

interface UpdateLocationPointData {
  latitude?: number;
  longitude?: number;
}

export class LocationPointService {
  getAll() {
    return locationPointRepository.findAll();
  }

  getById(id: number) {
    return locationPointRepository.findById(id);
  }

  create(data: CreateLocationPointData) {
    return locationPointRepository.create(data);
  }

  update(id: number, data: UpdateLocationPointData) {
    return locationPointRepository.update(id, data);
  }

  delete(id: number) {
    return locationPointRepository.delete(id);
  }

  async hasDependents(id: number): Promise<boolean> {
    return locationPointRepository.hasDependents(id);
  }
}

export const locationPointService = new LocationPointService();

