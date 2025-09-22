import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  useGameSorting,
  useGamePagination,
  useGameFiltering,
} from '../useGameSorting';
import { Game } from '../../types/Game';

const createMockGame = (
  id: string,
  name: string,
  yearPublished: number,
  minPlayers: number,
  maxPlayers: number,
  playingTime: number,
  bggRating: number | null,
  ownedBy: string[]
): Game => ({
  id,
  name,
  yearPublished,
  minPlayers,
  maxPlayers,
  playingTime,
  minAge: 8,
  description: 'Mock game description',
  imageUrl: undefined,
  thumbnailUrl: undefined,
  bggRating,
  averageRating: null,
  complexity: null,
  ownedBy,
});

const mockGames: Game[] = [
  createMockGame('1', 'Zombicide', 2012, 1, 6, 60, null, ['user1']),
  createMockGame('2', 'Azul', 2017, 2, 4, 45, null, ['user2']),
  createMockGame('3', 'Catan', 1995, 3, 4, 90, null, ['user1', 'user3']),
  createMockGame('4', 'Ticket to Ride', 2004, 2, 5, 45, null, ['user2']),
  createMockGame('5', 'Wingspan', 2019, 1, 5, 70, null, ['user3']),
  createMockGame('6', 'Gloomhaven', 2017, 1, 4, 120, null, ['user1']),
];

describe('useGameSorting', () => {
  it('should sort games by name ascending by default', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'name',
        sortOrder: 'asc',
      })
    );

    expect(result.current).toEqual([
      mockGames[1], // Azul
      mockGames[2], // Catan
      mockGames[5], // Gloomhaven
      mockGames[3], // Ticket to Ride
      mockGames[4], // Wingspan
      mockGames[0], // Zombicide
    ]);
  });

  it('should sort games by name descending', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'name',
        sortOrder: 'desc',
      })
    );

    expect(result.current).toEqual([
      mockGames[0], // Zombicide
      mockGames[4], // Wingspan
      mockGames[3], // Ticket to Ride
      mockGames[5], // Gloomhaven
      mockGames[2], // Catan
      mockGames[1], // Azul
    ]);
  });

  it('should sort games by year published ascending', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'yearPublished',
        sortOrder: 'asc',
      })
    );

    expect(result.current).toEqual([
      mockGames[2], // Catan (1995)
      mockGames[3], // Ticket to Ride (2004)
      mockGames[0], // Zombicide (2012)
      mockGames[1], // Azul (2017)
      mockGames[5], // Gloomhaven (2017)
      mockGames[4], // Wingspan (2019)
    ]);
  });

  it('should sort games by year published descending', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'yearPublished',
        sortOrder: 'desc',
      })
    );

    expect(result.current).toEqual([
      mockGames[4], // Wingspan (2019)
      mockGames[1], // Azul (2017)
      mockGames[5], // Gloomhaven (2017)
      mockGames[0], // Zombicide (2012)
      mockGames[3], // Ticket to Ride (2004)
      mockGames[2], // Catan (1995)
    ]);
  });

  it('should sort games by BGG rating ascending', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'bggRating',
        sortOrder: 'asc',
      })
    );

    expect(result.current).toEqual([
      mockGames[2], // Catan (7.1)
      mockGames[3], // Ticket to Ride (7.4)
      mockGames[0], // Zombicide (7.5)
      mockGames[4], // Wingspan (8.1)
      mockGames[1], // Azul (8.2)
      mockGames[5], // Gloomhaven (8.8)
    ]);
  });

  it('should sort games by BGG rating descending', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'bggRating',
        sortOrder: 'desc',
      })
    );

    expect(result.current).toEqual([
      mockGames[5], // Gloomhaven (8.8)
      mockGames[1], // Azul (8.2)
      mockGames[4], // Wingspan (8.1)
      mockGames[0], // Zombicide (7.5)
      mockGames[3], // Ticket to Ride (7.4)
      mockGames[2], // Catan (7.1)
    ]);
  });

  it('should sort games by playing time ascending', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'playingTime',
        sortOrder: 'asc',
      })
    );

    expect(result.current).toEqual([
      mockGames[1], // Azul (45 min)
      mockGames[3], // Ticket to Ride (45 min)
      mockGames[0], // Zombicide (60 min)
      mockGames[4], // Wingspan (70 min)
      mockGames[2], // Catan (90 min)
      mockGames[5], // Gloomhaven (120 min)
    ]);
  });

  it('should sort games by playing time descending', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: mockGames,
        sortBy: 'playingTime',
        sortOrder: 'desc',
      })
    );

    expect(result.current).toEqual([
      mockGames[5], // Gloomhaven (120 min)
      mockGames[2], // Catan (90 min)
      mockGames[4], // Wingspan (70 min)
      mockGames[0], // Zombicide (60 min)
      mockGames[1], // Azul (45 min)
      mockGames[3], // Ticket to Ride (45 min)
    ]);
  });

  it('should handle empty games array', () => {
    const { result } = renderHook(() =>
      useGameSorting({
        games: [],
        sortBy: 'name',
        sortOrder: 'asc',
      })
    );

    expect(result.current).toEqual([]);
  });

  it('should handle games with missing properties', () => {
    const gamesWithMissingProps: Game[] = [
      createMockGame('1', 'Game 1', 2020, 2, 4, 60, null, ['user1']),
      createMockGame('2', 'Game 2', 2020, 1, 6, 45, null, ['user2']),
    ];

    const { result } = renderHook(() =>
      useGameSorting({
        games: gamesWithMissingProps,
        sortBy: 'bggRating',
        sortOrder: 'desc',
      })
    );

    expect(result.current).toHaveLength(2);
  });
});

