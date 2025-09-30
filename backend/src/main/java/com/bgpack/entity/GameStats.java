package com.bgpack.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "game_stats")
public class GameStats {

    @Id
    private String id;

    @Field("gameId")
    private String gameId;

    @Field("name")
    private String name;

    @Field("bggRating")
    private Double bggRating;

    @Field("averageRating")
    private Double averageRating;

    @Field("averageWeight")
    private Double averageWeight;

    @Field("suggestedNumPlayers")
    private String suggestedNumPlayers;

    // Cache metadata
    @Field("cachedAt")
    private LocalDateTime cachedAt;

    @Field("lastUpdated")
    private LocalDateTime lastUpdated;

    @Field("cacheHits")
    private Integer cacheHits;

    public void incrementCacheHits() {
        this.cacheHits = (this.cacheHits == null ? 0 : this.cacheHits) + 1;
    }

    public void updateCacheTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }
}
