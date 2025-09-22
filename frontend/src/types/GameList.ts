import { Game } from './Game';

export interface GameList {
  id: string;
  listName: string;
  games: Game[];
  searchCriteria: SearchCriteria;
  createdAt: string;
}

export interface SearchCriteria {
  usernames: string[];
  filters: GameFilters;
  exactPlayerFilter: boolean;
}

export interface GameFilters {
  minPlayers?: number;
  maxPlayers?: number;
  minPlayingTime?: number;
  maxPlayingTime?: number;
  minAge?: number;
  minRating?: number;
  yearFrom?: number;
  yearTo?: number;
}

export interface SaveGameListRequest {
  listName: string;
  usernames: string[];
  games: Game[];
  filters: GameFilters;
  exactPlayerFilter: boolean;
}
