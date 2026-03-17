import type { Response } from 'express';
import { animalService } from '../services/animalService';
import { animalTypeRepository } from '../repositories/animalTypeRepository';
import { animalOnTypeRepository } from '../repositories/animalOnTypeRepository';
import { locationPointRepository } from '../repositories/locationPointRepository';
import { accountRepository } from '../repositories/accountRepository';
import {
  searchAnimalsSchema,
  createAnimalSchema,
  updateAnimalSchema,
  animalIdParamSchema,
  removeAnimalTypeSchema,
  changeAnimalTypeSchema,
  changeAnimalTypeParamsSchema,
} from '../validation';
import {
  handleControllerError,
  handleNotFoundError,
  handleValidationError,
  handleBusinessLogicError,
  sendControllerSuccess,
  sendControllerCreated,
  validateControllerTypeId,
} from '../utils/controllerUtils';
import { ERROR_CODES, ENTITY_NAMES, SUCCESS_MESSAGES } from '../common';
import { transformAnimalResponse } from '../utils/animalResponseTransformer';
import type {
  GetAnimalRequest,
  SearchAnimalsRequest,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  DeleteAnimalRequest,
  AddAnimalTypeRequest,
  RemoveAnimalTypeRequest,
  ChangeAnimalTypeRequest,
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
      handleNotFoundError(res, 'Animal', id);
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
        handleNotFoundError(res, 'Animal type', typeId);
        return;
      }
    }

    // Validate that chipping location exists
    const chippingLocation = await locationPointRepository.findById(animalData.chippingLocationId);
    if (!chippingLocation) {
      handleNotFoundError(res, 'Location point', animalData.chippingLocationId);
      return;
    }

    // Validate that chipper exists
    const chipper = await accountRepository.findById(animalData.chipperId);
    if (!chipper) {
      handleNotFoundError(res, 'Account', animalData.chipperId);
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
      handleNotFoundError(res, 'Animal', id);
      return;
    }

    // If animalTypes are being updated, validate they exist
    if (updateData.animalTypes) {
      for (const typeId of updateData.animalTypes) {
        const animalType = await animalTypeRepository.findById(typeId);
        if (!animalType) {
          handleNotFoundError(res, 'Animal type', typeId);
          return;
        }
      }
    }

    // If chippingLocationId is being updated, validate it exists
    if (updateData.chippingLocationId !== undefined) {
      const chippingLocation = await locationPointRepository.findById(updateData.chippingLocationId);
      if (!chippingLocation) {
        handleNotFoundError(res, 'Location point', updateData.chippingLocationId);
        return;
      }
    }

    // If chipperId is being updated, validate it exists
    if (updateData.chipperId !== undefined) {
      const chipper = await accountRepository.findById(updateData.chipperId);
      if (!chipper) {
        handleNotFoundError(res, 'Account', updateData.chipperId);
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
      handleValidationError(res, 'animalId', 'Invalid animalId');
      return;
    }

    // Check if animal exists
    const animal = await animalService.getById(id);
    if (!animal) {
      handleNotFoundError(res, 'Animal', id);
      return;
    }

    // Check if animal left chipping location and has other visited points
    const canDelete = await animalService.canDeleteAnimal(id);
    if (!canDelete) {
      handleBusinessLogicError(res, ERROR_CODES.ANIMAL_CANNOT_BE_DELETED);
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
    // Get typeId from params (if provided in URL) or body
    const typeIdFromParams = (req.params as { typeId?: string }).typeId;
    const { typeId: typeIdFromBody }: { typeId: number } = req.body;
    const typeId = typeIdFromParams ? Number(typeIdFromParams) : typeIdFromBody;

    const validatedTypeId = validateControllerTypeId(typeId);

    // Validate that animal exists
    const animal = await animalService.getById(id);
    if (!animal) {
      handleNotFoundError(res, 'Animal', id);
      return;
    }

    // Validate that animal type exists
    const animalType = await animalTypeRepository.findById(validatedTypeId);
    if (!animalType) {
      handleNotFoundError(res, 'Animal type', validatedTypeId);
      return;
    }

    await animalService.addTypeToAnimal(id, validatedTypeId);
    const updatedAnimal = await animalService.getById(id);
    if (!updatedAnimal) {
      handleNotFoundError(res, 'Animal', id);
      return;
    }
    const transformedAnimal = transformAnimalResponse(updatedAnimal);
    sendControllerCreated(res, transformedAnimal, SUCCESS_MESSAGES.CREATED(`${ENTITY_NAMES.ANIMAL_TYPE} association`));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - addAnimalType`);
  }
}

export async function removeAnimalType(req: RemoveAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const { id, typeId } = removeAnimalTypeSchema.parse(req.params);

    const validatedTypeId = validateControllerTypeId(typeId);

    // Validate that animal exists
    const animal = await animalService.getById(id);
    if (!animal) {
      handleNotFoundError(res, 'Animal', id);
      return;
    }

    // Validate that animal type exists
    const animalType = await animalTypeRepository.findById(validatedTypeId);
    if (!animalType) {
      handleNotFoundError(res, 'Animal type', validatedTypeId);
      return;
    }

    // Check if animal has this type
    const animalHasType = await animalOnTypeRepository.findRelation(id, validatedTypeId);
    if (!animalHasType) {
      handleBusinessLogicError(res, ERROR_CODES.NOT_FOUND, 'Animal type is not associated with animal');
      return;
    }

    // Check if this is the only type - animal must have at least one type
    const animalTypes = await animalOnTypeRepository.findByAnimalId(id);
    if (animalTypes.length === 1) {
      res.status(400).json({ message: 'Cannot remove the only animal type' });
      return;
    }

    await animalService.removeTypeFromAnimal(id, validatedTypeId);
    sendControllerSuccess(res, { message: 'Animal type removed successfully' }, SUCCESS_MESSAGES.DELETED(`${ENTITY_NAMES.ANIMAL_TYPE} association`));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - removeAnimalType`);
  }
}

