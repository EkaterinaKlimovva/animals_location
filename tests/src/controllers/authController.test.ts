import { jest } from '@jest/globals';
import { register } from '../../../src/controllers/authController';
import { authService } from '../../../src/services/authService';
import { createMockRequest, createMockResponse } from '../utils/mock-express';

// Mock dependencies
jest.mock('../../../src/services/authService');

// Type assertions for mocked functions
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth Controller Tests', () => {
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
  });

  describe('register', () => {
    it('should create account when valid data is provided', async () => {
      const accountData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdAccount = {
        id: 1,
        email: accountData.email,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
      };

      (mockAuthService.register as any).mockResolvedValue({
        conflict: false,
        account: createdAccount,
      });

      const mockRequest = createMockRequest({ body: accountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockAuthService.register).toHaveBeenCalledWith(accountData);
      expect(mockResponse.getStatusCode()).toBe(201);
      expect(mockResponse.getData()).toBeDefined();
      expect(mockResponse.getData().id).toBe(1);
      expect(mockResponse.getData().password).toBeUndefined();
    });

    it('should return 409 when account already exists', async () => {
      const accountData = {
        email: 'existing@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      (mockAuthService.register as any).mockResolvedValue({
        conflict: true,
        account: null,
      });

      const mockRequest = createMockRequest({ body: accountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(409);
      expect(mockResponse.getData().message).toContain('already exists');
    });

    it('should handle missing email field', async () => {
      const invalidAccountData = {
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle missing password field', async () => {
      const invalidAccountData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle missing firstName field', async () => {
      const invalidAccountData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        lastName: 'User',
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle missing lastName field', async () => {
      const invalidAccountData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle empty string fields', async () => {
      const invalidAccountData = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle null fields', async () => {
      const invalidAccountData = {
        email: null,
        password: null,
        firstName: null,
        lastName: null,
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle undefined fields', async () => {
      const invalidAccountData = {
        email: undefined,
        password: undefined,
        firstName: undefined,
        lastName: undefined,
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle whitespace-only fields', async () => {
      const invalidAccountData = {
        email: '   ',
        password: '   ',
        firstName: '   ',
        lastName: '   ',
      };

      const mockRequest = createMockRequest({ body: invalidAccountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should return 403 when user is already authenticated', async () => {
      const accountData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockRequest = createMockRequest({
        body: accountData,
        user: { id: 1, email: 'existing@example.com', firstName: 'Existing', lastName: 'User' },
      } as any);

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(403);
      expect(mockResponse.getData().message).toContain('Already authenticated');
    });

    it('should handle service errors during registration', async () => {
      const accountData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      (mockAuthService.register as any).mockRejectedValue(new Error('Database error'));

      const mockRequest = createMockRequest({ body: accountData });

      // The auth controller doesn't use try-catch, so errors will bubble up
      await expect((register as any)(mockRequest, mockResponse)).rejects.toThrow('Database error');
    });

    it('should handle empty request body', async () => {
      const mockRequest = createMockRequest({ body: {} });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });

    it('should handle malformed request body', async () => {
      const mockRequest = createMockRequest({ body: null });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(400);
      expect(mockResponse.getData().message).toContain('Missing required fields');
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent registration attempts', async () => {
      const accountData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdAccount = {
        id: 1,
        email: accountData.email,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
      };

      (mockAuthService.register as any).mockResolvedValue({
        conflict: false,
        account: createdAccount,
      });

      const promises = Array.from({ length: 10 }, () => {
        const mockRequest = createMockRequest({ body: accountData });
        const mockResponse = createMockResponse();
        return (register as any)(mockRequest, mockResponse as any).then(() => mockResponse);
      });

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.getStatusCode()).toBe(201);
      });
    });

    it('should handle email case sensitivity', async () => {
      const emailVariations = [
        'test@example.com',
        'Test@Example.Com',
        'TEST@EXAMPLE.COM',
        'test@EXAMPLE.com',
      ];

      for (const email of emailVariations) {
        const accountData = {
          email,
          password: 'ValidPassword123!',
          firstName: 'Test',
          lastName: 'User',
        };

        const createdAccount = {
          id: 1,
          email: accountData.email,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
        };

        (mockAuthService.register as any).mockResolvedValue({
          conflict: false,
          account: createdAccount,
        });

        const mockRequest = createMockRequest({ body: accountData });
        await (register as any)(mockRequest, mockResponse);

        expect(mockResponse.getStatusCode()).toBe(201);
        expect(mockAuthService.register).toHaveBeenCalledWith(accountData);

        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle very long field values', async () => {
      const longString = 'a'.repeat(10000);
      const accountData = {
        email: `${longString}@example.com`,
        password: longString,
        firstName: longString,
        lastName: longString,
      };

      const createdAccount = {
        id: 1,
        email: accountData.email,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
      };

      (mockAuthService.register as any).mockResolvedValue({
        conflict: false,
        account: createdAccount,
      });

      const mockRequest = createMockRequest({ body: accountData });

      await (register as any)(mockRequest, mockResponse);

      expect(mockResponse.getStatusCode()).toBe(201);
      expect(mockAuthService.register).toHaveBeenCalledWith(accountData);
    });
  });

  describe('Security Tests', () => {
    it('should handle email with special characters', async () => {
      const specialEmails = [
        'test+tag@example.com',
        'test.sub@example.com',
        'test@example.co.uk',
        'test@example-domain.com',
        'user@123.456.789.012', // IP address
      ];

      for (const email of specialEmails) {
        const accountData = {
          email,
          password: 'ValidPassword123!',
          firstName: 'Test',
          lastName: 'User',
        };

        const createdAccount = {
          id: 1,
          email: accountData.email,
          firstName: accountData.firstName,
          lastName: accountData.lastName,
        };

        (mockAuthService.register as any).mockResolvedValue({
          conflict: false,
          account: createdAccount,
        });

        const mockRequest = createMockRequest({ body: accountData });
        await (register as any)(mockRequest, mockResponse);

        expect(mockResponse.getStatusCode()).toBe(201);

        jest.clearAllMocks();
        mockResponse = createMockResponse();
      }
    });

    it('should handle names with special characters', async () => {
      const specialNames = [
        'José María',
        'François',
        'Øyvind',
        'Müller',
        'O\'Connor',
        'Van der Berg',
        'Jean-Claude',
      ];

      for (const firstName of specialNames) {
        for (const lastName of specialNames) {
          const accountData = {
            email: 'test@example.com',
            password: 'ValidPassword123!',
            firstName,
            lastName,
          };

          const createdAccount = {
            id: 1,
            email: accountData.email,
            firstName: accountData.firstName,
            lastName: accountData.lastName,
          };

          (mockAuthService.register as any).mockResolvedValue({
            conflict: false,
            account: createdAccount,
          });

          const mockRequest = createMockRequest({ body: accountData });
          await (register as any)(mockRequest, mockResponse);

          expect(mockResponse.getStatusCode()).toBe(201);

          jest.clearAllMocks();
          mockResponse = createMockResponse();
        }
      }
    });

    it('should prevent password logging in console output', async () => {
      const accountData = {
        email: 'test@example.com',
        password: 'SecretPassword123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdAccount = {
        id: 1,
        email: accountData.email,
        firstName: accountData.firstName,
        lastName: accountData.lastName,
      };

      (mockAuthService.register as any).mockResolvedValue({
        conflict: false,
        account: createdAccount,
      });

      const mockRequest = createMockRequest({ body: accountData });

      // Mock console.log to check password is redacted
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await (register as any)(mockRequest, mockResponse);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[AUTH_CONTROLLER] register called with body:',
        expect.objectContaining({ password: '[REDACTED]' }),
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('SecretPassword123!'),
      );

      consoleSpy.mockRestore();
    });
  });
});
