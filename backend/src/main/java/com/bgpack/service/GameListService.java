package com.bgpack.service;

import com.bgpack.dto.GameListDto;
import com.bgpack.dto.SaveGameListRequest;
import com.bgpack.entity.GameList;
import com.bgpack.mapper.GameListMapper;
import com.bgpack.repository.GameListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameListService {

    private final GameListRepository gameListRepository;
    private final GameListMapper gameListMapper;

    public GameListDto saveGameList(String username, SaveGameListRequest request) {
        log.info("Saving game list for user: {} (storing as 'admin' user)", username);

        String listId = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        String storageUsername = "admin";

        GameListDto gameListDto = GameListDto.builder()
                .id(listId)
                .username(storageUsername)
                .listName(request.getListName())
                .usernames(request.getUsernames())
                .games(request.getGames())
                .filters(request.getFilters())
                .exactPlayerFilter(request.isExactPlayerFilter())
                .createdAt(now)
                .updatedAt(now)
                .build();

        try {
            GameList gameListEntity = gameListMapper.toEntity(gameListDto);
            GameList savedEntity = gameListRepository.save(gameListEntity);

            log.info("Successfully saved game list with ID: {} for user: {} (stored as 'admin') to MongoDB", listId, username);
            return gameListMapper.toDto(savedEntity);
        } catch (Exception e) {
            log.error("Error saving to MongoDB: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<GameListDto> getUserGameLists(String username) {
        log.info("Getting game lists for user: {} (returning lists from 'admin' user)", username);

        List<GameList> userLists = gameListRepository.findByUsername("admin");
        List<GameListDto> userListDtos = userLists.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(gameListMapper::toDto)
                .toList();

        log.info("Found {} game lists for user: {} (from 'admin' user in MongoDB)", userListDtos.size(), username);
        return userListDtos;
    }

    public void deleteGameList(String username, String gameListId) {
        log.info("Deleting game list {} for user: {} (deleting from 'admin' user)", gameListId, username);

        gameListRepository.deleteByUsernameAndId("admin", gameListId);

        log.info("Successfully deleted game list: {} for user: {} (from 'admin' user in MongoDB)", gameListId, username);
    }
}
