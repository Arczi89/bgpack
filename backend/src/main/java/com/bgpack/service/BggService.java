package com.bgpack.service;

import com.bgpack.client.BggApiClient;
import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameSearchRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

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
    public List<GameDto> getGames(final GameSearchRequest searchRequest) {
        log.info("Searching games with criteria: {}", searchRequest);

        // If search query is provided, try to search BGG API first
        if (searchRequest.getSearch() != null && !searchRequest.getSearch().trim().isEmpty()) {
            if (optimizationService.shouldMakeRequest("search")) {
                try {
                    rateLimiter.acquire();
                    List<GameDto> bggGames = searchGamesFromBgg(searchRequest.getSearch());
                    optimizationService.recordRequest("search", true);
                    if (!bggGames.isEmpty()) {
                        return bggGames.stream()
                                .filter(game -> matchesSearch(game, searchRequest))
                                .toList();
                    }
                } catch (Exception e) {
                    optimizationService.recordRequest("search", false);
                    log.warn("Failed to search BGG API, falling back to mock data: {}", e.getMessage());
                }
            } else {
                log.info("Skipping BGG API search due to optimization rules");
            }
        }

        // Fallback to mock data
        List<GameDto> allGames = getMockGames();
        return allGames.stream()
                .filter(game -> matchesSearch(game, searchRequest))
                .toList();
    }

    @Cacheable(value = "game", key = "#id")
    public GameDto getGameById(final String id) {
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
                log.warn("Failed to fetch from BGG API, falling back to mock data: {}", e.getMessage());
            }
        } else {
            log.info("Skipping BGG API game details due to optimization rules");
        }

        // Fallback to mock data
        return getMockGames().stream()
                .filter(game -> game.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Game not found with id: " + id));
    }

    public List<GameDto> getCollection(final String username) {
        if (optimizationService.shouldMakeRequest("collection")) {
            try {
                rateLimiter.acquire();
                String xmlResponse = bggApiClient.getCollection(username).block();

                if (xmlResponse != null && !xmlResponse.trim().isEmpty()) {
                    List<GameDto> games = xmlParserService.parseCollection(xmlResponse);
                    optimizationService.recordRequest("collection", true);
                    return games;
                } else {
                    optimizationService.recordRequest("collection", false);
                }
            } catch (Exception e) {
                optimizationService.recordRequest("collection", false);
                log.error("Failed to fetch collection from BGG API: {}", e.getMessage(), e);
            }
        }

        return getMockCollection(username);
    }

    private List<GameDto> searchGamesFromBgg(final String query) {
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

    private List<GameDto> getMockGames() {

        return Arrays.asList(
            GameDto.builder()
                .id("1")
                .name("Catan")
                .yearPublished(1995)
                .minPlayers(3)
                .maxPlayers(4)
                .playingTime(60)
                .minAge(10)
                .description("Classic strategy game about building settlements and cities on the island of Catan. " +
                    "Players collect resources, trade, and build settlements, cities, and roads.")
                .bggRating(7.2)
                .averageRating(7.2)
                .complexity(2.3)
                .build(),

            GameDto.builder()
                .id("2")
                .name("Ticket to Ride")
                .yearPublished(2004)
                .minPlayers(2)
                .maxPlayers(5)
                .playingTime(45)
                .minAge(8)
                .description("Game about building railway routes across North America. Players collect train cards and build routes between cities.")
                .bggRating(7.4)
                .averageRating(7.4)
                .complexity(1.9)
                .build(),

            GameDto.builder()
                .id("3")
                .name("Wingspan")
                .yearPublished(2019)
                .minPlayers(1)
                .maxPlayers(5)
                .playingTime(70)
                .minAge(10)
                .description("Game about birds where players build nature reserves, attract birds, and score points for different strategies.")
                .bggRating(8.1)
                .averageRating(8.1)
                .complexity(2.4)
                .build(),

            GameDto.builder()
                .id("4")
                .name("Azul")
                .yearPublished(2017)
                .minPlayers(2)
                .maxPlayers(4)
                .playingTime(45)
                .minAge(8)
                .description("Game about tile-laying in the style of Portuguese azulejos. Players select and arrange colorful tiles on their boards.")
                .bggRating(7.8)
                .averageRating(7.8)
                .complexity(1.8)
                .build(),

            GameDto.builder()
                .id("5")
                .name("Gloomhaven")
                .yearPublished(2017)
                .minPlayers(1)
                .maxPlayers(4)
                .playingTime(120)
                .minAge(14)
                .description("Epic cooperative game in a fantasy world. Players take on the role of adventurers and explore dungeons.")
                .bggRating(8.8)
                .averageRating(8.8)
                .complexity(4.0)
                .build()
        );
    }

    private boolean matchesSearch(final GameDto game, final GameSearchRequest searchRequest) {
        if (searchRequest.getSearch() != null && !searchRequest.getSearch().trim().isEmpty()) {
            String search = searchRequest.getSearch().toLowerCase();
            if (!game.getName().toLowerCase().contains(search)
                && !game.getDescription().toLowerCase().contains(search)) {
                return false;
            }
        }

        if (searchRequest.getMinPlayers() != null && game.getMinPlayers() < searchRequest.getMinPlayers()) {
            return false;
        }
        if (searchRequest.getMaxPlayers() != null && game.getMaxPlayers() > searchRequest.getMaxPlayers()) {
            return false;
        }

        if (searchRequest.getMinPlayingTime() != null && game.getPlayingTime() < searchRequest.getMinPlayingTime()) {
            return false;
        }
        if (searchRequest.getMaxPlayingTime() != null && game.getPlayingTime() > searchRequest.getMaxPlayingTime()) {
            return false;
        }

        if (searchRequest.getMinAge() != null && game.getMinAge() < searchRequest.getMinAge()) {
            return false;
        }

        if (searchRequest.getMinRating() != null && game.getBggRating() < searchRequest.getMinRating()) {
            return false;
        }

        if (searchRequest.getYearFrom() != null && game.getYearPublished() < searchRequest.getYearFrom()) {
            return false;
        }
        if (searchRequest.getYearTo() != null && game.getYearPublished() > searchRequest.getYearTo()) {
            return false;
        }

        return true;
    }

    private List<GameDto> getMockCollection(final String username) {
        if ("arczi89".equals(username)) {
            return List.of(
                GameDto.builder()
                    .id("7")
                    .name("7 Wonders")
                    .yearPublished(2016)
                    .minPlayers(2)
                    .maxPlayers(7)
                    .playingTime(30)
                    .minAge(10)
                    .description("Build your civilization and erect an architectural wonder which will transcend future times.")
                    .bggRating(7.8)
                    .averageRating(7.8)
                    .complexity(2.3)
                    .build(),
                GameDto.builder()
                    .id("31260")
                    .name("Agricola")
                    .yearPublished(2007)
                    .minPlayers(1)
                    .maxPlayers(5)
                    .playingTime(150)
                    .minAge(12)
                    .description("Farm life in the 17th century. You are a farmer in a wooden shack with your spouse and little help.")
                    .bggRating(8.0)
                    .averageRating(8.0)
                    .complexity(3.6)
                    .build(),
                GameDto.builder()
                    .id("230802")
                    .name("Azul")
                    .yearPublished(2017)
                    .minPlayers(2)
                    .maxPlayers(4)
                    .playingTime(45)
                    .minAge(8)
                    .description("Abstract strategy game about decorating the walls of the Royal Palace of Evora.")
                    .bggRating(7.8)
                    .averageRating(7.8)
                    .complexity(1.8)
                    .build(),
                GameDto.builder()
                    .id("2651")
                    .name("Power Grid")
                    .yearPublished(2004)
                    .minPlayers(2)
                    .maxPlayers(6)
                    .playingTime(120)
                    .minAge(12)
                    .description("The objective of Power Grid is to supply the most cities with power when someone's " +
                        "network gains a predetermined size.")
                    .bggRating(7.9)
                    .averageRating(7.9)
                    .complexity(3.3)
                    .build(),
                GameDto.builder()
                    .id("342942")
                    .name("Ankh: Gods of Egypt")
                    .yearPublished(2021)
                    .minPlayers(2)
                    .maxPlayers(5)
                    .playingTime(90)
                    .minAge(14)
                    .description("A strategic area control game set in ancient Egypt where players take on the roles of Egyptian gods.")
                    .bggRating(7.5)
                    .averageRating(7.5)
                    .complexity(3.2)
                    .build()
            );
        }

        return List.of(
            GameDto.builder()
                .id("1")
                .name("Catan")
                .yearPublished(1995)
                .minPlayers(3)
                .maxPlayers(4)
                .playingTime(60)
                .minAge(10)
                .description("Classic strategy game about building settlements and cities on the island of Catan.")
                .bggRating(7.2)
                .averageRating(7.2)
                .complexity(2.3)
                .build()
        );
    }
}
