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
  createMockGame('1', 'Zombicide', 2012, 1, 6, 60, 7.5, ['user1']),
  createMockGame('2', 'Azul', 2017, 2, 4, 45, 8.2, ['user2']),
  createMockGame('3', 'Catan', 1995, 3, 4, 90, 7.1, ['user1', 'user3']),
  createMockGame('4', 'Ticket to Ride', 2004, 2, 5, 45, 7.4, ['user2']),
  createMockGame('5', 'Wingspan', 2019, 1, 5, 70, 8.1, ['user3']),
  createMockGame('6', 'Gloomhaven', 2017, 1, 4, 120, 8.8, ['user1']),
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
      mockGames[1],
      mockGames[2],
      mockGames[5],
      mockGames[3],
      mockGames[4],
      mockGames[0],
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
      mockGames[0],
      mockGames[4],
      mockGames[3],
      mockGames[5],
      mockGames[2],
      mockGames[1],
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
      mockGames[2],
      mockGames[3],
      mockGames[0],
      mockGames[1],
      mockGames[5],
      mockGames[4],
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
      mockGames[4],
      mockGames[1],
      mockGames[5],
      mockGames[0],
      mockGames[3],
      mockGames[2],
    ]);
  });

  it('should sort games by BGG rating ascending', () => {
    const gamesWithRatings = mockGames.map((game, index) => ({
      ...game,
      bggRating: [7.5, 8.2, 7.1, 7.4, 8.1, 8.8][index],
    }));

    const { result } = renderHook(() =>
      useGameSorting({
        games: gamesWithRatings,
        sortBy: 'bggRating',
        sortOrder: 'asc',
      })
    );

    expect(result.current).toEqual([
      gamesWithRatings[2],
      gamesWithRatings[3],
      gamesWithRatings[0],
      gamesWithRatings[4],
      gamesWithRatings[1],
      gamesWithRatings[5],
    ]);
  });

  it('should sort games by BGG rating descending', () => {
    const gamesWithRatings = mockGames.map((game, index) => ({
      ...game,
      bggRating: [7.5, 8.2, 7.1, 7.4, 8.1, 8.8][index],
    }));

    const { result } = renderHook(() =>
      useGameSorting({
        games: gamesWithRatings,
        sortBy: 'bggRating',
        sortOrder: 'desc',
      })
    );

    expect(result.current).toEqual([
      gamesWithRatings[5],
      gamesWithRatings[1],
      gamesWithRatings[4],
      gamesWithRatings[0],
      gamesWithRatings[3],
      gamesWithRatings[2],
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
      mockGames[1],
      mockGames[3],
      mockGames[0],
      mockGames[4],
      mockGames[2],
      mockGames[5],
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
      mockGames[5],
      mockGames[2],
      mockGames[4],
      mockGames[0],
      mockGames[1],
      mockGames[3],
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

  it('should filter games by minimum players only', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayers: 4 })
    );

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

    expect(result.current).toHaveLength(1);
    expect(result.current.map(g => g.name)).toEqual(['Azul']);
  });

  it('should filter games by exact minimum players only', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayers: 3, exactPlayerFilter: true })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current.map(g => g.name)).toEqual(['Catan']);
  });

  it('should filter games by exact maximum players only', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { maxPlayers: 6, exactPlayerFilter: true })
    );

    expect(result.current).toHaveLength(1);
    expect(result.current.map(g => g.name)).toEqual(['Zombicide']);
  });

  it('should use non-exact filter by default', () => {
    const { result } = renderHook(() =>
      useGameFiltering(mockGames, { minPlayers: 3, maxPlayers: 4 })
    );

    expect(result.current).toHaveLength(6);
  });
});
