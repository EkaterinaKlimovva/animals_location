// Типы для API тестов

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers?: Record<string, string>;
  error?: string;
}

export interface TestUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// TestAccount is an alias for TestUser (used in animal context)
export type TestAccount = TestUser;

export interface TestAnimalType {
  id: number;
  type: string;
}

export interface TestAnimalTypeLink {
  animalId: number;
  typeId: number;
  type: TestAnimalType;
}

export interface TestLocation {
  id: number;
  latitude: number;
  longitude: number;
}

export interface TestAnimal {
  id: number;
  animalTypes: TestAnimalTypeLink[];
  types?: TestAnimalTypeLink[]; // for backward compatibility
  weight: number;
  length: number;
  height: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  lifeStatus: 'ALIVE' | 'DEAD';
  chipperId: number;
  chippingLocationId: number;
  chippingDateTime: string;
  deathDateTime?: string;
  visitedLocations: TestVisitedLocation[];
  chipper?: TestAccount;
  chippingLocation?: TestLocation;
}

export interface TestVisitedLocation {
  id: number;
  animalId: number;
  locationPointId: number;
  dateTimeOfVisitLocationPoint: string;
  locationPoint?: TestLocation;
}

export interface TestRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface TestCreateAnimalTypeRequest {
  type: string;
}

export interface TestCreateLocationRequest {
  latitude: number;
  longitude: number;
}

export interface TestCreateAnimalRequest {
  animalTypes: number[];
  weight: number;
  length: number;
  height: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  chipperId: number;
  chippingLocationId: number;
}

export interface TestUpdateAccountRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface TestUpdateAnimalRequest {
  weight?: number;
  length?: number;
  height?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  lifeStatus?: 'ALIVE' | 'DEAD';
  chipperId?: number;
  chippingLocationId?: number;
  deathDateTime?: string;
}

export interface TestAddVisitedLocationRequest {
  locationPointId?: number;
  visitedLocationPointId?: number;
  visitedAt?: string;
}

export interface TestSearchParams {
  chipperId?: number;
  chippingLocationId?: number;
  lifeStatus?: 'ALIVE' | 'DEAD';
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  startDateTime?: string;
  endDateTime?: string;
  from?: number;
  size?: number;
}

export interface TestAccountSearchParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  from?: number;
  size?: number;
}

export interface ValidationError {
  code: string;
  path: string[];
  message: string;
  minimum?: number;
  inclusive?: boolean;
  format?: string;
  pattern?: string;
  origin?: string;
}

export interface ErrorResponse {
  error: string;
  details?: ValidationError[];
  message?: string;
}

// Combined type for registration responses that can be either success or error
export interface RegistrationResponse extends TestUser {
  error?: string;
  details?: ValidationError[];
  message?: string;
}

// Type declarations for jest-extended matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBePositive(): R;
      toBeWithin(min: number, max: number): R;
      toBeOneOf(expected: any[]): R;
      toBeEmail(): R;
      toBeISODate(): R;
      toInclude(expected: string): R;
      toSatisfy(predicate: (value: any) => boolean): R;
      toBeArrayOfSize(expected: number): R;
      toBeString(): R;
      toBeNumber(): R;
      toBeArray(): R;
      toBeObject(): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeBoolean(): R;
      toBeTrue(): R;
      toBeFalse(): R;
      toBeNaN(): R;
      toBeFinite(): R;
      toBeDate(): R;
      toBeAfter(date: Date): R;
      toBeBefore(date: Date): R;
      toBeDateString(): R;
      toBeIso8601(): R;
      toBeAfterOrEqualTo(date: Date): R;
      toBeBeforeOrEqualTo(date: Date): R;
      toBeEmpty(): R;
      toBeEmptyObject(): R;
      toBeEmptyArray(): R;
      toEqualCaseInsensitive(expected: string): R;
      toStartWith(expected: string): R;
      toEndWith(expected: string): R;
      toIncludeMultiple(expected: string[]): R;
      toIncludeAny(expected: string[]): R;
      toIncludeAll(expected: string[]): R;
      toEqualIgnoringWhitespace(expected: string): R;
      toHaveBeenCalledBefore(spy: jest.SpyInstance): R;
      toHaveBeenCalledAfter(spy: jest.SpyInstance): R;
      toHaveBeenCalledOnce(): R;
      toHaveBeenCalledTwice(): R;
      toHaveBeenCalledThrice(): R;
      toHaveBeenCalledTimes(expected: number): R;
      toHaveBeenLastCalledWith(...expected: any[]): R;
      toHaveBeenNthCalledWith(n: number, ...expected: any[]): R;
      toHaveBeenCalledWithMatch(...expected: any[]): R;
      toHaveBeenNthCalledWithMatch(n: number, ...expected: any[]): R;
      toHaveReturned(): R;
      toHaveReturnedTimes(expected: number): R;
      toHaveReturnedWith(expected: any): R;
      toHaveLastReturnedWith(expected: any): R;
      toHaveNthReturnedWith(n: number, expected: any): R;
      toHaveReturnedWithMatch(expected: any): R;
      toHaveLastReturnedWithMatch(expected: any): R;
      toHaveNthReturnedWithMatch(n: number, expected: any): R;
      toThrowWithMessage(type: (message?: string) => void, message: string | RegExp): R;
      toBeRejected(): R;
      toBeRejectedWith(expected: any): R;
      toBeRejectedWithError(type: (message?: string) => void, message?: string | RegExp): R;
      toResolve(): R;
      toResolveWith(expected: any): R;
      toBeSealed(): R;
      toBeFrozen(): R;
      toBeExtensible(): R;
      toContainKey(key: string): R;
      toContainKeys(keys: string[]): R;
      toContainAllKeys(keys: string[]): R;
      toContainAnyKeys(keys: string[]): R;
      toContainValue(value: any): R;
      toContainValues(values: any[]): R;
      toContainAllValues(values: any[]): R;
      toContainAnyValues(values: any[]): R;
      toContainEntry(entry: [string, any]): R;
      toContainEntries(entries: [string, any][]): R;
      toContainAllEntries(entries: [string, any][]): R;
      toContainAnyEntries(entries: [string, any][]): R;
      toBeEmptyObjectOrMapOrSet(): R;
      toBeEmptyArrayOrString(): R;
      toBeNonEmptyObject(): R;
      toBeNonEmptyArray(): R;
      toBeNonEmptyString(): R;
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}
