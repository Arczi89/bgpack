package com.bgpack.service;

import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameSearchRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class BggService {

    public List<GameDto> getGames(GameSearchRequest searchRequest) {
        log.info("Searching games with criteria: {}", searchRequest);

        List<GameDto> allGames = getMockGames();

        // Apply filters
        return allGames.stream()
                .filter(game -> matchesSearch(game, searchRequest))
                .toList();
    }

    public GameDto getGameById(String id) {
        log.info("Getting game by id: {}", id);

        return getMockGames().stream()
                .filter(game -> game.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Game not found with id: " + id));
    }

    private List<GameDto> getMockGames() {
        log.info("Returning mock games data");

        return Arrays.asList(
            GameDto.builder()
                .id("1")
                .name("Catan")
                .yearPublished(1995)
                .minPlayers(3)
                .maxPlayers(4)
                .playingTime(60)
                .minAge(10)
                .description("Klasyczna gra strategiczna o budowaniu osad i miast na wyspie Catan. Gracze zbierają surowce, handlują i budują osady, miasta i drogi.")
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
                .description("Gra o budowaniu tras kolejowych przez Amerykę Północną. Gracze zbierają karty wagonów i budują trasy między miastami.")
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
                .description("Gra o ptakach, w której gracze budują rezerwaty przyrody, przyciągają ptaki i zdobywają punkty za różne strategie.")
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
                .description("Gra o układaniu płytek w stylu portugalskich azulejos. Gracze wybierają i układają kolorowe płytki na swoich planszach.")
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
                .description("Epicka gra kooperacyjna w świecie fantasy. Gracze wcielają się w poszukiwaczy przygód i eksplorują lochy.")
                .bggRating(8.8)
                .averageRating(8.8)
                .complexity(4.0)
                .build()
        );
    }

    private boolean matchesSearch(GameDto game, GameSearchRequest searchRequest) {
        // Search by name or description
        if (searchRequest.getSearch() != null && !searchRequest.getSearch().trim().isEmpty()) {
            String search = searchRequest.getSearch().toLowerCase();
            if (!game.getName().toLowerCase().contains(search) &&
                !game.getDescription().toLowerCase().contains(search)) {
                return false;
            }
        }

        // Filter by players
        if (searchRequest.getMinPlayers() != null && game.getMinPlayers() < searchRequest.getMinPlayers()) {
            return false;
        }
        if (searchRequest.getMaxPlayers() != null && game.getMaxPlayers() > searchRequest.getMaxPlayers()) {
            return false;
        }

        // Filter by playing time
        if (searchRequest.getMinPlayingTime() != null && game.getPlayingTime() < searchRequest.getMinPlayingTime()) {
            return false;
        }
        if (searchRequest.getMaxPlayingTime() != null && game.getPlayingTime() > searchRequest.getMaxPlayingTime()) {
            return false;
        }

        // Filter by age
        if (searchRequest.getMinAge() != null && game.getMinAge() < searchRequest.getMinAge()) {
            return false;
        }

        // Filter by rating
        if (searchRequest.getMinRating() != null && game.getBggRating() < searchRequest.getMinRating()) {
            return false;
        }

        // Filter by year
        if (searchRequest.getYearFrom() != null && game.getYearPublished() < searchRequest.getYearFrom()) {
            return false;
        }
        if (searchRequest.getYearTo() != null && game.getYearPublished() > searchRequest.getYearTo()) {
            return false;
        }

        return true;
    }
}
