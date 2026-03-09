import type { Response } from 'express';
import { animalVisitedLocationService } from '../services/animalVisitedLocationService';
import type {
  ListVisitedLocationsRequest,
  CreateVisitedLocationRequest,
  UpdateVisitedLocationRequest,
  DeleteVisitedLocationRequest,
} from '../types';

export async function listVisitedLocations(
  req: ListVisitedLocationsRequest,
  res: Response,
) {
  console.log('[VISITED_LOCATION_CONTROLLER] listVisitedLocations called with params:', req.params);
  const animalId = Number(req.params.animalId);

  if (!Number.isInteger(animalId) || animalId <= 0) {
    console.log('[VISITED_LOCATION_CONTROLLER] Invalid animal id detected - returning 400');
    return res.status(400).json({ message: 'Invalid animal id' });
  }

  const locations = await animalVisitedLocationService.listByAnimal(animalId);
  console.log(`[VISITED_LOCATION_CONTROLLER] Found ${locations.length} visited locations for animalId: ${animalId}`);
  return res.json(locations);
}

export async function createVisitedLocation(
  req: CreateVisitedLocationRequest,
  res: Response,
) {
  console.log('[VISITED_LOCATION_CONTROLLER] createVisitedLocation called with params:', req.params, 'body:', req.body);
  const animalId = Number(req.params.animalId);
  const { locationPointId, visitedAt } = req.body;

  if (!Number.isInteger(animalId) || animalId <= 0) {
    console.log('[VISITED_LOCATION_CONTROLLER] Invalid animal id detected - returning 400');
    return res.status(400).json({ message: 'Invalid animal id' });
  }

  if (!locationPointId) {
    console.log('[VISITED_LOCATION_CONTROLLER] Missing locationPointId - returning 400');
    return res
      .status(400)
      .json({ message: 'locationPointId is required' });
  }

  try {
    const created = await animalVisitedLocationService.create({
      animalId,
      locationPointId,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location created successfully with id: ${created.id}`);
    return res.status(201).json(created);
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error creating visited location:', err);
    return res
      .status(400)
      .json({ message: 'Failed to create visited location' });
  }
}

export async function updateVisitedLocation(
  req: UpdateVisitedLocationRequest,
  res: Response,
) {
  console.log('[VISITED_LOCATION_CONTROLLER] updateVisitedLocation called with params:', req.params, 'body:', req.body);
  const id = Number(req.params.id);
  const { locationPointId, visitedAt } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[VISITED_LOCATION_CONTROLLER] Invalid visited location id detected - returning 400');
    return res.status(400).json({ message: 'Invalid visited location id' });
  }

  try {
    const updated = await animalVisitedLocationService.update(id, {
      locationPointId,
      visitedAt: visitedAt ? new Date(visitedAt) : undefined,
    });
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location updated successfully with id: ${updated.id}`);
    return res.json(updated);
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error updating visited location:', err);
    return res
      .status(404)
      .json({ message: 'Visited location not found' });
  }
}

export async function deleteVisitedLocation(
  req: DeleteVisitedLocationRequest,
  res: Response,
) {
  console.log('[VISITED_LOCATION_CONTROLLER] deleteVisitedLocation called with params:', req.params);
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[VISITED_LOCATION_CONTROLLER] Invalid visited location id detected - returning 400');
    return res.status(400).json({ message: 'Invalid visited location id' });
  }

  try {
    await animalVisitedLocationService.delete(id);
    console.log(`[VISITED_LOCATION_CONTROLLER] Visited location deleted successfully with id: ${id}`);
    return res.status(204).send();
  } catch (err) {
    console.log('[VISITED_LOCATION_CONTROLLER] Error deleting visited location:', err);
    return res
      .status(404)
      .json({ message: 'Visited location not found' });
  }
}

