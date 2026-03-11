import { ApiClient } from '../utils/api-client';
import { TestHelpers } from '../utils/test-helpers';
import type { TestUpdateAccountRequest, TestAccountSearchParams } from '../types/api.types';

describe('Accounts API Tests', () => {
  let apiClient: ApiClient;


  beforeAll(() => {
    apiClient = new ApiClient((global as any).TEST_BASE_URL);
  });

  describe('GET /accounts/:id', () => {
    it('should return existing account', async () => {
      const response = await apiClient.getAccount(5);

      TestHelpers.expectOk(response, 'Get Account Success');
      TestHelpers.expectHasProperty(response.data, 'id', 'Get Account Success');
      TestHelpers.expectHasProperty(response.data, 'firstName', 'Get Account Success');
      TestHelpers.expectHasProperty(response.data, 'lastName', 'Get Account Success');
      TestHelpers.expectHasProperty(response.data, 'email', 'Get Account Success');
    });

    it('should return 404 for non-existing account', async () => {
      const response = await apiClient.getAccount(999999);

      TestHelpers.expectNotFound(response, 'Get Account Not Found');
    });

    it('should return 401 for unauthorized request', async () => {
      // Temporarily override the global auth with invalid credentials
      const originalAuth = (global as any).TEST_BASE64_AUTH;
      (global as any).TEST_BASE64_AUTH = Buffer.from('invalid:credentials').toString('base64');

      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const response = await unauthorizedClient.getAccount(5);

      // Restore original auth
      (global as any).TEST_BASE64_AUTH = originalAuth;

      TestHelpers.expectUnauthorized(response, 'Get Account Unauthorized');
    });
  });

  describe('PUT /accounts/:id', () => {
    it('should update account successfully', async () => {
      const updateData: TestUpdateAccountRequest = {
        firstName: 'НовоеИмя',
        lastName: 'НоваяФамилия',
      };

      const response = await apiClient.updateAccount(5, updateData);

      TestHelpers.expectUpdated(response, 'Update Account Success');
      TestHelpers.expectEqual(response.data.firstName, updateData.firstName, 'Update Account Success', 'firstName');
      TestHelpers.expectEqual(response.data.lastName, updateData.lastName, 'Update Account Success', 'lastName');
    });

    it('should update only firstName', async () => {
      const updateData: TestUpdateAccountRequest = {
        firstName: 'ТолькоИмя',
      };

      const response = await apiClient.updateAccount(5, updateData);

      TestHelpers.expectUpdated(response, 'Update Account FirstName Only');
      TestHelpers.expectEqual(response.data.firstName, updateData.firstName, 'Update Account FirstName Only', 'firstName');
    });

    it('should update only lastName', async () => {
      const updateData: TestUpdateAccountRequest = {
        lastName: 'ТолькоФамилия',
      };

      const response = await apiClient.updateAccount(5, updateData);

      TestHelpers.expectUpdated(response, 'Update Account LastName Only');
      TestHelpers.expectEqual(response.data.lastName, updateData.lastName, 'Update Account LastName Only', 'lastName');
    });

    it('should return 404 when updating non-existing account', async () => {
      const updateData: TestUpdateAccountRequest = {
        firstName: 'Несуществующий',
      };

      const response = await apiClient.updateAccount(999999, updateData);

      TestHelpers.expectNotFound(response, 'Update Account Not Found');
    });

    it('should return 401 for unauthorized update', async () => {
      // Temporarily override the global auth with invalid credentials
      const originalAuth = (global as any).TEST_BASE64_AUTH;
      (global as any).TEST_BASE64_AUTH = Buffer.from('invalid:credentials').toString('base64');

      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const updateData: TestUpdateAccountRequest = {
        firstName: 'Хакер',
      };

      const response = await unauthorizedClient.updateAccount(5, updateData);

      // Restore original auth
      (global as any).TEST_BASE64_AUTH = originalAuth;

      TestHelpers.expectUnauthorized(response, 'Update Account Unauthorized');
    });

    it('should handle Cyrillic characters in update', async () => {
      const updateData: TestUpdateAccountRequest = {
        firstName: 'Анна-Мария',
        lastName: 'Петрова-Иванова',
      };

      const response = await apiClient.updateAccount(5, updateData);

      TestHelpers.expectUpdated(response, 'Update Account Cyrillic');
      TestHelpers.expectEqual(response.data.firstName, updateData.firstName, 'Update Account Cyrillic', 'firstName');
      TestHelpers.expectEqual(response.data.lastName, updateData.lastName, 'Update Account Cyrillic', 'lastName');
    });
  });

  describe('GET /accounts/search', () => {
    it('should search accounts by firstName', async () => {
      const params: TestAccountSearchParams = {
        firstName: 'А',
        from: 0,
        size: 10,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts By FirstName');
      TestHelpers.expectArray(response.data, 'Search Accounts By FirstName');
    });

    it('should search accounts by lastName', async () => {
      const params: TestAccountSearchParams = {
        lastName: 'Петров',
        from: 0,
        size: 10,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts By LastName');
      TestHelpers.expectArray(response.data, 'Search Accounts By LastName');
    });

    it('should search accounts by email', async () => {
      const params: TestAccountSearchParams = {
        email: 'admin@',
        from: 0,
        size: 10,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts By Email');
      TestHelpers.expectArray(response.data, 'Search Accounts By Email');
    });

    it('should search with multiple parameters', async () => {
      const params: TestAccountSearchParams = {
        firstName: 'А',
        lastName: 'П',
        email: '@mail',
        from: 0,
        size: 5,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts Multiple Params');
      TestHelpers.expectArray(response.data, 'Search Accounts Multiple Params');
    });

    it('should handle pagination correctly', async () => {
      const params: TestAccountSearchParams = {
        from: 0,
        size: 2,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts Pagination');
      TestHelpers.expectArray(response.data, 'Search Accounts Pagination');
      // Проверяем, что возвращается не более указанного количества
      expect(response.data.length).toBeLessThanOrEqual(2);
    });

    it('should handle second page correctly', async () => {
      const params: TestAccountSearchParams = {
        from: 2,
        size: 2,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts Second Page');
      TestHelpers.expectArray(response.data, 'Search Accounts Second Page');
    });

    it('should return 401 for unauthorized search', async () => {
      // Temporarily override the global auth with invalid credentials
      const originalAuth = (global as any).TEST_BASE64_AUTH;
      (global as any).TEST_BASE64_AUTH = Buffer.from('invalid:credentials').toString('base64');

      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const params: TestAccountSearchParams = {
        firstName: 'А',
        from: 0,
        size: 10,
      };

      const response = await unauthorizedClient.searchAccounts(params);

      // Restore original auth
      (global as any).TEST_BASE64_AUTH = originalAuth;

      TestHelpers.expectUnauthorized(response, 'Search Accounts Unauthorized');
    });

    it('should handle Cyrillic search parameters', async () => {
      const params: TestAccountSearchParams = {
        firstName: 'Анна',
        lastName: 'Петрова',
        from: 0,
        size: 10,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts Cyrillic');
      TestHelpers.expectArray(response.data, 'Search Accounts Cyrillic');
    });

    it('should return empty array for non-matching search', async () => {
      const params: TestAccountSearchParams = {
        firstName: 'NonExistentName',
        from: 0,
        size: 10,
      };

      const response = await apiClient.searchAccounts(params);

      TestHelpers.expectOk(response, 'Search Accounts No Results');
      TestHelpers.expectArray(response.data, 'Search Accounts No Results');
      TestHelpers.expectArrayLength(response.data, 0, 'Search Accounts No Results');
    });
  });

  describe('DELETE /accounts/:id', () => {
    it('should return 404 for non-existing account', async () => {
      const response = await apiClient.deleteAccount(999999);

      TestHelpers.expectNotFound(response, 'Delete Account Not Found');
    });

    it('should return 400 when account has dependent animals', async () => {
      const response = await apiClient.deleteAccount(4);

      TestHelpers.expectBadRequest(response, 'Delete Account Has Dependencies');
      TestHelpers.expectContains((response.data as any).message, 'Cannot delete', 'Delete Account Has Dependencies', 'message');
      TestHelpers.expectContains((response.data as any).message, 'dependent animals', 'Delete Account Has Dependencies', 'message');
    });

    it('should return 401 for unauthorized delete', async () => {
      // Temporarily override the global auth with invalid credentials
      const originalAuth = (global as any).TEST_BASE64_AUTH;
      (global as any).TEST_BASE64_AUTH = Buffer.from('invalid:credentials').toString('base64');

      const unauthorizedClient = new ApiClient((global as any).TEST_BASE_URL);
      const response = await unauthorizedClient.deleteAccount(4);

      // Restore original auth
      (global as any).TEST_BASE64_AUTH = originalAuth;

      TestHelpers.expectUnauthorized(response, 'Delete Account Unauthorized');
    });

    it('should delete account successfully when no dependencies', async () => {
      // Сначала создаем тестовый аккаунт
      const testData = TestHelpers.generateTestData();
      const createResponse = await apiClient.register(testData.user);

      if (createResponse.status === 201) {
        const accountId = createResponse.data.id;

        // Теперь удаляем его
        const deleteResponse = await apiClient.deleteAccount(accountId);

        TestHelpers.expectDeleted(deleteResponse, 'Delete Account Success');

        // Проверяем, что аккаунт действительно удален
        const getResponse = await apiClient.getAccount(accountId);
        TestHelpers.expectNotFound(getResponse, 'Verify Account Deleted');
      }
    });
  });
});
