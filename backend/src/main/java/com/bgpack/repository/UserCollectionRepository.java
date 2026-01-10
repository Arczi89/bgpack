package com.bgpack.repository;

import com.bgpack.entity.UserCollection;
import com.bgpack.entity.UserCollectionId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCollectionRepository extends JpaRepository<UserCollection, UserCollectionId> {

    @Query("SELECT uc FROM UserCollection uc WHERE uc.user.id = :userId")
    Page<UserCollection> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT uc FROM UserCollection uc WHERE uc.user.id = :userId AND uc.status = :status")
    Page<UserCollection> findByUserIdAndStatus(@Param("userId") Long userId,
                                               @Param("status") UserCollection.CollectionStatus status,
                                               Pageable pageable);

    @Query("SELECT uc FROM UserCollection uc WHERE uc.game.id = :gameId")
    List<UserCollection> findByGameId(@Param("gameId") Long gameId);

    @Query("SELECT COUNT(uc) FROM UserCollection uc WHERE uc.user.id = :userId AND uc.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId,
                                @Param("status") UserCollection.CollectionStatus status);
}