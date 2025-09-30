import '@testing-library/jest-dom';
import { apiService } from '../apiService';
import { Game } from '../../types/Game';
import { GameList, SaveGameListRequest } from '../../types/GameList';

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
  id: id.toString(),
  name,
  yearPublished,
  minPlayers,
  maxPlayers,
  playingTime,
  minAge: 8,
  description: `Description for ${name}`,
  bggRating,
  averageRating: bggRating,
  complexity: 2.5,
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

  describe('getOwnedGamesWithStats', () => {
    it('should fetch games for a single user', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockGames),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.getOwnedGamesWithStats('user1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/own/user1',
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(result).toEqual(mockGames);
    });

    it('should fetch games with excludeExpansions parameter', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockGames),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.getOwnedGamesWithStats('user1', true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/own/user1?excludeExpansions=true',
        {
          headers: { 'Content-Type': 'application/json' },
        }
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
        apiService.getOwnedGamesWithStats('nonExistingUser1')
      ).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getOwnedGamesWithStats('user1')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle empty responses', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.getOwnedGamesWithStats('user1');

      expect(result).toEqual([]);
    });

    it('should handle malformed JSON responses', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGamesWithStats('user1')).rejects.toThrow(
        'Invalid JSON'
      );
    });
  });

  describe('testConnection', () => {
    it('should test API connection successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue('Connection successful'),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await apiService.testConnection();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/test', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual('Connection successful');
    });

    it('should handle connection test failures', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.testConnection()).rejects.toThrow(
        'HTTP error! status: 500'
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

      const result = await (apiService as any).request('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/api/test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: 'data' }),
        }
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('should handle timeout scenarios', async () => {
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

      const result = await apiService.getOwnedGamesWithStats('user1');

      expect(result).toEqual(mockGames);
    });

    it('should handle different response types', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue('plain text response'),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

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

      await expect(
        apiService.getOwnedGamesWithStats('invalidUser')
      ).rejects.toThrow('HTTP error! status: 400');
    });

    it('should handle 401 Unauthorized', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGamesWithStats('user1')).rejects.toThrow(
        'HTTP error! status: 401'
      );
    });

    it('should handle 403 Forbidden', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGamesWithStats('user1')).rejects.toThrow(
        'HTTP error! status: 403'
      );
    });

    it('should handle 500 Internal Server Error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGamesWithStats('user1')).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });

    it('should handle 503 Service Unavailable', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(apiService.getOwnedGamesWithStats('user1')).rejects.toThrow(
        'HTTP error! status: 503'
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
        apiService.getOwnedGamesWithStats('user1'),
        apiService.getOwnedGamesWithStats('user2'),
        apiService.getOwnedGamesWithStats('user3'),
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
        apiService.getOwnedGamesWithStats('user1'),
        apiService.getOwnedGamesWithStats('nonExistingUser1'),
        apiService.getOwnedGamesWithStats('user2'),
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });
  });

  describe('Game Lists API', () => {
    const mockGameList: GameList = {
      id: 'list-1',
      username: 'arczi89',
      listName: 'My Test List',
      usernames: ['user1'],
      games: mockGames,
      filters: {
        minPlayers: 2,
        maxPlayers: 4,
      },
      exactPlayerFilter: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const mockSaveRequest: SaveGameListRequest = {
      listName: 'My Test List',
      usernames: ['user1'],
      games: mockGames,
      filters: {
        minPlayers: 2,
        maxPlayers: 4,
      },
      exactPlayerFilter: false,
    };

    describe('saveGameList', () => {
      it('should save a game list successfully', async () => {
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue(mockGameList),
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        const result = await apiService.saveGameList(
          'arczi89',
          mockSaveRequest
        );

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/game-lists/arczi89',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockSaveRequest),
          }
        );
        expect(result).toEqual(mockGameList);
      });

      it('should handle save game list error', async () => {
        const mockResponse = {
          ok: false,
          status: 400,
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        await expect(
          apiService.saveGameList('arczi89', mockSaveRequest)
        ).rejects.toThrow('HTTP error! status: 400');
      });
    });

    describe('getUserGameLists', () => {
      it('should get user game lists successfully', async () => {
        const mockGameLists = [mockGameList];
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue(mockGameLists),
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        const result = await apiService.getUserGameLists('arczi89');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/game-lists/arczi89',
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        expect(result).toEqual(mockGameLists);
      });

      it('should handle get user game lists error', async () => {
        const mockResponse = {
          ok: false,
          status: 404,
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        await expect(apiService.getUserGameLists('arczi89')).rejects.toThrow(
          'HTTP error! status: 404'
        );
      });
    });

    describe('deleteGameList', () => {
      it('should delete a game list successfully', async () => {
        const mockResponse = {
          ok: true,
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        await apiService.deleteGameList('arczi89', 'list-1');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/game-lists/arczi89/list-1',
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      });

      it('should handle delete game list error', async () => {
        const mockResponse = {
          ok: false,
          status: 404,
        };
        mockFetch.mockResolvedValue(mockResponse as any);

        await expect(
          apiService.deleteGameList('arczi89', 'list-1')
        ).rejects.toThrow('HTTP error! status: 404');
      });
    });
  });
});
