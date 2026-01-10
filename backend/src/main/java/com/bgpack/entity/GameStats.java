package com.bgpack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "game_stats")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(name = "total_plays")
    private Long totalPlays;

    @Column(name = "average_rating")
    private BigDecimal averageRating;

    @Column(name = "total_ratings")
    private Long totalRatings;

    @Column(name = "complexity_rating")
    private BigDecimal complexityRating;
}