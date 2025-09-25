package com.bgpack.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Field("ownedBy")
    private List<String> ownedBy;
}
