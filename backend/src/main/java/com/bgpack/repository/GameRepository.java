package com.bgpack.repository;

import com.bgpack.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Game> {

    Optional<Game> findByBggId(String bggId);

    List<Game> findByBggIdIn(List<String> bggIds);

    @Query("SELECT g FROM Game g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Game> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    @Query("SELECT g FROM Game g WHERE " +
            "(:minPlayers IS NULL OR g.minPlayers <= :minPlayers) AND " +
            "(:maxPlayers IS NULL OR g.maxPlayers >= :maxPlayers)")
    Page<Game> findByPlayersRange(@Param("minPlayers") Integer minPlayers,
                                  @Param("maxPlayers") Integer maxPlayers,
                                  Pageable pageable);

    @Query("SELECT g FROM Game g WHERE g.rank IS NOT NULL ORDER BY g.rank ASC")
    Page<Game> findTopRankedGames(Pageable pageable);

    @Query("SELECT g FROM Game g JOIN g.tags t WHERE t.name IN :tagNames")
    Page<Game> findByTagsNameIn(@Param("tagNames") List<String> tagNames, Pageable pageable);
}