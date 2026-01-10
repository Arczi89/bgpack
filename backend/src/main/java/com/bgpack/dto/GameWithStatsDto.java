package com.bgpack.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GameWithStatsDto(
    String bggId,
    String name,
    Integer yearPublished,
    Integer minPlayers,
    Integer maxPlayers,
    Integer playingTime,
    Integer minAge,
    String description,
    String imageUrl,
    String thumbnailUrl,
    BigDecimal bggRating,
    BigDecimal averageRating,
    BigDecimal complexity,
    List<String> ownedBy,
    BigDecimal averageWeight,
    String suggestedNumPlayers
) {}
