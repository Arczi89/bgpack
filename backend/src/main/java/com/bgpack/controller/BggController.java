
package com.bgpack.controller;

import com.bgpack.dto.GameSearchRequest;
import com.bgpack.entity.Game;
import com.bgpack.service.BggApiOptimizationService;
import com.bgpack.service.BggService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    private final BggApiOptimizationService optimizationService;

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

    @GetMapping("/games/user/{username}")
    public ResponseEntity<List<Game>> getOwnedGamesWithStats(
            @PathVariable @NotBlank final String username,
            @RequestParam(defaultValue = "false") final boolean excludeExpansions) {
        List<Game> games = bggService.getCollection(username, excludeExpansions);
        return ResponseEntity.ok(games);
    }

    @PostMapping("/bgg/reset-cache/{endpoint}")
    public ResponseEntity<String> resetCircuitBreaker(@PathVariable String endpoint) {
        optimizationService.resetCircuitBreaker(endpoint);
        return ResponseEntity.ok("Circuit breaker reset for: " + endpoint);
    }
}