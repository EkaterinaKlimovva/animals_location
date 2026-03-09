import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { register } from '../controllers/authController';

const router = Router();

router.post('/registration', asyncHandler(register));

export { router };

