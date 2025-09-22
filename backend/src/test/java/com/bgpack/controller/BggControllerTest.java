package com.bgpack.controller;

import com.bgpack.dto.GameDto;
import com.bgpack.dto.GameSearchRequest;
import com.bgpack.service.BggService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BggController.class)
class BggControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BggService bggService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void test_ShouldReturnHelloMessage() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello from Backend - BGPack API is running!"));
    }

    @Test
    void getGames_WithValidRequest_ShouldReturnGames() throws Exception {
        // Given
        List<GameDto> mockGames = Arrays.asList(
                GameDto.builder()
                        .id("1")
                        .name("Catan")
                        .yearPublished(1995)
                        .minPlayers(3)
                        .maxPlayers(4)
                        .playingTime(60)
                        .minAge(10)
                        .bggRating(7.2)
                        .build()
        );
        when(bggService.getGames(any(GameSearchRequest.class))).thenReturn(mockGames);

        // When & Then
        mockMvc.perform(get("/api/games")
                        .param("search", "Catan"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("1")))
                .andExpect(jsonPath("$[0].name", is("Catan")))
                .andExpect(jsonPath("$[0].yearPublished", is(1995)))
                .andExpect(jsonPath("$[0].minPlayers", is(3)))
                .andExpect(jsonPath("$[0].maxPlayers", is(4)))
                .andExpect(jsonPath("$[0].playingTime", is(60)))
                .andExpect(jsonPath("$[0].minAge", is(10)))
                .andExpect(jsonPath("$[0].bggRating", is(7.2)));
    }

    @Test
    void getGames_WithEmptyRequest_ShouldReturnAllGames() throws Exception {
        // Given
        List<GameDto> mockGames = Arrays.asList(
                GameDto.builder().id("1").name("Catan").build(),
                GameDto.builder().id("2").name("Ticket to Ride").build()
        );
        when(bggService.getGames(any(GameSearchRequest.class))).thenReturn(mockGames);

        // When & Then
        mockMvc.perform(get("/api/games"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Catan")))
                .andExpect(jsonPath("$[1].name", is("Ticket to Ride")));
    }

    @Test
    void getGames_WithMultipleFilters_ShouldReturnFilteredGames() throws Exception {
        // Given
        List<GameDto> mockGames = Arrays.asList(
                GameDto.builder().id("1").name("Catan").build()
        );
        when(bggService.getGames(any(GameSearchRequest.class))).thenReturn(mockGames);

        // When & Then
        mockMvc.perform(get("/api/games")
                        .param("search", "Catan")
                        .param("minPlayers", "3")
                        .param("maxPlayers", "4")
                        .param("minPlayingTime", "30")
                        .param("maxPlayingTime", "90")
                        .param("minAge", "10")
                        .param("minRating", "7.0")
                        .param("yearFrom", "1990")
                        .param("yearTo", "2000"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Catan")));
    }

    @Test
    void getGameById_WithValidId_ShouldReturnGame() throws Exception {
        // Given
        GameDto mockGame = GameDto.builder()
                .id("1")
                .name("Catan")
                .yearPublished(1995)
                .minPlayers(3)
                .maxPlayers(4)
                .playingTime(60)
                .minAge(10)
                .description("Klasyczna gra strategiczna")
                .bggRating(7.2)
                .averageRating(7.2)
                .complexity(2.3)
                .build();
        when(bggService.getGameById("1")).thenReturn(mockGame);

        // When & Then
        mockMvc.perform(get("/api/games/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is("1")))
                .andExpect(jsonPath("$.name", is("Catan")))
                .andExpect(jsonPath("$.yearPublished", is(1995)))
                .andExpect(jsonPath("$.minPlayers", is(3)))
                .andExpect(jsonPath("$.maxPlayers", is(4)))
                .andExpect(jsonPath("$.playingTime", is(60)))
                .andExpect(jsonPath("$.minAge", is(10)))
                .andExpect(jsonPath("$.description", is("Klasyczna gra strategiczna")))
                .andExpect(jsonPath("$.bggRating", is(7.2)))
                .andExpect(jsonPath("$.averageRating", is(7.2)))
                .andExpect(jsonPath("$.complexity", is(2.3)));
    }

    @Test
    void getGameById_WithInvalidId_ShouldReturnNotFound() throws Exception {
        // Given
        when(bggService.getGameById("999"))
                .thenThrow(new IllegalArgumentException("Game not found with id: 999"));

        // When & Then
        mockMvc.perform(get("/api/games/999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getCollection_WithValidUsername_ShouldReturnCollection() throws Exception {
        // Given
        List<GameDto> mockCollection = Arrays.asList(
                GameDto.builder().id("1").name("Catan").build(),
                GameDto.builder().id("2").name("Ticket to Ride").build()
        );
        when(bggService.getCollection("testuser")).thenReturn(mockCollection);

        // When & Then
        mockMvc.perform(get("/api/collections/testuser"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Catan")))
                .andExpect(jsonPath("$[1].name", is("Ticket to Ride")));
    }

    @Test
    void getCollection_WithEmptyCollection_ShouldReturnEmptyList() throws Exception {
        // Given
        when(bggService.getCollection("emptyuser")).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/collections/emptyuser"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getGames_WithInvalidParameters_ShouldReturnBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/games")
                        .param("minPlayers", "0")  // Invalid: below minimum
                        .param("maxPlayers", "25") // Invalid: above maximum
                        .param("minAge", "0")      // Invalid: below minimum
                        .param("minRating", "11.0") // Invalid: above maximum
                        .param("yearFrom", "1800") // Invalid: below minimum
                        .param("yearTo", "2050"))  // Invalid: above maximum
                .andExpect(status().isBadRequest());
    }
}
