package com.bgpack.repository;

import com.bgpack.entity.GameStats;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameStatsRepository extends MongoRepository<GameStats, String> {

    Optional<GameStats> findByGameId(String gameId);

    List<GameStats> findByGameIdIn(List<String> gameIds);

    List<GameStats> findByCachedAtBefore(LocalDateTime dateTime);

    List<GameStats> findByCacheHitsGreaterThan(Integer hits);

    void deleteByGameId(String gameId);

    boolean existsByGameId(String gameId);
}
