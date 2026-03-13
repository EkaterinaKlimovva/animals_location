import { accountRepository } from '../repositories/accountRepository';
import bcrypt from 'bcrypt';
import type { SafeAccount } from '../types/account';
import type { Account } from '../generated/prisma/client';
import type { AccountDto } from '../utils/dataTransform';

const SALT_ROUNDS = 10;

function stripSensitiveFields(account: Account): SafeAccount {
  return {
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
  };
}

export class AccountService {
  listByEmail(email?: string): Promise<SafeAccount[]> {
    return accountRepository
      .findManyByEmail(email)
      .then((accounts) => accounts.map(stripSensitiveFields));
  }

  search(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    from: number;
    size: number;
  }): Promise<SafeAccount[]> {
    return accountRepository
      .search(params)
      .then((accounts) => accounts.map(stripSensitiveFields));
  }

  async getById(id: number): Promise<SafeAccount | null> {
    const account = await accountRepository.findById(id);
    return account ? stripSensitiveFields(account) : null;
  }

  async findByEmail(email: string): Promise<SafeAccount | null> {
    const account = await accountRepository.findByEmail(email);
    return account ? stripSensitiveFields(account) : null;
  }

  async findByEmailWithPassword(email: string): Promise<Account | null> {
    return accountRepository.findByEmail(email);
  }

  async verifyCredentials(email: string, password: string): Promise<boolean> {
    const account = await accountRepository.findByEmail(email);
    if (!account) return false;
    return bcrypt.compare(password, account.password);
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<SafeAccount> {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const account = await accountRepository.create({ ...data, password: hashedPassword });
    return stripSensitiveFields(account);
  }

  async update(id: number, data: { firstName?: string; lastName?: string; role?: string; password?: string }): Promise<SafeAccount> {
    const updateData: { firstName?: string; lastName?: string; role?: string; password?: string } = { ...data };
    
    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    
    const account = await accountRepository.update(id, updateData);
    return stripSensitiveFields(account);
  }

  delete(id: number) {
    return accountRepository.delete(id);
  }

  hasDependentAnimals(id: number): Promise<boolean> {
    return accountRepository.hasDependentAnimals(id);
  }
}

export const accountService = new AccountService();
