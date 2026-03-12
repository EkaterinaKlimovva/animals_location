import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams } from '../middleware/validateParams';
import { register } from '../controllers/authController';
import { registrationSchema } from '../validation';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

const router = Router();

router.post('/registration', validateParams(registrationSchema, 'body'), optionalAuthMiddleware, asyncHandler(register));

export { router };

