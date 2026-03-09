// Account data utilities for cleaning and formatting

/**
 * Clean account data for API response
 * Removes whitespace-only strings and formats data properly
 * Converts empty/whitespace-only strings to null for firstName/lastName to pass validation
 * Email is converted to empty string for backward compatibility
 */
export function cleanAccountData(account: any) {
  return {
    id: account.id,
    email: account.email?.trim() || null,
    firstName: account.firstName?.trim() || null,
    lastName: account.lastName?.trim() || null,
  };
}

/**
 * Clean multiple accounts for API response
 */
export function cleanAccountsData(accounts: any[]) {
  return accounts.map(cleanAccountData);
}
