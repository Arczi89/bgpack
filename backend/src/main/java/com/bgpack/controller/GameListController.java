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

@RestController
@RequestMapping("/api/game-lists")
@RequiredArgsConstructor
@Validated
public class GameListController {

    private final GameListService gameListService;

    @PostMapping("/{username}")
    public ResponseEntity<GameList> saveGameList(
            @PathVariable @NotBlank final String username,
            @RequestBody @Valid final SaveGameListRequest request) {
        final GameList savedList = gameListService.saveGameList(username, request);
        return ResponseEntity.ok(savedList);
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<GameList>> getUserGameLists(
            @PathVariable @NotBlank final String username) {
        final List<GameList> gameLists = gameListService.getUserGameLists(username);
        return ResponseEntity.ok(gameLists);
    }

    @DeleteMapping("/{username}/{gameListId}")
    public ResponseEntity<Void> deleteGameList(
            @PathVariable @NotBlank final String username,
            @PathVariable @NotBlank final String gameListId) {
        gameListService.deleteGameList(username, gameListId);
        return ResponseEntity.noContent().build();
    }
}
