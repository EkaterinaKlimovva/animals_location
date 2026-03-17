import type { SafeAccount } from '../common';

/**
 * Account DTO for API responses - uses SafeAccount interface directly
 * Excludes sensitive fields (password, timestamps)
 */
export type AccountDto = SafeAccount;

/**
 * Transforms SafeAccount data to AccountDto
 * Note: SafeAccount already contains safe fields, so this is a pass-through
 */
export function transformToAccountDto(account: SafeAccount): AccountDto {
  return {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
  };
}

/**
 * Transforms an array of SafeAccount data to AccountDto array
 */
export function transformToAccountDtoList(accounts: SafeAccount[]): AccountDto[] {
  return accounts.map(transformToAccountDto);
}
