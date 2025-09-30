import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { HomePage } from '../HomePage';
import { Game } from '../../../../types/Game';
import apiService from '../../../../services/apiService';

jest.mock('../../../../hooks/useApi', () => ({
  useMultipleOwnedGames: jest.fn(),
}));

jest.mock('../../../../services/apiService', () => ({
  saveGameList: jest.fn(),
}));

jest.mock('../../../../hooks/useGameSorting', () => ({
  useGameSorting: jest.fn(),
  useGamePagination: jest.fn(),
}));

jest.mock('../../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      title: 'BGPack',
      subtitle: 'Discover board games',
      bggUsernames: 'BGG Usernames',
      bggUsernamesPlaceholder: 'Enter usernames separated by commas',
      searchGames: 'Search Games',
      searching: 'Searching...',
      minPlayers: 'Min Players',
      maxPlayers: 'Max Players',
      minPlayTime: 'Min Play Time',
      maxPlayTime: 'Max Play Time',
      sortBy: 'Sort By',
      order: 'Order',
      descending: 'Descending',
      ascending: 'Ascending',
      rating: 'Rating',
      name: 'Name',
      year: 'Year',
      playTime: 'Play Time',
      results: 'Results',
      gamesFound: 'games found',
      saveResults: 'Save Results',
      noGamesFound: 'No games found',
      noGamesFoundDesc: 'Try different search criteria',
      readyToDiscover: 'Ready to discover games?',
      readyToDiscoverDesc: 'Enter BGG usernames to get started',
      game: 'Game',
      players: 'Players',
      time: 'Time',
      ownedBy: 'Owned By',
      excludeExpansions: 'Exclude expansions (board games only)',
      show: 'Show:',
      perPage: 'per page',
      pageOf: 'Page {current} of {total}',
      all: 'All',
      previous: 'Previous',
      next: 'Next',
      emptyCollectionsInfo: 'Users with empty collections:',
      userErrors: 'Errors while fetching collections:',
      exactPlayerFilter: 'Exact player count match',
    },
  }),
}));

const createMockGame = (
  id: string,
  name: string,
  yearPublished: number,
  minPlayers: number,
  maxPlayers: number,
  playingTime: number,
  bggRating: number | null,
  ownedBy: string[]
): Game => ({
  id,
  name,
  yearPublished,
  minPlayers,
  maxPlayers,
  playingTime,
  minAge: 8,
  description: 'Mock game description',
  imageUrl: undefined,
  thumbnailUrl: undefined,
  bggRating,
  averageRating: null,
  complexity: null,
  ownedBy,
});

const mockGames: Game[] = [
  createMockGame('68448', '7 Cudów Świata', 2016, 2, 7, 30, null, ['user1']),
  createMockGame('173346', '7 Cudów Świata: Pojedynek', 2019, 2, 2, 30, null, [
    'user2',
  ]),
  createMockGame('206915', 'Amazonki', 2018, 3, 10, 15, null, [
    'user1',
    'user3',
  ]),
  createMockGame(
    '299659',
    'Clash of Cultures: Monumental Edition',
    2021,
    2,
    4,
    240,
    null,
    ['user2']
  ),
  createMockGame(
    '182028',
    'Cywilizacja: Poprzez Wieki',
    2015,
    2,
    4,
    120,
    null,
    ['user1']
  ),
];

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      // Add minimal reducers for testing
      gameList: (state = { games: [], loading: false, error: null }) => state,
      filters: (state = {}) => state,
    },
    preloadedState: initialState,
  });
};

