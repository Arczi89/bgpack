package com.bgpack.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSearchRequest {

    private static final int MAX_SEARCH_LENGTH = 100;
    private static final int MIN_PLAYERS = 1;
    private static final int MAX_PLAYERS = 20;
    private static final int MIN_PLAYING_TIME = 1;
    private static final int MAX_PLAYING_TIME = 600;
    private static final int MIN_AGE = 1;
    private static final int MAX_AGE = 18;
    private static final double MIN_RATING = 0.0;
    private static final double MAX_RATING = 10.0;
    private static final int MIN_YEAR = 1900;
    private static final int MAX_YEAR = 2030;

    @Size(max = MAX_SEARCH_LENGTH, message = "Search query cannot exceed 100 characters")
    private String search;

    @Min(value = MIN_PLAYERS, message = "Minimum players must be at least 1")
    @Max(value = MAX_PLAYERS, message = "Maximum players cannot exceed 20")
    private Integer minPlayers;

    @Min(value = MIN_PLAYERS, message = "Maximum players must be at least 1")
    @Max(value = MAX_PLAYERS, message = "Maximum players cannot exceed 20")
    private Integer maxPlayers;

    @Min(value = MIN_PLAYING_TIME, message = "Minimum playing time must be at least 1 minute")
    @Max(value = MAX_PLAYING_TIME, message = "Maximum playing time cannot exceed 600 minutes")
    private Integer minPlayingTime;

    @Min(value = MIN_PLAYING_TIME, message = "Maximum playing time must be at least 1 minute")
    @Max(value = MAX_PLAYING_TIME, message = "Maximum playing time cannot exceed 600 minutes")
    private Integer maxPlayingTime;

    @Min(value = MIN_AGE, message = "Minimum age must be at least 1")
    @Max(value = MAX_AGE, message = "Maximum age cannot exceed 18")
    private Integer minAge;

    @Min(value = (int) MIN_RATING, message = "Minimum rating must be at least 0")
    @Max(value = (int) MAX_RATING, message = "Maximum rating cannot exceed 10")
    private Double minRating;

    @Min(value = MIN_YEAR, message = "Year must be at least 1900")
    @Max(value = MAX_YEAR, message = "Year cannot exceed 2030")
    private Integer yearFrom;

    @Min(value = MIN_YEAR, message = "Year must be at least 1900")
    @Max(value = MAX_YEAR, message = "Year cannot exceed 2030")
    private Integer yearTo;

    @Builder.Default
    @Pattern(regexp = "^(name|yearPublished|bggRating|playingTime|complexity)$",
            message = "Sort field must be one of: name, yearPublished, bggRating, playingTime, complexity")
    private String sortBy = "bggRating";

    @Builder.Default
    @Pattern(regexp = "^(asc|desc)$", message = "Sort order must be 'asc' or 'desc'")
    private String sortOrder = "desc";

    @Builder.Default
    private Boolean exactPlayerFilter = false;
}