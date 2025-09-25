package com.bgpack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameListDto {
    private String id;
    private String username;
    private String listName;
    private List<String> usernames;
    private List<GameDto> games;
    private GameFilters filters;
    private boolean exactPlayerFilter;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
