import { accountService } from '../services/accountService';

export async function validateAnimalsExist(animalIds: number[]): Promise<{ valid: boolean; invalidIds: number[] }> {
  const invalidIds: number[] = [];

  for (const animalId of animalIds) {
    const exists = await accountService.validateAnimalExists(animalId);
    if (!exists) {
      invalidIds.push(animalId);
    }
  }

  return {
    valid: invalidIds.length === 0,
    invalidIds,
  };
}

export function createAnimalValidationError(invalidIds: number[]): string {
  return `Animals with IDs [${invalidIds.join(', ')}] not found`;
}
