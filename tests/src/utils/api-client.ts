import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import type {
  ApiResponse,
  TestUser,
  TestAnimalType,
  TestLocation,
  TestAnimal,
  TestVisitedLocation,
  TestRegistrationRequest,
  AnimalDto,
  TestCreateAnimalTypeRequest,
  TestCreateLocationRequest,
  TestCreateAnimalRequest,
  TestUpdateAccountRequest,
  TestUpdateAnimalRequest,
  TestAddVisitedLocationRequest,
  TestSearchParams,
  TestAccountSearchParams ,
  RegistrationResponse } from '../types/api.types';

export class ApiClient {
  private client: AxiosInstance;
  private disableAuth: boolean = false;

  constructor(baseUrl: string, disableAuth: boolean = false) {
    this.disableAuth = disableAuth;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const apiError: ApiResponse = {
          status: error.response?.status || 0,
          data: error.response?.data || null,
          // Serialize the full error object for detailed debugging
          error: JSON.stringify(error),
        };
        // Return the error response instead of rejecting
        return Promise.resolve(apiError);
      },
    );
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    auth: boolean = false,
  ): Promise<ApiResponse<T>> {
    try {
      const config: any = {
        method,
        url: endpoint,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      if (auth && !this.disableAuth) {
        config.headers = {
          ...config.headers,
          Authorization: `Basic ${(global as any).TEST_BASE64_AUTH}`,
        };
      } else if (auth && this.disableAuth) {
        console.log('DEBUG: Auth disabled, not sending Authorization header');
      }

      const response: AxiosResponse<T> = await this.client.request(config);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers as any,
      };
    } catch (error: any) {
      return error;
    }
  }

  public async requestWithCustomHeaders<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string | null>,
  ): Promise<ApiResponse<T>> {
    try {
      const config: any = {
        method,
        url: endpoint,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response: AxiosResponse<T> = await this.client.request(config);

      return {
        status: response.status,
        data: response.data,
        headers: response.headers as any,
      };
    } catch (error: any) {
      return error;
    }
  }

  // Registration endpoints
  async register(userData: TestRegistrationRequest): Promise<ApiResponse<RegistrationResponse>> {
    return this.request<RegistrationResponse>('POST', '/registration', userData, false);
  }

  // Account endpoints
  async getAccount(id: number): Promise<ApiResponse<TestUser>> {
    return this.request<TestUser>('GET', `/accounts/${id}`, undefined, true);
  }

  async getAccounts(): Promise<ApiResponse<TestUser[]>> {
    return this.request<TestUser[]>('GET', '/accounts', undefined, true);
  }

  async searchAccounts(params: TestAccountSearchParams): Promise<ApiResponse<TestUser[]>> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<TestUser[]>('GET', `/accounts/search?${queryString}`, undefined, true);
  }

  async searchAccountsUnauthenticated(params: TestAccountSearchParams): Promise<ApiResponse<TestUser[]>> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<TestUser[]>('GET', `/accounts/search?${queryString}`, undefined, false);
  }

  async updateAccount(id: number, data: TestUpdateAccountRequest): Promise<ApiResponse<TestUser>> {
    return this.request<TestUser>('PUT', `/accounts/${id}`, data, true);
  }

  async deleteAccount(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/accounts/${id}`, undefined, true);
  }

  // Animal Type endpoints
  async createAnimalType(typeData: string | TestCreateAnimalTypeRequest): Promise<ApiResponse<TestAnimalType>> {
    const data = typeof typeData === 'string' ? { type: typeData } : typeData;
    return this.request<TestAnimalType>('POST', '/animals/types', data, true);
  }

  async createAnimalTypeUnauthenticated(typeData: string | TestCreateAnimalTypeRequest): Promise<ApiResponse<TestAnimalType>> {
    const data = typeof typeData === 'string' ? { type: typeData } : typeData;
    return this.request<TestAnimalType>('POST', '/animals/types', data, false);
  }

  async getAnimalType(id: number): Promise<ApiResponse<TestAnimalType>> {
    return this.request<TestAnimalType>('GET', `/animals/types/${id}`, undefined, true);
  }

  async getAnimalTypes(): Promise<ApiResponse<TestAnimalType[]>> {
    return this.request<TestAnimalType[]>('GET', '/animals/types', undefined, true);
  }

  async getAnimalTypeUnauthenticated(id: number): Promise<ApiResponse<TestAnimalType>> {
    return this.request<TestAnimalType>('GET', `/animals/types/${id}`, undefined, false);
  }

  async getAnimalTypesUnauthenticated(): Promise<ApiResponse<TestAnimalType[]>> {
    return this.request<TestAnimalType[]>('GET', '/animals/types', undefined, false);
  }

  async updateAnimalType(id: number, data: string | TestCreateAnimalTypeRequest): Promise<ApiResponse<TestAnimalType>> {
    const requestData = typeof data === 'string' ? { type: data } : data;
    return this.request<TestAnimalType>('PUT', `/animals/types/${id}`, requestData, true);
  }

  async updateAnimalTypeUnauthenticated(id: number, data: string | TestCreateAnimalTypeRequest): Promise<ApiResponse<TestAnimalType>> {
    const requestData = typeof data === 'string' ? { type: data } : data;
    return this.request<TestAnimalType>('PUT', `/animals/types/${id}`, requestData, false);
  }

  async deleteAnimalType(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/animals/types/${id}`, undefined, true);
  }

  async deleteAnimalTypeUnauthenticated(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/animals/types/${id}`, undefined, false);
  }

  // Location endpoints
  async createLocation(locationData: TestCreateLocationRequest): Promise<ApiResponse<TestLocation>> {
    return this.request<TestLocation>('POST', '/locations', locationData, true);
  }

  async getLocation(id: number): Promise<ApiResponse<TestLocation>> {
    return this.request<TestLocation>('GET', `/locations/${id}`, undefined, true);
  }

  async updateLocation(id: number, data: Partial<TestCreateLocationRequest>): Promise<ApiResponse<TestLocation>> {
    return this.request<TestLocation>('PUT', `/locations/${id}`, data, true);
  }

  async deleteLocation(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/locations/${id}`, undefined, true);
  }

  async getLocations(): Promise<ApiResponse<TestLocation[]>> {
    return this.request<TestLocation[]>('GET', '/locations', undefined, true);
  }

  // Animal endpoints
  async createAnimal(animalData: TestCreateAnimalRequest): Promise<ApiResponse<TestAnimal>> {
    return this.request<TestAnimal>('POST', '/animals', animalData, true);
  }

  async createAnimalUnauthenticated(animalData: TestCreateAnimalRequest): Promise<ApiResponse<TestAnimal>> {
    return this.request<TestAnimal>('POST', '/animals', animalData, false);
  }

  async getAnimal(id: number): Promise<ApiResponse<TestAnimal>> {
    return this.request<TestAnimal>('GET', `/animals/${id}`, undefined, true);
  }

  async getAnimalUnauthenticated(id: number): Promise<ApiResponse<TestAnimal>> {
    return this.request<TestAnimal>('GET', `/animals/${id}`, undefined, false);
  }

  async updateAnimal(id: number, data: TestUpdateAnimalRequest): Promise<ApiResponse<TestAnimal>> {
    return this.request<TestAnimal>('PUT', `/animals/${id}`, data, true);
  }

  async updateAnimalUnauthenticated(id: number, data: TestUpdateAnimalRequest): Promise<ApiResponse<TestAnimal>> {
    return this.request<TestAnimal>('PUT', `/animals/${id}`, data, false);
  }

  async deleteAnimal(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/animals/${id}`, undefined, true);
  }

  async deleteAnimalUnauthenticated(id: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/animals/${id}`, undefined, false);
  }

  async searchAnimals(params: TestSearchParams): Promise<ApiResponse<TestAnimal[]>> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<TestAnimal[]>('GET', `/animals/search?${queryString}`, undefined, true);
  }

  async searchAnimalsUnauthenticated(params: TestSearchParams): Promise<ApiResponse<TestAnimal[]>> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<TestAnimal[]>('GET', `/animals/search?${queryString}`, undefined, false);
  }

  // Animal Types management
  async addAnimalType(animalId: number, typeId: number): Promise<ApiResponse<AnimalDto>> {
    return this.request<AnimalDto>('POST', `/animals/${animalId}/types`, { typeId }, true);
  }

  async addAnimalTypeUnauthenticated(animalId: number, typeId: number): Promise<ApiResponse<void>> {
    return this.request<void>('POST', `/animals/${animalId}/types`, { typeId }, false);
  }

  async removeAnimalType(animalId: number, typeId: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/animals/${animalId}/types/${typeId}`, undefined, true);
  }

  async changeAnimalType(animalId: number, data: { oldTypeId: number; newTypeId: number }): Promise<ApiResponse<any>> {
    return this.request<any>('PUT', `/animals/${animalId}/types`, data, true);
  }

  async removeAnimalTypeUnauthenticated(animalId: number, typeId: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/animals/${animalId}/types/${typeId}`, undefined, false);
  }

  // Visited Locations endpoints
  async addVisitedLocation(animalId: number, locationData: TestAddVisitedLocationRequest): Promise<ApiResponse<TestVisitedLocation>> {
    // The route expects POST /animals/:animalId/locations/:locationId
    // where locationId is in the URL params and locationData is in the body
    return this.request<TestVisitedLocation>('POST', `/animals/${animalId}/locations/${locationData.locationPointId}`, locationData, true);
  }

  async getVisitedLocations(animalId: number, params?: { startDateTime?: string; endDateTime?: string }): Promise<ApiResponse<TestVisitedLocation[]>> {
    let url = `/animals/${animalId}/locations`;
    if (params) {
      const queryString = new URLSearchParams(params as any).toString();
      url += `?${queryString}`;
    }
    return this.request<TestVisitedLocation[]>('GET', url, undefined, true);
  }

  async getVisitedLocationsUnauthenticated(animalId: number, params?: { startDateTime?: string; endDateTime?: string }): Promise<ApiResponse<TestVisitedLocation[]>> {
    let url = `/animals/${animalId}/locations`;
    if (params) {
      const queryString = new URLSearchParams(params as any).toString();
      url += `?${queryString}`;
    }
    return this.request<TestVisitedLocation[]>('GET', url, undefined, false);
  }

  async updateVisitedLocation(animalId: number, data: TestAddVisitedLocationRequest): Promise<ApiResponse<TestVisitedLocation>> {
    return this.request<TestVisitedLocation>('PUT', `/animals/${animalId}/locations`, data, true);
  }

  async deleteVisitedLocation(animalId: number, locationId: number): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/animals/${animalId}/locations/${locationId}`, undefined, true);
  }
}
