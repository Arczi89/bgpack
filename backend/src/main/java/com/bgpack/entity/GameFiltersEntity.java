package com.bgpack.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameFiltersEntity {
    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer minPlayingTime;
    private Integer maxPlayingTime;
    private Integer minAge;
    private Double minRating;
    private Boolean exactPlayerFilter;
}
