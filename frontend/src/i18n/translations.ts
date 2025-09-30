export interface Translations {
  home: string;
  myLists: string;
  title: string;
  subtitle: string;
  bggUsernames: string;
  bggUsernamesPlaceholder: string;
  searchGames: string;
  searching: string;
  minPlayers: string;
  maxPlayers: string;
  minPlayTime: string;
  maxPlayTime: string;
  sortBy: string;
  order: string;
  descending: string;
  ascending: string;
  rating: string;
  name: string;
  year: string;
  playTime: string;
  results: string;
  gamesFound: string;
  saveResults: string;
  noGamesFound: string;
  noGamesFoundDesc: string;
  readyToDiscover: string;
  readyToDiscoverDesc: string;
  game: string;
  players: string;
  time: string;
  ownedBy: string;
  excludeExpansions: string;
  show: string;
  perPage: string;
  all: string;
  previous: string;
  next: string;
  pageOf: string;
  emptyCollectionsInfo: string;
  userErrors: string;
  exactPlayerFilter: string;
}

export const translations: Record<string, Translations> = {
  en: {
    home: 'Home',
    myLists: 'My Lists',
    title: 'BGPack',
    subtitle:
      "Board Games Pack - discover games from your friends' collections, sort, filter and play together.",
    bggUsernames: 'BGG Usernames (comma separated)',
    bggUsernamesPlaceholder: 'player1, player2, player3',
    searchGames: 'Search Games',
    searching: 'Searching...',
    minPlayers: 'Min Players',
    maxPlayers: 'Max Players',
    minPlayTime: 'Min Play Time (min)',
    maxPlayTime: 'Max Play Time (min)',
    sortBy: 'Sort by:',
    order: 'Order:',
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
    noGamesFoundDesc:
      'Try adjusting your search criteria or add more BGG usernames.',
    readyToDiscover: 'Ready to discover games?',
    readyToDiscoverDesc:
      'Enter BGG usernames above to see what games your friends own and find your next favorite game!',
    game: 'Game',
    players: 'Players',
    time: 'Time',
    ownedBy: 'Owned By',
    excludeExpansions: 'Exclude expansions (board games only)',
    show: 'Show:',
    perPage: 'per page',
    all: 'All',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {current} of {total}',
    emptyCollectionsInfo: 'Users with empty collections:',
    userErrors: 'Errors while fetching collections:',
    exactPlayerFilter: 'Exact player count match',
  },
  pl: {
    home: 'Home',
    myLists: 'My Lists',
    title: 'BGPack',
    subtitle:
      "Board Games Pack - discover games from your friends' collections, sort, filter and play together.",
    bggUsernames: 'BGG Usernames (comma separated)',
    bggUsernamesPlaceholder: 'player1, player2, player3',
    searchGames: 'Search Games',
    searching: 'Searching...',
    minPlayers: 'Min Players',
    maxPlayers: 'Max Players',
    minPlayTime: 'Min Play Time (min)',
    maxPlayTime: 'Max Play Time (min)',
    sortBy: 'Sort by:',
    order: 'Order:',
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
    noGamesFoundDesc:
      'Try adjusting your search criteria or add more BGG usernames.',
    readyToDiscover: 'Ready to discover games?',
    readyToDiscoverDesc:
      'Enter BGG usernames above to see what games your friends own and find your next favorite game!',
    game: 'Game',
    players: 'Players',
    time: 'Time',
    ownedBy: 'Owned By',
    excludeExpansions: 'Exclude expansions (board games only)',
    show: 'Show:',
    perPage: 'per page',
    all: 'All',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {current} of {total}',
    emptyCollectionsInfo: 'Users with empty collections:',
    userErrors: 'Errors while fetching collections:',
    exactPlayerFilter: 'Exact player count match',
  },
};