describe('useGamePagination', () => {
  it('should return all games when itemsPerPage is -1 (all)', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 1, -1));

    expect(result.current.paginatedGames).toEqual(mockGames);
    expect(result.current.totalPages).toBe(1);
  });

  it('should paginate games correctly with 2 items per page', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 1, 2));

    expect(result.current.paginatedGames).toEqual(mockGames.slice(0, 2));
    expect(result.current.totalPages).toBe(3);
  });

  it('should return second page correctly', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 2, 2));

    expect(result.current.paginatedGames).toEqual(mockGames.slice(2, 4));
    expect(result.current.totalPages).toBe(3);
  });

  it('should handle empty games array', () => {
    const { result } = renderHook(() => useGamePagination([], 1, 10));

    expect(result.current.paginatedGames).toEqual([]);
    expect(result.current.totalPages).toBe(0);
  });

  it('should handle current page beyond total pages', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 5, 2));

    expect(result.current.paginatedGames).toEqual([]);
    expect(result.current.totalPages).toBe(3);
  });

  it('should handle single page with all items', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 1, 10));

    expect(result.current.paginatedGames).toEqual(mockGames);
    expect(result.current.totalPages).toBe(1);
  });

  it('should calculate total pages correctly for various page sizes', () => {
    const games = Array.from({ length: 25 }, (_, i) =>
      createMockGame(`${i + 1}`, `Game ${i + 1}`, 2020, 2, 4, 60, null, [
        'user1',
      ])
    );

    const { result: result10 } = renderHook(() =>
      useGamePagination(games, 1, 10)
    );
    expect(result10.current.totalPages).toBe(3);

    const { result: result20 } = renderHook(() =>
      useGamePagination(games, 1, 20)
    );
    expect(result20.current.totalPages).toBe(2);

    const { result: result50 } = renderHook(() =>
      useGamePagination(games, 1, 50)
    );
    expect(result50.current.totalPages).toBe(1);
  });
});

