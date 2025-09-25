package com.bgpack.mapper;

import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameFilters;
import com.bgpack.dto.GameListDto;
import com.bgpack.entity.Game;
import com.bgpack.entity.GameFiltersEntity;
import com.bgpack.entity.GameList;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class GameListMapper {

    public GameListDto toDto(GameList entity) {
        if (entity == null) {
            return null;
        }

        return GameListDto.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .listName(entity.getListName())
                .usernames(entity.getUsernames())
                .games(entity.getGames() != null ?
                    entity.getGames().stream().map(this::gameToDto).collect(Collectors.toList()) : null)
                .filters(entity.getFilters() != null ? gameFiltersEntityToDto(entity.getFilters()) : null)
                .exactPlayerFilter(entity.isExactPlayerFilter())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public GameList toEntity(GameListDto dto) {
        if (dto == null) {
            return null;
        }

        return GameList.builder()
                .id(dto.getId())
                .username(dto.getUsername())
                .listName(dto.getListName())
                .usernames(dto.getUsernames())
                .games(dto.getGames() != null ?
                    dto.getGames().stream().map(this::gameToEntity).collect(Collectors.toList()) : null)
                .filters(dto.getFilters() != null ? gameFiltersDtoToEntity(dto.getFilters()) : null)
                .exactPlayerFilter(dto.isExactPlayerFilter())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    private GameDto gameToDto(Game entity) {
        if (entity == null) {
            return null;
        }

        return GameDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .yearPublished(entity.getYearPublished())
                .minPlayers(entity.getMinPlayers())
                .maxPlayers(entity.getMaxPlayers())
                .playingTime(entity.getPlayingTime())
                .minAge(entity.getMinAge())
                .description(entity.getDescription())
                .imageUrl(entity.getImageUrl())
                .thumbnailUrl(entity.getThumbnailUrl())
                .bggRating(entity.getBggRating())
                .averageRating(entity.getAverageRating())
                .complexity(entity.getComplexity())
                .ownedBy(entity.getOwnedBy())
                .build();
    }

    private Game gameToEntity(GameDto dto) {
        if (dto == null) {
            return null;
        }

        return Game.builder()
                .id(dto.getId())
                .name(dto.getName())
                .yearPublished(dto.getYearPublished())
                .minPlayers(dto.getMinPlayers())
                .maxPlayers(dto.getMaxPlayers())
                .playingTime(dto.getPlayingTime())
                .minAge(dto.getMinAge())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .thumbnailUrl(dto.getThumbnailUrl())
                .bggRating(dto.getBggRating())
                .averageRating(dto.getAverageRating())
                .complexity(dto.getComplexity())
                .ownedBy(dto.getOwnedBy())
                .build();
    }

    private GameFilters gameFiltersEntityToDto(GameFiltersEntity entity) {
        if (entity == null) {
            return null;
        }

        return GameFilters.builder()
                .minPlayers(entity.getMinPlayers())
                .maxPlayers(entity.getMaxPlayers())
                .minPlayingTime(entity.getMinPlayingTime())
                .maxPlayingTime(entity.getMaxPlayingTime())
                .minAge(entity.getMinAge())
                .minRating(entity.getMinRating())
                .exactPlayerFilter(entity.getExactPlayerFilter())
                .build();
    }

    private GameFiltersEntity gameFiltersDtoToEntity(GameFilters dto) {
        if (dto == null) {
            return null;
        }

        return GameFiltersEntity.builder()
                .minPlayers(dto.getMinPlayers())
                .maxPlayers(dto.getMaxPlayers())
                .minPlayingTime(dto.getMinPlayingTime())
                .maxPlayingTime(dto.getMaxPlayingTime())
                .minAge(dto.getMinAge())
                .minRating(dto.getMinRating())
                .exactPlayerFilter(dto.getExactPlayerFilter())
                .build();
    }
}
