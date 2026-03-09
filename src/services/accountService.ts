import { accountRepository } from '../repositories/accountRepository';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class AccountService {
  listByEmail(email?: string) {
    return accountRepository.findManyByEmail(email);
  }

  search(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    from: number;
    size: number;
  }) {
    return accountRepository.search(params);
  }

  getById(id: number) {
    return accountRepository.findById(id);
  }

  async findByEmail(email: string) {
    return accountRepository.findByEmail(email);
  }

  async verifyCredentials(email: string, password: string): Promise<boolean> {
    const account = await accountRepository.findByEmail(email);
    if (!account) {
      return false;
    }

    // Compare provided password with stored hash
    return bcrypt.compare(password, account.password);
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return accountRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  update(
    id: number,
    data: { firstName?: string; lastName?: string; role?: string },
  ) {
    return accountRepository.update(id, data);
  }

  delete(id: number) {
    return accountRepository.delete(id);
  }
}

export const accountService = new AccountService();

