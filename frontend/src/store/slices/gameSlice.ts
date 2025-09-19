import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

interface GameState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    minPlayers?: number;
    maxPlayers?: number;
    minPlayingTime?: number;
    maxPlayingTime?: number;
    minAge?: number;
    minRating?: number;
  };
}

const initialState: GameState = {
  games: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

export const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setGames: (state, action: PayloadAction<Game[]>) => {
      state.games = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<GameState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
      state.searchQuery = '';
    },
  },
});

export const {
  setLoading,
  setGames,
  setError,
  setSearchQuery,
  setFilters,
  clearFilters,
} = gameSlice.actions;
