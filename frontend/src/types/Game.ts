export interface Game {
  id: string;
  name: string;
  yearPublished: number;
  minPlayers: number;
  maxPlayers: number;
  playingTime: number;
  minAge: number;
  description: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  bggRating: number | null;
  averageRating: number | null;
  complexity: number | null;
  averageWeight?: number | null;
  suggestedNumPlayers?: string | null;
  ownedBy?: string[];
}

export interface GameStats {
  gameId: string;
  name: string;
  bggRating: number | null;
  averageRating: number | null;
  averageWeight: number | null;
  suggestedNumPlayers: string | null;
}

export interface GameWithStats extends Game {
  averageWeight?: number | null;
  suggestedNumPlayers?: string | null;
}

export interface GameFilters {
  minPlayers?: number;
  maxPlayers?: number;
  minPlayingTime?: number;
  maxPlayingTime?: number;
  minAge?: number;
  minRating?: number;
  exactPlayerFilter?: boolean;
}

export interface GameSearchParams {
  search?: string;
  minPlayers?: number;
  maxPlayers?: number;
  minPlayingTime?: number;
  maxPlayingTime?: number;
  minAge?: number;
  minRating?: number;
  sortBy?:
    | 'name'
    | 'yearPublished'
    | 'bggRating'
    | 'playingTime'
    | 'complexity';
  sortOrder?: 'asc' | 'desc';
}

export interface BggUser {
  username: string;
  displayName?: string;
}

export interface GameCollection {
  id: string;
  name: string;
  games: Game[];
  createdAt: Date;
  updatedAt: Date;
}
