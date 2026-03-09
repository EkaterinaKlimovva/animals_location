import type { Response } from 'express';
import { animalTypeService } from '../services/animalTypeService';
import type {
  GetAnimalTypeRequest,
  CreateAnimalTypeRequest,
  UpdateAnimalTypeRequest,
  DeleteAnimalTypeRequest,
} from '../types';

export async function getAnimalType(req: GetAnimalTypeRequest, res: Response) {
  console.log('[ANIMAL_TYPE_CONTROLLER] getAnimalType called with params:', req.params);
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Invalid animal type id detected - returning 400');
    return res.status(400).json({ message: 'Invalid animal type id' });
  }

  const type = await animalTypeService.getById(id);

  if (!type) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Animal type not found - returning 404');
    return res.status(404).json({ message: 'Animal type not found' });
  }

  console.log('[ANIMAL_TYPE_CONTROLLER] Animal type found - returning type data');
  return res.json(type);
}

export async function createAnimalType(req: CreateAnimalTypeRequest, res: Response) {
  console.log('[ANIMAL_TYPE_CONTROLLER] createAnimalType called with body:', req.body);
  const { type } = req.body;

  if (!type) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Missing type field - returning 400');
    return res.status(400).json({ message: 'Type is required' });
  }

  const result = await animalTypeService.create(type);

  if (result.conflict) {
    console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type already exists: ${type} - returning 409`);
    return res.status(409).json({ message: 'Animal type already exists' });
  }

  console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type created successfully with id: ${result.type.id}`);
  return res.status(201).json(result.type);
}

export async function updateAnimalType(req: UpdateAnimalTypeRequest, res: Response) {
  console.log('[ANIMAL_TYPE_CONTROLLER] updateAnimalType called with params:', req.params, 'body:', req.body);
  const id = Number(req.params.id);
  const { type } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Invalid animal type id detected - returning 400');
    return res.status(400).json({ message: 'Invalid animal type id' });
  }

  if (!type) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Missing type field - returning 400');
    return res.status(400).json({ message: 'Type is required' });
  }

  const updated = await animalTypeService.update(id, type);
  console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type updated successfully with id: ${updated.id}`);
  return res.json(updated);
}

export async function deleteAnimalType(req: DeleteAnimalTypeRequest, res: Response) {
  console.log('[ANIMAL_TYPE_CONTROLLER] deleteAnimalType called with params:', req.params);
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Invalid animal type id detected - returning 400');
    return res.status(400).json({ message: 'Invalid animal type id' });
  }

  await animalTypeService.delete(id);
  console.log(`[ANIMAL_TYPE_CONTROLLER] Animal type deleted successfully with id: ${id}`);
  return res.status(204).send();
}

