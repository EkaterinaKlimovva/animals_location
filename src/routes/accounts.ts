import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams, validateComposite } from '../middleware/validateParams';
import {
  listAccounts,
  searchAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController';
import { accountIdSchema, searchAccountsSchema, updateAccountSchema } from '../validation';

const router = Router();

router.get('/search', validateParams(searchAccountsSchema, 'query'), optionalAuthMiddleware, asyncHandler(searchAccounts));
router.get('/', authMiddleware, asyncHandler(listAccounts));
router.post('/', asyncHandler(createAccount));
router.get('/:id', validateParams(accountIdSchema, 'params'), optionalAuthMiddleware, asyncHandler(getAccount));
router.put('/:id', validateComposite(accountIdSchema, updateAccountSchema), authMiddleware, asyncHandler(updateAccount));
router.delete('/:id', validateParams(accountIdSchema, 'params'), authMiddleware, asyncHandler(deleteAccount));

export { router };

