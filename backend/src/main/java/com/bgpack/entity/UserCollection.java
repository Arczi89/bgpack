package com.bgpack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "user_collections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCollection {

    @EmbeddedId
    private UserCollectionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("gameId")
    @JoinColumn(name = "game_id")
    private Game game;

    @Column(name = "rating")
    private Integer rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private CollectionStatus status;

    @Column(name = "added_at")
    private ZonedDateTime addedAt;

    public enum CollectionStatus {
        OWNED, WISHLIST, WANT_TO_PLAY, PREVIOUSLY_OWNED, FOR_TRADE, WANT_IN_TRADE
    }

    @PrePersist
    protected void onCreate() {
        addedAt = ZonedDateTime.now();
    }
}