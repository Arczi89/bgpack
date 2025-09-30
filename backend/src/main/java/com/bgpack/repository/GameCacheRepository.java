package com.bgpack.repository;

import com.bgpack.entity.GameCache;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameCacheRepository extends MongoRepository<GameCache, String> {

    Optional<GameCache> findByGameId(String gameId);

    List<GameCache> findByCachedAtBefore(LocalDateTime dateTime);

    List<GameCache> findByCacheHitsGreaterThan(Integer hits);

    void deleteByGameId(String gameId);
}
