package com.bgpack.service;

import com.bgpack.dto.PresetCriteriaDto;
import com.bgpack.dto.PresetDto;
import com.bgpack.dto.SavePresetRequest;
import com.bgpack.entity.SearchPreset;
import com.bgpack.repository.SearchPresetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresetService {

    private final SearchPresetRepository searchPresetRepository;

    @Transactional
    public PresetDto saveGlobalPreset(SavePresetRequest request) {
        String presetName = request.getPresetName() == null ? null : request.getPresetName().trim();
        log.info("Saving global preset '{}'", presetName);

        if (presetName == null || presetName.isBlank()) {
            throw new IllegalArgumentException("Preset name is required");
        }

        // Uniqueness (global)
        if (!searchPresetRepository.findByPresetName(presetName).isEmpty()) {
            throw new IllegalArgumentException("Preset o tej nazwie już istnieje");
        }

        PresetCriteriaDto criteria = request.getCriteria();
        if (criteria == null || criteria.getUsernames() == null || criteria.getUsernames().isEmpty()) {
            // DoD: at least one BGG nick required
            throw new IllegalArgumentException("Wpisz przynajmniej jeden nick BGG");
        }

        Map<String, Object> jsonb = new HashMap<>();
        jsonb.put("usernames", criteria.getUsernames());
        jsonb.put("filters", criteria.getFilters());
        jsonb.put("excludeExpansions", criteria.isExcludeExpansions());

        SearchPreset preset = SearchPreset.builder()
                .presetName(presetName)
                .filterCriteria(jsonb)
                .build();

        SearchPreset saved = searchPresetRepository.save(preset);
        return mapToDto(saved);
    }

    public List<PresetDto> getGlobalPresets() {
        return searchPresetRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    private PresetDto mapToDto(SearchPreset preset) {
        return PresetDto.builder()
                .id(preset.getId())
                .presetName(preset.getPresetName())
                .filterCriteria(preset.getFilterCriteria())
                .createdAt(preset.getCreatedAt())
                .build();
    }
}

