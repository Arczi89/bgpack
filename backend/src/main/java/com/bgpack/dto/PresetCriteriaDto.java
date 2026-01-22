package com.bgpack.dto;

import com.bgpack.model.GameFilters;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresetCriteriaDto {
    private List<String> usernames;
    private GameFilters filters;
    private boolean excludeExpansions;
}

