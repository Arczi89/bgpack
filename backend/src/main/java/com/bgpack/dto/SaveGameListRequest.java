package com.bgpack.dto;

import com.bgpack.model.Game;
import com.bgpack.model.GameFilters;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Request DTO for saving a game list.
 * Kept separate from GameList entity because it has validation annotations
 * and different business rules (no ID, timestamps generated on server).
 * This follows Spring Boot best practice: separate DTOs when validation or
 * transformation logic differs from the domain model.
 */
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
