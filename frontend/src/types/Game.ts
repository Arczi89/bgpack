export interface Game {
  id: number;
  bggId: string;
  name: string;
  description: string;
  yearPublished: number;
  minPlayers: number;
  maxPlayers: number;
  playingTime: number;
  minAge: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  rank?: number | null;
  bggRating: number | null;
  complexity: number | null;
  suggestedNumPlayers?: string | null;
  recommendedPlayers?: Record<string, any> | null;
  cachedAt?: string;
  cacheHits?: number;
  lastUpdated?: string;
  ownedBy?: string[];
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
  page?: number;
  size?: number;
}

export interface PresetCriteria {
  usernames: string[];
  filters: Partial<GameFilters>;
  excludeExpansions: boolean;
}

export interface Preset {
  id: number;
  presetName: string;
  filterCriteria: PresetCriteria;
  createdAt: string;
}

export interface SavePresetRequest {
  presetName: string;
  criteria: PresetCriteria;
}
