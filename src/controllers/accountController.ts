import type { Response } from 'express';
import { accountService } from '../services/accountService';
import {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
  searchAccountsSchema,
} from '../validation';
import {
  handleControllerError,
  handleControllerNotFound,
  sendControllerSuccess,
  sendControllerCreated,
  sendControllerNoContent,
} from '../utils/controllerUtils';
import { ENTITY_NAMES, SUCCESS_MESSAGES } from '../utils/constants';
import { cleanAccountsData, cleanAccountData } from '../utils/accountUtils';
import type {
  ListAccountsRequest,
  SearchAccountsRequest,
  CreateAccountRequest,
  GetAccountRequest,
  UpdateAccountRequest,
  DeleteAccountRequest,
} from '../types';

const CONTROLLER_PREFIX = '[ACCOUNT_CONTROLLER]';

export async function createAccount(req: CreateAccountRequest, res: Response): Promise<void> {
  try {
    const accountData = createAccountSchema.parse(req.body);
    const account = await accountService.create(accountData);

    sendControllerCreated(res, cleanAccountData(account), SUCCESS_MESSAGES.CREATED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - createAccount`);
  }
}

export async function listAccounts(req: ListAccountsRequest, res: Response): Promise<void> {
  const { email } = req.query;
  const accounts = await accountService.listByEmail(
    email ? String(email) : undefined,
  );

  sendControllerSuccess(res, accounts.map(cleanAccountData), SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(accounts.length, ENTITY_NAMES.ACCOUNT));
}

export async function searchAccounts(req: SearchAccountsRequest, res: Response): Promise<void> {
  try {
    const searchParams = (req as any).validatedData || searchAccountsSchema.parse(req.query);

    const accounts = await accountService.search(searchParams);

    sendControllerSuccess(res, cleanAccountsData(accounts), SUCCESS_MESSAGES.SEARCH_SUCCESSFUL(accounts.length, ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - searchAccounts`);
  }
}

export async function getAccount(req: GetAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = (req as any).validatedData || accountIdSchema.parse(req.params);
    const account = await accountService.getById(id);

    if (!account) {
      handleControllerNotFound(res, `${CONTROLLER_PREFIX} - getAccount`, ENTITY_NAMES.ACCOUNT);
      return;
    }

    sendControllerSuccess(res, cleanAccountData(account), SUCCESS_MESSAGES.FOUND(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - getAccount`);
  }
}

export async function updateAccount(req: UpdateAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = (req as any).validatedParams || accountIdSchema.parse(req.params);
    const updateData = (req as any).validatedBody || updateAccountSchema.parse(req.body);

    const updated = await accountService.update(id, updateData);
    sendControllerSuccess(res, cleanAccountData(updated), SUCCESS_MESSAGES.UPDATED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - updateAccount`);
  }
}

export async function deleteAccount(req: DeleteAccountRequest, res: Response): Promise<void> {
  try {
    const { id } = (req as any).validatedData || accountIdSchema.parse(req.params);
    await accountService.delete(id);

    sendControllerNoContent(res, SUCCESS_MESSAGES.DELETED(ENTITY_NAMES.ACCOUNT));
  } catch (error) {
    handleControllerError(res, error, `${CONTROLLER_PREFIX} - deleteAccount`);
  }
}
