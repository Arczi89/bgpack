package com.bgpack.service;

import com.bgpack.client.BggApiClient;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.model.Game;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
public class BggService {

    private final BggApiClient bggApiClient;
    private final BggXmlParserService xmlParserService;
    private final BggRateLimiter rateLimiter;
    private final BggApiOptimizationService optimizationService;

    public BggService(BggApiClient bggApiClient,
                     BggXmlParserService xmlParserService,
                     BggRateLimiter rateLimiter,
                     BggApiOptimizationService optimizationService) {
        this.bggApiClient = bggApiClient;
        this.xmlParserService = xmlParserService;
        this.rateLimiter = rateLimiter;
        this.optimizationService = optimizationService;
    }

    @Cacheable(value = "games", key = "#searchRequest.toString()")
    public List<Game> getGames(final GameSearchRequest searchRequest) {
        log.info("Searching games with criteria: {}", searchRequest);

        if (searchRequest.getSearch() != null && !searchRequest.getSearch().trim().isEmpty()) {
            if (optimizationService.shouldMakeRequest("search")) {
                try {
                    rateLimiter.acquire();
                    List<Game> bggGames = searchGamesFromBgg(searchRequest.getSearch());
                    optimizationService.recordRequest("search", true);
                    if (!bggGames.isEmpty()) {
                        return bggGames.stream()
                                .filter(game -> matchesSearch(game, searchRequest))
                                .toList();
                    }
                } catch (Exception e) {
                    optimizationService.recordRequest("search", false);
                    log.warn("Failed to search BGG API: {}", e.getMessage());
                }
            } else {
                log.info("Skipping BGG API search due to optimization rules");
            }
        }

        log.warn("BGG API optimization rules prevent searching - returning empty list");
        return new ArrayList<>();
    }

    @Cacheable(value = "game", key = "#id")
    public Game getGameById(final String id) {
        log.info("Getting game by id: {}", id);

        if (optimizationService.shouldMakeRequest("gameDetails")) {
            try {
                rateLimiter.acquire();
                String xmlResponse = bggApiClient.getGameDetails(id).block();
                optimizationService.recordRequest("gameDetails", true);
                if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                    return xmlParserService.parseGameDetails(xmlResponse);
                }
            } catch (Exception e) {
                optimizationService.recordRequest("gameDetails", false);
                log.warn("Failed to fetch from BGG API: {}", e.getMessage());
            }
        } else {
            log.info("Skipping BGG API game details due to optimization rules");
        }

