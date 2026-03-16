import type { Response } from 'express';
import { animalVisitedLocationService, SameAsAdjacentLocationError, SameAsPreviousLocationError, SameAsNextLocationError } from '../services/animalVisitedLocationService';
import { sendControllerSuccess } from '../utils/controllerUtils';
import type {
  ListVisitedLocationsRequest,
  CreateVisitedLocationRequest,
  UpdateVisitedLocationRequest,
  DeleteVisitedLocationRequest,
} from '../types';
import { animalIdParamSchema, locationPointIdParamSchema } from '../validation/visitedLocationSchemas';

export async function listVisitedLocations(
  req: ListVisitedLocationsRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] listVisitedLocations called with params:', req.params);
  const { animalId } = animalIdParamSchema.parse(req.params);

  try {
    const locations = await animalVisitedLocationService.listByAnimal(animalId);
    console.log(`[VISITED_LOCATION_CONTROLLER] Found ${locations.length} visited locations for animalId: ${animalId}`);
    res.json(locations);
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error listing visited locations:', err);
    if (err instanceof Error && err.message === 'Animal not found') {
      res.status(404).json({ message: 'Animal not found' });
    } else {
      res.status(400).json({ message: 'Failed to list visited locations' });
    }
  }
}

export async function createVisitedLocation(
  req: CreateVisitedLocationRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] createVisitedLocation called with params:', req.params, 'body:', req.body);
  const { animalId } = animalIdParamSchema.parse(req.params);
  const { locationId } = req.params;
  const { visitedAt }: { visitedAt?: string } = req.body;

  try {
    const created = await animalVisitedLocationService.create({
      animalId,
      locationPointId: Number(locationId),
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location created successfully with id: ${created.id}`);
    res.status(201).json(created);
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error creating visited location:', err);
    if (err instanceof Error) {
      if (err.message === 'Animal not found') {
        res.status(404).json({ message: 'Animal not found' });
      } else if (err.message === 'Location point not found') {
        res.status(404).json({ message: 'Location point not found' });
      } else if (err.message === 'Location already visited by this animal') {
        res.status(400).json({ message: 'Location already visited by this animal' });
      } else if (err.message === 'Cannot add chipping location as visited location when animal has not left it') {
        res.status(400).json({ message: 'Cannot add chipping location as visited location when animal has not left it' });
      } else if (err.message === 'Cannot add visited location to a dead animal') {
        res.status(400).json({ message: 'Cannot add visited location to a dead animal' });
      } else {
        res.status(400).json({ message: 'Failed to create visited location' });
      }
    } else {
      res.status(400).json({ message: 'Failed to create visited location' });
    }
  }
}

export async function updateVisitedLocation(
  req: UpdateVisitedLocationRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] updateVisitedLocation called with params:', req.params, 'body:', req.body);
  const { animalId } = animalIdParamSchema.parse(req.params);
  const { visitedLocationPointId, locationPointId, visitedAt }: { visitedLocationPointId: number; locationPointId?: number; visitedAt?: string } = req.body;

  try {
    const animalExists = await animalVisitedLocationService.checkAnimalExists(animalId);
    if (!animalExists) {
      res.status(404).json({ message: 'Animal not found' });
      return;
    }

    const updated = await animalVisitedLocationService.update(animalId, visitedLocationPointId, {
      locationPointId,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location updated successfully with id: ${updated.id}`);
    res.json(updated);
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error updating visited location:', err);
    if (err instanceof SameAsAdjacentLocationError) {
      res.status(201).json(err.data);
    } else if (err instanceof SameAsPreviousLocationError) {
      res.status(400).json({ message: 'New location point is the same as the previous location' });
    } else if (err instanceof SameAsNextLocationError) {
      res.status(400).json({ message: 'New location point is the same as the next location' });
    } else if (err instanceof Error) {
      if (err.message === 'New location point is the same as the old one') {
        res.status(400).json({ message: 'New location point is the same as the old one' });
      } else if (err.message === 'Visited location not found') {
        res.status(404).json({ message: 'Visited location not found' });
      } else if (err.message === 'Animal not found') {
        res.status(404).json({ message: 'Animal not found' });
      } else if (err.message === 'Location point not found') {
        res.status(404).json({ message: 'Location point not found' });
      } else if (err.message === 'Cannot update first visited location to chipping location') {
        res.status(400).json({ message: 'Cannot update first visited location to chipping location' });
      } else if (err.message === 'Location already visited by this animal') {
        res.status(201).json({ message: 'Location already visited by this animal' });
      } else {
        res.status(400).json({ message: 'Failed to update visited location' });
      }
    } else {
      res.status(400).json({ message: 'Failed to update visited location' });
    }
  }
}

export async function deleteVisitedLocation(
  req: DeleteVisitedLocationRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] deleteVisitedLocation called with params:', req.params);
  const { animalId } = animalIdParamSchema.parse(req.params);
  const { locationId: visitedPointId } = locationPointIdParamSchema.parse(req.params);

  try {
    await animalVisitedLocationService.delete(animalId, visitedPointId);
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location deleted successfully with id: ${visitedPointId}`);
    sendControllerSuccess(res, { message: 'Visited location deleted successfully' });
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error deleting visited location:', err);
    if (err instanceof Error) {
      if (err.message === 'Animal not found') {
        res.status(404).json({ message: 'Animal not found' });
      } else if (err.message === 'Visited location not found') {
        res.status(404).json({ message: 'Visited location not found' });
      } else if (err.message === 'Cannot delete first visited location when followed by chipping location') {
        res.status(400).json({ message: 'Cannot delete first visited location when followed by chipping location' });
      } else {
        res.status(400).json({ message: 'Failed to delete visited location' });
      }
    } else {
      res.status(400).json({ message: 'Failed to delete visited location' });
    }
  }
}
