import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  useGameSorting,
  useGamePagination,
} from '../../../hooks/useGameSorting';
import { Game, GameFilters } from '../../../types/Game';
import { useMultipleOwnedGames } from '../../../hooks/useApi';
import { SaveGameListRequest } from '../../../types/GameList';
import apiService from '../../../services/apiService';
import { matchesAllFilters } from '../../../utils/gameFilters';

export const HomePage: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [bggNicks, setBggNicks] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUsernames, setCurrentUsernames] = useState<string[]>([]);
  const [filters, setFilters] = useState<Partial<GameFilters>>({});
  const [localFilters, setLocalFilters] = useState<Partial<GameFilters>>({});
  const [excludeExpansions, setExcludeExpansions] = useState<boolean>(false);
  const [localExcludeExpansions, setLocalExcludeExpansions] =
    useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    'name' | 'yearPublished' | 'bggRating' | 'playingTime' | 'complexity'
  >('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [games, setGames] = useState<Game[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // ===== HOOKS =====
  const { t } = useLanguage();

  const {
    data: apiGames,
    loading: isLoading,
    error,
    emptyCollections,
    errors,
  } = useMultipleOwnedGames(currentUsernames, excludeExpansions);

  // ===== EFFECTS =====
  useEffect(() => {
    if (!apiGames) return;

    const hasFilters = Object.keys(filters).length > 0;
    const filteredGames = hasFilters
      ? apiGames.filter(game => matchesAllFilters(game, filters))
      : apiGames;

    setGames(filteredGames);
    setCurrentPage(1);
  }, [apiGames, filters]);

  useEffect(() => {
    if (!hasSearched || !apiGames) return;

    const hasFilters = Object.keys(filters).length > 0;
    const filteredGames = hasFilters
      ? apiGames.filter(game => matchesAllFilters(game, filters))
      : apiGames;

    setGames(filteredGames);
    setCurrentPage(1);
  }, [filters, hasSearched, apiGames]);

  // ===== EVENT HANDLERS =====
  const handleSearch = async () => {
    if (!bggNicks.trim()) return;

    const usernames = bggNicks
      .split(',')
      .map(username => username.trim())
      .filter(username => username.length > 0);

    if (usernames.length === 0) return;

    setCurrentUsernames(usernames);
    setFilters(localFilters);
    setExcludeExpansions(localExcludeExpansions);
    setHasSearched(true);
  };

  const handleSaveResults = async () => {
    if (games.length === 0) {
      alert('No games to save!');
      return;
    }

    const listName = prompt('Enter a name for this list:');
    if (!listName || listName.trim() === '') {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const saveRequest: SaveGameListRequest = {
        listName: listName.trim(),
        usernames: currentUsernames,
        games: games,
        filters: filters,
        exactPlayerFilter: filters.exactPlayerFilter || false,
      };

      await apiService.saveGameList('arczi89', saveRequest);
      setSaveSuccess(`List "${listName}" saved successfully!`);

      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving game list:', error);
      alert('Failed to save the list. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ===== COMPUTED VALUES =====
  const sortedGames = useGameSorting({ games, sortBy, sortOrder });
  const { paginatedGames, totalPages } = useGamePagination(
    sortedGames,
    currentPage,
    itemsPerPage
  );

  // ===== RENDER =====
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          🎲 {t.title}
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          {t.subtitle}
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 gap-6">
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
              data-testid="bgg-usernames-input"
              value={bggNicks}
              onChange={e => setBggNicks(e.target.value)}
              placeholder={t.bggUsernamesPlaceholder}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Expansion Filter */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              data-testid="exclude-expansions-checkbox"
              checked={localExcludeExpansions}
              onChange={e => setLocalExcludeExpansions(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="ml-2 text-sm text-gray-700">
              {t.excludeExpansions}
            </span>
          </label>
        </div>

        {/* Filters */}
        <div className="mt-6">
          {/* Player Count Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            <div>
              <label
                htmlFor="minPlayers"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.minPlayers}
              </label>
              <input
                id="minPlayers"
                type="number"
                value={localFilters.minPlayers || ''}
                onChange={e =>
                  setLocalFilters({
                    ...localFilters,
                    minPlayers: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="maxPlayers"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.maxPlayers}
              </label>
              <input
                id="maxPlayers"
                type="number"
                value={localFilters.maxPlayers || ''}
                onChange={e =>
                  setLocalFilters({
                    ...localFilters,
                    maxPlayers: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="exactPlayerFilter"
                checked={localFilters.exactPlayerFilter || false}
                onChange={e =>
                  setLocalFilters({
                    ...localFilters,
                    exactPlayerFilter: e.target.checked,
                  })
                }
                disabled={isLoading}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label
                htmlFor="exactPlayerFilter"
                className="text-sm font-medium text-gray-700"
              >
                {t.exactPlayerFilter}
              </label>
            </div>
          </div>

          {/* Playing Time Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <div>
              <label
                htmlFor="minPlayTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.minPlayTime}
              </label>
              <input
                id="minPlayTime"
                type="number"
                value={localFilters.minPlayingTime || ''}
                onChange={e =>
                  setLocalFilters({
                    ...localFilters,
                    minPlayingTime: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="maxPlayTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.maxPlayTime}
              </label>
              <input
                id="maxPlayTime"
                type="number"
                value={localFilters.maxPlayingTime || ''}
                onChange={e =>
                  setLocalFilters({
                    ...localFilters,
                    maxPlayingTime: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
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
              disabled={isLoading}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isLoading}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="desc">{t.descending}</option>
              <option value="asc">{t.ascending}</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6">
          <button
            data-testid="search-button"
            onClick={handleSearch}
            disabled={!bggNicks.trim() || isLoading}
            className="w-full bg-primary-600 text-white py-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {/* Content */}
            <div className="relative z-10 flex items-center gap-3">
              {isLoading && (
                <div
                  className="h-5 w-5 text-white text-2xl flex items-center justify-center"
                  style={{
                    animation: 'spin 1s linear infinite',
                    transformOrigin: 'center center',
                  }}
                >
                  🎲
                </div>
              )}
              {isLoading ? t.searching : t.searchGames}
            </div>
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {t.results} ({games.length} {t.gamesFound})
              {currentUsernames.length > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  - {currentUsernames.length}{' '}
                  {currentUsernames.length === 1 ? 'user' : 'users'}:{' '}
                  {currentUsernames.join(', ')}
                </span>
              )}
            </h2>
            {games.length > 0 && (
              <div className="flex flex-col items-end space-y-2">
                <button
                  onClick={handleSaveResults}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                    isSaving
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {isSaving ? 'Saving...' : t.saveResults}
                </button>
                {saveSuccess && (
                  <div className="text-sm text-green-600 font-medium">
                    {saveSuccess}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Information about empty collections and errors */}
          {(emptyCollections && emptyCollections.length > 0) ||
          (errors && errors.length > 0) ? (
            <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
              {emptyCollections && emptyCollections.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-yellow-800">
                    {t.emptyCollectionsInfo}
                  </span>
                  <span className="text-sm text-yellow-700 ml-2">
                    {emptyCollections.join(', ')}
                  </span>
                </div>
              )}
              {errors && errors.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-red-800">
                    {t.userErrors}
                  </span>
                  <div className="mt-1">
                    {errors.map(({ username, error }, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <span className="font-medium">{username}:</span> {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

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
                Error loading collection
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
                      {t.ownedBy}
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
                      {t.year}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedGames.map(game => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {game.name}
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.minPlayers === game.maxPlayers
                          ? game.minPlayers
                          : `${game.minPlayers}-${game.maxPlayers}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.playingTime} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.bggRating ? game.bggRating.toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.yearPublished}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {hasSearched && games.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">{t.show}</label>
                <select
                  value={itemsPerPage}
                  onChange={e =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={-1}>{t.all}</option>
                </select>
                <span className="text-sm text-gray-700">{t.perPage}</span>
              </div>

              {/* Page navigation */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.previous}
                  </button>

                  <span className="text-sm text-gray-700">
                    {t.pageOf
                      .replace('{current}', currentPage.toString())
                      .replace('{total}', totalPages.toString())}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.next}
                  </button>
                </div>
              )}
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
