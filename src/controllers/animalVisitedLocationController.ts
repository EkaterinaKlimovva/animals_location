import type { Response } from 'express';
import { animalVisitedLocationService } from '../services/animalVisitedLocationService';
import { animalService } from '../services/animalService';
import { sendControllerSuccess, handleControllerError } from '../utils/controllerUtils';
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
  try {
    const { animalId } = animalIdParamSchema.parse(req.params);

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
  try {
    const { animalId } = animalIdParamSchema.parse(req.params);
    const { locationId } = locationPointIdParamSchema.parse(req.params);
    const { visitedAt } = createVisitedLocationBodySchema.parse(req.body);

    const animal = await animalService.getById(animalId);
    if (!animal) {
      res.status(404).json({ message: 'Animal not found.' });
      return;
    }

    if (animal.visitedLocations.length === 0 && animal.chippingLocationId === Number(locationId)) {
      res.status(400).json({ message: 'Animal has not left the chipping location yet.' });
      return;
    }

    const locations = await animalVisitedLocationService.listByAnimal(animalId);
    if (locations.length > 0) {
      const lastVisitedLocation = locations[locations.length - 1];
      if (lastVisitedLocation.locationPointId === Number(locationId)) {
        res.status(400).json({ message: 'The new visited location cannot be the same as the last one.' });
        return;
      }
    }

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
  try {
    const { animalId } = animalIdParamSchema.parse(req.params);
    const { visitedLocationPointId, locationPointId, visitedAt } = updateVisitedLocationBodySchema.parse(req.body);

    const animal = await animalService.getById(animalId);
    if (!animal) {
      res.status(404).json({ message: 'Animal not found.' });
      return;
    }

    const locations = await animalVisitedLocationService.listByAnimal(animalId);
    const locationIndex = locations.findIndex(loc => loc.id === visitedLocationPointId);

    if (locationIndex === -1) {
      res.status(404).json({ message: 'Visited location not found.' });
      return;
    }

    if (locationIndex === 0 && locationPointId === animal.chippingLocationId) {
      res.status(400).json({ message: 'Cannot update the first visited location to the chipping location.' });
      return;
    }

    if (locations[locationIndex].locationPointId === locationPointId) {
      res.status(400).json({ message: 'The new location point cannot be the same as the current one.' });
      return;
    }

    const prevLocation = locations[locationIndex - 1];
    if (prevLocation && prevLocation.locationPointId === locationPointId) {
      res.status(400).json({ message: 'The new location point cannot be the same as the previous one.' });
      return;
    }

    const nextLocation = locations[locationIndex + 1];
    if (nextLocation && nextLocation.locationPointId === locationPointId) {
      res.status(400).json({ message: 'The new location point cannot be the same as the next one.' });
      return;
    }

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
  try {
    const { animalId } = animalIdParamSchema.parse(req.params);
    const { locationId: visitedPointId } = locationPointIdParamSchema.parse(req.params);

    const animal = await animalService.getById(animalId);
    if (!animal) {
      res.status(404).json({ message: 'Animal not found.' });
      return;
    }

    const locations = await animalVisitedLocationService.listByAnimal(animalId);
    if (locations.length > 1 && locations[0].id === Number(visitedPointId) && locations[1].locationPointId === animal.chippingLocationId) {
      await animalVisitedLocationService.delete(animalId, locations[1].id);
    }

    const result = await animalVisitedLocationService.delete(animalId, Number(visitedPointId));
    res.status(result.status).json({ message: 'Visited location deleted successfully' });
  } catch (error) {
    handleControllerError(res, error, '[VISITED_LOCATION_CONTROLLER] - deleteVisitedLocation');
  }
}
