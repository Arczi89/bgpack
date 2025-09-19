package com.bgpack.controller;

import com.bgpack.dto.GameDto;
import com.bgpack.service.BggService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class BggController {

    private final BggService bggService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Hello from Backend - BGPack API is running!");
    }

    @GetMapping("/games")
    public ResponseEntity<List<GameDto>> getGames(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minPlayers,
            @RequestParam(required = false) Integer maxPlayers,
            @RequestParam(required = false) Integer minPlayingTime,
            @RequestParam(required = false) Integer maxPlayingTime,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Double minRating) {
        
        List<GameDto> mockGames = bggService.getMockGames();
        return ResponseEntity.ok(mockGames);
    }

    @GetMapping("/games/{id}")
    public ResponseEntity<GameDto> getGameById(@PathVariable String id) {
        GameDto mockGame = bggService.getMockGameById(id);
        return ResponseEntity.ok(mockGame);
    }
}
