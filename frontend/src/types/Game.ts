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
  bggRating: number;
  averageRating: number;
  complexity: number;
  ownedBy?: string[];
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

export interface GameSearchParams {
  search?: string;
  minPlayers?: number;
  maxPlayers?: number;
  minPlayingTime?: number;
  maxPlayingTime?: number;
  minAge?: number;
  minRating?: number;
  yearFrom?: number;
  yearTo?: number;
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
