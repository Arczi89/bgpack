package com.bgpack.service;

import com.bgpack.dto.SaveGameListRequest;
import com.bgpack.model.GameList;
import com.bgpack.repository.GameListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service layer for game list management.
 * Handles business logic for CRUD operations on game lists.
 * Following Spring Boot layered architecture: Controller -> Service -> Repository.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameListService {

    private final GameListRepository gameListRepository;

    /**
     * Save a new game list.
     * No mapper needed - we build GameList directly from request.
     * This follows DRY principle and reduces unnecessary code.
     *
     * @param username BGG username (currently stored as 'admin' for simplicity)
     * @param request validated request with list details
     * @return saved game list
     */
    public GameList saveGameList(final String username, final SaveGameListRequest request) {
        log.info("Saving game list for user: {} (storing as 'admin' user)", username);

        final LocalDateTime now = LocalDateTime.now();

        // Build entity directly from request - no mapper needed!
        final GameList gameList = GameList.builder()
                .id(UUID.randomUUID().toString())
                .username("admin")  // Simplified: all lists stored under 'admin'
                .listName(request.getListName())
                .usernames(request.getUsernames())
                .games(request.getGames())
                .filters(request.getFilters())
                .exactPlayerFilter(request.isExactPlayerFilter())
                .createdAt(now)
                .updatedAt(now)
                .build();

        try {
            final GameList savedList = gameListRepository.save(gameList);
            log.info("Successfully saved game list with ID: {} for user: {}",
                    savedList.getId(), username);
            return savedList;
        } catch (Exception e) {
            log.error("Error saving game list to MongoDB: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get all game lists for a user.
     * Returns GameList entities directly - they serve as both domain model and API response.
     *
     * @param username BGG username
     * @return list of game lists, sorted by creation date (newest first)
     */
    public List<GameList> getUserGameLists(final String username) {
        log.info("Getting game lists for user: {} (returning lists from 'admin' user)", username);

        final List<GameList> userLists = gameListRepository.findByUsername("admin");
        final List<GameList> sortedLists = userLists.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();

        log.info("Found {} game lists for user: {}", sortedLists.size(), username);
        return sortedLists;
    }

    /**
     * Delete a game list.
     *
     * @param username BGG username
     * @param gameListId ID of the list to delete
     */
    public void deleteGameList(final String username, final String gameListId) {
        log.info("Deleting game list {} for user: {}", gameListId, username);

        gameListRepository.deleteByUsernameAndId("admin", gameListId);

        log.info("Successfully deleted game list: {} for user: {}", gameListId, username);
    }
}
