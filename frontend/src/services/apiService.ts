import { Game, GameSearchParams } from '../types/Game';
import { GameList, SaveGameListRequest } from '../types/GameList';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getGames(searchParams: GameSearchParams = {}): Promise<Game[]> {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/games?${queryString}` : '/games';

    return this.request<Game[]>(endpoint);
  }

  async getOwnedGames(
    username: string,
    excludeExpansions: boolean = false
  ): Promise<Game[]> {
    const url = excludeExpansions
      ? `/own/${username}?excludeExpansions=true`
      : `/own/${username}`;
    return this.request<Game[]>(url);
  }

  async testConnection(): Promise<string> {
    return this.request<string>('/test');
  }

  // Game Lists API
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

  async deleteGameList(username: string, gameListId: string): Promise<void> {
    return this.request<void>(`/game-lists/${username}/${gameListId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
