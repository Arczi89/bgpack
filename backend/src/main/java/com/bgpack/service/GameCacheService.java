package com.bgpack.service;

import com.bgpack.entity.GameCache;
import com.bgpack.model.Game;
import com.bgpack.repository.GameCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameCacheService {

    private final GameCacheRepository gameCacheRepository;

    public Optional<Game> getCachedGame(String gameId) {
        log.info("Looking for cached game: {}", gameId);

        Optional<GameCache> cachedGame = gameCacheRepository.findByGameId(gameId);

        if (cachedGame.isPresent()) {
            GameCache cache = cachedGame.get();
            cache.incrementCacheHits();
            gameCacheRepository.save(cache);

            log.info("Found cached game: {} (cache hits: {})", gameId, cache.getCacheHits());
            return Optional.of(convertToDto(cache));
        }

        log.info("No cached game found for: {}", gameId);
        return Optional.empty();
    }

    public void saveGameToCache(Game gameDto) {
        log.info("Saving game to cache: {}", gameDto.getId());

        GameCache gameCache = GameCache.builder()
                .gameId(gameDto.getId())
                .name(gameDto.getName())
                .yearPublished(gameDto.getYearPublished())
                .minPlayers(gameDto.getMinPlayers())
                .maxPlayers(gameDto.getMaxPlayers())
                .playingTime(gameDto.getPlayingTime())
                .minAge(gameDto.getMinAge())
                .description(gameDto.getDescription())
                .imageUrl(gameDto.getImageUrl())
                .thumbnailUrl(gameDto.getThumbnailUrl())
                .bggRating(gameDto.getBggRating())
                .averageRating(gameDto.getAverageRating())
                .complexity(gameDto.getComplexity())
                .averageWeight(gameDto.getAverageWeight())
                .suggestedNumPlayers(gameDto.getSuggestedNumPlayers())
                .cachedAt(LocalDateTime.now())
                .lastUpdated(LocalDateTime.now())
                .cacheHits(0)
                .build();

        gameCacheRepository.save(gameCache);
        log.info("Game saved to cache: {}", gameDto.getId());
    }

    public void updateGameCache(Game gameDto) {
        log.info("Updating cached game: {}", gameDto.getId());

        Optional<GameCache> existingCache = gameCacheRepository.findByGameId(gameDto.getId());

        if (existingCache.isPresent()) {
            GameCache cache = existingCache.get();
            cache.setName(gameDto.getName());
            cache.setYearPublished(gameDto.getYearPublished());
            cache.setMinPlayers(gameDto.getMinPlayers());
            cache.setMaxPlayers(gameDto.getMaxPlayers());
            cache.setPlayingTime(gameDto.getPlayingTime());
            cache.setMinAge(gameDto.getMinAge());
            cache.setDescription(gameDto.getDescription());
            cache.setImageUrl(gameDto.getImageUrl());
            cache.setThumbnailUrl(gameDto.getThumbnailUrl());
            cache.setBggRating(gameDto.getBggRating());
            cache.setAverageRating(gameDto.getAverageRating());
            cache.setComplexity(gameDto.getComplexity());
            cache.setAverageWeight(gameDto.getAverageWeight());
            cache.setSuggestedNumPlayers(gameDto.getSuggestedNumPlayers());
            cache.updateCacheTimestamp();

            gameCacheRepository.save(cache);
            log.info("Game cache updated: {}", gameDto.getId());
        } else {
            saveGameToCache(gameDto);
        }
    }

    public void removeGameFromCache(String gameId) {
        log.info("Removing game from cache: {}", gameId);
        gameCacheRepository.deleteByGameId(gameId);
    }

    public boolean isGameCached(String gameId) {
        return gameCacheRepository.findByGameId(gameId).isPresent();
    }

    public long getCacheSize() {
        return gameCacheRepository.count();
    }

    private Game convertToDto(GameCache cache) {
        return Game.builder()
                .id(cache.getGameId())
                .name(cache.getName())
                .yearPublished(cache.getYearPublished())
                .minPlayers(cache.getMinPlayers())
                .maxPlayers(cache.getMaxPlayers())
                .playingTime(cache.getPlayingTime())
                .minAge(cache.getMinAge())
                .description(cache.getDescription())
                .imageUrl(cache.getImageUrl())
                .thumbnailUrl(cache.getThumbnailUrl())
                .bggRating(cache.getBggRating())
                .averageRating(cache.getAverageRating())
                .complexity(cache.getComplexity())
                .averageWeight(cache.getAverageWeight())
                .suggestedNumPlayers(cache.getSuggestedNumPlayers())
                .build();
    }
}
