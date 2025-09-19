import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { gameSlice } from './slices/gameSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    games: gameSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
