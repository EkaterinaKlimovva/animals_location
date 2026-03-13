import type { Request, Response } from 'express';
import { accountService } from '../services/accountService';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
  sendControllerForbidden,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../utils/constants';
import type {
  ListAccountsRequest,
  SearchAccountsRequest,
  CreateAccountRequest,
  GetAccountRequest,
  UpdateAccountRequest,
  DeleteAccountRequest, SafeAccount,
} from '../types';
import type { CreateAccountInput, UpdateAccountInput, SearchAccountsInput } from '../validation';
import { accountIdParamSchema, searchAccountsSchema } from '../validation';

interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

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

export async function searchAccounts(req: Request, res: Response): Promise<void> {
  try {
    const searchParams: SearchAccountsInput = req.query as unknown as SearchAccountsInput;

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
    const authenticatedUser = (req as AuthenticatedRequest).user;
    if (!authenticatedUser || authenticatedUser.id !== id) {
      sendControllerForbidden(res, `${CONTROLLER_PREFIX} - updateAccount`);
      return;
    }

    // Check if account exists
    const existingAccount: SafeAccount | null = await accountService.getById(id);
    if (!existingAccount) {
      sendControllerForbidden(res, `${CONTROLLER_PREFIX} - updateAccount`);
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
    const authenticatedUser = (req as AuthenticatedRequest).user;

    // Check if account exists
    const account: SafeAccount | null = await accountService.getById(id);
    if (!account || !authenticatedUser || authenticatedUser.id !== id) {
      sendControllerForbidden(res, `${CONTROLLER_PREFIX} - deleteAccount`);
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
