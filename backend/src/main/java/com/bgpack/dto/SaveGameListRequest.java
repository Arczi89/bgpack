package com.bgpack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveGameListRequest {
    @NotBlank(message = "List name is required")
    private String listName;

    @NotEmpty(message = "Usernames list cannot be empty")
    private List<String> usernames;

    @NotEmpty(message = "Games list cannot be empty")
    private List<GameDto> games;

    private GameFilters filters;
    private boolean exactPlayerFilter;
}
