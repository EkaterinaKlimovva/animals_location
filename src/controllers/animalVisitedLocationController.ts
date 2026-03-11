import type { Response } from 'express';
import { animalVisitedLocationService } from '../services/animalVisitedLocationService';
import type {
  ListVisitedLocationsRequest,
  CreateVisitedLocationRequest,
  UpdateVisitedLocationRequest,
  DeleteVisitedLocationRequest,
} from '../types';
import { animalIdParamSchema, visitedLocationIdParamSchema } from '../routes/visitedLocations';

export async function listVisitedLocations(
  req: ListVisitedLocationsRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] listVisitedLocations called with params:', req.params);
  const { animalId } = animalIdParamSchema.parse(req.params);

  const locations = await animalVisitedLocationService.listByAnimal(animalId);
  console.log(`[VISITED_LOCATION_CONTROLLER] Found ${locations.length} visited locations for animalId: ${animalId}`);
  res.json(locations);
}

export async function createVisitedLocation(
  req: CreateVisitedLocationRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] createVisitedLocation called with params:', req.params, 'body:', req.body);
  const { animalId } = animalIdParamSchema.parse(req.params);
  const { locationPointId, visitedAt }: { locationPointId: number; visitedAt?: string } = req.body;

  if (!locationPointId) {
    console.log('[VISITED_LOCATION_CONTROLLER] Missing locationPointId - returning 400');
    res
      .status(400)
      .json({ message: 'locationPointId is required' });
    return;
  }

  try {
    const created = await animalVisitedLocationService.create({
      animalId,
      locationPointId,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location created successfully with id: ${created.id}`);
    res.status(201).json(created);
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error creating visited location:', err);
    res
      .status(400)
      .json({ message: 'Failed to create visited location' });
  }
}

export async function updateVisitedLocation(
  req: UpdateVisitedLocationRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] updateVisitedLocation called with params:', req.params, 'body:', req.body);
  const { id } = visitedLocationIdParamSchema.parse(req.params);
  const { locationPointId, visitedAt }: { locationPointId?: number; visitedAt?: string } = req.body;

  try {
    const updated = await animalVisitedLocationService.update(id, {
      locationPointId,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location updated successfully with id: ${updated.id}`);
    res.json(updated);
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error updating visited location:', err);
    res
      .status(404)
      .json({ message: 'Visited location not found' });
  }
}

export async function deleteVisitedLocation(
  req: DeleteVisitedLocationRequest,
  res: Response,
): Promise<void> {
  console.log('[VISITED_LOCATION_CONTROLLER] deleteVisitedLocation called with params:', req.params);
  const { id } = visitedLocationIdParamSchema.parse(req.params);

  try {
    await animalVisitedLocationService.delete(id);
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location deleted successfully with id: ${id}`);
    res.status(204).send();
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error deleting visited location:', err);
    res
      .status(404)
      .json({ message: 'Visited location not found' });
  }
}

