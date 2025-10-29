package com.bgpack.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * User's saved game list.
 * Serves both as MongoDB document and API response/request.
 * Following Spring Data MongoDB best practices for simple CRUD operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "my_games")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GameList {

    @Id
    private String id;

    private String username;
    private String listName;
    private List<String> usernames;
    private List<Game> games;
    private GameFilters filters;
    private boolean exactPlayerFilter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

