package com.bgpack.service;

import com.bgpack.dto.GameStatsDto;
import com.bgpack.dto.GameWithStatsDto;
import com.bgpack.entity.Game;
import com.bgpack.repository.UserCollectionRepository;
import com.bgpack.client.BggApiClient;
import com.bgpack.service.BggXmlParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameStatsService {

    private final UserCollectionRepository userCollectionRepository;
    private final BggApiClient bggApiClient;
    private final BggXmlParserService bggXmlParserService;

    public GameStatsDto getGameStats(String gameId) {
        log.info("Getting stats for game ID: {}", gameId);
        try {
            String xmlResponse = bggApiClient.getGameDetails(gameId).block();
            if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                GameStatsDto statsDto = bggXmlParserService.parseGameStats(xmlResponse);
                if (statsDto != null) {
                    log.info("Successfully fetched stats for game ID: {}", gameId);
                    return statsDto;
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
        try {
            String gameIdsString = String.join(",", gameIds);
            String xmlResponse = bggApiClient.getMultipleGames(gameIdsString).block();
            if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                List<GameStatsDto> fetchedStats = bggXmlParserService.parseMultipleGameStats(xmlResponse);
                result.addAll(fetchedStats);
                log.info("Successfully fetched stats for {} games", fetchedStats.size());
            }
        } catch (Exception e) {
            log.error("Error fetching multiple game stats: {}", e.getMessage());
        }
        return result;
    }

    public List<GameWithStatsDto> getGamesWithStats(List<Game> games) {
        log.info("Getting games with stats for {} games", games.size());
        List<String> gameIds = games.stream()
                .map(Game::getBggId)
                .collect(Collectors.toList());
        List<GameStatsDto> statsList = getMultipleGameStats(gameIds);
        return games.stream()
                .map(game -> {
                    GameStatsDto stats = statsList.stream()
                            .filter(s -> s.gameId().equals(game.getBggId()))
                            .findFirst()
                            .orElse(null);

                    List<String> ownedBy = userCollectionRepository.findByGameId(game.getId())
                            .stream()
                            .map(uc -> uc.getUser().getUsername())
                            .collect(Collectors.toList());

                    return new GameWithStatsDto(
                            game.getBggId(),
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
                            ownedBy.isEmpty() ? null : ownedBy,
                            stats != null ? stats.averageWeight() : null,
                            stats != null ? stats.suggestedNumPlayers() : null
                    );
                })
                .collect(Collectors.toList());
    }
}
