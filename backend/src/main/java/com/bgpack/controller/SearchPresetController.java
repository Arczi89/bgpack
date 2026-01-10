package com.bgpack.controller;

import com.bgpack.dto.SaveSearchPresetRequest;
import com.bgpack.dto.SearchPresetDto;
import com.bgpack.entity.Game;
import com.bgpack.service.SearchPresetService;
import com.bgpack.service.GameSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@RestController
@RequestMapping("/api/search-presets")
@RequiredArgsConstructor
@Validated
public class SearchPresetController {

    private final SearchPresetService searchPresetService;

    @PostMapping("/{username}")
    public ResponseEntity<SearchPresetDto> saveSearchPreset(
            @PathVariable @NotBlank final String username,
            @RequestBody @Valid final SaveSearchPresetRequest request) {

        SearchPresetDto savedPreset = searchPresetService.saveSearchPreset(username, request);
        return ResponseEntity.ok(savedPreset);
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<SearchPresetDto>> getUserSearchPresets(
            @PathVariable @NotBlank final String username) {

        List<SearchPresetDto> presets = searchPresetService.getUserSearchPresets(username);
        return ResponseEntity.ok(presets);
    }

    @DeleteMapping("/{username}/{presetId}")
    public ResponseEntity<Void> deleteSearchPreset(
            @PathVariable @NotBlank final String username,
            @PathVariable final Long presetId) {

        searchPresetService.deleteSearchPreset(username, presetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{username}/{presetId}/execute")
    public ResponseEntity<List<Game>> executeSearchPreset(
            @PathVariable @NotBlank final String username,
            @PathVariable final Long presetId) {

        List<Game> games = searchPresetService.executeSearchPreset(username, presetId);
        return ResponseEntity.ok(games);
    }
}