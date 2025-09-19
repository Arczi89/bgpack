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

      // Handle string comparison for name field
      if (sortBy === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string comparison
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
  }
) => {
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      if (filters.minPlayers && game.minPlayers < filters.minPlayers)
        return false;
      if (filters.maxPlayers && game.maxPlayers > filters.maxPlayers)
        return false;
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
