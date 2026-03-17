import type { Response } from 'express';
import { animalVisitedLocationService } from '../services/animalVisitedLocationService';
import { sendControllerSuccess, handleControllerError, handleNotFoundError, handleBusinessLogicError } from '../utils/controllerUtils';
import { ERROR_CODES, FirstVisitedLocationDeletedWithChippingNextError } from '../common';
import type {
  ListVisitedLocationsRequest,
  CreateVisitedLocationRequest,
  UpdateVisitedLocationRequest,
  DeleteVisitedLocationRequest,
} from '../types';
import { animalIdParamSchema, locationPointIdParamSchema, updateVisitedLocationBodySchema, createVisitedLocationBodySchema } from '../validation/visitedLocationSchemas';

export async function listVisitedLocations(
  req: ListVisitedLocationsRequest,
  res: Response,
): Promise<void> {
  const { animalId } = animalIdParamSchema.parse(req.params);

  try {
    const locations = await animalVisitedLocationService.listByAnimal(animalId);
    sendControllerSuccess(res, locations);
  } catch (error) {
    handleControllerError(res, error, '[VISITED_LOCATION_CONTROLLER] - listVisitedLocations');
  }
}

export async function createVisitedLocation(
  req: CreateVisitedLocationRequest,
  res: Response,
): Promise<void> {
  const { animalId } = animalIdParamSchema.parse(req.params);
  const { locationId } = locationPointIdParamSchema.parse(req.params);
  const { visitedAt } = createVisitedLocationBodySchema.parse(req.body);

  try {
    const created = await animalVisitedLocationService.create({
      animalId,
      locationPointId: Number(locationId),
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });
    res.status(201).json(created);
  } catch (error) {
    handleControllerError(res, error, '[VISITED_LOCATION_CONTROLLER] - createVisitedLocation');
  }
}

export async function updateVisitedLocation(
  req: UpdateVisitedLocationRequest,
  res: Response,
): Promise<void> {
  const { animalId } = animalIdParamSchema.parse(req.params);
  const { visitedLocationPointId, locationPointId, visitedAt } = updateVisitedLocationBodySchema.parse(req.body);

  try {
    const result = await animalVisitedLocationService.update(animalId, visitedLocationPointId, {
      locationPointId,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });

    if (result.data) {
      res.status(result.status).json(result.data);
    } else {
      res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    handleControllerError(res, error, '[VISITED_LOCATION_CONTROLLER] - updateVisitedLocation');
  }
}

export async function deleteVisitedLocation(
  req: DeleteVisitedLocationRequest,
  res: Response,
): Promise<void> {
  const { animalId } = animalIdParamSchema.parse(req.params);
  const { locationId: visitedPointId } = locationPointIdParamSchema.parse(req.params);

  try {
    await animalVisitedLocationService.delete(animalId, visitedPointId);
    sendControllerSuccess(res, { message: 'Visited location deleted successfully' });
  } catch (error) {
    if (error instanceof FirstVisitedLocationDeletedWithChippingNextError) {
      res.status(200).json({ message: 'Visited location deleted successfully' });
    } else {
      handleControllerError(res, error, '[VISITED_LOCATION_CONTROLLER] - deleteVisitedLocation');
    }
  }
}
