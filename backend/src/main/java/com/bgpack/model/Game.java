package com.bgpack.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

/**
 * Game entity representing a board game.
 * Used both as MongoDB document (embedded in GameList) and API response.
 * This unified approach follows YAGNI principle - no need for separate DTO/Entity for MongoDB.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)  // Don't serialize null values in JSON
public class Game {

    @Field("id")
    private String id;

    @Field("name")
    private String name;

    @Field("yearPublished")
    private Integer yearPublished;

    @Field("minPlayers")
    private Integer minPlayers;

    @Field("maxPlayers")
    private Integer maxPlayers;

    @Field("playingTime")
    private Integer playingTime;

    @Field("minAge")
    private Integer minAge;

    @Field("description")
    private String description;

    @Field("imageUrl")
    private String imageUrl;

    @Field("thumbnailUrl")
    private String thumbnailUrl;

    @Field("bggRating")
    private Double bggRating;

    @Field("averageRating")
    private Double averageRating;

    @Field("complexity")
    private Double complexity;

    @Field("averageWeight")
    private Double averageWeight;

    @Field("suggestedNumPlayers")
    private String suggestedNumPlayers;

    @Field("ownedBy")
    private List<String> ownedBy;
}