const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({
  children,
  store = createMockStore(),
}) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe('HomePage', () => {
  const mockUseMultipleOwnedGames =
    require('../../../../hooks/useApi').useMultipleOwnedGames;
  const mockUseGameSorting =
    require('../../../../hooks/useGameSorting').useGameSorting;
  const mockUseGamePagination =
    require('../../../../hooks/useGameSorting').useGamePagination;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseMultipleOwnedGames.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      emptyCollections: [],
      errors: [],
    });

    mockUseGameSorting.mockReturnValue(mockGames);
    mockUseGamePagination.mockReturnValue({
      paginatedGames: mockGames,
      totalPages: 1,
    });
  });

  it('should render the homepage with search form', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByLabelText('BGG Usernames')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle username input', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    fireEvent.change(input, { target: { value: 'user1, user2' } });

    expect(input).toHaveValue('user1, user2');
  });

  it('should trigger search when search button is clicked', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    const searchButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'user1, user2' } });
    fireEvent.click(searchButton);

    expect(input).toHaveValue('user1, user2');
  });

  it('should display loading state', () => {
    mockUseMultipleOwnedGames.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should display error state', async () => {
    mockUseMultipleOwnedGames.mockReturnValue({
      data: null,
      loading: false,
      error: 'User not found',
      emptyCollections: [],
      errors: [],
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    const searchButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'user1' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Error loading collection')).toBeInTheDocument();
    });
  });

  it('should display games when data is loaded', async () => {
    mockUseMultipleOwnedGames.mockReturnValue({
      data: mockGames,
      loading: false,
      error: null,
      emptyCollections: [],
      errors: [],
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    const searchButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'user1' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('7 Cudów Świata')).toBeInTheDocument();
    });
  });

  it('should handle expansion filter toggle', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const expansionCheckbox = screen.getByLabelText(
      'Exclude expansions (board games only)'
    );
    fireEvent.click(expansionCheckbox);

    expect(expansionCheckbox).toBeChecked();
  });

  it('should handle pagination controls', async () => {
    mockUseMultipleOwnedGames.mockReturnValue({
      data: mockGames,
      loading: false,
      error: null,
      emptyCollections: [],
      errors: [],
    });

    mockUseGamePagination.mockReturnValue({
      paginatedGames: mockGames.slice(0, 2),
      totalPages: 2,
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    const searchButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'user1, user2' } });
    fireEvent.click(searchButton);

    // Wait for the search to complete and results to be displayed
    await waitFor(() => {
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    });

    const itemsPerPageSelect = screen.getByDisplayValue('20');
    fireEvent.change(itemsPerPageSelect, { target: { value: '10' } });

    expect(itemsPerPageSelect).toHaveValue('10');
  });

  it('should handle player filter', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const minPlayersInput = screen.getByLabelText('Min Players');
    const maxPlayersInput = screen.getByLabelText('Max Players');

    fireEvent.change(minPlayersInput, { target: { value: '2' } });
    fireEvent.change(maxPlayersInput, { target: { value: '4' } });

    expect(minPlayersInput).toHaveValue(2);
    expect(maxPlayersInput).toHaveValue(4);
  });

  it('should handle time filter', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const minTimeInput = screen.getByLabelText('Min Play Time');
    const maxTimeInput = screen.getByLabelText('Max Play Time');

    fireEvent.change(minTimeInput, { target: { value: '30' } });
    fireEvent.change(maxTimeInput, { target: { value: '90' } });

    expect(minTimeInput).toHaveValue(30);
    expect(maxTimeInput).toHaveValue(90);
  });

  it('should handle basic input functionality', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    fireEvent.change(input, { target: { value: 'user1' } });
    expect(input).toHaveValue('user1');
  });

  it('should handle checkbox functionality', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText(
      'Exclude expansions (board games only)'
    );
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should display ready to discover state', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Ready to discover games?')).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Search Games')).toBeInTheDocument();
  });

  it('should not show save results button by default', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.queryByText('Save Results')).not.toBeInTheDocument();
  });

  it('should handle multiple usernames input', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    const searchButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'user1, user2, user3' } });
    fireEvent.click(searchButton);

    expect(input).toHaveValue('user1, user2, user3');
  });

  it('should trim whitespace from usernames', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    const searchButton = screen.getByRole('button');

    fireEvent.change(input, {
      target: { value: '  user1  ,  user2  , user3 ' },
    });
    fireEvent.click(searchButton);

    expect(input).toHaveValue('  user1  ,  user2  , user3 ');
  });

  it('should handle empty usernames gracefully', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('BGG Usernames');
    const searchButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'user1, , user2,   ' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockUseMultipleOwnedGames).toHaveBeenCalledWith(
        ['user1', 'user2'],
        false
      );
    });
  });

  describe('Save Results functionality', () => {
    const mockApiService = apiService as jest.Mocked<typeof apiService>;

    beforeEach(() => {
      mockApiService.saveGameList.mockClear();
      window.prompt = jest.fn();
    });

    afterEach(() => {
      delete (window as any).prompt;
    });

    it('should show save button when games are loaded', async () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: mockGames,
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Save Results')).toBeInTheDocument();
      });
    });

    it('should not show save button when no games are loaded', () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      expect(screen.queryByText('Save Results')).not.toBeInTheDocument();
    });

    it('should call saveGameList when save button is clicked and list name is provided', async () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: mockGames,
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      (window.prompt as jest.Mock).mockReturnValue('My Test List');

      mockApiService.saveGameList.mockResolvedValue({
        id: 'list-1',
        listName: 'My Test List',
        games: mockGames,
        username: 'arczi89',
        usernames: ['user1'],
        filters: {},
        exactPlayerFilter: false,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      });

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Save Results')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Results');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(window.prompt).toHaveBeenCalledWith(
          'Enter a name for this list:'
        );
      });

      expect(mockApiService.saveGameList).toHaveBeenCalledWith('arczi89', {
        listName: 'My Test List',
        usernames: ['user1', 'user2'],
        games: mockGames,
        filters: {},
        exactPlayerFilter: false,
      });
    });

    it('should not save when prompt is cancelled', async () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: mockGames,
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      (window.prompt as jest.Mock).mockReturnValue(null);

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Save Results')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Results');
      fireEvent.click(saveButton);

      expect(window.prompt).toHaveBeenCalledWith('Enter a name for this list:');
      expect(mockApiService.saveGameList).not.toHaveBeenCalled();
    });

    it('should not save when prompt returns empty string', async () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: mockGames,
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      (window.prompt as jest.Mock).mockReturnValue('');

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Save Results')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Results');
      fireEvent.click(saveButton);

      expect(window.prompt).toHaveBeenCalledWith('Enter a name for this list:');
      expect(mockApiService.saveGameList).not.toHaveBeenCalled();
    });

    it('should show loading state while saving', async () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: mockGames,
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      (window.prompt as jest.Mock).mockReturnValue('My Test List');

      mockApiService.saveGameList.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Save Results')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Results');
      fireEvent.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    it('should show success message after successful save', async () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: mockGames,
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      (window.prompt as jest.Mock).mockReturnValue('My Test List');

      mockApiService.saveGameList.mockResolvedValue({
        id: 'list-1',
        listName: 'My Test List',
        games: mockGames,
        username: 'arczi89',
        usernames: ['user1'],
        filters: {},
        exactPlayerFilter: false,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      });

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Save Results')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Results');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('List "My Test List" saved successfully!')
        ).toBeInTheDocument();
      });
    });

    it('should show alert when save fails', async () => {
      mockUseMultipleOwnedGames.mockReturnValue({
        data: mockGames,
        loading: false,
        error: null,
        emptyCollections: [],
        errors: [],
      });

      (window.prompt as jest.Mock).mockReturnValue('My Test List');

      mockApiService.saveGameList.mockRejectedValue(new Error('Save failed'));

      window.alert = jest.fn();

      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );

      const input = screen.getByLabelText('BGG Usernames');
      const searchButton = screen.getByRole('button');

      fireEvent.change(input, { target: { value: 'user1, user2' } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Save Results')).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save Results');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Failed to save the list. Please try again.'
        );
      });

      delete (window as any).alert;
    });
  });
});
