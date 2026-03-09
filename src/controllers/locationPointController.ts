import type { Response } from 'express';
import { locationPointService } from '../services/locationPointService';
import {
  createLocationPointSchema,
  updateLocationPointSchema,
  locationPointIdSchema,
} from '../validation';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
  sendControllerNoContent,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../utils/constants';
import type {
  GetLocationPointRequest,
  CreateLocationPointRequest,
  UpdateLocationPointRequest,
  DeleteLocationPointRequest,
} from '../types';

const CONTROLLER_PREFIX = '[LOCATION_POINT_CONTROLLER]';

export async function getLocationPoint(req: GetLocationPointRequest, res: Response): Promise<void> {
  try {
    const { id } = locationPointIdSchema.parse(req.params);
    const point = await locationPointService.getById(id);

    if (!point) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - getLocationPoint`, ENTITY_NAMES.LOCATION_POINT);
      return;
    }

    sendControllerSuccess(res, point, SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - getLocationPoint`);
  }
}

export async function createLocationPoint(req: CreateLocationPointRequest, res: Response): Promise<void> {
  try {
    const locationData = createLocationPointSchema.parse(req.body);
    const point = await locationPointService.create(locationData);

    sendControllerCreated(res, point, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createLocationPoint`);
  }
}

export async function updateLocationPoint(req: UpdateLocationPointRequest, res: Response): Promise<void> {
  try {
    const { id } = locationPointIdSchema.parse(req.params);
    const updateData = updateLocationPointSchema.parse(req.body);

    const updated = await locationPointService.update(id, updateData);
    sendControllerSuccess(res, updated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateLocationPoint`);
  }
}

export async function deleteLocationPoint(req: DeleteLocationPointRequest, res: Response): Promise<void> {
  try {
    const { id } = locationPointIdSchema.parse(req.params);
    await locationPointService.delete(id);

    sendControllerNoContent(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteLocationPoint`);
  }
}
