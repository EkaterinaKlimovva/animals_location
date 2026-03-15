import type { Response } from 'express';
import { animalService } from '../services/animalService';
import { animalTypeRepository } from '../repositories/animalTypeRepository';
import { locationPointRepository } from '../repositories/locationPointRepository';
import { accountRepository } from '../repositories/accountRepository';
import {
  searchAnimalsSchema,
  createAnimalSchema,
  updateAnimalSchema,
  animalIdParamSchema,
} from '../validation';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
  validateControllerTypeId,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../utils/constants';
import { transformAnimalResponse } from '../utils/animalResponseTransformer';
import type {
  GetAnimalRequest,
  SearchAnimalsRequest,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  DeleteAnimalRequest,
  AddAnimalTypeRequest,
  RemoveAnimalTypeRequest,
} from '../types';
import type {
  SearchAnimalsInput,
  CreateAnimalInput,
  UpdateAnimalInput,
} from '../validation';

const CONTROLLER_PREFIX = '[ANIMAL_CONTROLLER]';

export async function getAnimal(req: GetAnimalRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdParamSchema.parse(req.params);
    const animal = await animalService.getById(id);

    if (!animal) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - getAnimal`, ENTITY_NAMES.ANIMAL);
      return;
    }

    const transformedAnimal = transformAnimalResponse(animal);
    sendControllerSuccess(res, transformedAnimal, SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - getAnimal`);
  }
}

export async function searchAnimals(req: SearchAnimalsRequest, res: Response): Promise<void> {
  try {
    const searchParams: SearchAnimalsInput = searchAnimalsSchema.parse(req.query);
    const animals = await animalService.search(searchParams);

    const transformedAnimals = animals.map(transformAnimalResponse);
    sendControllerSuccess(res, transformedAnimals, SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(animals.length, ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - searchAnimals`);
  }
}

export async function createAnimal(req: CreateAnimalRequest, res: Response): Promise<void> {
  try {
    const animalData: CreateAnimalInput = createAnimalSchema.parse(req.body);

    // Validate that all animal types exist
    for (const typeId of animalData.animalTypes) {
      const animalType = await animalTypeRepository.findById(typeId);
      if (!animalType) {
        handleControllerNotFound(res, `${CONTROLLER_PREFIX} - createAnimal`, `${ENTITY_NAMES.ANIMAL_TYPE} with id ${typeId}`);
        return;
      }
    }

    // Validate that chipping location exists
    const chippingLocation = await locationPointRepository.findById(animalData.chippingLocationId);
    if (!chippingLocation) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - createAnimal`, `${ENTITY_NAMES.LOCATION_POINT} with id ${animalData.chippingLocationId}`);
      return;
    }

    // Validate that chipper exists
    const chipper = await accountRepository.findById(animalData.chipperId);
    if (!chipper) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - createAnimal`, `${ENTITY_NAMES.ACCOUNT} with id ${animalData.chipperId}`);
      return;
    }

    const animal = await animalService.create(animalData);

    const transformedAnimal = transformAnimalResponse(animal);
    sendControllerCreated(res, transformedAnimal, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createAnimal`);
  }
}

export async function updateAnimal(req: UpdateAnimalRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdParamSchema.parse(req.params);
    const updateData: UpdateAnimalInput = updateAnimalSchema.parse(req.body);

    // Validate that animal exists first
    const existingAnimal = await animalService.getById(id);
    if (!existingAnimal) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - updateAnimal`, ENTITY_NAMES.ANIMAL);
      return;
    }

    // If animalTypes are being updated, validate they exist
    if (updateData.animalTypes) {
      for (const typeId of updateData.animalTypes) {
        const animalType = await animalTypeRepository.findById(typeId);
        if (!animalType) {
          handleControllerNotFound(res, `${CONTROLLER_PREFIX} - updateAnimal`, `${ENTITY_NAMES.ANIMAL_TYPE} with id ${typeId}`);
          return;
        }
      }
    }

    // If chippingLocationId is being updated, validate it exists
    if (updateData.chippingLocationId !== undefined) {
      const chippingLocation = await locationPointRepository.findById(updateData.chippingLocationId);
      if (!chippingLocation) {
        handleControllerNotFound(res, `${CONTROLLER_PREFIX} - updateAnimal`, `${ENTITY_NAMES.LOCATION_POINT} with id ${updateData.chippingLocationId}`);
        return;
      }
    }

    // If chipperId is being updated, validate it exists
    if (updateData.chipperId !== undefined) {
      const chipper = await accountRepository.findById(updateData.chipperId);
      if (!chipper) {
        handleControllerNotFound(res, `${CONTROLLER_PREFIX} - updateAnimal`, `${ENTITY_NAMES.ACCOUNT} with id ${updateData.chipperId}`);
        return;
      }
    }

    const updated = await animalService.update(id, updateData);
    const transformedUpdated = transformAnimalResponse(updated);
    sendControllerSuccess(res, transformedUpdated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateAnimal`);
  }
}

export async function deleteAnimal(req: DeleteAnimalRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdParamSchema.parse(req.params);

    // Check if animalId is null or <= 0
    if (id === null || id <= 0) {
      res.status(400).json({ message: 'Invalid animalId' });
      return;
    }

    // Check if animal exists
    const animal = await animalService.getById(id);
    if (!animal) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - deleteAnimal`, ENTITY_NAMES.ANIMAL);
      return;
    }

    // Check if animal left chipping location and has other visited points
    const canDelete = await animalService.canDeleteAnimal(id);
    if (!canDelete) {
      res.status(400).json({ message: 'Animal cannot be deleted: it has left the chipping location and has other visited points' });
      return;
    }

    await animalService.delete(id);

    sendControllerSuccess(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.ANIMAL));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteAnimal`);
  }
}

export async function addAnimalType(req: AddAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdParamSchema.parse(req.params);
    const { typeId }: { typeId: number } = req.body;

    const validatedTypeId = validateControllerTypeId(typeId);

    // Validate that animal exists
    const animal = await animalService.getById(id);
    if (!animal) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - addAnimalType`, ENTITY_NAMES.ANIMAL);
      return;
    }

    // Validate that animal type exists
    const animalType = await animalTypeRepository.findById(validatedTypeId);
    if (!animalType) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - addAnimalType`, `${ENTITY_NAMES.ANIMAL_TYPE} with id ${validatedTypeId}`);
      return;
    }

    await animalService.addTypeToAnimal(id, validatedTypeId);
    sendControllerSuccess(res, { message: 'Animal type added successfully' }, 'Animal type added successfully');
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - addAnimalType`);
  }
}

export async function removeAnimalType(req: RemoveAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const { id } = animalIdParamSchema.parse(req.params);
    const { typeId }: { typeId: string } = req.params;

    const validatedTypeId = validateControllerTypeId(typeId);

    // Validate that animal exists
    const animal = await animalService.getById(id);
    if (!animal) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - removeAnimalType`, ENTITY_NAMES.ANIMAL);
      return;
    }

    // Validate that animal type exists
    const animalType = await animalTypeRepository.findById(validatedTypeId);
    if (!animalType) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - removeAnimalType`, `${ENTITY_NAMES.ANIMAL_TYPE} with id ${validatedTypeId}`);
      return;
    }

    await animalService.removeTypeFromAnimal(id, validatedTypeId);
    sendControllerSuccess(res, { message: 'Animal type removed successfully' }, 'Animal type removed successfully');
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - removeAnimalType`);
  }
}
