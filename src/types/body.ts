// ==============================
// Body Types
// ==============================

export type UpdateAccountBody = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}>;

export type AddAnimalTypeBody = { typeId: number };
export type ChangeAnimalTypeBody = { oldTypeId: number; newTypeId: number };

export interface CreateVisitedLocationBody {
  visitedAt?: string;
}

export interface UpdateVisitedLocationBody {
  visitedLocationPointId: number;
  locationPointId?: number;
  visitedAt?: string;
}
