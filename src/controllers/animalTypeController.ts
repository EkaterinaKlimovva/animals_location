import type { Response } from 'express';
import { animalTypeService } from '../services/animalTypeService';
import type {
  GetAnimalTypeRequest,
  CreateAnimalTypeRequest,
  UpdateAnimalTypeRequest,
  DeleteAnimalTypeRequest,
} from '../types';

export async function getAnimalType(req: GetAnimalTypeRequest, res: Response): Promise<void> {
  console.log('[ANIMAL_TYPE_CONTROLLER] getAnimalType called with params:', req.params);
  const id: number = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Invalid animal type id detected - returning 400');
    res.status(400).json({ message: 'Invalid animal type id' });
    return;
  }

  const type = await animalTypeService.getById(id);

  if (!type) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Animal type not found - returning 404');
    res.status(404).json({ message: 'Animal type not found' });
    return;
  }

  console.log('[ANIMAL_TYPE_CONTROLLER] Animal type found - returning type data');
  res.json(type);
}

export async function createAnimalType(req: CreateAnimalTypeRequest, res: Response): Promise<void> {
  console.log('[ANIMAL_TYPE_CONTROLLER] createAnimalType called with body:', req.body);
  const { type }: { type: string } = req.body;

  if (!type) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Missing type field - returning 400');
    res.status(400).json({ message: 'Type is required' });
    return;
  }

  const result = await animalTypeService.create(type);

  if (result.conflict) {
    console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type already exists: ${type} - returning 409`);
    res.status(409).json({ message: 'Animal type already exists' });
    return;
  }

  console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type created successfully with id: ${result.type.id}`);
  res.status(201).json(result.type);
}

export async function updateAnimalType(req: UpdateAnimalTypeRequest, res: Response): Promise<void> {
  console.log('[ANIMAL_TYPE_CONTROLLER] updateAnimalType called with params:', req.params, 'body:', req.body);
  const id: number = Number(req.params.id);
  const { type }: { type?: string } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Invalid animal type id detected - returning 400');
    res.status(400).json({ message: 'Invalid animal type id' });
    return;
  }

  if (!type) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Missing type field - returning 400');
    res.status(400).json({ message: 'Type is required' });
    return;
  }

  const updated = await animalTypeService.update(id, type);
  console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type updated successfully with id: ${updated.id}`);
  res.json(updated);
}

export async function deleteAnimalType(req: DeleteAnimalTypeRequest, res: Response): Promise<void> {
  console.log('[ANIMAL_TYPE_CONTROLLER] deleteAnimalType called with params:', req.params);
  const id: number = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Invalid animal type id detected - returning 400');
    res.status(400).json({ message: 'Invalid animal type id' });
    return;
  }

  // Check if animal type exists
  const type = await animalTypeService.getById(id);
  if (!type) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Animal type not found - returning 404');
    res.status(404).json({ message: 'Animal type not found' });
    return;
  }

  // Check for dependent animals
  const hasDependents = await animalTypeService.hasDependentAnimals(id);
  if (hasDependents) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Animal type has dependent animals - returning 400');
    res.status(400).json({ message: 'Cannot delete animal type: it has dependent animals' });
    return;
  }

  await animalTypeService.delete(id);
  console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type deleted successfully with id: ${id}`);
  res.status(204).send();
}

