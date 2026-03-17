import type { Response } from 'express';
import { locationPointService } from '../services/locationPointService';
import {
  locationPointIdSchema,
} from '../validation';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
  sendControllerNoContent,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../common';
import type {
  GetLocationPointRequest,
  CreateLocationPointRequest,
  UpdateLocationPointRequest,
  DeleteLocationPointRequest,
} from '../types';
import type {
  LocationPointIdInput,
} from '../validation';

const CONTROLLER_PREFIX = '[LOCATION_POINT_CONTROLLER]';

export async function getLocationPoints(req: GetLocationPointRequest, res: Response): Promise<void> {
  try {
    const points = await locationPointService.getAll();
    sendControllerSuccess(res, points, SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - getLocationPoints`);
  }
}

export async function getLocationPoint(req: GetLocationPointRequest, res: Response): Promise<void> {
  try {
    const { id }: LocationPointIdInput = locationPointIdSchema.parse(req.params);
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
    const point = await locationPointService.create(req.body);

    sendControllerCreated(res, point, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    // Check for duplicate coordinates error - should return 409 Conflict
    if (error instanceof Error && error.message === 'Location point with these coordinates already exists') {
      res.status(409).json({ message: 'Location point with these coordinates already exists' });
      return;
    }
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createLocationPoint`);
  }
}

export async function updateLocationPoint(req: UpdateLocationPointRequest, res: Response): Promise<void> {
  try {
    const { id }: LocationPointIdInput = locationPointIdSchema.parse(req.params);

    const updated = await locationPointService.update(id, req.body);
    sendControllerSuccess(res, updated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    if (error instanceof Error && error.message === 'Location point not found') {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - updateLocationPoint`, ENTITY_NAMES.LOCATION_POINT);
      return;
    }
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateLocationPoint`);
  }
}

export async function deleteLocationPoint(req: DeleteLocationPointRequest, res: Response): Promise<void> {
  try {
    const { id }: LocationPointIdInput = locationPointIdSchema.parse(req.params);

    // Check if location point exists
    const locationPoint = await locationPointService.getById(id);
    if (!locationPoint) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - deleteLocationPoint`, ENTITY_NAMES.LOCATION_POINT);
      return;
    }

    // Check for dependent data
    const hasDependents = await locationPointService.hasDependents(id);
    if (hasDependents) {
      res.status(400).json({ message: 'Cannot delete location point: it has dependent animals or visited locations' });
      return;
    }

    await locationPointService.delete(id);

    sendControllerSuccess(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.LOCATION_POINT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteLocationPoint`);
  }
}
