package com.bgpack.service;

import com.bgpack.entity.Game;
import com.bgpack.entity.UserCollection;
import com.bgpack.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Subquery;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameSearchService {

    private final GameRepository gameRepository;

    /**
     * Searches games based on criteria stored in JSONB
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

    private Specification<Game> hasUsersInCollection(List<Integer> userIds) {
        return (root, query, cb) -> {
            Subquery<Long> subquery = query.subquery(Long.class);
            var collectionRoot = subquery.from(UserCollection.class);
            subquery.select(collectionRoot.get("game").get("id"))
                    .where(cb.in(collectionRoot.get("user").get("id")).value(userIds))
                    .groupBy(collectionRoot.get("game").get("id"))
                    .having(cb.equal(cb.countDistinct(collectionRoot.get("user").get("id")), userIds.size()));
            return root.get("id").in(subquery);
        };
    }

    private Specification<Game> hasMinPlayers(Integer minPlayers) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("maxPlayers"), minPlayers);
    }

    private Specification<Game> hasMaxPlayers(Integer maxPlayers) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("minPlayers"), maxPlayers);
    }
}