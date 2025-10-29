package com.bgpack.testdata;

import com.bgpack.model.Game;

import java.util.Arrays;
import java.util.List;

public class MockGameData {

    public static List<Game> getMockGames() {
        return Arrays.asList(
            Game.builder()
                .id("1")
                .name("Catan")
                .yearPublished(1995)
                .minPlayers(3)
                .maxPlayers(4)
                .playingTime(60)
                .minAge(10)
                .description("Classic strategy game about building settlements and cities on the island of Catan. " +
                    "Players collect resources, trade, and build settlements, cities, and roads.")
                .bggRating(7.2)
                .averageRating(7.2)
                .complexity(2.3)
                .build(),

            Game.builder()
                .id("2")
                .name("Ticket to Ride")
                .yearPublished(2004)
                .minPlayers(2)
                .maxPlayers(5)
                .playingTime(45)
                .minAge(8)
                .description("Game about building railway routes across North America. Players collect train cards and build routes between cities.")
                .bggRating(7.4)
                .averageRating(7.4)
                .complexity(1.9)
                .build(),

            Game.builder()
                .id("3")
                .name("Wingspan")
                .yearPublished(2019)
                .minPlayers(1)
                .maxPlayers(5)
                .playingTime(70)
                .minAge(10)
                .description("Engine-building card game about birds. Players attract birds to their wildlife preserves.")
                .bggRating(8.1)
                .averageRating(8.1)
                .complexity(2.4)
                .build(),

            Game.builder()
                .id("4")
                .name("Azul")
                .yearPublished(2017)
                .minPlayers(2)
                .maxPlayers(4)
                .playingTime(45)
                .minAge(8)
                .description("Abstract strategy game about decorating the walls of the Royal Palace of Evora.")
                .bggRating(7.8)
                .averageRating(7.8)
                .complexity(1.8)
                .build(),

            Game.builder()
                .id("5")
                .name("Gloomhaven")
                .yearPublished(2017)
                .minPlayers(1)
                .maxPlayers(4)
                .playingTime(120)
                .minAge(14)
                .description("Epic cooperative game in a fantasy world. Players take on the role of adventurers and explore dungeons.")
                .bggRating(8.8)
                .averageRating(8.8)
                .complexity(4.0)
                .build()
        );
    }

    public static List<Game> getMockCollection(String username) {
        return List.of(
            Game.builder()
                .id("7")
                .name("7 Wonders")
                .yearPublished(2016)
                .minPlayers(2)
                .maxPlayers(7)
                .playingTime(30)
                .minAge(10)
                .description("Build your civilization and erect an architectural wonder which will transcend future times.")
                .bggRating(7.8)
                .averageRating(7.8)
                .complexity(2.3)
                .ownedBy(List.of(username))
                .build(),
            Game.builder()
                .id("31260")
                .name("Agricola")
                .yearPublished(2007)
                .minPlayers(1)
                .maxPlayers(5)
                .playingTime(150)
                .minAge(12)
                .description("Farm life in the 17th century. You are a farmer in a wooden shack with your spouse and little help.")
                .bggRating(8.0)
                .averageRating(8.0)
                .complexity(3.6)
                .ownedBy(List.of(username))
                .build(),
            Game.builder()
                .id("230802")
                .name("Azul")
                .yearPublished(2017)
                .minPlayers(2)
                .maxPlayers(4)
                .playingTime(45)
                .minAge(8)
                .description("Abstract strategy game about decorating the walls of the Royal Palace of Evora.")
                .bggRating(7.8)
                .averageRating(7.8)
                .complexity(1.8)
                .ownedBy(List.of(username))
                .build(),
            Game.builder()
                .id("2651")
                .name("Power Grid")
                .yearPublished(2004)
                .minPlayers(2)
                .maxPlayers(6)
                .playingTime(120)
                .minAge(12)
                .description("Players represent companies that own power plants and buy raw materials to produce electricity.")
                .bggRating(7.9)
                .averageRating(7.9)
                .complexity(3.3)
                .ownedBy(List.of(username))
                .build(),
            Game.builder()
                .id("266192")
                .name("Wingspan")
                .yearPublished(2019)
                .minPlayers(1)
                .maxPlayers(5)
                .playingTime(70)
                .minAge(10)
                .description("Engine-building card game about birds. Players attract birds to their wildlife preserves.")
                .bggRating(8.1)
                .averageRating(8.1)
                .complexity(2.4)
                .ownedBy(List.of(username))
                .build()
        );
    }
}
