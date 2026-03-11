import { accountRepository } from '../repositories/accountRepository';
import bcrypt from 'bcrypt';
import { transformToAccountDto, type AccountDto } from '../utils/dataTransform';
import type { Account } from '../generated/prisma/client';

const SALT_ROUNDS = 10;

function stripSensitiveFields(account: Account): AccountDto {
  const { password: _password, createdAt: _createdAt, updatedAt: _updatedAt, ...safe } = account;
  return transformToAccountDto(safe);
}

export class AccountService {
  listByEmail(email?: string): Promise<AccountDto[]> {
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
  }): Promise<AccountDto[]> {
    return accountRepository
      .search(params)
      .then((accounts) => accounts.map(stripSensitiveFields));
  }

  async getById(id: number): Promise<AccountDto | null> {
    const account = await accountRepository.findById(id);
    return account ? stripSensitiveFields(account) : null;
  }

  async findByEmail(email: string): Promise<AccountDto | null> {
    const account = await accountRepository.findByEmail(email);
    return account ? stripSensitiveFields(account) : null;
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
  }): Promise<AccountDto> {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    const account = await accountRepository.create({ ...data, password: hashedPassword });
    return stripSensitiveFields(account);
  }

  update(id: number, data: { firstName?: string; lastName?: string; role?: string }) {
    return accountRepository.update(id, data);
  }

  delete(id: number) {
    return accountRepository.delete(id);
  }

  hasDependentAnimals(id: number): Promise<boolean> {
    return accountRepository.hasDependentAnimals(id);
  }
}

export const accountService = new AccountService();
