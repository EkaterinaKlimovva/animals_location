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
  sendControllerNoContent,
  validateControllerTypeId,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../utils/constants';
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

const CONTROLLER_PREFIX = '[ANIMAL_TYPE_CONTROLLER]';

export async function getAnimalType(req: GetAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const id = validateControllerTypeId(req.params.id);
    const animalType = await animalTypeService.getById(id);

    if (!animalType) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - getAnimalType`, ENTITY_NAMES.ANIMAL_TYPE);
      return;
    }

    sendControllerSuccess(res, animalType, SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.ANIMAL_TYPE));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - getAnimalType`);
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
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createAnimalType`);
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

    const updated = await animalTypeService.update(id, updateData.type);
    sendControllerSuccess(res, updated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.ANIMAL_TYPE));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateAnimalType`);
  }
}

export async function deleteAnimalType(req: DeleteAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const id = validateControllerTypeId(req.params.id);

    // Check if animal type exists
    const animalType = await animalTypeService.getById(id);
    if (!animalType) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - deleteAnimalType`, ENTITY_NAMES.ANIMAL_TYPE);
      return;
    }

    // Check for dependent animals
    const hasDependents = await animalTypeService.hasDependentAnimals(id);
    if (hasDependents) {
      res.status(400).json({ message: 'Cannot delete animal type: it has dependent animals' });
      return;
    }

    await animalTypeService.delete(id);
    sendControllerNoContent(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.ANIMAL_TYPE));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteAnimalType`);
  }
}

