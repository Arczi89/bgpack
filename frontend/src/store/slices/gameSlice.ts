import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Game, GameFilters } from '../../types/Game';

interface GameState {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: GameFilters;
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
    setFilters: (state, action: PayloadAction<Partial<GameFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: state => {
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
