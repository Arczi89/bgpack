package com.bgpack.service;

import com.bgpack.entity.Game;
import com.bgpack.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameSearchService {

    private final GameRepository gameRepository;

    /**
     * Wyszukuje gry na podstawie kryteriów zapisanych w JSONB
     */
    public List<Game> searchWithCriteria(Map<String, Object> criteria) {
        log.info("Searching games with criteria: {}", criteria);

        Specification<Game> spec = Specification.where(null);

        if (criteria.containsKey("userIds")) {
            @SuppressWarnings("unchecked")
            List<Integer> userIds = (List<Integer>) criteria.get("userIds");
            spec = spec.and(hasUsersInCollection(userIds));
        }

        if (criteria.containsKey("minPlayers")) {
            Integer minPlayers = (Integer) criteria.get("minPlayers");
            spec = spec.and(hasMinPlayers(minPlayers));
        }

        if (criteria.containsKey("maxPlayers")) {
            Integer maxPlayers = (Integer) criteria.get("maxPlayers");
            spec = spec.and(hasMaxPlayers(maxPlayers));
        }

        List<Game> games = gameRepository.findAll(spec);
        log.info("Found {} games matching criteria", games.size());

        return games;
    }

    // JPA Specifications
    private Specification<Game> hasUsersInCollection(List<Integer> userIds) {
        return (root, query, cb) -> {
            // Checks if the game is in the collection of ALL specified users
            // SQL: WHERE game_id IN (SELECT game_id FROM user_collections WHERE user_id IN (1,5,10) GROUP BY game_id HAVING COUNT(DISTINCT user_id) = 3)
            return root.get("id").in(
                    // TODO: implementacja podzapytania - do uzupełnienia przez developera
            );
        };
    }

    private Specification<Game> hasMinPlayers(Integer minPlayers) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("maxPlayers"), minPlayers);
    }

    private Specification<Game> hasMaxPlayers(Integer maxPlayers) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("minPlayers"), maxPlayers);
    }
}