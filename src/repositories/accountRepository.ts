import { prisma } from '../prisma';
import type { Prisma } from '../generated/prisma/client';

export class AccountRepository {
  findManyByEmail(email?: string) {
    const where: Prisma.AccountWhereInput = email ? { email: { equals: email } } : {};
    return prisma.account.findMany({ where });
  }

  search(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    from: number;
    size: number;
  }) {
    const { firstName, lastName, email, from, size } = params;

    const where: Prisma.AccountWhereInput = {};
    if (firstName) {
      where.firstName = { contains: firstName, mode: 'insensitive' };
    }
    if (lastName) {
      where.lastName = { contains: lastName, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    return prisma.account.findMany({
      where,
      skip: from,
      take: size,
      orderBy: { id: 'asc' },
    });
  }

  findById(id: number) {
    return prisma.account.findUnique({ where: { id } });
  }

  update(
    id: number,
    data: { firstName?: string; lastName?: string; role?: string },
  ) {
    return prisma.account.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return prisma.account.delete({ where: { id } });
  }

  findByEmail(email: string) {
    return prisma.account.findUnique({ where: { email } });
  }

  create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return prisma.account.create({ data });
  }

  async hasDependentAnimals(id: number): Promise<boolean> {
    const count = await prisma.animal.count({
      where: { chipperId: id },
    });
    return count > 0;
  }
}

export const accountRepository = new AccountRepository();

