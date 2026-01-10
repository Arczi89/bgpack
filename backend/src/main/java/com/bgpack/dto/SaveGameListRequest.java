package com.bgpack.dto;

import com.bgpack.entity.Game;
import com.bgpack.model.GameFilters;
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
    private List<Game> games;

    private GameFilters filters;
    private boolean exactPlayerFilter;
}
