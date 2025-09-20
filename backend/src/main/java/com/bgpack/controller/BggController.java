package com.bgpack.controller;

import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.service.BggService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class BggController {

    private final BggService bggService;

    /**
     * Test endpoint to verify API is running.
     * @return Hello message
     */
    @GetMapping("/test")
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

    @GetMapping("/games/{id}")
    public ResponseEntity<GameDto> getGameById(@PathVariable @NotBlank final String id) {
        GameDto game = bggService.getGameById(id);
        return ResponseEntity.ok(game);
    }

    /**
     * Get owned games for a specific user.
     * @param username BGG username
     * @return list of owned games
     */
    @GetMapping("/own/{username}")
    public ResponseEntity<List<GameDto>> getOwnedGames(@PathVariable @NotBlank final String username) {
        List<GameDto> games = bggService.getCollection(username);
        return ResponseEntity.ok(games);
    }
}
