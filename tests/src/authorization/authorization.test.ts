import { ApiClient } from '../utils/api-client';
import { TestHelpers } from '../utils/test-helpers';
import type { TestCreateAnimalRequest } from '../types/api.types';

interface EndpointTest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  clientMethod: string;
  data?: any;
  expectedStatus?: number;
  description: string;
}

class AuthorizationTestSuite {
  private apiClient: ApiClient;
  private unauthorizedClient: ApiClient;

  constructor(baseUrl: string) {
    this.apiClient = new ApiClient(baseUrl);
    this.unauthorizedClient = new ApiClient(baseUrl, true); // Disable auth for unauthorized tests
  }

  private getUnauthorizedEndpoints(): EndpointTest[] {
    return [
      // Account endpoints
      { method: 'GET', endpoint: '/accounts', clientMethod: 'getAccounts', description: 'GET Accounts No Auth' },
      { method: 'POST', endpoint: '/registration', clientMethod: 'register', data: this.getTestUserData(), expectedStatus: 201, description: 'POST Registration No Auth' },
      { method: 'GET', endpoint: '/accounts/1', clientMethod: 'getAccount', description: 'GET Account By ID No Auth' },
      { method: 'PUT', endpoint: '/accounts/1', clientMethod: 'updateAccount', data: { firstName: 'Hacker' }, description: 'PUT Account No Auth' },
      { method: 'DELETE', endpoint: '/accounts/1', clientMethod: 'deleteAccount', description: 'DELETE Account No Auth' },
      { method: 'GET', endpoint: '/accounts/search', clientMethod: 'searchAccounts', data: { firstName: 'Test', from: 0, size: 10 }, expectedStatus: 200, description: 'GET Accounts Search No Auth' },

      // Animal Type endpoints
      { method: 'POST', endpoint: '/animals/types', clientMethod: 'createAnimalType', data: { type: 'UnauthorizedType' }, description: 'POST Animal Type No Auth' },
      { method: 'GET', endpoint: '/animals/types/1', clientMethod: 'getAnimalType', expectedStatus: 200, description: 'GET Animal Type No Auth' },
      { method: 'PUT', endpoint: '/animals/types/1', clientMethod: 'updateAnimalType', data: { type: 'HackedType' }, description: 'PUT Animal Type No Auth' },
      { method: 'DELETE', endpoint: '/animals/types/1', clientMethod: 'deleteAnimalType', description: 'DELETE Animal Type No Auth' },

      // Location endpoints
      { method: 'POST', endpoint: '/locations', clientMethod: 'createLocation', data: { latitude: 50.0, longitude: 30.0 }, description: 'POST Location No Auth' },
      { method: 'GET', endpoint: '/locations/1', clientMethod: 'getLocation', description: 'GET Location No Auth' },
      { method: 'PUT', endpoint: '/locations/1', clientMethod: 'updateLocation', data: { latitude: 0.0, longitude: 0.0 }, description: 'PUT Location No Auth' },
      { method: 'DELETE', endpoint: '/locations/1', clientMethod: 'deleteLocation', description: 'DELETE Location No Auth' },
      { method: 'GET', endpoint: '/locations', clientMethod: 'getLocations', description: 'GET Locations No Auth' },

      // Animal endpoints
      { method: 'POST', endpoint: '/animals', clientMethod: 'createAnimal', data: this.getTestAnimalData(), description: 'POST Animal No Auth' },
      { method: 'GET', endpoint: '/animals/1', clientMethod: 'getAnimal', description: 'GET Animal No Auth' },
      { method: 'PUT', endpoint: '/animals/1', clientMethod: 'updateAnimal', data: { weight: 999.0 }, description: 'PUT Animal No Auth' },
      { method: 'DELETE', endpoint: '/animals/1', clientMethod: 'deleteAnimal', description: 'DELETE Animal No Auth' },
      { method: 'GET', endpoint: '/animals/search', clientMethod: 'searchAnimals', data: { chipperId: 1, from: 0, size: 10 }, expectedStatus: 200, description: 'GET Animals Search No Auth' },

      // Animal Type management
      { method: 'POST', endpoint: '/animals/1/types', clientMethod: 'addAnimalType', data: 2, description: 'POST Animal Type No Auth' },
      { method: 'DELETE', endpoint: '/animals/1/types/2', clientMethod: 'removeAnimalType', description: 'DELETE Animal Type No Auth' },

      // Visited Locations
      { method: 'POST', endpoint: '/animals/1/locations', clientMethod: 'addVisitedLocation', data: { locationPointId: 1, visitedAt: '2025-01-01T12:00:00.000Z' }, description: 'POST Visited Location No Auth' },
      { method: 'GET', endpoint: '/animals/1/locations', clientMethod: 'getVisitedLocations', expectedStatus: 200, description: 'GET Visited Locations No Auth' },
      { method: 'PUT', endpoint: '/animals/1/locations/1', clientMethod: 'updateVisitedLocation', data: { locationPointId: 1, visitedAt: '2025-01-01T12:00:00.000Z' }, description: 'PUT Visited Location No Auth' },
      { method: 'DELETE', endpoint: '/animals/1/locations/1', clientMethod: 'deleteVisitedLocation', description: 'DELETE Visited Location No Auth' },
    ];
  }

