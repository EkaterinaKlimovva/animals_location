import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams, validateComposite } from '../middleware/validateParams';
import {
  listAccounts,
  searchAccounts,
  createAccount,
  createAccountWithAnimalValidation,
  getAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController';
import { accountIdParamSchema, searchAccountsSchema, updateAccountSchema, createAccountSchema, createAccountWithAnimalsSchema } from '../validation';
import type { SearchAccountsRequest } from '../types';

const router = Router();

router.get('/search', validateParams(searchAccountsSchema, 'query'), optionalAuthMiddleware, asyncHandler((req, res) => searchAccounts(req as unknown as SearchAccountsRequest, res)));
router.get('/', authMiddleware, optionalAuthMiddleware, asyncHandler(listAccounts));
router.post('/', validateParams(createAccountSchema, 'body'), optionalAuthMiddleware, asyncHandler(createAccount));
router.post('/with-animals', validateParams(createAccountWithAnimalsSchema, 'body'), optionalAuthMiddleware, asyncHandler(createAccountWithAnimalValidation));
router.get('/:id', validateParams(accountIdParamSchema, 'params'), optionalAuthMiddleware, asyncHandler(getAccount));
router.put('/:id', authMiddleware, validateComposite(accountIdParamSchema, updateAccountSchema), asyncHandler(updateAccount));
router.delete('/:id', authMiddleware, validateParams(accountIdParamSchema, 'params'), asyncHandler(deleteAccount));

export { router };

