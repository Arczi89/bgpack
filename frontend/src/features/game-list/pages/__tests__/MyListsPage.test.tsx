import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { MyListsPage } from '../MyListsPage';
import apiService from '../../../../services/apiService';
import { GameList } from '../../../../types/GameList';
import { Game } from '../../../../types/Game';

jest.mock('../../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      myLists: 'My Lists',
    },
  }),
}));

jest.mock('../../../../services/apiService', () => ({
  getUserGameLists: jest.fn(),
  deleteGameList: jest.fn(),
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const createMockGame = (
  id: number,
  name: string,
  yearPublished: number,
  minPlayers: number,
  maxPlayers: number,
  playingTime: number,
  bggRating: number,
  ownedBy: string[]
): Game => ({
  id,
  name,
  yearPublished,
  minPlayers,
  maxPlayers,
  playingTime,
  bggRating,
  ownedBy,
});

const mockGames: Game[] = [
  createMockGame(1, 'Catan', 1995, 3, 4, 90, 7.1, ['user1']),
  createMockGame(2, 'Azul', 2017, 2, 4, 45, 8.2, ['user2']),
  createMockGame(3, 'Ticket to Ride', 2004, 2, 5, 60, 7.4, ['user1', 'user3']),
];

const mockGameLists: GameList[] = [
  {
    id: 'list-1',
    listName: 'Strategy Games',
    games: mockGames,
    searchCriteria: {
      usernames: ['user1', 'user2'],
      filters: {
        minPlayers: 2,
        maxPlayers: 4,
      },
      exactPlayerFilter: false,
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'list-2',
    listName: 'Quick Games',
    games: [mockGames[1], mockGames[2]],
    searchCriteria: {
      usernames: ['user2'],
      filters: {
        maxPlayingTime: 60,
      },
      exactPlayerFilter: true,
    },
    createdAt: '2024-01-02T00:00:00Z',
  },
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('MyListsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    window.confirm = jest.fn();
  });

  afterEach(() => {
    delete (window as any).confirm;
  });

  it('should show loading state initially', () => {
    mockApiService.getUserGameLists.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading your lists...')).toBeInTheDocument();
  });

  it('should display game lists when loaded successfully', async () => {
    mockApiService.getUserGameLists.mockResolvedValue(mockGameLists);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('My Lists')).toBeInTheDocument();
      expect(
        screen.getByText('Your saved game lists (2 lists)')
      ).toBeInTheDocument();
      expect(screen.getByText('Strategy Games')).toBeInTheDocument();
      expect(screen.getByText('Quick Games')).toBeInTheDocument();
    });

    expect(mockApiService.getUserGameLists).toHaveBeenCalledWith('arczi89');
  });

  it('should display empty state when no lists exist', async () => {
    mockApiService.getUserGameLists.mockResolvedValue([]);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No saved lists yet')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Go to the home page to search for games and save your results!'
        )
      ).toBeInTheDocument();
    });
  });

  it('should display error state when loading fails', async () => {
    mockApiService.getUserGameLists.mockRejectedValue(
      new Error('Network error')
    );

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load game lists. Please try again.')
      ).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should allow retry after error', async () => {
    mockApiService.getUserGameLists
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockGameLists);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load game lists. Please try again.')
      ).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Strategy Games')).toBeInTheDocument();
    });

    expect(mockApiService.getUserGameLists).toHaveBeenCalledTimes(2);
  });

  it('should delete a game list when confirmed', async () => {
    mockApiService.getUserGameLists.mockResolvedValue(mockGameLists);
    mockApiService.deleteGameList.mockResolvedValue(undefined);
    (window.confirm as jest.Mock).mockReturnValue(true);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Strategy Games')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this list?'
    );
    expect(mockApiService.deleteGameList).toHaveBeenCalledWith(
      'arczi89',
      'list-1'
    );

    await waitFor(() => {
      expect(screen.queryByText('Strategy Games')).not.toBeInTheDocument();
      expect(screen.getByText('Quick Games')).toBeInTheDocument();
    });
  });

  it('should not delete a game list when not confirmed', async () => {
    mockApiService.getUserGameLists.mockResolvedValue(mockGameLists);
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Strategy Games')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this list?'
    );
    expect(mockApiService.deleteGameList).not.toHaveBeenCalled();
    expect(screen.getByText('Strategy Games')).toBeInTheDocument();
  });

  it('should show loading state while deleting', async () => {
    mockApiService.getUserGameLists.mockResolvedValue(mockGameLists);
    mockApiService.deleteGameList.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    (window.confirm as jest.Mock).mockReturnValue(true);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Strategy Games')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(deleteButtons[0]).toBeDisabled();
  });

  it('should handle delete error', async () => {
    mockApiService.getUserGameLists.mockResolvedValue(mockGameLists);
    mockApiService.deleteGameList.mockRejectedValue(new Error('Delete failed'));
    (window.confirm as jest.Mock).mockReturnValue(true);

    // Mock window.alert
    window.alert = jest.fn();

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Strategy Games')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to delete the list. Please try again.'
      );
    });

    delete (window as any).alert;
  });

  it('should display game list details correctly', async () => {
    mockApiService.getUserGameLists.mockResolvedValue(mockGameLists);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Strategy Games')).toBeInTheDocument();
    });

    // Check list details
    expect(
      screen.getByText('Created on 1/1/2024, 12:00 AM')
    ).toBeInTheDocument();
    expect(screen.getByText('From users: user1, user2')).toBeInTheDocument();

    // Check search criteria
    expect(screen.getByText('Search Criteria:')).toBeInTheDocument();
    expect(screen.getByText('Min Players: 2')).toBeInTheDocument();
    expect(screen.getByText('Max Players: 4')).toBeInTheDocument();

    // Check games table
    expect(screen.getByText('Games (3)')).toBeInTheDocument();
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('Azul')).toBeInTheDocument();
    expect(screen.getByText('Ticket to Ride')).toBeInTheDocument();
  });

  it('should show exact player filter when enabled', async () => {
    mockApiService.getUserGameLists.mockResolvedValue(mockGameLists);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Quick Games')).toBeInTheDocument();
    });

    expect(screen.getByText('Exact Player Filter: Yes')).toBeInTheDocument();
  });

  it('should show truncated games when more than 10', async () => {
    const manyGames = Array.from({ length: 15 }, (_, i) =>
      createMockGame(i + 1, `Game ${i + 1}`, 2020, 2, 4, 60, 7.0, ['user1'])
    );

    const largeGameList: GameList = {
      id: 'list-large',
      listName: 'Large List',
      games: manyGames,
      searchCriteria: {
        usernames: ['user1'],
        filters: {},
        exactPlayerFilter: false,
      },
      createdAt: '2024-01-01T00:00:00Z',
    };

    mockApiService.getUserGameLists.mockResolvedValue([largeGameList]);

    render(
      <TestWrapper>
        <MyListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Games (15)')).toBeInTheDocument();
      expect(screen.getByText('... and 5 more games')).toBeInTheDocument();
    });
  });
});