  private getTestUserData() {
    const timestamp = Date.now();
    return {
      firstName: 'Unauthorized',
      lastName: 'User',
      email: `unauthorized${timestamp}@example.com`,
      password: 'password123',
    };
  }

  private getTestAnimalData(): TestCreateAnimalRequest {
    return {
      animalTypes: [1],
      weight: 5.0,
      length: 0.5,
      height: 0.3,
      gender: 'MALE' as const,
      chipperId: 1,
      chippingLocationId: 1,
    };
  }

  private async testUnauthorizedEndpoint(endpointTest: EndpointTest): Promise<void> {
    const client = this.unauthorizedClient;
    let response: any;

    try {
      switch (endpointTest.clientMethod) {
      case 'getAccounts':
        response = await client.getAccounts();
        break;
      case 'register':
        response = await client.register(endpointTest.data!);
        break;
      case 'getAccount':
        response = await client.getAccount(1);
        break;
      case 'updateAccount':
        response = await client.updateAccount(1, endpointTest.data!);
        break;
      case 'deleteAccount':
        response = await client.deleteAccount(1);
        break;
      case 'searchAccounts':
        response = await client.searchAccounts(endpointTest.data!);
        break;
      case 'createAnimalType':
        response = await client.createAnimalType(endpointTest.data!);
        break;
      case 'getAnimalType':
        response = await client.getAnimalType(1);
        break;
      case 'updateAnimalType':
        response = await client.updateAnimalType(1, endpointTest.data!);
        break;
      case 'deleteAnimalType':
        response = await client.deleteAnimalType(1);
        break;
      case 'createLocation':
        response = await client.createLocation(endpointTest.data!);
        break;
      case 'getLocation':
        response = await client.getLocation(1);
        break;
      case 'updateLocation':
        response = await client.updateLocation(1, endpointTest.data!);
        break;
      case 'deleteLocation':
        response = await client.deleteLocation(1);
        break;
      case 'getLocations':
        response = await client.getLocations();
        break;
      case 'createAnimal':
        response = await client.createAnimal(endpointTest.data!);
        break;
      case 'getAnimal':
        response = await client.getAnimal(1);
        break;
      case 'updateAnimal':
        response = await client.updateAnimal(1, endpointTest.data!);
        break;
      case 'deleteAnimal':
        response = await client.deleteAnimal(1);
        break;
      case 'searchAnimals':
        response = await client.searchAnimals(endpointTest.data!);
        break;
      case 'addAnimalType':
        response = await client.addAnimalType(1, endpointTest.data!);
        break;
      case 'removeAnimalType':
        response = await client.removeAnimalType(1, 2);
        break;
      case 'addVisitedLocation':
        response = await client.addVisitedLocation(1, endpointTest.data!);
        break;
      case 'getVisitedLocations':
        response = await client.getVisitedLocations(1);
        break;
      case 'updateVisitedLocation':
        response = await client.updateVisitedLocation(1, 1, endpointTest.data!);
        break;
      case 'deleteVisitedLocation':
        response = await client.deleteVisitedLocation(1, 1);
        break;
      default:
        throw new Error(`Unknown client method: ${endpointTest.clientMethod} for endpoint: ${endpointTest.description}`);
      }
    } catch (error: any) {
      throw new Error(`Error testing ${endpointTest.description}: ${error.message}`);
    }

    const expectedStatus = endpointTest.expectedStatus ?? 401;

    try {
      switch (expectedStatus) {
      case 401:
        TestHelpers.expectUnauthorized(response, endpointTest.description);
        break;
      case 400:
        TestHelpers.expectBadRequest(response, endpointTest.description);
        break;
      case 404:
        TestHelpers.expectNotFound(response, endpointTest.description);
        break;
      case 200:
        TestHelpers.expectOk(response, endpointTest.description);
        break;
      case 201:
        TestHelpers.expectStatus(response.status, 201, endpointTest.description);
        break;
      }
    } catch (error: any) {
      throw new Error(`Error validating ${endpointTest.description} (status ${response.status}): ${error.message}`);
    }
  }

  async runUnauthorizedTests(): Promise<void> {
    const endpoints = this.getUnauthorizedEndpoints();

    // Test just the GET /accounts endpoint first (should return 401)
    const accountsEndpoint = endpoints.find(e => e.description === 'GET Accounts No Auth');
    if (accountsEndpoint) {
      console.log('Testing GET /accounts endpoint...');
      await this.testUnauthorizedEndpoint(accountsEndpoint);
    }

    // Test the rest one by one to identify the failing endpoint
    for (const endpointTest of endpoints) {
      if (endpointTest.description !== 'GET Accounts No Auth') {
        try {
          console.log(`Testing: ${endpointTest.description}`);
          await this.testUnauthorizedEndpoint(endpointTest);
        } catch (error: any) {
          console.log(`FAILED: ${endpointTest.description} - ${error.message}`);
          throw error;
        }
      }
    }
  }

