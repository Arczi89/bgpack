import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface MultipleOwnedGamesState<T> extends ApiState<T> {
  emptyCollections?: string[];
  errors?: { username: string; error: string }[];
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useGames(searchParams: any = {}) {
  return useApi(
    () => apiService.getGames(searchParams),
    [JSON.stringify(searchParams)]
  );
}

export function useOwnedGames(username: string) {
  const [state, setState] = useState<ApiState<any[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!username || username.trim() === '') {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiService.getOwnedGames(username);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useMultipleOwnedGames(
  usernames: string[],
  excludeExpansions: boolean = false
): MultipleOwnedGamesState<any[]> & { refetch: () => void } {
  const [state, setState] = useState<MultipleOwnedGamesState<any[]>>({
    data: null,
    loading: false,
    error: null,
    emptyCollections: [],
    errors: [],
  });

  const fetchData = useCallback(async () => {
    if (
      !usernames ||
      usernames.length === 0 ||
      usernames.every(u => !u.trim())
    ) {
      setState({
        data: [],
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      emptyCollections: [],
      errors: [],
    }));

    try {
      // Pobierz gry dla wszystkich użytkowników równolegle
      const validUsernames = usernames
        .map(username => username.trim())
        .filter(username => username.length > 0);

      const promises = validUsernames.map(async username => {
        try {
          const games = await apiService.getOwnedGames(
            username,
            excludeExpansions
          );
          return { username, games, error: null };
        } catch (error) {
          console.warn(`Failed to fetch games for user ${username}:`, error);
          return {
            username,
            games: [],
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(promises);

      // Połącz wszystkie gry w jedną listę z informacją o właścicielach
      const gameMap = new Map<string, any>();
      const emptyCollections: string[] = [];
      const errors: { username: string; error: string }[] = [];

      results.forEach(({ username, games, error }) => {
        if (error) {
          errors.push({ username, error });
        }

        if (games.length === 0 && !error) {
          emptyCollections.push(username);
        }

        games.forEach(game => {
          const gameId = game.id;
          if (gameMap.has(gameId)) {
            // Jeśli gra już istnieje, dodaj użytkownika do listy właścicieli
            const existingGame = gameMap.get(gameId);
            if (!existingGame.ownedBy.includes(username)) {
              existingGame.ownedBy.push(username);
            }
          } else {
            // Jeśli to nowa gra, dodaj ją z właścicielem
            const gameWithOwner = {
              ...game,
              ownedBy: [username],
            };
            gameMap.set(gameId, gameWithOwner);
          }
        });
      });

      const uniqueGames = Array.from(gameMap.values());

      setState({
        data: uniqueGames,
        loading: false,
        error: null,
        emptyCollections,
        errors,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        emptyCollections: [],
        errors: [],
      });
    }
  }, [usernames, excludeExpansions]); // Dependency na usernames array i excludeExpansions

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}
