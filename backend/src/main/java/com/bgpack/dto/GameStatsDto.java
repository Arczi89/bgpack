package com.bgpack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStatsDto {
    private String gameId;
    private String name;
    private Double bggRating;
    private Double averageRating;
    private Double averageWeight;
    private String suggestedNumPlayers;
}
