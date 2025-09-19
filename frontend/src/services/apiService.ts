import { Game, GameSearchParams } from '../types/Game';

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

  async getGameById(id: string): Promise<Game> {
    return this.request<Game>(`/games/${id}`);
  }

  async getOwnedGames(username: string): Promise<Game[]> {
    return this.request<Game[]>(`/own/${username}`);
  }

  async getApiHealth(): Promise<{ successRate: number; timestamp: number }> {
    return this.request<{ successRate: number; timestamp: number }>(
      '/stats/api-health'
    );
  }

  async resetCircuitBreaker(): Promise<{ message: string; timestamp: number }> {
    return this.request<{ message: string; timestamp: number }>(
      '/stats/reset-circuit-breaker',
      {
        method: 'POST',
      }
    );
  }

  async testConnection(): Promise<string> {
    return this.request<string>('/test');
  }
}

export const apiService = new ApiService();
export default apiService;
