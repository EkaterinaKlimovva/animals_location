import { agent } from 'supertest';
const request = agent;
import type { Express } from 'express';
import type { Request } from 'express';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TestAnimalData {
  weight: number;
  length: number;
  height: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  lifeStatus: 'ALIVE' | 'DEAD';
}

export interface TestLocationData {
  latitude: number;
  longitude: number;
}

export interface TestAnimalTypeData {
  type: string;
}

export interface AuthenticatedRequest extends Request {
  set: (field: string, val: string) => AuthenticatedRequest;
}

export class JestTestHelpers {
  static generateTestUser(): TestUser {
    const timestamp = Date.now();
    return {
      email: `test.user.${timestamp}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: `User${timestamp}`,
    };
  }

  static generateTestAnimalData(): TestAnimalData {
    return {
      weight: 5.5,
      length: 0.6,
      height: 0.4,
      gender: 'MALE',
      lifeStatus: 'ALIVE',
    };
  }

  static generateTestLocationData(): TestLocationData {
    return {
      latitude: 55.7558 + Math.random() * 0.01,
      longitude: 37.6173 + Math.random() * 0.01,
    };
  }

  static generateTestAnimalTypeData(): TestAnimalTypeData {
    return {
      type: `TestType${Date.now()}`,
    };
  }

  static generateTestAccount(id: number) {
    const timestamp = Date.now();
    return {
      id,
      email: `test.user.${timestamp}@example.com`,
      firstName: 'Test',
      lastName: `User${timestamp}`,
    };
  }

  static generateTestAnimal(id: number, data?: TestAnimalData | Partial<TestAnimalData>) {
    const animalData = { ...this.generateTestAnimalData(), ...data };
    return {
      id,
      weight: animalData.weight,
      length: animalData.length,
      height: animalData.height,
      gender: animalData.gender,
      lifeStatus: animalData.lifeStatus,
      chipperId: 1,
      chippingLocationId: 1,
      chippingDateTime: new Date(),
      visitedLocations: [],
      types: [
        { id: 1, type: 'Dog' },
      ],
    };
  }

  static generateTestAnimalCreateData() {
    return {
      weight: 5.5,
      length: 0.6,
      height: 0.4,
      gender: 'MALE' as const,
      chipperId: 1,
      chippingLocationId: 1,
      animalTypes: [1, 2, 3],
    };
  }

  static generateTestAnimalType(id: number, type?: string) {
    return {
      id,
      type: type || `TestType${Date.now()}`,
    };
  }

  static generateTestLocationPoint(id: number, latitude?: number, longitude?: number) {
    const locationData = this.generateTestLocationData();
    return {
      id,
      latitude: latitude || locationData.latitude,
      longitude: longitude || locationData.longitude,
    };
  }

  static generateTestVisitedLocation(id: number, animalId: number, locationPointId: number) {
    return {
      id,
      animalId,
      locationPointId,
      visitedAt: new Date().toISOString(),
    };
  }

  static createAuthenticatedRequest(app: Express, email: string, password: string): any {
    const base64Auth = Buffer.from(`${email}:${password}`).toString('base64');
    return request(app).set('Authorization', `Basic ${base64Auth}`);
  }

  static expectValidUser(user: any) {
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(typeof user.id).toBe('number');
    expect(user.firstName).toBeDefined();
    expect(typeof user.firstName).toBe('string');
    expect(user.lastName).toBeDefined();
    expect(typeof user.lastName).toBe('string');
    expect(user.email).toBeDefined();
    expect(typeof user.email).toBe('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  static expectValidAnimal(animal: any) {
    expect(animal).toBeDefined();
    expect(animal.id).toBeDefined();
    expect(typeof animal.id).toBe('number');
    expect(animal.weight).toBeDefined();
    expect(typeof animal.weight).toBe('number');
    expect(animal.weight).toBeGreaterThan(0);
    expect(animal.length).toBeDefined();
    expect(typeof animal.length).toBe('number');
    expect(animal.length).toBeGreaterThan(0);
    expect(animal.height).toBeDefined();
    expect(typeof animal.height).toBe('number');
    expect(animal.height).toBeGreaterThan(0);
    expect(animal.gender).toBeDefined();
    expect(['MALE', 'FEMALE', 'OTHER']).toContain(animal.gender);
    expect(animal.lifeStatus).toBeDefined();
    expect(['ALIVE', 'DEAD']).toContain(animal.lifeStatus);
    expect(animal.chipperId).toBeDefined();
    expect(typeof animal.chipperId).toBe('number');
    expect(animal.chippingLocationId).toBeDefined();
    expect(typeof animal.chippingLocationId).toBe('number');
    expect(animal.chippingDateTime).toBeDefined();
    expect(typeof animal.chippingDateTime).toBe('string');
    expect(animal.animalTypes).toBeDefined();
    expect(Array.isArray(animal.animalTypes)).toBe(true);
  }

  static expectValidAnimalType(animalType: any) {
    expect(animalType).toBeDefined();
    expect(animalType.id).toBeDefined();
    expect(typeof animalType.id).toBe('number');
    expect(animalType.type).toBeDefined();
    expect(typeof animalType.type).toBe('string');
    expect(animalType.type.length).toBeGreaterThan(0);
  }

  static expectValidLocation(location: any) {
    expect(location).toBeDefined();
    expect(location.id).toBeDefined();
    expect(typeof location.id).toBe('number');
    expect(location.latitude).toBeDefined();
    expect(typeof location.latitude).toBe('number');
    expect(location.latitude).toBeGreaterThanOrEqual(-90);
    expect(location.latitude).toBeLessThanOrEqual(90);
    expect(location.longitude).toBeDefined();
    expect(typeof location.longitude).toBe('number');
    expect(location.longitude).toBeGreaterThanOrEqual(-180);
    expect(location.longitude).toBeLessThanOrEqual(180);
  }

  static expectValidVisitedLocation(visitedLocation: any) {
    expect(visitedLocation).toBeDefined();
    expect(visitedLocation.id).toBeDefined();
    expect(typeof visitedLocation.id).toBe('number');
    expect(visitedLocation.locationPointId).toBeDefined();
    expect(typeof visitedLocation.locationPointId).toBe('number');
    expect(visitedLocation.visitedAt).toBeDefined();
    expect(typeof visitedLocation.visitedAt).toBe('string');
  }

  static expectError(response: any, status: number, message?: string) {
    expect(response.status).toBe(status);
    expect(response.body).toBeDefined();
    expect(typeof response.body).toBe('object');

    if (message) {
      if (response.body.message) {
        expect(response.body.message).toContain(message);
      } else if (response.body.error) {
        expect(response.body.error).toContain(message);
      }
    }
  }

  static expectValidationError(response: any, expectedFields?: string[]) {
    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();

    if (expectedFields && response.body.details) {
      expect(Array.isArray(response.body.details)).toBe(true);
      for (const field of expectedFields) {
        const hasFieldError = response.body.details.some((detail: any) =>
          detail.message.toLowerCase().includes(field.toLowerCase()),
        );
        expect(hasFieldError).toBe(true);
      }
    }
  }
}
