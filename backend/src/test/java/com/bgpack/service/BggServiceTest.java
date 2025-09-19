package com.bgpack.service;

import com.bgpack.client.BggApiClient;
import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameSearchRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;

@ExtendWith(MockitoExtension.class)
class BggServiceTest {

    @Mock
    private BggApiClient bggApiClient;

    @Mock
    private BggXmlParserService xmlParserService;

    @Mock
    private BggRateLimiter rateLimiter;

    @InjectMocks
    private BggService bggService;

    @BeforeEach
    void setUp() {
        // Mock rate limiter to not block tests
        doNothing().when(rateLimiter).acquire();
    }

    @Test
    void getGames_WithEmptySearch_ShouldReturnAllMockGames() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder().build();

        // When
        List<GameDto> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).hasSize(5);
        assertThat(result).extracting(GameDto::getName)
                .containsExactlyInAnyOrder("Catan", "Ticket to Ride", "Wingspan", "Azul", "Gloomhaven");
    }

    @Test
    void getGames_WithSearchTerm_ShouldFilterByName() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .search("Catan")
                .build();

        // When
        List<GameDto> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Catan");
    }

    @Test
    void getGames_WithPlayerFilter_ShouldFilterByPlayerCount() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .minPlayers(3)
                .maxPlayers(4)
                .build();

        // When
        List<GameDto> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(GameDto::getName)
                .containsExactlyInAnyOrder("Catan", "Azul");
    }

    @Test
    void getGames_WithBggApiSuccess_ShouldReturnBggGames() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .search("Catan")
                .build();

        List<GameDto> bggGames = Arrays.asList(
                GameDto.builder().id("13").name("Catan").yearPublished(1995).build()
        );

        when(bggApiClient.searchGames("Catan")).thenReturn(Mono.just("<xml>mock response</xml>"));
        when(xmlParserService.parseSearchResults(anyString())).thenReturn(bggGames);

        // When
        List<GameDto> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Catan");
        assertThat(result.get(0).getId()).isEqualTo("13");
    }

    @Test
    void getGames_WithBggApiFailure_ShouldFallbackToMockData() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .search("Catan")
                .build();

        when(bggApiClient.searchGames("Catan")).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When
        List<GameDto> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Catan");
        assertThat(result.get(0).getId()).isEqualTo("1"); // Mock data ID
    }

    @Test
    void getGameById_WithValidId_ShouldReturnGame() {
        // When
        GameDto result = bggService.getGameById("1");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Catan");
    }

    @Test
    void getGameById_WithBggApiSuccess_ShouldReturnBggGame() {
        // Given
        GameDto bggGame = GameDto.builder()
                .id("13")
                .name("Catan")
                .yearPublished(1995)
                .minPlayers(3)
                .maxPlayers(4)
                .build();

        when(bggApiClient.getGameDetails("13")).thenReturn(Mono.just("<xml>mock response</xml>"));
        when(xmlParserService.parseGameDetails(anyString())).thenReturn(bggGame);

        // When
        GameDto result = bggService.getGameById("13");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Catan");
        assertThat(result.getId()).isEqualTo("13");
    }

    @Test
    void getGameById_WithBggApiFailure_ShouldFallbackToMockData() {
        // Given
        when(bggApiClient.getGameDetails("1")).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When
        GameDto result = bggService.getGameById("1");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Catan");
        assertThat(result.getId()).isEqualTo("1"); // Mock data ID
    }

    @Test
    void getGameById_WithInvalidId_ShouldThrowException() {
        // When & Then
        assertThatThrownBy(() -> bggService.getGameById("999"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Game not found with id: 999");
    }

    @Test
    void getCollection_WithValidUsername_ShouldReturnCollection() {
        // Given
        List<GameDto> collection = Arrays.asList(
                GameDto.builder().id("13").name("Catan").build(),
                GameDto.builder().id("42").name("Ticket to Ride").build()
        );

        when(bggApiClient.getCollection("testuser")).thenReturn(Mono.just("<xml>mock response</xml>"));
        when(xmlParserService.parseCollection(anyString())).thenReturn(collection);

        // When
        List<GameDto> result = bggService.getCollection("testuser");

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(GameDto::getName)
                .containsExactlyInAnyOrder("Catan", "Ticket to Ride");
    }

    @Test
    void getCollection_WithApiFailure_ShouldReturnEmptyList() {
        // Given
        when(bggApiClient.getCollection("testuser")).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When
        List<GameDto> result = bggService.getCollection("testuser");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getGames_WithComplexFilters_ShouldFilterCorrectly() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .minPlayers(2)
                .maxPlayers(5)
                .minPlayingTime(30)
                .maxPlayingTime(90)
                .minAge(8)
                .minRating(7.0)
                .yearFrom(2000)
                .yearTo(2020)
                .build();

        // When
        List<GameDto> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(GameDto::getName)
                .containsExactlyInAnyOrder("Ticket to Ride", "Azul");
    }
}
