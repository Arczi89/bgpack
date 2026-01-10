package com.bgpack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "games")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bgg_id", nullable = false, unique = true)
    private String bggId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "year_published")
    private Integer yearPublished;

    @Column(name = "min_players")
    private Integer minPlayers;

    @Column(name = "max_players")
    private Integer maxPlayers;

    @Column(name = "playing_time")
    private Integer playingTime;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 512)
    private String thumbnailUrl;

    @Column(name = "rank")
    private Integer rank;

    @Column(name = "bgg_rating", precision = 3)
    private BigDecimal bggRating;

    @Column(name = "average_rating", precision = 3)
    private BigDecimal averageRating;

    @Column(name = "complexity", precision = 3)
    private BigDecimal complexity;

    @Column(name = "average_weight", precision = 3)
    private BigDecimal averageWeight;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "suggested_num_players", columnDefinition = "jsonb")
    private Map<String, Object> suggestedNumPlayers;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommended_players", columnDefinition = "jsonb")
    private Map<String, Object> recommendedPlayers;

    @Column(name = "cached_at")
    private ZonedDateTime cachedAt;

    @Column(name = "cache_hits")
    @Builder.Default
    private Integer cacheHits = 0;

    @Column(name = "last_updated")
    private ZonedDateTime lastUpdated;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "game_tags",
            joinColumns = @JoinColumn(name = "game_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<UserCollection> collections;

    public void incrementCacheHits() {
        this.cacheHits = (this.cacheHits == null ? 0 : this.cacheHits) + 1;
    }

    public void updateCacheTimestamp() {
        this.lastUpdated = ZonedDateTime.now();
        this.cachedAt = ZonedDateTime.now();
    }

    public boolean isCacheStale() {
        if (lastUpdated == null) return true;
        return lastUpdated.isBefore(ZonedDateTime.now().minusDays(7));
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        if (lastUpdated == null) {
            lastUpdated = ZonedDateTime.now();
        }
        if (cachedAt == null) {
            cachedAt = ZonedDateTime.now();
        }
    }
}