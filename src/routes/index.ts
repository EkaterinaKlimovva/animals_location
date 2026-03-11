import { Router } from 'express';
import { router as authRouter } from './auth';
import { router as accountRouter } from './accounts';
import { router as animalRouter } from './animals';
import { router as animalTypeRouter } from './animalTypes';
import { router as locationPointRouter } from './locationPoints';
import { router as visitedLocationRouter } from './visitedLocations';

export const router = Router();

router.use('/', authRouter);

// NOTE: /animals/types must be registered before /animals to avoid /:id capturing "types"
router.use('/animals/types', animalTypeRouter);

router.use('/animals/:animalId/locations', visitedLocationRouter);

router.use('/accounts', accountRouter);
router.use('/animals', animalRouter);

router.use('/locations', locationPointRouter);