  async runInvalidCredentialsTests(): Promise<void> {
    const testCases = [
      {
        description: 'Invalid Basic Auth',
        authHeader: 'Basic d3JvbmdAdXNlcjpwYXNz', // wronguser:pass
      },
      {
        description: 'Malformed Basic Auth',
        authHeader: 'Basic invalidbase64',
      },
      {
        description: 'Empty Basic Auth',
        authHeader: 'Basic ',
      },
      {
        description: 'Non-existent User',
        authHeader: 'Basic bm9uZXhpc3RlbnRAZXhhbXBsZS5jb206cGFzcw==', // nonexistent@example.com:pass
      },
      {
        description: 'Wrong Password',
        authHeader: 'Basic YWRtaW5AbWFpbC5ydTp3cm9uZ3Bhc3M=', // admin@mail.com:wrongpass
      },
    ];

    for (const testCase of testCases) {
      const response = await this.unauthorizedClient.requestWithCustomHeaders(
        'GET',
        '/accounts',
        undefined,
        { 'Authorization': testCase.authHeader },
      );

      TestHelpers.expectUnauthorized(response, testCase.description);

      if (testCase.description === 'Invalid Basic Auth') {
        TestHelpers.expectHasProperty(response.data, 'message', testCase.description);
      }
    }
  }

  async runValidCredentialsTests(): Promise<void> {
    // Test basic access
    const response = await this.apiClient.getAccounts();
    TestHelpers.expectOk(response, 'Valid Credentials Access');
    TestHelpers.expectArray(response.data, 'Valid Credentials Access');

    // Test different endpoints
    const endpoints = [
      () => this.apiClient.getAccounts(),
      () => this.apiClient.getAccount(1),
      () => this.apiClient.getAnimalType(1),
      () => this.apiClient.getLocation(1),
      () => this.apiClient.getAnimal(1),
      () => this.apiClient.getLocations(),
      () => this.apiClient.getVisitedLocations(1),
    ];

    for (const endpointCall of endpoints) {
      try {
        const response = await endpointCall();
        expect(response.status).not.toBe(401);
      } catch (error: any) {
        expect(error.status).not.toBe(401);
      }
    }

    // Test POST operations
    const typeData = { type: `TempType${Date.now()}` };
    const createResponse = await this.apiClient.createAnimalType(typeData);

    if (createResponse.status === 201) {
      await this.apiClient.deleteAnimalType(createResponse.data.id);
      TestHelpers.expectCreated(createResponse, 'Valid Credentials POST');
    } else {
      TestHelpers.expectStatus(createResponse.status, 400, 'Valid Credentials POST');
    }

    // Test PUT operations
    const updateData = { firstName: 'TestUpdate' };
    const updateResponse = await this.apiClient.updateAccount(1, updateData);
    expect(updateResponse.status).not.toBe(401);

    if (updateResponse.status === 200) {
      await this.apiClient.updateAccount(1, { firstName: 'НовоеИмя' });
    }

    // Test search operations
    const searchParams = { firstName: 'Test', from: 0, size: 10 };
    const searchResponse = await this.apiClient.searchAccounts(searchParams);
    TestHelpers.expectOk(searchResponse, 'Valid Credentials Search');
    TestHelpers.expectArray(searchResponse.data, 'Valid Credentials Search');
  }

  async runAuthorizationHeaderTests(): Promise<void> {
    // Test case-insensitive header name
    const response1 = await this.unauthorizedClient.requestWithCustomHeaders(
      'GET',
      '/accounts',
      undefined,
      { 'authorization': `Basic ${(global as any).TEST_BASE64_AUTH}` },
    );
    TestHelpers.expectOk(response1, 'Case-insensitive Authorization Header');

    // Test extra spaces in header value
    const response2 = await this.unauthorizedClient.requestWithCustomHeaders(
      'GET',
      '/accounts',
      undefined,
      { 'Authorization': ` Basic ${(global as any).TEST_BASE64_AUTH} ` },
    );
    TestHelpers.expectOk(response2, 'Authorization Header Extra Spaces');

    // Test no authorization header
    const response3 = await this.unauthorizedClient.requestWithCustomHeaders(
      'GET',
      '/accounts',
      undefined,
      {},
    );
    TestHelpers.expectUnauthorized(response3, 'No Authorization Header');
  }
}

describe('Authorization API Tests', () => {
  let testSuite: AuthorizationTestSuite;

  beforeAll(() => {
    testSuite = new AuthorizationTestSuite((global as any).TEST_BASE_URL);
  });

  describe('Unauthorized Access Tests', () => {
    it('should return appropriate errors for all endpoints without auth', async () => {
      await testSuite.runUnauthorizedTests();
    });
  });

  describe('Invalid Credentials Tests', () => {
    it('should return 401 for invalid Basic Auth credentials', async () => {
      await testSuite.runInvalidCredentialsTests();
    });
  });

  describe('Valid Credentials Tests', () => {
    it('should allow access with valid credentials', async () => {
      await testSuite.runValidCredentialsTests();
    });
  });

  describe('Authorization Header Tests', () => {
    it('should handle various authorization header formats', async () => {
      await testSuite.runAuthorizationHeaderTests();
    });
  });
});
