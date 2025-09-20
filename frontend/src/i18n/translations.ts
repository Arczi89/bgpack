export interface Translations {
  home: string;
  myLists: string;
  myCollection: string;
  login: string;
  logout: string;
  welcome: string;
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
  loginTitle: string;
  username: string;
  password: string;
  loginButton: string;
  loggingIn: string;
  loginFailed: string;
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
    myCollection: 'My Collection',
    login: 'Login',
    logout: 'Logout',
    welcome: 'Welcome',
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
    loginTitle: 'Login to BGPack',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    loggingIn: 'Logging in...',
    loginFailed: 'Login failed. Please try again.',
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
    home: 'Strona główna',
    myLists: 'Listy mojej paczki',
    myCollection: 'Moja kolekcja',
    login: 'Zaloguj się',
    logout: 'Wyloguj',
    welcome: 'Witaj',
    title: 'BGPack',
    subtitle:
      'Board Games Pack - odkryj gry z kolekcji twojej paczki przyjaciół, sortuj, filtruj i graj razem.',
    bggUsernames: 'Nazwy użytkowników BGG (oddzielone przecinkami)',
    bggUsernamesPlaceholder: 'gracz1, gracz2, gracz3',
    searchGames: 'Szukaj gier',
    searching: 'Szukam...',
    minPlayers: 'Min. graczy',
    maxPlayers: 'Max. graczy',
    minPlayTime: 'Min. czas gry (min)',
    maxPlayTime: 'Max. czas gry (min)',
    sortBy: 'Sortuj według:',
    order: 'Kolejność:',
    descending: 'Malejąco',
    ascending: 'Rosnąco',
    rating: 'Ocena',
    name: 'Nazwa',
    year: 'Rok',
    playTime: 'Czas gry',
    results: 'Wyniki',
    gamesFound: 'znalezionych gier',
    saveResults: 'Zapisz wyniki',
    noGamesFound: 'Nie znaleziono gier',
    noGamesFoundDesc:
      'Spróbuj zmienić kryteria wyszukiwania lub dodaj więcej nazw użytkowników BGG.',
    readyToDiscover: 'Gotowy na odkrywanie gier?',
    readyToDiscoverDesc:
      'Wprowadź nazwy użytkowników BGG powyżej, aby zobaczyć jakie gry posiadają Twoi znajomi i znajdź swoją następną ulubioną grę!',
    game: 'Gra',
    players: 'Gracze',
    time: 'Czas',
    ownedBy: 'Posiadane przez',
    loginTitle: 'Zaloguj się do BGPack',
    username: 'Nazwa użytkownika',
    password: 'Hasło',
    loginButton: 'Zaloguj się',
    loggingIn: 'Logowanie...',
    loginFailed: 'Logowanie nie powiodło się. Spróbuj ponownie.',
    excludeExpansions: 'Wyklucz dodatki (tylko gry planszowe)',
    show: 'Pokaż:',
    perPage: 'na stronę',
    all: 'Wszystkie',
    previous: 'Poprzednia',
    next: 'Następna',
    pageOf: 'Strona {current} z {total}',
    emptyCollectionsInfo: 'Użytkownicy bez kolekcji:',
    userErrors: 'Błędy podczas pobierania kolekcji:',
    exactPlayerFilter: 'Dokładne dopasowanie liczby graczy',
  },
};
