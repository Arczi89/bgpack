import { Game, GameFilters } from './Game';

export interface GameList {
  id: string;
  username: string;
  listName: string;
  usernames: string[];
  games: Game[];
  filters: GameFilters;
  exactPlayerFilter: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveGameListRequest {
  listName: string;
  usernames: string[];
  games: Game[];
  filters: GameFilters;
  exactPlayerFilter: boolean;
}
