package com.bgpack.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GameWithStatsDto(
    String id,
    String name,
    Integer yearPublished,
    Integer minPlayers,
    Integer maxPlayers,
    Integer playingTime,
    Integer minAge,
    String description,
    String imageUrl,
    String thumbnailUrl,
    Double bggRating,
    Double averageRating,
    Double complexity,
    List<String> ownedBy,
    Double averageWeight,
    String suggestedNumPlayers
) {}
