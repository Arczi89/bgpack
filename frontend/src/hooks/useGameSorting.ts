import { useMemo } from 'react';
import { Game } from '../types/Game';

type SortField =
  | 'name'
  | 'yearPublished'
  | 'bggRating'
  | 'playingTime'
  | 'complexity';
type SortOrder = 'asc' | 'desc';

interface UseGameSortingProps {
  games: Game[];
  sortBy: SortField;
  sortOrder: SortOrder;
}

export const useGameSorting = ({
  games,
  sortBy,
  sortOrder,
}: UseGameSortingProps) => {
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [games, sortBy, sortOrder]);

  return sortedGames;
};

export const useGameFiltering = (
  games: Game[],
  filters: {
    minPlayers?: number;
    maxPlayers?: number;
    minPlayingTime?: number;
    maxPlayingTime?: number;
    minAge?: number;
    minRating?: number;
    yearFrom?: number;
    yearTo?: number;
    exactPlayerFilter?: boolean;
  }
) => {
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Player count filter
      if (filters.minPlayers && filters.maxPlayers) {
        if (filters.exactPlayerFilter) {
          // Exact match: game must have exactly the same range
          if (
            game.minPlayers !== filters.minPlayers ||
            game.maxPlayers !== filters.maxPlayers
          )
            return false;
        } else {
          // Non-exact: game range must overlap with filter range
          if (
            game.minPlayers > filters.maxPlayers ||
            game.maxPlayers < filters.minPlayers
          )
            return false;
        }
      } else if (filters.minPlayers) {
        if (filters.exactPlayerFilter) {
          // Exact match: game must have exactly this min value
          if (game.minPlayers !== filters.minPlayers) return false;
        } else {
          // Non-exact: game must support at least this many players
          if (game.maxPlayers < filters.minPlayers) return false;
        }
      } else if (filters.maxPlayers) {
        if (filters.exactPlayerFilter) {
          // Exact match: game must have exactly this max value
          if (game.maxPlayers !== filters.maxPlayers) return false;
        } else {
          // Non-exact: game must not support more than this many players
          if (game.maxPlayers > filters.maxPlayers) return false;
        }
      }
      if (filters.minPlayingTime && game.playingTime < filters.minPlayingTime)
        return false;
      if (filters.maxPlayingTime && game.playingTime > filters.maxPlayingTime)
        return false;
      if (filters.minAge && game.minAge < filters.minAge) return false;
      if (filters.minRating && game.bggRating < filters.minRating) return false;
      if (filters.yearFrom && game.yearPublished < filters.yearFrom)
        return false;
      if (filters.yearTo && game.yearPublished > filters.yearTo) return false;
      return true;
    });
  }, [games, filters]);

  return filteredGames;
};

export const useGameSearch = (games: Game[], searchQuery: string) => {
  const searchedGames = useMemo(() => {
    if (!searchQuery.trim()) return games;

    const query = searchQuery.toLowerCase();
    return games.filter(
      game =>
        game.name.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query)
    );
  }, [games, searchQuery]);

  return searchedGames;
};

export const useGamePagination = (
  games: Game[],
  currentPage: number,
  itemsPerPage: number
) => {
  const paginatedGames = useMemo(() => {
    if (itemsPerPage === -1) return games; // -1 means "all"

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return games.slice(startIndex, endIndex);
  }, [games, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === -1) return 1;
    if (games.length === 0) return 0;
    return Math.ceil(games.length / itemsPerPage);
  }, [games.length, itemsPerPage]);

  return { paginatedGames, totalPages };
};
