package com.bgpack.service;

import com.bgpack.client.BggApiClient;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.entity.Game;
import com.bgpack.entity.User;
import com.bgpack.entity.UserCollection;
import com.bgpack.entity.UserCollectionId;
import com.bgpack.repository.GameRepository;
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
    private final UserRepository userRepository;
    private final UserCollectionRepository userCollectionRepository;
    private final GameRepository gameRepository;

    public BggService(BggApiClient bggApiClient,
                      BggXmlParserService xmlParserService,
                      BggRateLimiter rateLimiter,
                      BggApiOptimizationService optimizationService,
                      GameCacheService gameCacheService,
                      UserRepository userRepository,
                      UserCollectionRepository userCollectionRepository, GameRepository gameRepository) {
        this.bggApiClient = bggApiClient;
        this.xmlParserService = xmlParserService;
        this.rateLimiter = rateLimiter;
        this.optimizationService = optimizationService;
        this.gameCacheService = gameCacheService;
        this.userRepository = userRepository;
        this.userCollectionRepository = userCollectionRepository;
        this.gameRepository = gameRepository;
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
            List<Game> games = xmlParserService.parseCollection(xmlResponse);

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
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.save(new User(username)));

        if (!user.isCacheStale()) {
            List<UserCollection> dbCollection = userCollectionRepository.findAllByUser(user);
            if (!dbCollection.isEmpty()) {
                log.info("Returning {} games from local cache for user: {}", dbCollection.size(), username);
                return dbCollection.stream()
                        .map(UserCollection::getGame)
                        .toList();
            }
        }

        if (!optimizationService.shouldMakeRequest("collection")) {
            return new ArrayList<>();
        }

        rateLimiter.acquire();

        try {
            log.info("Fetching collection from BGG for user: {}", username);
            String subtype = excludeExpansions ? "boardgame" : null;
            String xmlResponse = bggApiClient.getCollection(username, subtype).block();

            List<Game> gamesFromApi = xmlParserService.parseCollection(xmlResponse);

            List<Game> synchronizedGames = new ArrayList<>();
            for (Game gameData : gamesFromApi) {
                Game persistedGame = gameCacheService.saveOrUpdateGameCache(gameData);
                updateUserCollectionRelation(user, persistedGame, gameData);

                synchronizedGames.add(persistedGame);
            }

            user.updateSyncTimestamp();
            userRepository.save(user);

            optimizationService.recordRequest("collection", true);
            return synchronizedGames;

        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("202")) {
                log.info("BGG is processing collection for {}, request queued.", username);
            } else {
                optimizationService.recordRequest("collection", false);
                log.info("BGG error request collection for {}, {}.", username, e.getMessage());
            }
            return new ArrayList<>();
        }
    }

    private void updateUserCollectionRelation(User user, Game game, Game apiData) {
        UserCollectionId id = new UserCollectionId(user.getId(), game.getId());

        UserCollection relation = userCollectionRepository.findById(id)
                .orElse(UserCollection.builder()
                        .id(id)
                        .user(user)
                        .game(game)
                        .build());

        relation.setStatus(UserCollection.CollectionStatus.OWNED);
        relation.setRating(apiData.getRank());

        userCollectionRepository.save(relation);
    }

    @Transactional
    public void syncGameDetails(String username) {
        String xmlResponse = bggApiClient.getCollection(username, null).block();
        List<Game> gamesFromCollection = xmlParserService.parseCollection(xmlResponse);

        if (gamesFromCollection.isEmpty()) return;

        List<Game> savedGames = gameRepository.saveAll(gamesFromCollection);
        List<String> bggIds = savedGames.stream()
                .map(Game::getBggId)
                .toList();

        String idsParam = String.join(",", bggIds); //TODO: test how much ids can be fetch at once

        String thingsXml = bggApiClient.getThings(idsParam).block();

        enrichAndSaveGames(xmlParserService.parseThings(thingsXml));

        log.info("Synchronization completed for user: {}", username);
    }

    private void enrichAndSaveGames(List<Game> detailedData) {
        for (Game detailed : detailedData) {
            gameRepository.findByBggId(detailed.getBggId()).ifPresent(existing -> {
                existing.setComplexity(detailed.getComplexity());
                existing.setDescription(detailed.getDescription());
            });
        }
        gameRepository.saveAll(detailedData);
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