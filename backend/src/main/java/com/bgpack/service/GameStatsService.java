package com.bgpack.service;

import com.bgpack.dto.GameStatsDto;
import com.bgpack.dto.GameWithStatsDto;
import com.bgpack.entity.Game;
import com.bgpack.entity.GameStats;
import com.bgpack.repository.GameStatsRepository;
import com.bgpack.client.BggApiClient;
import com.bgpack.service.BggXmlParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameStatsService {

    private final GameStatsRepository gameStatsRepository;
    private final BggApiClient bggApiClient;
    private final BggXmlParserService bggXmlParserService;

    /**
     * Get game statistics for a single game.
     * @param gameId BGG game ID
     * @return game statistics
     */
    public GameStatsDto getGameStats(String gameId) {
        log.info("Getting stats for game ID: {}", gameId);

        // Check cache first
        Optional<GameStats> cachedStats = gameStatsRepository.findByGameId(gameId);
        if (cachedStats.isPresent() && isStatsComplete(cachedStats.get())) {
            log.info("Found complete cached stats for game ID: {}", gameId);
            cachedStats.get().incrementCacheHits();
            gameStatsRepository.save(cachedStats.get());
            return mapToDto(cachedStats.get());
        }

        // Fetch from BGG API
        try {
            String xmlResponse = bggApiClient.getGameDetails(gameId).block();
            if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                GameStatsDto stats = bggXmlParserService.parseGameStats(xmlResponse);
                if (stats != null) {
                    // Cache the result
                    GameStats gameStats = mapToEntity(stats);
                    gameStats.setCachedAt(LocalDateTime.now());
                    gameStats.setLastUpdated(LocalDateTime.now());
                    gameStats.setCacheHits(1);
                    gameStatsRepository.save(gameStats);

                    log.info("Successfully fetched and cached stats for game ID: {}", gameId);
                    return stats;
                }
            }
        } catch (Exception e) {
            log.error("Error fetching stats for game ID {}: {}", gameId, e.getMessage());
        }

        throw new IllegalArgumentException("Game stats not found for ID: " + gameId);
    }

    /**
     * Get game statistics for multiple games.
     * @param gameIds list of BGG game IDs
     * @return list of game statistics
     */
    public List<GameStatsDto> getMultipleGameStats(List<String> gameIds) {
        log.info("Getting stats for {} games", gameIds.size());

        List<GameStatsDto> result = new ArrayList<>();
        List<String> missingGameIds = new ArrayList<>();

        // Check cache for all games
        List<GameStats> cachedStats = gameStatsRepository.findByGameIdIn(gameIds);
        List<String> cachedGameIds = cachedStats.stream()
                .map(GameStats::getGameId)
                .collect(Collectors.toList());

        // Add cached results (only if complete)
        for (GameStats stats : cachedStats) {
            if (isStatsComplete(stats)) {
                stats.incrementCacheHits();
                gameStatsRepository.save(stats);
                result.add(mapToDto(stats));
            } else {
                // Add to missing games if stats are incomplete
                missingGameIds.add(stats.getGameId());
            }
        }

        // Find missing games
        for (String gameId : gameIds) {
            if (!cachedGameIds.contains(gameId)) {
                missingGameIds.add(gameId);
            }
        }

        // Fetch missing games from BGG API
        if (!missingGameIds.isEmpty()) {
            log.info("Fetching {} missing games from BGG API", missingGameIds.size());
            try {
                String gameIdsString = String.join(",", missingGameIds);
                String xmlResponse = bggApiClient.getMultipleGames(gameIdsString).block();

                if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                    List<GameStatsDto> fetchedStats = bggXmlParserService.parseMultipleGameStats(xmlResponse);

                    // Cache the results
                    for (GameStatsDto stats : fetchedStats) {
                        GameStats gameStats = mapToEntity(stats);
                        gameStats.setCachedAt(LocalDateTime.now());
                        gameStats.setLastUpdated(LocalDateTime.now());
                        gameStats.setCacheHits(1);
                        gameStatsRepository.save(gameStats);
                        result.add(stats);
                    }

                    log.info("Successfully fetched and cached stats for {} games", fetchedStats.size());
                }
            } catch (Exception e) {
                log.error("Error fetching multiple game stats: {}", e.getMessage());
            }
        }

        return result;
    }

    /**
     * Get games with extended statistics for a user.
     * @param games list of basic games
     * @return list of games with extended statistics
     */
    public List<GameWithStatsDto> getGamesWithStats(List<Game> games) {
        log.info("Getting games with stats for {} games", games.size());

        List<String> gameIds = games.stream()
                .map(Game::getId)
                .collect(Collectors.toList());

        List<GameStatsDto> statsList = getMultipleGameStats(gameIds);

        return games.stream()
                .map(game -> {
                    GameStatsDto stats = statsList.stream()
                            .filter(s -> s.getGameId().equals(game.getId()))
                            .findFirst()
                            .orElse(null);

                    return GameWithStatsDto.builder()
                            .id(game.getId())
                            .name(game.getName())
                            .yearPublished(game.getYearPublished())
                            .minPlayers(game.getMinPlayers())
                            .maxPlayers(game.getMaxPlayers())
                            .playingTime(game.getPlayingTime())
                            .minAge(game.getMinAge())
                            .description(game.getDescription())
                            .imageUrl(game.getImageUrl())
                            .thumbnailUrl(game.getThumbnailUrl())
                            .bggRating(game.getBggRating())
                            .averageRating(game.getAverageRating())
                            .complexity(game.getComplexity())
                            .ownedBy(game.getOwnedBy())
                            .averageWeight(stats != null ? stats.getAverageWeight() : null)
                            .suggestedNumPlayers(stats != null ? stats.getSuggestedNumPlayers() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private GameStatsDto mapToDto(GameStats entity) {
        if (entity == null) {
            return null;
        }

        return GameStatsDto.builder()
                .gameId(entity.getGameId())
                .name(entity.getName())
                .bggRating(entity.getBggRating())
                .averageRating(entity.getAverageRating())
                .averageWeight(entity.getAverageWeight())
                .suggestedNumPlayers(entity.getSuggestedNumPlayers())
                .build();
    }

    private GameStats mapToEntity(GameStatsDto dto) {
        if (dto == null) {
            return null;
        }

        return GameStats.builder()
                .gameId(dto.getGameId())
                .name(dto.getName())
                .bggRating(dto.getBggRating())
                .averageRating(dto.getAverageRating())
                .averageWeight(dto.getAverageWeight())
                .suggestedNumPlayers(dto.getSuggestedNumPlayers())
                .build();
    }

    private boolean isStatsComplete(GameStats stats) {
        return stats.getBggRating() != null &&
               stats.getAverageRating() != null &&
               stats.getAverageWeight() != null &&
               stats.getSuggestedNumPlayers() != null;
    }
}
