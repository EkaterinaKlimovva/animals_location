import type { SafeAccount } from '../types/account';

export interface AccountDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Transforms SafeAccount data to AccountDto, cleaning up empty/whitespace values
 */
export function transformToAccountDto(account: SafeAccount): AccountDto {
  return {
    id: account.id,
    firstName: cleanString(account.firstName),
    lastName: cleanString(account.lastName),
    email: cleanString(account.email),
  };
}

/**
 * Transforms an array of SafeAccount data to AccountDto array
 */
export function transformToAccountDtoList(accounts: SafeAccount[]): AccountDto[] {
  return accounts.map(transformToAccountDto);
}

/**
 * Cleans a string value:
 * - Converts null/undefined to a default placeholder value
 * - Trims whitespace
 * - Handles newlines and other whitespace characters
 */
function cleanString(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Remove all types of whitespace (spaces, tabs, newlines) and trim
  const cleaned = value.replace(/\s+/g, ' ').trim();

  // If after cleaning it's empty, return default placeholder
  if (cleaned === '') {
    return 'N/A';
  }

  return cleaned;
}
