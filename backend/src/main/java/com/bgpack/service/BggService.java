package com.bgpack.service;

import com.bgpack.client.BggApiClient;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.entity.Game;
import com.bgpack.entity.User;
import com.bgpack.entity.UserCollection;
import com.bgpack.entity.UserCollectionId;
import com.bgpack.repository.UserRepository;
import com.bgpack.repository.UserCollectionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class BggService {

    private final BggApiClient bggApiClient;
    private final BggXmlParserService xmlParserService;
    private final BggRateLimiter rateLimiter;
    private final BggApiOptimizationService optimizationService;
    private final GameCacheService gameCacheService;

    public BggService(BggApiClient bggApiClient,
                      BggXmlParserService xmlParserService,
                      BggRateLimiter rateLimiter,
                      BggApiOptimizationService optimizationService,
                      GameCacheService gameCacheService,
                      UserRepository userRepository,
                      UserCollectionRepository userCollectionRepository) {
        this.bggApiClient = bggApiClient;
        this.xmlParserService = xmlParserService;
        this.rateLimiter = rateLimiter;
        this.optimizationService = optimizationService;
        this.gameCacheService = gameCacheService;
    }

    @Cacheable(value = "games", key = "#searchRequest.search")
    public List<Game> getGames(final GameSearchRequest searchRequest) {
        if (searchRequest.getSearch() == null || searchRequest.getSearch().trim().isEmpty()) {
            return new ArrayList<>();
        }

        if (!optimizationService.shouldMakeRequest("search")) {
            return new ArrayList<>();
        }

        rateLimiter.acquire();

        try {
            String xmlResponse = bggApiClient.searchGames(searchRequest.getSearch()).block();
            List<Game> games = xmlParserService.parseSearchResults(xmlResponse);

            optimizationService.recordRequest("search", true);

            List<Game> filteredGames = games.stream()
                    .filter(game -> matchesCriteria(game, searchRequest))
                    .toList();

            filteredGames.forEach(gameCacheService::saveOrUpdateGameCache);

            return filteredGames;
        } catch (Exception e) {
            optimizationService.recordRequest("search", false);
            log.error("Error fetching games: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Transactional
    public List<Game> getCollection(final String username, final boolean excludeExpansions) {
        if (!optimizationService.shouldMakeRequest("collection")) {
            return new ArrayList<>();
        }

        rateLimiter.acquire();

        try {
            String subtype = excludeExpansions ? "boardgame" : null;
            String xmlResponse = bggApiClient.getCollection(username, subtype).block();
            List<Game> games = xmlParserService.parseCollection(xmlResponse);

            optimizationService.recordRequest("collection", true);

//            User user = userRepository.findByUsername(username)
//                    .orElseGet(() -> userRepository.save(User.builder().username(username).build()));

//            List<Game> savedGames = new ArrayList<>();
//            for (Game gameData : games) {
//                Game cachedGame = gameCacheService.saveOrUpdateGameCache(gameData);
//                savedGames.add(cachedGame);
//
//                UserCollectionId collectionId = new UserCollectionId(user.getId(), cachedGame.getId());
//                if (!userCollectionRepository.existsById(collectionId)) {
//                    UserCollection collection = UserCollection.builder()
//                            .id(collectionId)
//                            .user(user)
//                            .game(cachedGame)
//                            .build();
//                    userCollectionRepository.save(collection);
//                }
//            }

//            return savedGames;
            return games;
        } catch (Exception e) {
            optimizationService.recordRequest("collection", false);
            log.error("Error fetching collection for {}: {}", username, e.getMessage());
            return new ArrayList<>();
        }
    }

    private boolean matchesCriteria(final Game game, final GameSearchRequest searchRequest) {
        return matchesPlayerCount(game, searchRequest) &&
                matchesPlayingTime(game, searchRequest) &&
                matchesAge(game, searchRequest) &&
                matchesRating(game, searchRequest) &&
                matchesYear(game, searchRequest);
    }

    private boolean matchesPlayerCount(final Game game, final GameSearchRequest searchRequest) {
        if (searchRequest.getMinPlayers() == null && searchRequest.getMaxPlayers() == null) {
            return true;
        }
        boolean matchesMin = true;
        if (searchRequest.getMinPlayers() != null) {
            matchesMin = game.getMinPlayers() != null && game.getMinPlayers() <= searchRequest.getMinPlayers()
                    && game.getMaxPlayers() != null && game.getMaxPlayers() >= searchRequest.getMinPlayers();
        }
        if (!matchesMin) return false;

        if (searchRequest.getMaxPlayers() != null) {
            return game.getMinPlayers() != null && game.getMinPlayers() <= searchRequest.getMaxPlayers()
                    && game.getMaxPlayers() != null && game.getMaxPlayers() >= searchRequest.getMaxPlayers();
        }
        return true;
    }

    private boolean matchesPlayingTime(final Game game, final GameSearchRequest searchRequest) {
        boolean matchesMinTime = searchRequest.getMinPlayingTime() == null ||
                (game.getPlayingTime() != null && game.getPlayingTime() >= searchRequest.getMinPlayingTime());
        boolean matchesMaxTime = searchRequest.getMaxPlayingTime() == null ||
                (game.getPlayingTime() != null && game.getPlayingTime() <= searchRequest.getMaxPlayingTime());
        return matchesMinTime && matchesMaxTime;
    }

    private boolean matchesAge(final Game game, final GameSearchRequest searchRequest) {
        return searchRequest.getMinAge() == null || (game.getMinAge() != null && game.getMinAge() >= searchRequest.getMinAge());
    }

    private boolean matchesRating(final Game game, final GameSearchRequest searchRequest) {
        return searchRequest.getMinRating() == null ||
                (game.getBggRating() != null && game.getBggRating().doubleValue() >= searchRequest.getMinRating());
    }

    private boolean matchesYear(final Game game, final GameSearchRequest searchRequest) {
        boolean matchesYearFrom = searchRequest.getYearFrom() == null ||
                (game.getYearPublished() != null && game.getYearPublished() >= searchRequest.getYearFrom());
        boolean matchesYearTo = searchRequest.getYearTo() == null ||
                (game.getYearPublished() != null && game.getYearPublished() <= searchRequest.getYearTo());
        return matchesYearFrom && matchesYearTo;
    }
}