import { Game, GameSearchParams } from '@/types/Game';
import { GameList, SaveGameListRequest } from '@/types/GameList';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  async getGames(params: GameSearchParams): Promise<Game[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/games?${queryString}` : '/games';

    return this.request<Game[]>(endpoint);
  }

  async getOwnedGamesWithStats(
    username: string,
    excludeExpansions: boolean = false
  ): Promise<Game[]> {
    const url = `/own/${username}/with-stats?excludeExpansions=${excludeExpansions}`;
    return this.request<Game[]>(url);
  }

  async getGameDetails(bggId: string): Promise<Game> {
    return this.request<Game>(`/games/${bggId}`);
  }

  async saveGameList(
    username: string,
    request: SaveGameListRequest
  ): Promise<GameList> {
    return this.request<GameList>(`/game-lists/${username}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getUserGameLists(username: string): Promise<GameList[]> {
    return this.request<GameList[]>(`/game-lists/${username}`);
  }

  async deleteGameList(username: string, listId: number): Promise<void> {
    return this.request<void>(`/game-lists/${username}/${listId}`, {
      method: 'DELETE',
    });
  }

  async testConnection(): Promise<string> {
    return this.request<string>('/test');
  }
}

const apiService = new ApiService();
export default apiService;
