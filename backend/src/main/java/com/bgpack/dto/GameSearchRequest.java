package com.bgpack.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.validation.constraints.Min;
import javax.validation.constraints.Max;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSearchRequest {

    @Size(max = 100, message = "Search query cannot exceed 100 characters")
    private String search;

    @Min(value = 1, message = "Minimum players must be at least 1")
    @Max(value = 20, message = "Maximum players cannot exceed 20")
    private Integer minPlayers;

    @Min(value = 1, message = "Maximum players must be at least 1")
    @Max(value = 20, message = "Maximum players cannot exceed 20")
    private Integer maxPlayers;

    @Min(value = 1, message = "Minimum playing time must be at least 1 minute")
    @Max(value = 600, message = "Maximum playing time cannot exceed 600 minutes")
    private Integer minPlayingTime;

    @Min(value = 1, message = "Maximum playing time must be at least 1 minute")
    @Max(value = 600, message = "Maximum playing time cannot exceed 600 minutes")
    private Integer maxPlayingTime;

    @Min(value = 1, message = "Minimum age must be at least 1")
    @Max(value = 18, message = "Maximum age cannot exceed 18")
    private Integer minAge;

    @Min(value = 0, message = "Minimum rating must be at least 0")
    @Max(value = 10, message = "Maximum rating cannot exceed 10")
    private Double minRating;

    @Min(value = 1900, message = "Year must be at least 1900")
    @Max(value = 2030, message = "Year cannot exceed 2030")
    private Integer yearFrom;

    @Min(value = 1900, message = "Year must be at least 1900")
    @Max(value = 2030, message = "Year cannot exceed 2030")
    private Integer yearTo;

    @Pattern(regexp = "^(name|yearPublished|bggRating|playingTime|complexity)$",
             message = "Sort field must be one of: name, yearPublished, bggRating, playingTime, complexity")
    private String sortBy = "bggRating";

    @Pattern(regexp = "^(asc|desc)$", message = "Sort order must be 'asc' or 'desc'")
    private String sortOrder = "desc";
}
