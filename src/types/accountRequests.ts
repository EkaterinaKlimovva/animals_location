import type { Request } from 'express';
import type { CreateAccountInput, UpdateAccountInput } from '../validation';

// Query Types
export type ListAccountsQuery = { email?: string };
export type UpdateAccountBody = Partial<UpdateAccountInput>;

// Request Types
export type ListAccountsRequest = Request<unknown, unknown, unknown, ListAccountsQuery>;
export type SearchAccountsRequest = Request;
export type CreateAccountRequest = Request<unknown, unknown, CreateAccountInput>;
export type GetAccountRequest = Request<{ id: string }>;
export type UpdateAccountRequest = Request<{ id: string }, unknown, UpdateAccountBody>;
export type DeleteAccountRequest = Request<{ id: string }>;
