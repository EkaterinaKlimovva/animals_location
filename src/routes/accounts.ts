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
import { accountIdParamSchema, searchAccountsSchema, updateAccountSchema, createAccountSchema } from '../validation';

const router = Router();

router.get('/search', validateParams(searchAccountsSchema, 'query'), optionalAuthMiddleware, asyncHandler(searchAccounts));
router.get('/', authMiddleware, optionalAuthMiddleware, asyncHandler(listAccounts));
router.post('/', validateParams(createAccountSchema, 'body'), optionalAuthMiddleware, asyncHandler(createAccount));
router.get('/:id', validateParams(accountIdParamSchema, 'params'), optionalAuthMiddleware, asyncHandler(getAccount));
router.put('/:id', authMiddleware, validateComposite(accountIdParamSchema, updateAccountSchema), asyncHandler(updateAccount));
router.delete('/:id', authMiddleware, validateParams(accountIdParamSchema, 'params'), asyncHandler(deleteAccount));

export { router };

