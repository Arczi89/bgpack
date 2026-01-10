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
public class SearchPresetDto {
    private Long id;
    private String presetName;
    private String username;
    private Map<String, Object> filterCriteria;
    private ZonedDateTime createdAt;
}