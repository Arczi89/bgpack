package com.bgpack.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "my_games")
public class GameList {
    @Id
    private String id;
    private String username;
    private String listName;
    private List<String> usernames;
    private List<Game> games;
    private GameFiltersEntity filters;
    private boolean exactPlayerFilter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
