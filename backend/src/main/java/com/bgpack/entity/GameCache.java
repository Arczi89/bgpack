package com.bgpack.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "game_cache")
public class GameCache {

    @Id
    private String id;

    private String gameId;
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
    private Double averageWeight;
    private String suggestedNumPlayers;
    private String recommendedPlayers;

    // Cache metadata
    private LocalDateTime cachedAt;
    private LocalDateTime lastUpdated;
    private Integer cacheHits; // How many times this cache was used

    public void incrementCacheHits() {
        this.cacheHits = (this.cacheHits == null ? 0 : this.cacheHits) + 1;
    }

    public void updateCacheTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }
}
