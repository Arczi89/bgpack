import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
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

export function useGame(id: string) {
  return useApi(() => apiService.getGameById(id), [id]);
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

export function useApiHealth() {
  return useApi(() => apiService.getApiHealth(), []);
}

export function useMultipleOwnedGames(usernames: string[]) {
  const [state, setState] = useState<ApiState<any[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (
      !usernames ||
      usernames.length === 0 ||
      usernames.every(u => !u.trim())
    ) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Pobierz gry dla wszystkich użytkowników równolegle
      const promises = usernames
        .map(username => username.trim())
        .filter(username => username.length > 0)
        .map(username => apiService.getOwnedGames(username));

      const results = await Promise.all(promises);

      // Połącz wszystkie gry w jedną listę
      const allGames = results.flat();

      // Usuń duplikaty na podstawie ID gry
      const uniqueGames = allGames.filter(
        (game, index, self) => index === self.findIndex(g => g.id === game.id)
      );

      setState({ data: uniqueGames, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [usernames]); // Dependency na usernames array

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}
