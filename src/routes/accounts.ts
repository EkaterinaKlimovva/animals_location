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
router.get('/', authMiddleware, asyncHandler(listAccounts));
router.post('/', validateParams(createAccountSchema, 'body'), asyncHandler(createAccount));
router.get('/:id', validateParams(accountIdParamSchema, 'params'), authMiddleware, asyncHandler(getAccount));
router.put('/:id', validateComposite(accountIdParamSchema, updateAccountSchema), authMiddleware, asyncHandler(updateAccount));
router.delete('/:id', validateParams(accountIdParamSchema, 'params'), authMiddleware, asyncHandler(deleteAccount));

export { router };

