import { accountRepository } from '../repositories/accountRepository';
import { animalRepository } from '../repositories/animalRepository';
import bcrypt from 'bcrypt';
import type { SafeAccount } from '../common';
import type { Account } from '../generated/prisma/client';
import { validateAnimalsExist } from '../utils/validationUtils';

const SALT_ROUNDS = 10;

function stripSensitiveFields(account: Account): SafeAccount {
  return {
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
  };
}

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export class AccountService {
  private async processAccountsWithSafety(accounts: Account[]): Promise<SafeAccount[]> {
    return Promise.all(accounts.map(stripSensitiveFields));
  }

  async listByEmail(email?: string): Promise<SafeAccount[]> {
    const accounts = await accountRepository.findManyByEmail(email);
    return this.processAccountsWithSafety(accounts);
  }

  async search(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    from: number;
    size: number;
  }): Promise<SafeAccount[]> {
    const accounts = await accountRepository.search(params);
    return this.processAccountsWithSafety(accounts);
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
    const hashedPassword = await hashPassword(data.password);
    const account = await accountRepository.create({ ...data, password: hashedPassword });
    return stripSensitiveFields(account);
  }

  async createWithAnimalValidation(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    animalIds?: number[];
  }): Promise<SafeAccount> {
    // Validate animals if provided
    if (data.animalIds && data.animalIds.length > 0) {
      const validation = await validateAnimalsExist(data.animalIds);
      if (!validation.valid) {
        throw new Error(`Animals with IDs [${validation.invalidIds.join(', ')}] not found`);
      }
    }

    const hashedPassword = await hashPassword(data.password);
    const account = await accountRepository.create({
      ...data,
      password: hashedPassword,
    });
    return stripSensitiveFields(account);
  }

  async update(id: number, data: { firstName?: string; lastName?: string; role?: string; password?: string }): Promise<SafeAccount> {
    const updateData: { firstName?: string; lastName?: string; role?: string; password?: string } = { ...data };

    // Hash password if provided
    if (data.password) {
      updateData.password = await hashPassword(data.password);
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

  async validateAnimalExists(animalId: number): Promise<boolean> {
    const animal = await animalRepository.findById(animalId);
    return animal !== null;
  }
}

export const accountService = new AccountService();
