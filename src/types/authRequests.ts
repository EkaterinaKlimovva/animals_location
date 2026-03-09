import type { Request } from 'express';
import type { RegisterDto } from './account';

// Request Types
export type RegisterRequest = Request<unknown, unknown, RegisterDto>;
