
package com.bgpack.controller;

import com.bgpack.dto.GameSearchRequest;
import com.bgpack.dto.GameStatsDto;
import com.bgpack.dto.GameWithStatsDto;
import com.bgpack.entity.Game;
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

    @GetMapping("/test")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hello from Backend - BGPack API is running!");
    }

    @GetMapping("/games")
    public ResponseEntity<List<Game>> getGames(@Valid final GameSearchRequest searchRequest) {
        List<Game> games = bggService.getGames(searchRequest);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/own/{username}")
    public ResponseEntity<List<Game>> getOwnedGames(
            @PathVariable @NotBlank final String username,
            @RequestParam(defaultValue = "false") final boolean excludeExpansions) {
        List<Game> games = bggService.getCollection(username, excludeExpansions);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/games/{gameId}/stats")
    public ResponseEntity<GameStatsDto> getGameStats(
            @PathVariable @NotBlank final String gameId) {
        GameStatsDto stats = gameStatsService.getGameStats(gameId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/own/{username}/with-stats")
    public ResponseEntity<List<GameWithStatsDto>> getOwnedGamesWithStats(
            @PathVariable @NotBlank final String username,
            @RequestParam(defaultValue = "false") final boolean excludeExpansions) {
        List<Game> games = bggService.getCollection(username, excludeExpansions);
        List<GameWithStatsDto> gamesWithStats = gameStatsService.getGamesWithStats(games);
        return ResponseEntity.ok(gamesWithStats);
    }

    @PostMapping("/games/stats/batch")
    public ResponseEntity<List<GameStatsDto>> getMultipleGameStats(
            @RequestBody @Valid final List<String> gameIds) {
        List<GameStatsDto> stats = gameStatsService.getMultipleGameStats(gameIds);
        return ResponseEntity.ok(stats);
    }
}