import type { Response } from 'express';
import { accountService } from '../services/accountService';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
  sendControllerNoContent,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../utils/constants';
import type {
  ListAccountsRequest,
  SearchAccountsRequest,
  CreateAccountRequest,
  GetAccountRequest,
  UpdateAccountRequest,
  DeleteAccountRequest,
} from '../types';
import type { CreateAccountInput, UpdateAccountInput, SearchAccountsInput } from '../validation';
import { accountIdParamSchema } from '../validation';
import type { AccountDto } from '../utils/dataTransform';

const CONTROLLER_PREFIX = '[ACCOUNT_CONTROLLER]';

export async function createAccount(req: CreateAccountRequest, res: Response): Promise<void> {
  try {
    const accountData: CreateAccountInput = req.body;
    const account: AccountDto = await accountService.create(accountData);

    sendControllerCreated(res, account, SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createAccount`);
  }
}

export async function listAccounts(req: ListAccountsRequest, res: Response): Promise<void> {
  const { email } = req.query;
  const accounts = await accountService.listByEmail(
    email ? String(email) : undefined,
  );

  sendControllerSuccess(res, accounts, SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(accounts.length, ENTITY_NAMES.ACCOUNT));
}

export async function searchAccounts(req: SearchAccountsRequest, res: Response): Promise<void> {
  try {
    const searchParams: SearchAccountsInput = req.query as unknown as SearchAccountsInput;

    const accounts: AccountDto[] = await accountService.search(searchParams);

    sendControllerSuccess(res, accounts, SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(accounts.length, ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - searchAccounts`);
  }
}

export async function getAccount(req: GetAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = accountIdParamSchema.parse(req.params);
    const account: AccountDto | null = await accountService.getById(id);

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

    // Check if account exists
    const existingAccount = await accountService.getById(id);
    if (!existingAccount) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - updateAccount`, ENTITY_NAMES.ACCOUNT);
      return;
    }

    const updated = await accountService.update(id, updateData);
    sendControllerSuccess(res, updated, SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateAccount`);
  }
}

export async function deleteAccount(req: DeleteAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = accountIdParamSchema.parse(req.params);

    // Check if account exists
    const account = await accountService.getById(id);
    if (!account) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - deleteAccount`, ENTITY_NAMES.ACCOUNT);
      return;
    }

    // Check for dependent animals
    const hasDependents = await accountService.hasDependentAnimals(id);
    if (hasDependents) {
      res.status(400).json({ message: 'Cannot delete account: it has dependent animals' });
      return;
    }

    await accountService.delete(id);

    sendControllerNoContent(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteAccount`);
  }
}
