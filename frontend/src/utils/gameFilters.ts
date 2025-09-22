import { Game, GameFilters } from '../types/Game';

export const matchesPlayerCountFilter = (
  game: Game,
  filters: GameFilters
): boolean => {
  const { minPlayers, maxPlayers, exactPlayerFilter } = filters;

  if (!minPlayers && !maxPlayers) return true;

  if (exactPlayerFilter && minPlayers && maxPlayers) {
    return game.minPlayers === minPlayers && game.maxPlayers === maxPlayers;
  }

  if (minPlayers && maxPlayers) {
    return !(game.minPlayers > maxPlayers || game.maxPlayers < minPlayers);
  }

  if (minPlayers) {
    return game.maxPlayers >= minPlayers;
  }

  if (maxPlayers) {
    return game.maxPlayers <= maxPlayers;
  }

  return true;
};

export const matchesPlayingTimeFilter = (
  game: Game,
  filters: GameFilters
): boolean => {
  const { minPlayingTime, maxPlayingTime } = filters;

  return (
    !(minPlayingTime && game.playingTime < minPlayingTime) &&
    !(maxPlayingTime && game.playingTime > maxPlayingTime)
  );
};

export const matchesOtherFilters = (
  game: Game,
  filters: GameFilters
): boolean => {
  const { minAge, minRating } = filters;

  return (
    !(minAge && game.minAge < minAge) &&
    !(minRating && (!game.bggRating || game.bggRating < minRating))
  );
};

export const matchesAllFilters = (
  game: Game,
  filters: GameFilters
): boolean => {
  return (
    matchesPlayerCountFilter(game, filters) &&
    matchesPlayingTimeFilter(game, filters) &&
    matchesOtherFilters(game, filters)
  );
};
