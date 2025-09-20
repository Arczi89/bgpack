import '@testing-library/jest-dom';
import { apiService } from '../apiService';
import { Game } from '../../types/Game';

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const createMockGame = (
  id: number,
  name: string,
  yearPublished: number,
  minPlayers: number,
  maxPlayers: number,
  playingTime: number,
  bggRating: number,
  ownedBy: string[]
): Game => ({
  id,
  name,
  yearPublished,
  minPlayers,
  maxPlayers,
  playingTime,
  bggRating,
  ownedBy,
});

const mockGames: Game[] = [
  createMockGame(1, 'Catan', 1995, 3, 4, 90, 7.1, ['user1']),
  createMockGame(2, 'Azul', 2017, 2, 4, 45, 8.2, ['user2']),
];

describe('apiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOwnedGames', () => {
    it('should fetch games for a single user', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockGames),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.getOwnedGames('user1');

      expect(mockFetch).toHaveBeenCalledWith('/api/own/user1');
      expect(result).toEqual(mockGames);
    });

    it('should fetch games with excludeExpansions parameter', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockGames),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.getOwnedGames('user1', true);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/own/user1?excludeExpansions=true'
      );
      expect(result).toEqual(mockGames);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(
        apiService.getOwnedGames('nonExistingUser1')
      ).rejects.toThrow('API Error: 404 Not Found');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getOwnedGames('user1')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle empty responses', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.getOwnedGames('user1');

      expect(result).toEqual([]);
    });

    it('should handle malformed JSON responses', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGames('user1')).rejects.toThrow(
        'Invalid JSON'
      );
    });
  });

  describe('checkHealth', () => {
    it('should check API health successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'ok' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith('/api/health');
      expect(result).toEqual({ status: 'ok' });
    });

    it('should handle health check failures', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.checkHealth()).rejects.toThrow(
        'API Error: 500 Internal Server Error'
      );
    });
  });

  describe('request method', () => {
    it('should handle different HTTP methods', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      // Test with custom options
      const result = await (apiService as any).request('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });
      expect(result).toEqual({ data: 'test' });
    });

    it('should handle timeout scenarios', async () => {
      // Mock a slow response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockGames),
                } as any),
              100
            )
          )
      );

      const result = await apiService.getOwnedGames('user1');

      expect(result).toEqual(mockGames);
    });

    it('should handle different response types', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('plain text response'),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      // Test with text response
      const result = await (apiService as any).request('/api/text', {
        headers: { Accept: 'text/plain' },
      });

      expect(result).toBe('plain text response');
    });
  });

  describe('error handling', () => {
    it('should handle 400 Bad Request', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGames('invalidUser')).rejects.toThrow(
        'API Error: 400 Bad Request'
      );
    });

    it('should handle 401 Unauthorized', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGames('user1')).rejects.toThrow(
        'API Error: 401 Unauthorized'
      );
    });

    it('should handle 403 Forbidden', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGames('user1')).rejects.toThrow(
        'API Error: 403 Forbidden'
      );
    });

    it('should handle 500 Internal Server Error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGames('user1')).rejects.toThrow(
        'API Error: 500 Internal Server Error'
      );
    });

    it('should handle 503 Service Unavailable', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGames('user1')).rejects.toThrow(
        'API Error: 503 Service Unavailable'
      );
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockGames),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const promises = [
        apiService.getOwnedGames('user1'),
        apiService.getOwnedGames('user2'),
        apiService.getOwnedGames('user3'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(mockGames);
      expect(results[1]).toEqual(mockGames);
      expect(results[2]).toEqual(mockGames);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure in concurrent requests', async () => {
      const mockSuccessResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockGames),
      };
      const mockErrorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse as any)
        .mockResolvedValueOnce(mockErrorResponse as any)
        .mockResolvedValueOnce(mockSuccessResponse as any);

      const promises = [
        apiService.getOwnedGames('user1'),
        apiService.getOwnedGames('nonExistingUser1'),
        apiService.getOwnedGames('user2'),
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });
  });
});
