package com.bgpack.controller;

import com.bgpack.dto.PresetDto;
import com.bgpack.dto.SavePresetRequest;
import com.bgpack.service.PresetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/presets")
@RequiredArgsConstructor
@Validated
public class PresetController {

    private final PresetService presetService;

    @PostMapping
    public ResponseEntity<PresetDto> savePreset(@RequestBody @Valid SavePresetRequest request) {
        return ResponseEntity.ok(presetService.saveGlobalPreset(request));
    }

    @GetMapping
    public ResponseEntity<List<PresetDto>> getPresets() {
        return ResponseEntity.ok(presetService.getGlobalPresets());
    }
}

