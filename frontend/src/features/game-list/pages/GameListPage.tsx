import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/store';
import {
  setLoading,
  setGames,
  setSearchQuery,
  setFilters,
} from '../../../store/slices/gameSlice';
import { Game } from '../../../types/Game';
import { getMockGames } from '../../../services/mockDataService';

export const GameListPage: React.FC = () => {
  const dispatch = useDispatch();
  const { games, isLoading, searchQuery, filters } = useSelector(
    (state: RootState) => state.games
  );

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    dispatch(setLoading(true));

    setTimeout(() => {
      const mockGames = getMockGames();
      dispatch(setGames(mockGames));
    }, 1000);
  }, [dispatch]);

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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gry planszowe</h1>
        <p className="mt-2 text-gray-600">
          Odkryj i przeglądaj gry planszowe z całego świata
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Szukaj gier..."
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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Ładowanie gier...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
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

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
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
