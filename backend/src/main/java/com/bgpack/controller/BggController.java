package com.bgpack.controller;

import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.service.BggService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class BggController {

    private final BggService bggService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hello from Backend - BGPack API is running!");
    }

    @GetMapping("/games")
    public ResponseEntity<List<GameDto>> getGames(@Valid GameSearchRequest searchRequest) {
        List<GameDto> games = bggService.getGames(searchRequest);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/games/{id}")
    public ResponseEntity<GameDto> getGameById(@PathVariable @NotBlank String id) {
        GameDto game = bggService.getGameById(id);
        return ResponseEntity.ok(game);
    }

    @GetMapping("/own/{username}")
    public ResponseEntity<List<GameDto>> getOwnedGames(@PathVariable @NotBlank String username) {
        List<GameDto> games = bggService.getCollection(username);
        return ResponseEntity.ok(games);
    }
}
