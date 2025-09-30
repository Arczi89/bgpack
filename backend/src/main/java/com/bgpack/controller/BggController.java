package com.bgpack.controller;

import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.dto.GameStatsDto;
import com.bgpack.dto.GameWithStatsDto;
import com.bgpack.service.BggService;
import com.bgpack.service.GameStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class BggController {

    private final BggService bggService;
    private final GameStatsService gameStatsService;

    /**
     * Test endpoint to verify API is running.
     * @return Hello message
     */
    @GetMapping("/test")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hello from Backend - BGPack API is running!");
    }

    /**
     * Search for games based on criteria.
     * @param searchRequest search parameters
     * @return list of matching games
     */
    @GetMapping("/games")
    public ResponseEntity<List<GameDto>> getGames(@Valid final GameSearchRequest searchRequest) {
        List<GameDto> games = bggService.getGames(searchRequest);
        return ResponseEntity.ok(games);
    }


    /**
     * Get owned games for a specific user.
     * @param username BGG username
     * @param excludeExpansions whether to exclude expansions
     * @return list of owned games
     */
    @GetMapping("/own/{username}")
    public ResponseEntity<List<GameDto>> getOwnedGames(
            @PathVariable @NotBlank final String username,
            @RequestParam(defaultValue = "false") final boolean excludeExpansions) {
        List<GameDto> games = bggService.getCollection(username, excludeExpansions);
        return ResponseEntity.ok(games);
    }

    /**
     * Get game statistics for a single game.
     * @param gameId BGG game ID
     * @return game statistics
     */
    @GetMapping("/games/{gameId}/stats")
    public ResponseEntity<GameStatsDto> getGameStats(
            @PathVariable @NotBlank final String gameId) {
        GameStatsDto stats = gameStatsService.getGameStats(gameId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get owned games with extended statistics for a specific user.
     * @param username BGG username
     * @param excludeExpansions whether to exclude expansions
     * @return list of owned games with extended statistics
     */
    @GetMapping("/own/{username}/with-stats")
    public ResponseEntity<List<GameWithStatsDto>> getOwnedGamesWithStats(
            @PathVariable @NotBlank final String username,
            @RequestParam(defaultValue = "false") final boolean excludeExpansions) {
        List<GameDto> games = bggService.getCollection(username, excludeExpansions);
        List<GameWithStatsDto> gamesWithStats = gameStatsService.getGamesWithStats(
            games.stream().map(this::mapToEntity).collect(java.util.stream.Collectors.toList()));
        return ResponseEntity.ok(gamesWithStats);
    }

    /**
     * Get game statistics for multiple games.
     * @param gameIds list of BGG game IDs
     * @return list of game statistics
     */
    @PostMapping("/games/stats/batch")
    public ResponseEntity<List<GameStatsDto>> getMultipleGameStats(
            @RequestBody @Valid final List<String> gameIds) {
        List<GameStatsDto> stats = gameStatsService.getMultipleGameStats(gameIds);
        return ResponseEntity.ok(stats);
    }

    private com.bgpack.entity.Game mapToEntity(GameDto dto) {
        return com.bgpack.entity.Game.builder()
                .id(dto.getId())
                .name(dto.getName())
                .yearPublished(dto.getYearPublished())
                .minPlayers(dto.getMinPlayers())
                .maxPlayers(dto.getMaxPlayers())
                .playingTime(dto.getPlayingTime())
                .minAge(dto.getMinAge())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .thumbnailUrl(dto.getThumbnailUrl())
                .bggRating(dto.getBggRating())
                .averageRating(dto.getAverageRating())
                .complexity(dto.getComplexity())
                .averageWeight(dto.getAverageWeight())
                .suggestedNumPlayers(dto.getSuggestedNumPlayers())
                .ownedBy(dto.getOwnedBy())
                .build();
    }
}