        throw new IllegalArgumentException("Game not found with id: " + id);
    }

    public List<Game> getCollection(final String username) {
        return getCollection(username, false);
    }

    /**
     * Get collection with retry mechanism for better reliability.
     * @param username BGG username
     * @param excludeExpansions whether to exclude expansions
     * @param maxRetries maximum number of retry attempts
     * @return list of owned games
     */
    private List<Game> getCollectionWithRetry(final String username, final boolean excludeExpansions, final int maxRetries) {
        int attempts = 0;
        long delayMs = 2000;

        while (attempts < maxRetries) {
            attempts++;
            log.info("Attempting to fetch collection for user '{}' (attempt {}/{})", username, attempts, maxRetries);

            try {
                rateLimiter.acquire();
                String xmlResponse;

                if (excludeExpansions) {
                    xmlResponse = bggApiClient.getCollection(username, "boardgame").block();
                } else {
                    xmlResponse = bggApiClient.getCollection(username).block();
                }

                log.info("Raw XML response length for user '{}': {}", username, xmlResponse != null ? xmlResponse.length() : 0);

                if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                    List<Game> games = xmlParserService.parseCollection(xmlResponse);

                    if (games != null && !games.isEmpty()) {
                        games.forEach(game -> game.setOwnedBy(List.of(username)));
                        optimizationService.recordRequest("collection", true);
                        log.info("Successfully fetched {} games for user '{}'", games.size(), username);
                        return games;
                    } else {
                        log.info("User '{}' has an empty collection (no games found)", username);
                        optimizationService.recordRequest("collection", true);
                        return new ArrayList<>();
                    }
                } else {
                    log.warn("Empty XML response for user '{}' (attempt {}/{})", username, attempts, maxRetries);
                    if (attempts < maxRetries) {
                        log.info("Retrying in {}ms...", delayMs);
                        Thread.sleep(delayMs);
                        delayMs *= 2; // Exponential backoff
                        continue;
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch collection for user '{}' (attempt {}/{}): {}",
                         username, attempts, maxRetries, e.getMessage());

                if (attempts < maxRetries) {
                    log.info("Retrying in {}ms...", delayMs);
                    try {
                        Thread.sleep(delayMs);
                        delayMs *= 2; // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    continue;
                } else {
                    optimizationService.recordRequest("collection", false);
                    log.error("All retry attempts failed for user '{}'", username);
                }
            }
        }

        log.warn("Returning empty collection for user '{}' after {} failed attempts", username, maxRetries);
        return new ArrayList<>();
    }

    public List<Game> getCollection(final String username, final boolean excludeExpansions) {
        if (optimizationService.shouldMakeRequest("collection")) {
            return getCollectionWithRetry(username, excludeExpansions, 3);
        }

        log.warn("BGG API optimization rules prevent fetching collection for user '{}' - returning empty list", username);
        return new ArrayList<>();
    }

    private List<Game> searchGamesFromBgg(final String query) {
        try {
            String xmlResponse = bggApiClient.searchGames(query).block();
            if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                return xmlParserService.parseSearchResults(xmlResponse);
            }
        } catch (Exception e) {
            log.error("Error searching BGG API: {}", e.getMessage());
        }
        return List.of();
    }


    private boolean matchesSearch(final Game game, final GameSearchRequest searchRequest) {
        return matchesSearchText(game, searchRequest) &&
               matchesPlayerCount(game, searchRequest) &&
               matchesPlayingTime(game, searchRequest) &&
               matchesAge(game, searchRequest) &&
               matchesRating(game, searchRequest) &&
               matchesYear(game, searchRequest);
    }

    private boolean matchesSearchText(final Game game, final GameSearchRequest searchRequest) {
        if (searchRequest.getSearch() == null || searchRequest.getSearch().trim().isEmpty()) {
            return true;
        }
        String search = searchRequest.getSearch().toLowerCase();
        return game.getName().toLowerCase().contains(search) ||
               game.getDescription().toLowerCase().contains(search);
    }

    private boolean matchesPlayerCount(final Game game, final GameSearchRequest searchRequest) {
        if (searchRequest.getMinPlayers() != null && searchRequest.getMaxPlayers() != null) {
            return matchesPlayerRange(game, searchRequest);
        } else if (searchRequest.getMinPlayers() != null) {
            return matchesMinPlayers(game, searchRequest);
        } else if (searchRequest.getMaxPlayers() != null) {
            return matchesMaxPlayers(game, searchRequest);
        }
        return true;
    }

    private boolean matchesPlayerRange(final Game game, final GameSearchRequest searchRequest) {
        if (Boolean.TRUE.equals(searchRequest.getExactPlayerFilter())) {
            return game.getMinPlayers().equals(searchRequest.getMinPlayers()) &&
                   game.getMaxPlayers().equals(searchRequest.getMaxPlayers());
        } else {
            return !(game.getMinPlayers() > searchRequest.getMaxPlayers() ||
                     game.getMaxPlayers() < searchRequest.getMinPlayers());
        }
    }

    private boolean matchesMinPlayers(final Game game, final GameSearchRequest searchRequest) {
        if (Boolean.TRUE.equals(searchRequest.getExactPlayerFilter())) {
            return game.getMinPlayers().equals(searchRequest.getMinPlayers());
        } else {
            return game.getMaxPlayers() >= searchRequest.getMinPlayers();
        }
    }

    private boolean matchesMaxPlayers(final Game game, final GameSearchRequest searchRequest) {
        if (Boolean.TRUE.equals(searchRequest.getExactPlayerFilter())) {
            return game.getMaxPlayers().equals(searchRequest.getMaxPlayers());
        } else {
            return game.getMaxPlayers() <= searchRequest.getMaxPlayers();
        }
    }

    private boolean matchesPlayingTime(final Game game, final GameSearchRequest searchRequest) {
        boolean matchesMinTime = searchRequest.getMinPlayingTime() == null ||
                                 game.getPlayingTime() >= searchRequest.getMinPlayingTime();
        boolean matchesMaxTime = searchRequest.getMaxPlayingTime() == null ||
                                 game.getPlayingTime() <= searchRequest.getMaxPlayingTime();
        return matchesMinTime && matchesMaxTime;
    }

    private boolean matchesAge(final Game game, final GameSearchRequest searchRequest) {
        return searchRequest.getMinAge() == null || game.getMinAge() >= searchRequest.getMinAge();
    }

    private boolean matchesRating(final Game game, final GameSearchRequest searchRequest) {
        return searchRequest.getMinRating() == null || game.getBggRating() >= searchRequest.getMinRating();
    }

    private boolean matchesYear(final Game game, final GameSearchRequest searchRequest) {
        boolean matchesYearFrom = searchRequest.getYearFrom() == null ||
                                  game.getYearPublished() >= searchRequest.getYearFrom();
        boolean matchesYearTo = searchRequest.getYearTo() == null ||
                                game.getYearPublished() <= searchRequest.getYearTo();
        return matchesYearFrom && matchesYearTo;
    }

}
