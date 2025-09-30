package com.bgpack;

import com.bgpack.service.BggXmlParserService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TestXmlParser {

    @Test
    public void testParseGameDetails() {
        BggXmlParserService parser = new BggXmlParserService();

        String xmlResponse = """
            <?xml version="1.0" encoding="UTF-8"?>
            <boardgames>
                <boardgame objectid="224517">
                    <name primary="true">Brass: Birmingham</name>
                    <yearpublished>2018</yearpublished>
                    <minplayers>2</minplayers>
                    <maxplayers>4</maxplayers>
                    <playingtime>60</playingtime>
                    <minage>14</minage>
                    <description>Build networks, grow industries, and navigate the world of the Industrial Revolution.</description>
                    <image>https://cf.geekdo-images.com/imagepage/img/example.jpg</image>
                    <thumbnail>https://cf.geekdo-images.com/imagepage/img/example_thumb.jpg</thumbnail>
                    <statistics>
                        <ratings>
                            <bayesaverage>8.6</bayesaverage>
                            <average>8.2</average>
                            <averageweight>3.87</averageweight>
                        </ratings>
                    </statistics>
                    <polls>
                        <poll name="suggested_numplayers" title="User Suggested Number of Players" totalvotes="1234">
                            <results numplayers="1">
                                <result value="Best" numvotes="0"/>
                                <result value="Recommended" numvotes="0"/>
                                <result value="Not Recommended" numvotes="1234"/>
                            </results>
                            <results numplayers="2">
                                <result value="Best" numvotes="0"/>
                                <result value="Recommended" numvotes="456"/>
                                <result value="Not Recommended" numvotes="778"/>
                            </results>
                            <results numplayers="3">
                                <result value="Best" numvotes="234"/>
                                <result value="Recommended" numvotes="567"/>
                                <result value="Not Recommended" numvotes="433"/>
                            </results>
                            <results numplayers="4">
                                <result value="Best" numvotes="345"/>
                                <result value="Recommended" numvotes="456"/>
                                <result value="Not Recommended" numvotes="433"/>
                            </results>
                        </poll>
                    </polls>
                </boardgame>
            </boardgames>
            """;

        try {
            var game = parser.parseGameDetails(xmlResponse);
            System.out.println("Game parsed successfully:");
            System.out.println("Name: " + game.getName());
            System.out.println("BGG Rating: " + game.getBggRating());
            System.out.println("Complexity: " + game.getComplexity());
            System.out.println("Recommended Players: " + game.getSuggestedNumPlayers());
        } catch (Exception e) {
            System.err.println("Error parsing XML: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
