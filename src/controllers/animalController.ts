import type { Response } from 'express';
import { animalService } from '../services/animalService';
import {
  searchAnimalsSchema,
  createAnimalSchema,
  updateAnimalSchema,
  animalIdSchema,
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
  GetAnimalRequest,
  SearchAnimalsRequest,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  DeleteAnimalRequest,
  AddAnimalTypeRequest,
  RemoveAnimalTypeRequest,
} from '../types';

const CONTROLLER_PREFIX = '[ANIMAL_CONTROLLER]';

export async function getAnimal(req: GetAnimalRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdSchema.parse(req.params);
    const animal = await animalService.getById(id);

    if (!animal) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - getAnimal`, ENTITY_NAMES.ANIMAL);
      return;
    }

    sendControllerSuccess(res, animal, SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - getAnimal`);
  }
}

export async function searchAnimals(req: SearchAnimalsRequest, res: Response): Promise<void> {
  try {
    const searchParams = searchAnimalsSchema.parse(req.query);
    const animals = await animalService.search(searchParams);

    sendControllerSuccess(res, animals, SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(animals.length, ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - searchAnimals`);
  }
}

export async function createAnimal(req: CreateAnimalRequest, res: Response): Promise<void> {
  try {
    const animalData = createAnimalSchema.parse(req.body);
    const animal = await animalService.create(animalData);

    sendControllerCreated(res, animal, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createAnimal`);
  }
}

export async function updateAnimal(req: UpdateAnimalRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdSchema.parse(req.params);
    const updateData = updateAnimalSchema.parse(req.body);

    const updated = await animalService.update(id, updateData);
    sendControllerSuccess(res, updated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateAnimal`);
  }
}

export async function deleteAnimal(req: DeleteAnimalRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdSchema.parse(req.params);
    await animalService.delete(id);

    sendControllerNoContent(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteAnimal`);
  }
}

export async function addAnimalType(req: AddAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdSchema.parse(req.params);
    const { typeId } = req.body;

    const validation = validateControllerTypeId(typeId);
    if (!validation.isValid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    await animalService.addTypeToAnimal(id, typeId);
    sendControllerSuccess(res, { message: 'Animal type added successfully' }, 'Animal type added successfully');
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - addAnimalType`);
  }
}

export async function removeAnimalType(req: RemoveAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdSchema.parse(req.params);
    const { typeId } = req.params;

    const validation = validateControllerTypeId(typeId);
    if (!validation.isValid) {
      res.status(400).json({ message: validation.message });
      return;
    }

    await animalService.removeTypeFromAnimal(id, Number(typeId));
    sendControllerSuccess(res, { message: 'Animal type removed successfully' }, 'Animal type removed successfully');
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - removeAnimalType`);
  }
}
