package com.bgpack.service;

import com.bgpack.client.BggApiClient;
import com.bgpack.model.Game;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.testdata.MockGameData;
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

    @Mock
    private BggApiOptimizationService optimizationService;

    @InjectMocks
    private BggService bggService;

    @BeforeEach
    void setUp() {
        // Mock rate limiter to not block tests
        doNothing().when(rateLimiter).acquire();

        // Mock optimization service to always allow requests
        when(optimizationService.shouldMakeRequest(anyString())).thenReturn(true);
    }

    @Test
    void getGames_WithEmptySearch_ShouldReturnEmptyList() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder().build();

        // When
        List<Game> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getGames_WithSearchTerm_ShouldReturnEmptyList() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .search("Catan")
                .build();

        // When
        List<Game> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getGames_WithPlayerFilter_ShouldReturnEmptyList() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .minPlayers(3)
                .maxPlayers(4)
                .build();

        // When
        List<Game> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getGames_WithBggApiSuccess_ShouldReturnBggGames() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .search("Catan")
                .build();

        List<Game> bggGames = Arrays.asList(
                Game.builder().id("13").name("Catan").yearPublished(1995).build()
        );

        when(bggApiClient.searchGames("Catan")).thenReturn(Mono.just("<xml>mock response</xml>"));
        when(xmlParserService.parseSearchResults(anyString())).thenReturn(bggGames);

        // When
        List<Game> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Catan");
        assertThat(result.get(0).getId()).isEqualTo("13");
    }

    @Test
    void getGames_WithBggApiFailure_ShouldReturnEmptyList() {
        // Given
        GameSearchRequest searchRequest = GameSearchRequest.builder()
                .search("Catan")
                .build();

        when(bggApiClient.searchGames("Catan")).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When
        List<Game> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getGameById_WithValidId_ShouldThrowException() {
        // When & Then
        assertThatThrownBy(() -> bggService.getGameById("1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Game not found with id: 1");
    }

    @Test
    void getGameById_WithBggApiSuccess_ShouldReturnBggGame() {
        // Given
        Game bggGame = Game.builder()
                .id("13")
                .name("Catan")
                .yearPublished(1995)
                .minPlayers(3)
                .maxPlayers(4)
                .build();

        when(bggApiClient.getGameDetails("13")).thenReturn(Mono.just("<xml>mock response</xml>"));
        when(xmlParserService.parseGameDetails(anyString())).thenReturn(bggGame);

        // When
        Game result = bggService.getGameById("13");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Catan");
        assertThat(result.getId()).isEqualTo("13");
    }

    @Test
    void getGameById_WithBggApiFailure_ShouldThrowException() {
        // Given
        when(bggApiClient.getGameDetails("1")).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When & Then
        assertThatThrownBy(() -> bggService.getGameById("1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Game not found with id: 1");
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
        List<Game> collection = Arrays.asList(
                Game.builder().id("13").name("Catan").build(),
                Game.builder().id("42").name("Ticket to Ride").build()
        );

        when(bggApiClient.getCollection("testuser")).thenReturn(Mono.just("<xml>mock response</xml>"));
        when(xmlParserService.parseCollection(anyString())).thenReturn(collection);

        // When
        List<Game> result = bggService.getCollection("testuser");

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Game::getName)
                .containsExactlyInAnyOrder("Catan", "Ticket to Ride");
    }

    @Test
    void getCollection_WithApiFailure_ShouldReturnEmptyList() {
        // Given
        when(bggApiClient.getCollection("testuser")).thenReturn(Mono.error(new RuntimeException("API Error")));

        // When
        List<Game> result = bggService.getCollection("testuser");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getGames_WithComplexFilters_ShouldReturnEmptyList() {
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
        List<Game> result = bggService.getGames(searchRequest);

        // Then
        assertThat(result).isEmpty();
    }
}
