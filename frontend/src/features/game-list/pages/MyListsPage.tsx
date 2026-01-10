import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { GameList } from '../../../types/GameList';
import apiService from '../../../services/apiService';

export const MyListsPage: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  const [gameLists, setGameLists] = useState<GameList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ===== HOOKS =====
  const { t } = useLanguage();

  // ===== EFFECTS =====
  useEffect(() => {
    loadGameLists();
  }, []);

  // ====== EVENT HANDLERS =====
  const loadGameLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const lists = await apiService.getUserGameLists('arczi89');
      setGameLists(lists);
    } catch (err) {
      console.error('Error loading game lists:', err);
      setError('Failed to load game lists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (!window.confirm('Are you sure you want to delete this list?')) {
      return;
    }

    try {
      setDeletingId(listId);
      await apiService.deleteGameList('arczi89', listId);
      setGameLists(gameLists.filter(list => list.id !== listId));
    } catch (err) {
      console.error('Error deleting game list:', err);
      alert('Failed to delete the list. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // ===== UTILITY FUNCTIONS =====
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading your lists...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={loadGameLists}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.myLists}</h1>
        <p className="text-gray-600">
          Your saved game lists ({gameLists.length} lists)
        </p>
      </div>

      {gameLists.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-lg text-gray-500 mb-4">No saved lists yet</div>
          <p className="text-gray-400">
            Go to the home page to search for games and save your results!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {gameLists.map(list => (
            <div key={list.id} className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {list.listName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {formatDate(list.createdAt)}
                    </p>
                    {list.usernames && list.usernames.length > 0 && (
                      <p className="text-sm text-gray-500">
                        From users: {list.usernames.join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    disabled={deletingId === list.id}
                    className={`px-3 py-1 text-sm rounded ${
                      deletingId === list.id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {deletingId === list.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    Games ({list.games.length})
                  </h4>

                  {/* Search Criteria Summary */}
                  {(list.filters || list.exactPlayerFilter) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">
                        Search Criteria:
                      </h5>
                      <div className="text-sm text-gray-500 space-y-1">
                        {list.filters?.minPlayers && (
                          <div>Min Players: {list.filters.minPlayers}</div>
                        )}
                        {list.filters?.maxPlayers && (
                          <div>Max Players: {list.filters.maxPlayers}</div>
                        )}
                        {list.filters?.minPlayingTime && (
                          <div>
                            Min Playing Time: {list.filters.minPlayingTime} min
                          </div>
                        )}
                        {list.filters?.maxPlayingTime && (
                          <div>
                            Max Playing Time: {list.filters.maxPlayingTime} min
                          </div>
                        )}
                        {list.exactPlayerFilter && (
                          <div>Exact Player Filter: Yes</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Games List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Game
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Players
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {list.games.slice(0, 10).map(game => (
                          <tr key={game.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {game.name}
                              </div>
                              {game.ownedBy && game.ownedBy.length > 0 && (
                                <div className="text-sm text-gray-500">
                                  Owned by: {game.ownedBy.join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {game.yearPublished}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {game.minPlayers}-{game.maxPlayers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {game.playingTime} min
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {game.bggRating ? game.bggRating.toFixed(1) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {list.games.length > 10 && (
                      <div className="px-6 py-3 text-sm text-gray-500 bg-gray-50">
                        ... and {list.games.length - 10} more games
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
