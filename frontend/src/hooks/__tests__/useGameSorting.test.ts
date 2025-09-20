import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useGameSorting, useGamePagination } from '../useGameSorting';
import { Game } from '../../types/Game';

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
  createMockGame(1, 'Zombicide', 2012, 1, 6, 60, 7.5, ['user1']),
  createMockGame(2, 'Azul', 2017, 2, 4, 45, 8.2, ['user2']),
  createMockGame(3, 'Catan', 1995, 3, 4, 90, 7.1, ['user1', 'user3']),
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
      mockGames[0], // Zombicide (2012)
      mockGames[1], // Azul (2017)
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
      mockGames[1], // Azul (2017)
      mockGames[0], // Zombicide (2012)
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
      mockGames[0], // Zombicide (7.5)
      mockGames[1], // Azul (8.2)
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
      mockGames[1], // Azul (8.2)
      mockGames[0], // Zombicide (7.5)
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
      mockGames[0], // Zombicide (60 min)
      mockGames[2], // Catan (90 min)
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
      mockGames[2], // Catan (90 min)
      mockGames[0], // Zombicide (60 min)
      mockGames[1], // Azul (45 min)
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
      createMockGame(1, 'Game 1', 2020, 2, 4, 60, undefined as any, ['user1']),
      createMockGame(2, 'Game 2', undefined as any, 1, 6, 45, 8.0, ['user2']),
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
    expect(result.current.totalPages).toBe(2);
  });

  it('should return second page correctly', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 2, 2));

    expect(result.current.paginatedGames).toEqual(mockGames.slice(2, 4));
    expect(result.current.totalPages).toBe(2);
  });

  it('should handle empty games array', () => {
    const { result } = renderHook(() => useGamePagination([], 1, 10));

    expect(result.current.paginatedGames).toEqual([]);
    expect(result.current.totalPages).toBe(1);
  });

  it('should handle current page beyond total pages', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 5, 2));

    expect(result.current.paginatedGames).toEqual([]);
    expect(result.current.totalPages).toBe(2);
  });

  it('should handle single page with all items', () => {
    const { result } = renderHook(() => useGamePagination(mockGames, 1, 10));

    expect(result.current.paginatedGames).toEqual(mockGames);
    expect(result.current.totalPages).toBe(1);
  });

  it('should calculate total pages correctly for various page sizes', () => {
    const games = Array.from({ length: 25 }, (_, i) =>
      createMockGame(i + 1, `Game ${i + 1}`, 2020, 2, 4, 60, 7.0, ['user1'])
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
