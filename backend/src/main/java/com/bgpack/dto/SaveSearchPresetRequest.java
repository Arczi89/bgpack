package com.bgpack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveSearchPresetRequest {

    @NotBlank(message = "Preset name is required")
    @Size(max = 100, message = "Preset name cannot exceed 100 characters")
    private String presetName;

    @NotNull(message = "Filter criteria are required")
    private Map<String, Object> filterCriteria;
}