import type { Request } from 'express';
import type { CreateAccountInput, UpdateAccountInput, SearchAccountsInput } from '../validation';

// Query Types
export type ListAccountsQuery = { email?: string };
export type UpdateAccountBody = Partial<UpdateAccountInput>;
export type SearchAccountsQuery = SearchAccountsInput;

// Request Types
export type ListAccountsRequest = Request<unknown, unknown, unknown, ListAccountsQuery>;
export type SearchAccountsRequest = Request<unknown, unknown, unknown, SearchAccountsQuery>;
export type CreateAccountRequest = Request<unknown, unknown, CreateAccountInput>;
export type GetAccountRequest = Request<{ id: string }>;
export type UpdateAccountRequest = Request<{ id: string }, unknown, UpdateAccountBody>;
export type DeleteAccountRequest = Request<{ id: string }>;
