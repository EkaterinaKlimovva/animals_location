import type { Response } from 'express';
import { accountService } from '../services/accountService';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../utils/constants';
import { requireOwnership, handleAuthError } from '../utils/authUtils';
import { validateAnimalsExist, createAnimalValidationError } from '../utils/validationUtils';
import type {
  ListAccountsRequest,
  SearchAccountsRequest,
  CreateAccountRequest,
  CreateAccountWithAnimalsRequest,
  GetAccountRequest,
  UpdateAccountRequest,
  DeleteAccountRequest, SafeAccount,
} from '../types';
import type { CreateAccountInput, CreateAccountWithAnimalsInput, UpdateAccountInput, SearchAccountsInput } from '../validation';
import { accountIdParamSchema, searchAccountsSchema, createAccountWithAnimalsSchema } from '../validation';
import type { AuthenticatedRequest } from '../middleware/auth';

const CONTROLLER_PREFIX = '[ACCOUNT_CONTROLLER]';

export async function createAccount(req: CreateAccountRequest, res: Response): Promise<void> {
  try {
    const accountData: CreateAccountInput = req.body;
    const account: SafeAccount = await accountService.create(accountData);

    sendControllerCreated(res, account, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createAccount`);
  }
}

export async function createAccountWithAnimalValidation(req: CreateAccountWithAnimalsRequest, res: Response): Promise<void> {
  try {
    const accountData: CreateAccountWithAnimalsInput = createAccountWithAnimalsSchema.parse(req.body);

    // Explicit validation using database queries instead of try-catch
    if (accountData.animalIds && accountData.animalIds.length > 0) {
      const validation = await validateAnimalsExist(accountData.animalIds);
      if (!validation.valid) {
        res.status(400).json({
          error: createAnimalValidationError(validation.invalidIds),
          invalidIds: validation.invalidIds,
        });
        return;
      }
    }

    const account: SafeAccount = await accountService.createWithAnimalValidation(accountData);
    sendControllerCreated(res, account, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createAccountWithAnimalValidation`);
  }
}

export async function listAccounts(req: ListAccountsRequest, res: Response): Promise<void> {
  try {
    const { email } = req.query;
    const accounts: SafeAccount[] = await accountService.listByEmail(
      email ? String(email) : undefined,
    );

    sendControllerSuccess(res, accounts, SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(accounts.length, ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - listAccounts`);
  }
}

export async function searchAccounts(req: SearchAccountsRequest, res: Response): Promise<void> {
  try {
    const searchParams: SearchAccountsInput = searchAccountsSchema.parse(req.query);

    const accounts: SafeAccount[] = await accountService.search(searchParams);

    sendControllerSuccess(res, accounts, SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(accounts.length, ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - searchAccounts`);
  }
}

export async function getAccount(req: GetAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = accountIdParamSchema.parse(req.params);
    const account: SafeAccount | null = await accountService.getById(id);

    if (!account) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - getAccount`, ENTITY_NAMES.ACCOUNT);
      return;
    }

    sendControllerSuccess(res, account, SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - getAccount`);
  }
}

export async function updateAccount(req: UpdateAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = accountIdParamSchema.parse(req.params);
    const updateData: UpdateAccountInput = req.body as UpdateAccountInput;

    // Check if the authenticated user is editing their own account
    try {
      requireOwnership(req as AuthenticatedRequest, id);
    } catch (_authError) {
      handleAuthError(res, `${CONTROLLER_PREFIX} - updateAccount`);
      return;
    }

    const updated: SafeAccount = await accountService.update(id, updateData);
    sendControllerSuccess(res, updated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateAccount`);
  }
}

export async function deleteAccount(req: DeleteAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = accountIdParamSchema.parse(req.params);

    // Check if the authenticated user is deleting their own account
    try {
      requireOwnership(req as AuthenticatedRequest, id);
    } catch (_authError) {
      handleAuthError(res, `${CONTROLLER_PREFIX} - deleteAccount`);
      return;
    }

    // Check for dependent animals
    const hasDependents = await accountService.hasDependentAnimals(id);
    if (hasDependents) {
      res.status(400).json({ message: 'Cannot delete account: it has dependent animals' });
      return;
    }

    await accountService.delete(id);
    sendControllerSuccess(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteAccount`);
  }
}
