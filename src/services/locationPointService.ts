import { locationPointRepository } from '../repositories/locationPointRepository';
import { createLocationPointSchema, updateLocationPointSchema } from '../validation';
import type { CreateLocationPointData, UpdateLocationPointData } from '../types';
import { ERROR_MESSAGES } from '../common';

export class LocationPointService {
  getAll() {
    return locationPointRepository.findAll();
  }

  getById(id: number) {
    return locationPointRepository.findById(id);
  }

  async create(data: CreateLocationPointData) {
    // Validate input data using Zod schema
    const validatedData = createLocationPointSchema.parse(data);

    // Check if location point with these coordinates already exists
    const existing = await locationPointRepository.findByCoordinates(validatedData.latitude, validatedData.longitude);
    if (existing) {
      throw new Error(ERROR_MESSAGES.LOCATION_POINT_COORDINATES_EXIST);
    }

    return locationPointRepository.create(validatedData);
  }

  async update(id: number, data: UpdateLocationPointData) {
    // Validate input data using Zod schema
    const validatedData = updateLocationPointSchema.parse(data);

    // Check if location point exists
    const existing = await locationPointRepository.findById(id);
    if (!existing) {
      throw new Error(ERROR_MESSAGES.LOCATION_POINT_NOT_FOUND);
    }

    return locationPointRepository.update(id, validatedData);
  }

  delete(id: number) {
    return locationPointRepository.delete(id);
  }

  async hasDependents(id: number): Promise<boolean> {
    return locationPointRepository.hasDependents(id);
  }
}

export const locationPointService = new LocationPointService();
