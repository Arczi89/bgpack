package com.bgpack.repository;

import com.bgpack.model.GameList;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameListRepository extends MongoRepository<GameList, String> {
    List<GameList> findByUsername(String username);
    void deleteByUsernameAndId(String username, String id);
}
