package com.bgpack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresetDto {
    private Long id;
    private String presetName;
    /**
     * Stored in JSONB column `filter_criteria`:
     * {
     *   "usernames": [...],
     *   "filters": { ... },
     *   "excludeExpansions": true
     * }
     */
    private Map<String, Object> filterCriteria;
    private ZonedDateTime createdAt;
}

