// ==============================
// Request Parameter Types
// ==============================

// Common parameter types
export type IdParams = { id: string };

// Entity-specific parameter types
export type AnimalIdParams = IdParams;
export type AnimalIdAndTypeParams = { id: string; typeId: string };
export type AnimalTypeParams = IdParams;
export type LocationPointParams = IdParams;
export type AnimalVisitedLocationParams = { animalId: string };
export type AnimalVisitedLocationWithLocationIdParams = { animalId: string; locationId: string };
export type VisitedLocationIdParams = IdParams;
