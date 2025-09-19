import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useLanguage } from '../../../hooks/useLanguage';
import { useGameSorting } from '../../../hooks/useGameSorting';
import { Game, GameFilters } from '../../../types/Game';
import { useOwnedGames } from '../../../hooks/useApi';

export const HomePage: React.FC = () => {
  const [bggNicks, setBggNicks] = useState<string>('');
  const [filters, setFilters] = useState<Partial<GameFilters>>({});
  const [sortBy, setSortBy] = useState<
    'name' | 'yearPublished' | 'bggRating' | 'playingTime' | 'complexity'
  >('bggRating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [games, setGames] = useState<Game[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { t } = useLanguage();

  // Use API hook to fetch owned games only when username is provided
  const {
    data: apiGames,
    loading: isLoading,
    error,
  } = useOwnedGames(currentUsername);

  // Update games when API data changes
  useEffect(() => {
    if (apiGames) {
      let filteredGames = [...apiGames];

      // Apply filters
      if (Object.keys(filters).length > 0) {
        filteredGames = filteredGames.filter(game => {
          if (filters.minPlayers && game.minPlayers < filters.minPlayers)
            return false;
          if (filters.maxPlayers && game.maxPlayers > filters.maxPlayers)
            return false;
          if (
            filters.minPlayingTime &&
            game.playingTime < filters.minPlayingTime
          )
            return false;
          if (
            filters.maxPlayingTime &&
            game.playingTime > filters.maxPlayingTime
          )
            return false;
          if (filters.minAge && game.minAge < filters.minAge) return false;
          if (filters.minRating && game.bggRating < filters.minRating)
            return false;
          return true;
        });
      }

      setGames(filteredGames);
    }
  }, [apiGames, filters]);

  const handleSearch = async () => {
    if (!bggNicks.trim()) return;

    const username = bggNicks.trim();
    setCurrentUsername(username);
    setHasSearched(true);
  };

  const handleSaveResults = () => {
    if (!isAuthenticated) return;
    alert('Results saved to your lists!');
  };

  const sortedGames = useGameSorting({ games, sortBy, sortOrder });

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {t.subtitle}
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* BGG Nicks Input */}
          <div>
            <label
              htmlFor="bgg-nicks"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.bggUsernames}
            </label>
            <input
              type="text"
              id="bgg-nicks"
              value={bggNicks}
              onChange={e => setBggNicks(e.target.value)}
              placeholder={t.bggUsernamesPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={!bggNicks.trim() || isLoading}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.searching : t.searchGames}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.minPlayers}
            </label>
            <input
              type="number"
              value={filters.minPlayers || ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  minPlayers: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.maxPlayers}
            </label>
            <input
              type="number"
              value={filters.maxPlayers || ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  maxPlayers: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.minPlayTime}
            </label>
            <input
              type="number"
              value={filters.minPlayingTime || ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  minPlayingTime: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.maxPlayTime}
            </label>
            <input
              type="number"
              value={filters.maxPlayingTime || ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  maxPlayingTime: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Sorting */}
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t.sortBy}
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="bggRating">{t.rating}</option>
              <option value="name">{t.name}</option>
              <option value="yearPublished">{t.year}</option>
              <option value="playingTime">{t.playTime}</option>
              <option value="complexity">Complexity</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              {t.order}
            </label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="desc">{t.descending}</option>
              <option value="asc">{t.ascending}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {t.results} ({games.length} {t.gamesFound})
            </h2>
            {isAuthenticated && games.length > 0 && (
              <button
                onClick={handleSaveResults}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {t.saveResults}
              </button>
            )}
          </div>

          {error ? (
            <div className="p-8 text-center">
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
                Błąd ładowania kolekcji
              </h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">{t.searching}</p>
            </div>
          ) : games.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t.noGamesFound}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{t.noGamesFoundDesc}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.game}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.year}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.players}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.time}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.rating}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.ownedBy}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedGames.map(game => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {game.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.yearPublished}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.minPlayers === game.maxPlayers
                          ? game.minPlayers
                          : `${game.minPlayers}-${game.maxPlayers}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.playingTime} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.bggRating}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {game.ownedBy?.map((owner, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {owner}
                            </span>
                          )) || <span className="text-gray-400">-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty State - when no search has been performed */}
      {!hasSearched && (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t.readyToDiscover}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{t.readyToDiscoverDesc}</p>
        </div>
      )}
    </div>
  );
};
