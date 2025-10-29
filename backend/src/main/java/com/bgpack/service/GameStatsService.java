package com.bgpack.service;

import com.bgpack.dto.GameStatsDto;
import com.bgpack.dto.GameWithStatsDto;
import com.bgpack.entity.GameStats;
import com.bgpack.model.Game;
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

    public GameStatsDto getGameStats(String gameId) {
        log.info("Getting stats for game ID: {}", gameId);

        Optional<GameStats> cachedStats = gameStatsRepository.findByGameId(gameId);
        if (cachedStats.isPresent() && isStatsComplete(cachedStats.get())) {
            log.info("Found complete cached stats for game ID: {}", gameId);
            cachedStats.get().incrementCacheHits();
            gameStatsRepository.save(cachedStats.get());
            return mapToDto(cachedStats.get());
        }

        try {
            String xmlResponse = bggApiClient.getGameDetails(gameId).block();
            if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                GameStatsDto stats = bggXmlParserService.parseGameStats(xmlResponse);
                if (stats != null) {
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

    public List<GameStatsDto> getMultipleGameStats(List<String> gameIds) {
        log.info("Getting stats for {} games", gameIds.size());

        List<GameStatsDto> result = new ArrayList<>();
        List<String> missingGameIds = new ArrayList<>();

        List<GameStats> cachedStats = gameStatsRepository.findByGameIdIn(gameIds);
        List<String> cachedGameIds = cachedStats.stream()
                .map(GameStats::getGameId)
                .collect(Collectors.toList());

        for (GameStats stats : cachedStats) {
            if (isStatsComplete(stats)) {
                stats.incrementCacheHits();
                gameStatsRepository.save(stats);
                result.add(mapToDto(stats));
            } else {
                missingGameIds.add(stats.getGameId());
            }
        }

        for (String gameId : gameIds) {
            if (!cachedGameIds.contains(gameId)) {
                missingGameIds.add(gameId);
            }
        }

        if (!missingGameIds.isEmpty()) {
            log.info("Fetching {} missing games from BGG API", missingGameIds.size());
            try {
                String gameIdsString = String.join(",", missingGameIds);
                String xmlResponse = bggApiClient.getMultipleGames(gameIdsString).block();

                if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                    List<GameStatsDto> fetchedStats = bggXmlParserService.parseMultipleGameStats(xmlResponse);

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

    public List<GameWithStatsDto> getGamesWithStats(List<Game> games) {
        log.info("Getting games with stats for {} games", games.size());

        List<String> gameIds = games.stream()
                .map(Game::getId)
                .collect(Collectors.toList());

        List<GameStatsDto> statsList = getMultipleGameStats(gameIds);

        return games.stream()
                .map(game -> {
                    GameStatsDto stats = statsList.stream()
                            .filter(s -> s.gameId().equals(game.getId()))
                            .findFirst()
                            .orElse(null);

                    return new GameWithStatsDto(
                            game.getId(),
                            game.getName(),
                            game.getYearPublished(),
                            game.getMinPlayers(),
                            game.getMaxPlayers(),
                            game.getPlayingTime(),
                            game.getMinAge(),
                            game.getDescription(),
                            game.getImageUrl(),
                            game.getThumbnailUrl(),
                            game.getBggRating(),
                            game.getAverageRating(),
                            game.getComplexity(),
                            game.getOwnedBy(),
                            stats != null ? stats.averageWeight() : null,
                            stats != null ? stats.suggestedNumPlayers() : null
                    );
                })
                .collect(Collectors.toList());
    }

    private GameStatsDto mapToDto(final GameStats entity) {
        if (entity == null) {
            return null;
        }

        return new GameStatsDto(
                entity.getGameId(),
                entity.getName(),
                entity.getBggRating(),
                entity.getAverageRating(),
                entity.getAverageWeight(),
                entity.getSuggestedNumPlayers()
        );
    }

    private GameStats mapToEntity(final GameStatsDto dto) {
        if (dto == null) {
            return null;
        }

        return GameStats.builder()
                .gameId(dto.gameId())
                .name(dto.name())
                .bggRating(dto.bggRating())
                .averageRating(dto.averageRating())
                .averageWeight(dto.averageWeight())
                .suggestedNumPlayers(dto.suggestedNumPlayers())
                .build();
    }

    private boolean isStatsComplete(GameStats stats) {
        return stats.getBggRating() != null &&
               stats.getAverageRating() != null &&
               stats.getAverageWeight() != null &&
               stats.getSuggestedNumPlayers() != null;
    }
}
