import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams } from '../middleware/validateParams';
import { register } from '../controllers/authController';
import { registrationSchema } from '../validation';

const router = Router();

router.post('/registration', validateParams(registrationSchema, 'body'), asyncHandler(register));

export { router };

