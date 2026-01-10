package com.bgpack.service;

import com.bgpack.dto.SaveSearchPresetRequest;
import com.bgpack.dto.SearchPresetDto;
import com.bgpack.entity.Game;
import com.bgpack.entity.SearchPreset;
import com.bgpack.entity.User;
import com.bgpack.repository.SearchPresetRepository;
import com.bgpack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchPresetService {

    private final SearchPresetRepository searchPresetRepository;
    private final UserRepository userRepository;
    private final GameSearchService gameSearchService;

    @Transactional
    public SearchPresetDto saveSearchPreset(String username, SaveSearchPresetRequest request) {
        log.info("Saving search preset '{}' for user '{}'", request.getPresetName(), username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        SearchPreset preset = SearchPreset.builder()
                .user(user)
                .presetName(request.getPresetName())
                .filterCriteria(request.getFilterCriteria())
                .build();

        SearchPreset savedPreset = searchPresetRepository.save(preset);

        log.info("Successfully saved search preset with ID: {} for user '{}'",
                savedPreset.getId(), username);

        return mapToDto(savedPreset);
    }

    public List<SearchPresetDto> getUserSearchPresets(String username) {
        log.info("Getting search presets for user '{}'", username);

        User user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        List<SearchPreset> presets = searchPresetRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        log.info("Found {} search presets for user '{}'", presets.size(), username);
        return presets.stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public void deleteSearchPreset(String username, Long presetId) {
        log.info("Deleting search preset {} for user '{}'", presetId, username);

        SearchPreset preset = searchPresetRepository.findById(presetId)
                .orElseThrow(() -> new IllegalArgumentException("Search preset not found: " + presetId));

        if (!preset.getUser().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to delete this preset");
        }

        searchPresetRepository.delete(preset);
        log.info("Successfully deleted search preset: {} for user '{}'", presetId, username);
    }

    public List<Game> executeSearchPreset(String username, Long presetId) {
        log.info("Executing search preset {} for user '{}'", presetId, username);

        SearchPreset preset = searchPresetRepository.findById(presetId)
                .orElseThrow(() -> new IllegalArgumentException("Search preset not found: " + presetId));

        if (!preset.getUser().getUsername().equals(username)) {
            throw new IllegalArgumentException("Not authorized to access this preset");
        }

        List<Game> games = gameSearchService.searchWithCriteria(preset.getFilterCriteria());

        log.info("Search preset '{}' returned {} games", preset.getPresetName(), games.size());
        return games;
    }

    private SearchPresetDto mapToDto(SearchPreset preset) {
        return SearchPresetDto.builder()
                .id(preset.getId())
                .presetName(preset.getPresetName())
                .username(preset.getUser().getUsername())
                .filterCriteria(preset.getFilterCriteria())
                .createdAt(preset.getCreatedAt())
                .build();
    }
}