export async function changeAnimalType(req: ChangeAnimalTypeRequest, res: Response): Promise<void> {
  try {
    const { id } = changeAnimalTypeParamsSchema.parse(req.params);
    const { oldTypeId, newTypeId } = changeAnimalTypeSchema.parse(req.body);

    const validatedOldTypeId = validateControllerTypeId(oldTypeId);
    const validatedNewTypeId = validateControllerTypeId(newTypeId);

    // Validate that animal exists
    const animal = await animalService.getById(id);
    if (!animal) {
      handleNotFoundError(res, 'Animal', id);
      return;
    }

    // Validate that old animal type exists
    const oldAnimalType = await animalTypeRepository.findById(validatedOldTypeId);
    if (!oldAnimalType) {
      handleNotFoundError(res, 'Animal type', validatedOldTypeId);
      return;
    }

    // Validate that new animal type exists
    const newAnimalType = await animalTypeRepository.findById(validatedNewTypeId);
    if (!newAnimalType) {
      handleNotFoundError(res, 'Animal type', validatedNewTypeId);
      return;
    }

    // Check if animal has the old type
    const animalHasOldType = await animalOnTypeRepository.findRelation(id, validatedOldTypeId);
    if (!animalHasOldType) {
      handleBusinessLogicError(res, ERROR_CODES.NOT_FOUND, 'Animal type is not associated with animal');
      return;
    }

    // Check if animal already has the new type
    const animalHasNewType = await animalOnTypeRepository.findRelation(id, validatedNewTypeId);
    if (animalHasNewType) {
      res.status(409).json({ message: 'Animal already has this type - conflict' });
      return;
    }

    // Perform the change using the service method
    const updatedAnimal = await animalService.changeTypeOfAnimal(id, validatedOldTypeId, validatedNewTypeId);
    const transformedAnimal = transformAnimalResponse(updatedAnimal);

    sendControllerSuccess(res, transformedAnimal, SUCCESS_MESSAGES.UPDATED(`${ENTITY_NAMES.ANIMAL} ${ENTITY_NAMES.ANIMAL_TYPE}`));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - changeAnimalType`);
  }
}
