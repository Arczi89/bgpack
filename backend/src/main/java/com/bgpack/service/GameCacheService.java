package com.bgpack.service;

import com.bgpack.entity.Game;
import com.bgpack.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameCacheService {

    private final GameRepository gameRepository;

    @Transactional
    public Optional<Game> getCachedGame(String bggId) {
        return gameRepository.findByBggId(bggId).map(game -> {
            game.incrementCacheHits();
            return gameRepository.save(game);
        });
    }

    @Transactional
    public Game saveOrUpdateGameCache(Game gameData) {
        Optional<Game> existingOpt = gameRepository.findByBggId(gameData.getBggId());

        if (existingOpt.isPresent()) {
            Game existing = existingOpt.get();
            updateGameData(existing, gameData);
            existing.updateCacheTimestamp();
            return gameRepository.save(existing);
        } else {
            return gameRepository.save(gameData);
        }
    }

    private void updateGameData(Game existing, Game newData) {
        existing.setName(newData.getName());
        existing.setDescription(newData.getDescription());
        existing.setYearPublished(newData.getYearPublished());
        existing.setMinPlayers(newData.getMinPlayers());
        existing.setMaxPlayers(newData.getMaxPlayers());
        existing.setPlayingTime(newData.getPlayingTime());
        existing.setMinAge(newData.getMinAge());
        existing.setImageUrl(newData.getImageUrl());
        existing.setThumbnailUrl(newData.getThumbnailUrl());
        existing.setRank(newData.getRank());
        existing.setBggRating(newData.getBggRating());
        existing.setAverageRating(newData.getAverageRating());
        existing.setComplexity(newData.getComplexity());
        existing.setAverageWeight(newData.getAverageWeight());
        existing.setSuggestedNumPlayers(newData.getSuggestedNumPlayers());
        existing.setRecommendedPlayers(newData.getRecommendedPlayers());
    }

}