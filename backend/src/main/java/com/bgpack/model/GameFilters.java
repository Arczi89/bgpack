package com.bgpack.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Game filtering criteria.
 * Used both for API requests and MongoDB storage.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GameFilters {
    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer minPlayingTime;
    private Integer maxPlayingTime;
    private Integer minAge;
    private Double minRating;
    private Boolean exactPlayerFilter;
}