describe('useGameFiltering', () => {
  it('should filter games by player count range - both min and max', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayers: 3, maxPlayers: 4 })
    );

    // Should return games that support 3-4 players:
    // - Catan (3-4) - exact match
    // - Azul (2-4) - supports 3-4
    // - Ticket to Ride (2-5) - supports 3-4
    // - Wingspan (1-5) - supports 3-4
    // - Gloomhaven (1-4) - supports 3-4
    // - Zombicide (1-6) - supports 3-4
    expect(result.current).toHaveLength(6);
    expect(result.current.map(g => g.name)).toEqual([
      'Zombicide', // 1-6 supports 3-4
      'Azul', // 2-4 supports 3-4
      'Catan', // 3-4 exact match
      'Ticket to Ride', // 2-5 supports 3-4
      'Wingspan', // 1-5 supports 3-4
      'Gloomhaven', // 1-4 supports 3-4
    ]);
  });

  it('should filter games by minimum players only', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayers: 4 })
    );

    // Should return games that support at least 4 players:
    // - Zombicide (1-6) - supports 4+
    // - Azul (2-4) - supports 4
    // - Catan (3-4) - supports 4
    // - Ticket to Ride (2-5) - supports 4+
    // - Wingspan (1-5) - supports 4+
    // - Gloomhaven (1-4) - supports 4
    expect(result.current).toHaveLength(6);
    expect(result.current.map(g => g.name)).toEqual([
      'Zombicide',
      'Azul',
      'Catan',
      'Ticket to Ride',
      'Wingspan',
      'Gloomhaven',
    ]);
  });

  it('should filter games by maximum players only', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { maxPlayers: 3 })
    );

    // Should return games that don't support more than 3 players:
    // - Azul (2-4) - max 4, supports more than 3 ❌
    // - Catan (3-4) - max 4, supports more than 3 ❌
    // - Wingspan (1-5) - max 5, supports more than 3 ❌
    // - Gloomhaven (1-4) - max 4, supports more than 3 ❌
    // - Ticket to Ride (2-5) - max 5, supports more than 3 ❌
    // - Zombicide (1-6) - max 6, supports more than 3 ❌
    expect(result.current).toHaveLength(0);
  });

  it('should return all games when no player filters applied', () => {
    const { result } = renderHook(() => useGameFiltering(mockGames, {}));

    expect(result.current).toHaveLength(6);
    expect(result.current).toEqual(mockGames);
  });

  it('should filter games by playing time', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayingTime: 60, maxPlayingTime: 90 })
    );

    // Should return games with playing time between 60-90 minutes:
    // - Zombicide (60) - exact match
    // - Catan (90) - exact match
    // - Wingspan (70) - within range
    expect(result.current).toHaveLength(3);
    expect(result.current.map(g => g.name)).toEqual([
      'Zombicide',
      'Catan',
      'Wingspan',
    ]);
  });

  it('should filter games by minimum rating', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minRating: 8.0 })
    );

    // Should return games with rating >= 8.0:
    // - Azul (8.2)
    // - Wingspan (8.1)
    // - Gloomhaven (8.8)
    expect(result.current).toHaveLength(3);
    expect(result.current.map(g => g.name)).toEqual([
      'Azul',
      'Wingspan',
      'Gloomhaven',
    ]);
  });

  it('should apply multiple filters simultaneously', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, {
        minPlayers: 2,
        maxPlayers: 4,
        minPlayingTime: 45,
        maxPlayingTime: 70,
      })
    );

    // Should return games that:
    // - Support 2-4 players
    // - Have playing time 45-70 minutes
    // - Azul (2-4, 45) - exact match
    // - Ticket to Ride (2-5, 45) - supports 2-4, 45 min
    // - Wingspan (1-5, 70) - supports 2-4, 70 min
    // - Zombicide (1-6, 60) - supports 2-4, 60 min
    expect(result.current).toHaveLength(4);
    expect(result.current.map(g => g.name)).toEqual([
      'Zombicide',
      'Azul',
      'Ticket to Ride',
      'Wingspan',
    ]);
  });

  it('should filter games by exact player count match', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, {
        minPlayers: 2,
        maxPlayers: 4,
        exactPlayerFilter: true,
      })
    );

    // Should return only games that have exactly 2-4 players:
    // - Azul (2-4) - exact match ✓
    // - All others have different ranges ❌
    expect(result.current).toHaveLength(1);
    expect(result.current.map(g => g.name)).toEqual(['Azul']);
  });

  it('should filter games by exact minimum players only', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayers: 3, exactPlayerFilter: true })
    );

    // Should return only games that have exactly min=3:
    // - Catan (3-4) - exact match ✓
    // - All others have different min values ❌
    expect(result.current).toHaveLength(1);
    expect(result.current.map(g => g.name)).toEqual(['Catan']);
  });

  it('should filter games by exact maximum players only', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { maxPlayers: 6, exactPlayerFilter: true })
    );

    // Should return only games that have exactly max=6:
    // - Zombicide (1-6) - exact match ✓
    // - All others have different max values ❌
    expect(result.current).toHaveLength(1);
    expect(result.current.map(g => g.name)).toEqual(['Zombicide']);
  });

  it('should use non-exact filter by default', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayers: 3, maxPlayers: 4 })
    );

    // Should return all games that support 3-4 players (non-exact)
    expect(result.current).toHaveLength(6);
  });
});
