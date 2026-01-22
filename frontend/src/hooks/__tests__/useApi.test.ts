import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMultipleOwnedGames } from '../useApi';
import { apiService } from '../../services/apiService';
import { Game } from '../../types/Game';

jest.mock('../../services/apiService');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const createMockGame = (id: string, name: string, ownedBy: string[]): Game => ({
  id,
  name,
  yearPublished: 2020,
  minPlayers: 2,
  maxPlayers: 4,
  playingTime: 60,
  minAge: 8,
  description: 'A fun board game',
  imageUrl: undefined,
  thumbnailUrl: undefined,
  bggRating: null,
  averageRating: null,
  complexity: null,
  ownedBy,
});

describe('useMultipleOwnedGames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when no usernames provided', async () => {
    const { result } = renderHook(() => useMultipleOwnedGames([]));

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    expect(mockedApiService.getUserGamesWithStats).not.toHaveBeenCalled();
  });

  it('should return empty array when usernames are empty strings', async () => {
    const { result } = renderHook(() => useMultipleOwnedGames(['', '  ', '']));

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    expect(mockedApiService.getUserGamesWithStats).not.toHaveBeenCalled();
  });

  it('should fetch games for multiple users and deduplicate results', async () => {
    const mockGames1 = [
      createMockGame('1', 'Catan', ['user1']),
      createMockGame('2', 'Azul', ['user1']),
    ];
    const mockGames2 = [
      createMockGame('2', 'Azul', ['user2']),
      createMockGame('3', 'Ticket to Ride', ['user2']),
    ];
    const mockGames3 = [createMockGame('4', 'Pandemic', ['user3'])];

    mockedApiService.getUserGamesWithStats
      .mockResolvedValueOnce(mockGames1)
      .mockResolvedValueOnce(mockGames2)
      .mockResolvedValueOnce(mockGames3);

    const { result } = renderHook(() =>
      useMultipleOwnedGames(['user1', 'user2', 'user3'])
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(4);
    expect(result.current.data).toEqual([
      createMockGame('1', 'Catan', ['user1']),
      createMockGame('2', 'Azul', ['user1', 'user2']),
      createMockGame('3', 'Ticket to Ride', ['user2']),
      createMockGame('4', 'Pandemic', ['user3']),
    ]);
    expect(result.current.error).toBe(null);

    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledTimes(3);
    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user1',
      false
    );
    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user2',
      false
    );
    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user3',
      false
    );
  });

  it('should return error when API call fails', async () => {
    const errorMessage = 'User not found';
    mockedApiService.getUserGamesWithStats.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() =>
      useMultipleOwnedGames(['nonExistingUser1'])
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should return partial results when some users fail', async () => {
    const mockGames1 = [createMockGame('1', 'Catan', ['user1'])];
    const errorMessage = 'User not found';

    mockedApiService.getUserGamesWithStats
      .mockResolvedValueOnce(mockGames1)
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useMultipleOwnedGames(['user1', 'nonExistingUser2', 'user3'])
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([
      createMockGame('1', 'Catan', ['user1']),
    ]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should pass excludeExpansions parameter to API calls', async () => {
    const mockGames = [createMockGame('1', 'Catan', ['user1'])];
    mockedApiService.getUserGamesWithStats.mockResolvedValue(mockGames);

    const { result } = renderHook(() =>
      useMultipleOwnedGames(['user1', 'user2'], true)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user1',
      true
    );
    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user2',
      true
    );
  });

  it('should trim whitespace from usernames before API calls', async () => {
    const mockGames = [createMockGame('1', 'Catan', ['user1'])];
    mockedApiService.getUserGamesWithStats.mockResolvedValue(mockGames);

    const { result } = renderHook(() =>
      useMultipleOwnedGames(['  user1  ', ' user2 ', 'user3'])
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user1',
      false
    );
    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user2',
      false
    );
    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledWith(
      'user3',
      false
    );
  });

  it('should refetch data when refetch function is called', async () => {
    const mockGames = [createMockGame('1', 'Catan', ['user1'])];
    mockedApiService.getUserGamesWithStats.mockResolvedValue(mockGames);

    const { result } = renderHook(() => useMultipleOwnedGames(['user1']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedApiService.getUserGamesWithStats).toHaveBeenCalledTimes(2);
  });

  it('should handle network timeout errors', async () => {
    const timeoutError = new Error('Request timeout');
    mockedApiService.getUserGamesWithStats.mockRejectedValueOnce(timeoutError);

    const { result } = renderHook(() => useMultipleOwnedGames(['user1']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Request timeout');
  });

  it('should return empty array when API returns empty response', async () => {
    mockedApiService.getUserGamesWithStats.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useMultipleOwnedGames(['user1']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should handle malformed API responses', async () => {
    const malformedError = new Error('Invalid JSON response');
    mockedApiService.getUserGamesWithStats.mockRejectedValueOnce(
      malformedError
    );

    const { result } = renderHook(() => useMultipleOwnedGames(['user1']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Invalid JSON response');
  });

  it('should return successful results when mixed with failures', async () => {
    const mockGames1 = [createMockGame('1', 'Catan', ['user1'])];
    const mockGames2 = [createMockGame('2', 'Azul', ['user2'])];
    const errorMessage = 'User not found';

    mockedApiService.getUserGamesWithStats
      .mockResolvedValueOnce(mockGames1)
      .mockResolvedValueOnce(mockGames2)
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() =>
      useMultipleOwnedGames(['user1', 'user2', 'nonExistingUser3', 'user4'])
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([
      createMockGame('1', 'Catan', ['user1']),
      createMockGame('2', 'Azul', ['user2']),
    ]);
    expect(result.current.error).toBe(errorMessage);
  });
});
