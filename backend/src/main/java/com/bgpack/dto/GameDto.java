package com.bgpack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDto {
    private String id;
    private String name;
    private Integer yearPublished;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer playingTime;
    private Integer minAge;
    private String description;
    private String imageUrl;
    private String thumbnailUrl;
    private Double bggRating;
    private Double averageRating;
    private Double complexity;
}
