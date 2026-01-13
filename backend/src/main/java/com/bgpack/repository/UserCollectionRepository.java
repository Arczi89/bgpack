package com.bgpack.repository;

import com.bgpack.entity.User;
import com.bgpack.entity.UserCollection;
import com.bgpack.entity.UserCollectionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCollectionRepository extends JpaRepository<UserCollection, UserCollectionId> {

    List<UserCollection> findAllByUser(User user);

    @Query("SELECT uc FROM UserCollection uc WHERE uc.game.id = :gameId")
    List<UserCollection> findByGameId(@Param("gameId") Long gameId);

}