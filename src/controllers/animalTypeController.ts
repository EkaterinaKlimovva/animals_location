import type { Response } from 'express';
import { animalTypeService } from '../services/animalTypeService';
import {
  createAnimalTypeSchema,
  updateAnimalTypeSchema,
} from '../validation';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
  validateControllerTypeId,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES, CONTROLLER_PREFIXES } from '../common';
import type {
  GetAnimalTypeRequest,
  CreateAnimalTypeRequest,
  UpdateAnimalTypeRequest,
  DeleteAnimalTypeRequest,
} from '../types';
import type {
  CreateAnimalTypeInput,
  UpdateAnimalTypeInput,
} from '../validation';

export async function getAnimalType(req: GetAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const id = validateControllerTypeId(req.params.id);
    const animalType = await animalTypeService.getById(id);

    if (!animalType) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIXES.ANIMAL_TYPE} - getAnimalType`, ENTITY_NAMES.ANIMAL_TYPE);
      return;
    }

    sendControllerSuccess(res, animalType, SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.ANIMAL_TYPE));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIXES.ANIMAL_TYPE} - getAnimalType`);
  }
}

export async function createAnimalType(req: CreateAnimalTypeRequest, res: Response): Promise<void> {
  try {
    console.log('[ANIMAL_TYPE_CONTROLLER] Request body:', req.body);
    const animalTypeData: CreateAnimalTypeInput = createAnimalTypeSchema.parse(req.body);
    console.log('[ANIMAL_TYPE_CONTROLLER] Parsed data:', animalTypeData);
    const result = await animalTypeService.create(animalTypeData.type);

    if (result.conflict) {
      res.status(409).json({ message: 'Animal type already exists' });
      return;
    }

    sendControllerCreated(res, result.type, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.ANIMAL_TYPE));
  } catch (error) {
    console.log('[ANIMAL_TYPE_CONTROLLER] Error:', error);
    handleControllerError(res, error, `${CONTROLLER_PREFIXES.ANIMAL_TYPE} - createAnimalType`);
  }
}

export async function updateAnimalType(req: UpdateAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const id = validateControllerTypeId(req.params.id);
    const updateData: UpdateAnimalTypeInput = updateAnimalTypeSchema.parse(req.body);

    if (!updateData.type) {
      res.status(400).json({ message: 'Type is required for update' });
      return;
    }

    // Check if animal type exists
    const existingType = await animalTypeService.getById(id);
    if (!existingType) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIXES.ANIMAL_TYPE} - updateAnimalType`, ENTITY_NAMES.ANIMAL_TYPE);
      return;
    }

    // Check if the new type already exists (for another type)
    const typeByName = await animalTypeService.getByType(updateData.type);
    if (typeByName && typeByName.id !== id) {
      res.status(409).json({ message: 'Animal type already exists' });
      return;
    }

    const updated = await animalTypeService.update(id, updateData.type);
    sendControllerSuccess(res, updated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.ANIMAL_TYPE));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIXES.ANIMAL_TYPE} - updateAnimalType`);
  }
}

export async function deleteAnimalType(req: DeleteAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const id = validateControllerTypeId(req.params.id);

    // Check if animal type exists
    const animalType = await animalTypeService.getById(id);
    if (!animalType) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIXES.ANIMAL_TYPE} - deleteAnimalType`, ENTITY_NAMES.ANIMAL_TYPE);
      return;
    }

    // Check for dependent animals
    const hasDependents = await animalTypeService.hasDependentAnimals(id);
    if (hasDependents) {
      res.status(400).json({ message: 'Cannot delete animal type: it has dependent animals' });
      return;
    }

    await animalTypeService.delete(id);
    sendControllerSuccess(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.ANIMAL_TYPE));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIXES.ANIMAL_TYPE} - deleteAnimalType`);
  }
}
