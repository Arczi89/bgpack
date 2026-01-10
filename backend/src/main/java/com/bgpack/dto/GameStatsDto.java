package com.bgpack.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GameStatsDto(
    String gameId,
    String name,
    BigDecimal bggRating,
    BigDecimal averageRating,
    BigDecimal averageWeight,
    String suggestedNumPlayers
) {}
