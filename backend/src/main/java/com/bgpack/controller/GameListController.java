package com.bgpack.controller;

import com.bgpack.dto.SaveGameListRequest;
import com.bgpack.model.GameList;
import com.bgpack.service.GameListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * REST controller for game list management.
 * Handles HTTP requests for saving, retrieving, and deleting game lists.
 * Returns GameList entities directly - Jackson serializes them to JSON automatically.
 * This follows Spring Boot convention: @RestController + @Document classes work seamlessly.
 */
@RestController
@RequestMapping("/api/game-lists")
@RequiredArgsConstructor
@Validated
public class GameListController {

    private final GameListService gameListService;

    /**
     * Save a new game list.
     *
     * @param username BGG username
     * @param request validated request containing list details
     * @return saved game list (auto-serialized to JSON by Jackson)
     */
    @PostMapping("/{username}")
    public ResponseEntity<GameList> saveGameList(
            @PathVariable @NotBlank final String username,
            @RequestBody @Valid final SaveGameListRequest request) {

        final GameList savedList = gameListService.saveGameList(username, request);
        return ResponseEntity.ok(savedList);
    }

    /**
     * Get all game lists for a user.
     *
     * @param username BGG username
     * @return list of game lists (auto-serialized to JSON)
     */
    @GetMapping("/{username}")
    public ResponseEntity<List<GameList>> getUserGameLists(
            @PathVariable @NotBlank final String username) {

        final List<GameList> gameLists = gameListService.getUserGameLists(username);
        return ResponseEntity.ok(gameLists);
    }

    /**
     * Delete a specific game list.
     *
     * @param username BGG username
     * @param gameListId ID of the game list to delete
     * @return 204 No Content on success
     */
    @DeleteMapping("/{username}/{gameListId}")
    public ResponseEntity<Void> deleteGameList(
            @PathVariable @NotBlank final String username,
            @PathVariable @NotBlank final String gameListId) {

        gameListService.deleteGameList(username, gameListId);
        return ResponseEntity.noContent().build();
    }
}
