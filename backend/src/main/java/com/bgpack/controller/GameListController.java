package com.bgpack.controller;

import com.bgpack.dto.GameListDto;
import com.bgpack.dto.SaveGameListRequest;
import com.bgpack.service.GameListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@RestController
@RequestMapping("/api/game-lists")
@RequiredArgsConstructor
@Validated
public class GameListController {

    private final GameListService gameListService;

    /**
     * Save a new game list for a user.
     * @param username BGG username
     * @param request game list data to save
     * @return saved game list
     */
    @PostMapping("/{username}")
    public ResponseEntity<GameListDto> saveGameList(
            @PathVariable @NotBlank final String username,
            @RequestBody @Valid final SaveGameListRequest request) {
        GameListDto savedList = gameListService.saveGameList(username, request);
        return ResponseEntity.ok(savedList);
    }

    /**
     * Get all game lists for a specific user.
     * @param username BGG username
     * @return list of user's game lists
     */
    @GetMapping("/{username}")
    public ResponseEntity<List<GameListDto>> getUserGameLists(
            @PathVariable @NotBlank final String username) {
        List<GameListDto> gameLists = gameListService.getUserGameLists(username);
        return ResponseEntity.ok(gameLists);
    }

    /**
     * Delete a specific game list.
     * @param username BGG username
     * @param gameListId ID of the game list to delete
     * @return no content response
     */
    @DeleteMapping("/{username}/{gameListId}")
    public ResponseEntity<Void> deleteGameList(
            @PathVariable @NotBlank final String username,
            @PathVariable @NotBlank final String gameListId) {
        gameListService.deleteGameList(username, gameListId);
        return ResponseEntity.noContent().build();
    }
}
