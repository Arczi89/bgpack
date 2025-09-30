import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/store';
import {
  setLoading,
  setGames,
  setSearchQuery,
  setFilters,
} from '../../../store/slices/gameSlice';
import { GameSearchParams } from '../../../types/Game';
import { useGames } from '../../../hooks/useApi';

export const GameListPage: React.FC = () => {
  // ===== HOOKS =====
  const dispatch = useDispatch();
  const { searchQuery, filters } = useSelector(
    (state: RootState) => state.games
  );

  // ===== STATE MANAGEMENT =====
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState(filters);

  // ===== COMPUTED VALUES =====
  const searchParams: GameSearchParams = {
    search: localSearchQuery || undefined,
    minPlayers: localFilters.minPlayers || undefined,
    maxPlayers: localFilters.maxPlayers || undefined,
    minPlayingTime: localFilters.minPlayingTime || undefined,
    maxPlayingTime: localFilters.maxPlayingTime || undefined,
    minAge: localFilters.minAge || undefined,
    minRating: localFilters.minRating || undefined,
  };

  const { data: games, loading: isLoading, error } = useGames(searchParams);

  // ===== EFFECTS =====
  useEffect(() => {
    if (games) {
      dispatch(setGames(games));
    }
  }, [games, dispatch]);

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  // ===== EVENT HANDLERS =====
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearchQuery));
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...localFilters,
      [key]: value ? parseInt(value) : undefined,
    };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  // ===== RENDER =====
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Board Games</h1>
        <p className="mt-2 text-gray-600">
          Discover and browse board games from around the world
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search games..."
              value={localSearchQuery}
              onChange={e => setLocalSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button type="submit" className="btn-primary">
              Szukaj
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. graczy
            </label>
            <input
              type="number"
              min="1"
              value={localFilters.minPlayers || ''}
              onChange={e => handleFilterChange('minPlayers', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max. graczy
            </label>
            <input
              type="number"
              min="1"
              value={localFilters.maxPlayers || ''}
              onChange={e => handleFilterChange('maxPlayers', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Czas gry (min)
            </label>
            <input
              type="number"
              min="1"
              value={localFilters.minPlayingTime || ''}
              onChange={e =>
                handleFilterChange('minPlayingTime', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min. wiek
            </label>
            <input
              type="number"
              min="1"
              value={localFilters.minAge || ''}
              onChange={e => handleFilterChange('minAge', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Błąd ładowania gier
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Ładowanie gier...</p>
        </div>
      ) : games && games.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Brak gier</h3>
          <p className="mt-1 text-sm text-gray-500">
            Nie znaleziono gier spełniających kryteria wyszukiwania.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map(game => (
            <div
              key={game.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {game.name}
                </h3>
                <span className="text-sm text-gray-500">
                  ({game.yearPublished})
                </span>
              </div>

              <p
                className="text-gray-600 text-sm mb-4 overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {game.description}
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Gracze:</span>
                  <span>
                    {game.minPlayers}-{game.maxPlayers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Czas gry:</span>
                  <span>{game.playingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Wiek:</span>
                  <span>{game.minAge}+</span>
                </div>
                <div className="flex justify-between">
                  <span>Ocena BGG:</span>
                  <span className="font-medium">{game.bggRating}/10</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full btn-primary">
                  Dodaj do kolekcji
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
