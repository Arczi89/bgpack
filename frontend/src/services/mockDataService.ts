import { Game } from '../types/Game';

export const mockGames: Game[] = [
  {
    id: '1',
    name: 'Catan',
    yearPublished: 1995,
    minPlayers: 3,
    maxPlayers: 4,
    playingTime: 60,
    minAge: 10,
    description:
      'Klasyczna gra strategiczna o budowaniu osad i miast na wyspie Catan. Gracze zbierają surowce, handlują i budują osady, miasta i drogi.',
    imageUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic2419375.jpg',
    thumbnailUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic2419375.jpg',
    bggRating: 7.2,
    averageRating: 7.2,
    complexity: 2.3,
    ownedBy: ['player1', 'player2'],
  },
  {
    id: '2',
    name: 'Ticket to Ride',
    yearPublished: 2004,
    minPlayers: 2,
    maxPlayers: 5,
    playingTime: 45,
    minAge: 8,
    description:
      'Gra o budowaniu tras kolejowych przez Amerykę Północną. Gracze zbierają karty wagonów i budują trasy między miastami.',
    imageUrl:
      'https://cf.geekdo-images.com/thumb/img/jV8vN8KSjsYvj2U4F9Y0LQ==/fit-in/200x150/filters:strip_icc()/pic38668.jpg',
    thumbnailUrl:
      'https://cf.geekdo-images.com/thumb/img/jV8vN8KSjsYvj2U4F9Y0LQ==/fit-in/200x150/filters:strip_icc()/pic38668.jpg',
    bggRating: 7.4,
    averageRating: 7.4,
    complexity: 1.9,
    ownedBy: ['player1'],
  },
  {
    id: '3',
    name: 'Wingspan',
    yearPublished: 2019,
    minPlayers: 1,
    maxPlayers: 5,
    playingTime: 60,
    minAge: 10,
    description:
      'Gra o ptakach, gdzie gracze budują rezerwaty przyrody i zbierają ptaki o różnych zdolnościach.',
    imageUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic4458123.jpg',
    thumbnailUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic4458123.jpg',
    bggRating: 8.1,
    averageRating: 8.1,
    complexity: 2.4,
    ownedBy: ['player2', 'player3'],
  },
  {
    id: '4',
    name: 'Terraforming Mars',
    yearPublished: 2016,
    minPlayers: 1,
    maxPlayers: 5,
    playingTime: 120,
    minAge: 12,
    description:
      'Gra strategiczna o terraformowaniu Marsa. Gracze zarządzają korporacjami i próbują uczynić Mars zdatnym do zamieszkania.',
    imageUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic3536616.jpg',
    thumbnailUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic3536616.jpg',
    bggRating: 8.4,
    averageRating: 8.4,
    complexity: 3.2,
    ownedBy: ['player1', 'player3'],
  },
  {
    id: '5',
    name: 'Azul',
    yearPublished: 2017,
    minPlayers: 2,
    maxPlayers: 4,
    playingTime: 45,
    minAge: 8,
    description:
      'Gra o układaniu płytek azulejos w pałacu króla. Gracze zbierają kolorowe płytki i układają je w piękne wzory.',
    imageUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic3718275.jpg',
    thumbnailUrl:
      'https://cf.geekdo-images.com/thumb/img/1q0y1jSqHM5qj8FmJ4j4hQ==/fit-in/200x150/filters:strip_icc()/pic3718275.jpg',
    bggRating: 7.8,
    averageRating: 7.8,
    complexity: 1.8,
    ownedBy: ['player2'],
  },
];

export const getMockGames = (): Game[] => {
  return [...mockGames];
};

export const getMockGameById = (id: string): Game | undefined => {
  return mockGames.find(game => game.id === id);
};

export const getMockGamesByOwners = (owners: string[]): Game[] => {
  return mockGames.filter(
    game => game.ownedBy && game.ownedBy.some(owner => owners.includes(owner))
  );
};

export const getMockGamesByFilters = (filters: {
  minPlayers?: number;
  maxPlayers?: number;
  minPlayingTime?: number;
  maxPlayingTime?: number;
  minAge?: number;
  minRating?: number;
}): Game[] => {
  return mockGames.filter(game => {
    if (filters.minPlayers && game.minPlayers < filters.minPlayers)
      return false;
    if (filters.maxPlayers && game.maxPlayers > filters.maxPlayers)
      return false;
    if (filters.minPlayingTime && game.playingTime < filters.minPlayingTime)
      return false;
    if (filters.maxPlayingTime && game.playingTime > filters.maxPlayingTime)
      return false;
    if (filters.minAge && game.minAge < filters.minAge) return false;
    if (filters.minRating && game.bggRating < filters.minRating) return false;
    return true;
  });
};
