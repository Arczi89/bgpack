package com.bgpack.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavePresetRequest {

    @NotBlank(message = "Preset name is required")
    @Size(min = 1, max = 50, message = "Preset name must be between 1 and 50 characters")
    private String presetName;

    @NotNull(message = "Criteria is required")
    @Valid
    private PresetCriteriaDto criteria;
}

