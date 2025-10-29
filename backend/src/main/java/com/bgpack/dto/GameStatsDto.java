package com.bgpack.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GameStatsDto(
    String gameId,
    String name,
    Double bggRating,
    Double averageRating,
    Double averageWeight,
    String suggestedNumPlayers
) {}
