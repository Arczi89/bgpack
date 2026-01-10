package com.bgpack.repository;

import com.bgpack.entity.GameStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameStatsRepository extends JpaRepository<GameStats, Long> {

    @Query("SELECT gs FROM GameStats gs WHERE gs.game.id = :gameId")
    Optional<GameStats> findByGameId(@Param("gameId") Long gameId);

    @Query("SELECT gs FROM GameStats gs WHERE gs.game.bggId = :bggId")
    Optional<GameStats> findByGameBggId(@Param("bggId") String bggId);

    @Query("SELECT gs FROM GameStats gs WHERE gs.game.bggId IN :bggIds")
    List<GameStats> findByGameBggIdIn(@Param("bggIds") List<String> bggIds);
}