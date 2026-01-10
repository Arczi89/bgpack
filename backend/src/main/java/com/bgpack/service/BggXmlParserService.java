package com.bgpack.service;

import com.bgpack.dto.GameStatsDto;
import com.bgpack.entity.Game;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class BggXmlParserService {

    public List<Game> parseSearchResults(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            List<Game> games = new ArrayList<>();

            for (int i = 0; i < items.getLength(); i++) {
                Node item = items.item(i);
                if (item.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) item;
                    Game game = parseGameFromSearchElement(element);
                    if (game != null) {
                        games.add(game);
                    }
                }
            }

            log.info("Parsed {} games from search results", games.size());
            return games;
        } catch (UnsupportedEncodingException e) {
            log.error("Error with UTF-8 encoding: {}", e.getMessage());
            throw new RuntimeException("UTF-8 encoding not supported", e);
        } catch (Exception e) {
            log.error("Error parsing XML search response: {}", e.getMessage());
            throw new RuntimeException(
                "Failed to parse BGG API search response", e);
        }
    }

    public Game parseGameDetails(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            if (items.getLength() > 0) {
                Element element = (Element) items.item(0);
                return parseGameFromDetailElement(element);
            }

            throw new RuntimeException("No game found in XML response");
        } catch (UnsupportedEncodingException e) {
            log.error("Error with UTF-8 encoding: {}", e.getMessage());
            throw new RuntimeException("UTF-8 encoding not supported", e);
        } catch (Exception e) {
            log.error("Error parsing XML game details response: {}", e.getMessage());
            throw new RuntimeException(
                "Failed to parse BGG API game details response", e);
        }
    }

    public List<Game> parseCollection(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            List<Game> games = new ArrayList<>();

            for (int i = 0; i < items.getLength(); i++) {
                Node item = items.item(i);
                if (item.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) item;
                    Game game = parseGameFromCollectionElement(element);
                    if (game != null) {
                        games.add(game);
                    }
                }
            }

            log.info("Parsed {} games from collection", games.size());
            return games;
        } catch (UnsupportedEncodingException e) {
            log.error("Error with UTF-8 encoding: {}", e.getMessage());
            throw new RuntimeException("UTF-8 encoding not supported", e);
        } catch (Exception e) {
            log.error("Error parsing XML collection response: {}", e.getMessage());
            throw new RuntimeException(
                "Failed to parse BGG API collection response", e);
        }
    }

    private Game parseGameFromSearchElement(final Element element) {
        try {
            String bggId = getAttributeValue(element, "id");
            String name = getElementValue(element, "name");
            String yearPublished = getElementValue(element, "yearpublished");

            if (bggId == null || name == null) {
                return null;
            }

            return Game.builder()
                    .bggId(bggId)
                    .name(name)
                    .yearPublished(parseInteger(yearPublished))
                    .build();
        } catch (Exception e) {
            log.warn("Error parsing game from search element: {}", e.getMessage());
            return null;
        }
    }

    private Game parseGameFromDetailElement(Element element) {
        try {
            String bggId = element.getAttribute("id");
            String name = getElementValue(element, "name");
            String yearPublished = getElementValue(element, "yearpublished");
            String minPlayers = getElementValue(element, "minplayers");
            String maxPlayers = getElementValue(element, "maxplayers");
            String playingTime = getElementValue(element, "playingtime");
            String minAge = getElementValue(element, "minage");
            String description = getElementValue(element, "description");
            String imageUrl = getElementValue(element, "image");
            String thumbnailUrl = getElementValue(element, "thumbnail");

            // Parse statistics
            Element statsElement = getChildElement(element, "statistics");
            BigDecimal bggRating = null;
            BigDecimal averageRating = null;
            BigDecimal complexity = null;

            if (statsElement != null) {
                Element ratingsElement = getChildElement(statsElement, "ratings");
                if (ratingsElement != null) {
                    bggRating = parseDouble(getElementValue(ratingsElement, "bayesaverage"));
                    averageRating = parseDouble(getElementValue(ratingsElement, "average"));
                    complexity = parseDouble(getElementValue(ratingsElement, "averageweight"));
                }
            }

            return Game.builder()
                    .bggId(bggId)
                    .name(name)
                    .yearPublished(parseInteger(yearPublished))
                    .minPlayers(parseInteger(minPlayers))
                    .maxPlayers(parseInteger(maxPlayers))
                    .playingTime(parseInteger(playingTime))
                    .minAge(parseInteger(minAge))
                    .description(description)
                    .imageUrl(imageUrl)
                    .thumbnailUrl(thumbnailUrl)
                    .bggRating(bggRating)
                    .averageRating(averageRating)
                    .complexity(complexity)
                    .build();
        } catch (Exception e) {
            log.warn("Error parsing game from detail element: {}", e.getMessage());
            return null;
        }
    }

    private Game parseGameFromCollectionElement(Element element) {
        String bggId = element.getAttribute("objectid");
        String name = getElementValue(element, "name");
        String yearPublished = getElementValue(element, "yearpublished");
        String imageUrl = getElementValue(element, "image");
        String thumbnailUrl = getElementValue(element, "thumbnail");

        BigDecimal bggRating = null;
        BigDecimal averageRating = null;
        BigDecimal complexity = null;
        Integer rank = null;

        Element statsElement = getChildElement(element, "stats");
        if (statsElement != null) {
            Integer minPlayers = parseInteger(statsElement.getAttribute("minplayers"));
            Integer maxPlayers = parseInteger(statsElement.getAttribute("maxplayers"));
            Integer playingTime = parseInteger(statsElement.getAttribute("playingtime"));
            Integer minAge = parseInteger(statsElement.getAttribute("minage"));

            Element ratingElement = getChildElement(statsElement, "rating");
            if (ratingElement != null) {
                bggRating = getAttributeBigDecimalValue(ratingElement, "bayesaverage");
                averageRating = getAttributeBigDecimalValue(ratingElement, "average");
                complexity = getAttributeBigDecimalValue(ratingElement, "averageweight");

                rank = parseRankFromRanks(ratingElement);
            }

            return Game.builder()
                    .bggId(bggId)
                    .name(name)
                    .yearPublished(parseInteger(yearPublished))
                    .minPlayers(minPlayers)
                    .maxPlayers(maxPlayers)
                    .playingTime(playingTime)
                    .minAge(minAge)
                    .imageUrl(imageUrl)
                    .thumbnailUrl(thumbnailUrl)
                    .bggRating(bggRating)
                    .averageRating(averageRating)
                    .complexity(complexity)
                    .rank(rank)
                    .build();
        }

        return Game.builder()
                .bggId(bggId)
                .name(name)
                .yearPublished(parseInteger(yearPublished))
                .imageUrl(imageUrl)
                .thumbnailUrl(thumbnailUrl)
                .build();
    }

    private BigDecimal getAttributeBigDecimalValue(Element parent, String tagName) {
        Element el = getChildElement(parent, tagName);
        if (el != null) {
            return parseDouble(el.getAttribute("value"));
        }
        return null;
    }

    private Integer parseRankFromRanks(Element ratingElement) {
        Element ranksElement = getChildElement(ratingElement, "ranks");
        if (ranksElement != null) {
            NodeList ranks = ranksElement.getElementsByTagName("rank");
            for (int i = 0; i < ranks.getLength(); i++) {
                Element rankEl = (Element) ranks.item(i);
                if ("boardgame".equals(rankEl.getAttribute("name"))) {
                    String value = rankEl.getAttribute("value");
                    if ("Not Ranked".equalsIgnoreCase(value)) return null;
                    return parseInteger(value);
                }
            }
        }
        return null;
    }

    public GameStatsDto parseGameStats(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            if (items.getLength() > 0) {
                Element element = (Element) items.item(0);
                return parseGameStatsFromElement(element);
            }

            throw new RuntimeException("No game found in XML response");
        } catch (UnsupportedEncodingException e) {
            log.error("Error with UTF-8 encoding: {}", e.getMessage());
            throw new RuntimeException("UTF-8 encoding not supported", e);
        } catch (Exception e) {
            log.error("Error parsing XML game stats response: {}", e.getMessage());
            throw new RuntimeException(
                "Failed to parse BGG API game stats response", e);
        }
    }

    public List<GameStatsDto> parseMultipleGameStats(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            List<GameStatsDto> statsList = new ArrayList<>();

            for (int i = 0; i < items.getLength(); i++) {
                Node item = items.item(i);
                if (item.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) item;
                    GameStatsDto stats = parseGameStatsFromElement(element);
                    if (stats != null) {
                        statsList.add(stats);
                    }
                }
            }

            log.info("Parsed {} game stats from multiple games response", statsList.size());
            return statsList;
        } catch (UnsupportedEncodingException e) {
            log.error("Error with UTF-8 encoding: {}", e.getMessage());
            throw new RuntimeException("UTF-8 encoding not supported", e);
        } catch (Exception e) {
            log.error("Error parsing XML multiple game stats response: {}", e.getMessage());
            throw new RuntimeException(
                "Failed to parse BGG API multiple game stats response", e);
        }
    }

    public List<Game> parseSearchResultsToEntities(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                    new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            List<Game> games = new ArrayList<>();

            for (int i = 0; i < items.getLength(); i++) {
                Node item = items.item(i);
                if (item.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) item;
                    com.bgpack.entity.Game game = parseGameFromSearchElementToEntity(element);
                    if (game != null) {
                        games.add(game);
                    }
                }
            }

            log.info("Parsed {} games from search results to entities", games.size());
            return games;
        } catch (Exception e) {
            log.error("Error parsing XML search response to entities: {}", e.getMessage());
            throw new RuntimeException("Failed to parse BGG API search response", e);
        }
    }

    public Game parseGameDetailsToEntity(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                    new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            if (items.getLength() > 0) {
                Element element = (Element) items.item(0);
                return parseGameFromDetailElementToEntity(element);
            }

            throw new RuntimeException("No game found in XML response");
        } catch (Exception e) {
            log.error("Error parsing XML game details response to entity: {}", e.getMessage());
            throw new RuntimeException("Failed to parse BGG API game details response", e);
        }
    }

    public List<Game> parseCollectionToEntities(final String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(
                    new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            List<Game> games = new ArrayList<>();

            for (int i = 0; i < items.getLength(); i++) {
                Node item = items.item(i);
                if (item.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) item;
                    Game game = parseGameFromCollectionElementToEntity(element);
                    if (game != null) {
                        games.add(game);
                    }
                }
            }

            log.info("Parsed {} games from collection to entities", games.size());
            return games;
        } catch (Exception e) {
            log.error("Error parsing XML collection response to entities: {}", e.getMessage());
            throw new RuntimeException("Failed to parse BGG API collection response", e);
        }
    }

    private Game parseGameFromSearchElementToEntity(final Element element) {
        try {
            String bggId = getAttributeValue(element, "id");
            String name = getElementValue(element, "name");
            String yearPublished = getElementValue(element, "yearpublished");

            if (bggId == null || name == null) {
                return null;
            }

            return Game.builder()
                    .bggId(bggId)
                    .name(name)
                    .yearPublished(parseInteger(yearPublished))
                    .build();
        } catch (Exception e) {
            log.warn("Error parsing game from search element to entity: {}", e.getMessage());
            return null;
        }
    }

    private Game parseGameFromDetailElementToEntity(Element element) {
        try {
            String bggId = getAttributeValue(element, "id");
            String name = getElementValue(element, "name");
            String yearPublished = getElementValue(element, "yearpublished");
            String minPlayers = getElementValue(element, "minplayers");
            String maxPlayers = getElementValue(element, "maxplayers");
            String playingTime = getElementValue(element, "playingtime");
            String minAge = getElementValue(element, "minage");
            String description = getElementValue(element, "description");
            String imageUrl = getElementValue(element, "image");
            String thumbnailUrl = getElementValue(element, "thumbnail");

            // Parse statistics
            Element statsElement = getChildElement(element, "statistics");
            BigDecimal bggRating = null;
            BigDecimal averageRating = null;
            BigDecimal complexity = null;
            BigDecimal averageWeight = null;

            if (statsElement != null) {
                Element ratingsElement = getChildElement(statsElement, "ratings");
                if (ratingsElement != null) {
                    bggRating = parseDouble(getElementValue(ratingsElement, "bayesaverage"));
                    averageRating = parseDouble(getElementValue(ratingsElement, "average"));
                    complexity = parseDouble(getElementValue(ratingsElement, "averageweight"));
                    averageWeight = complexity; // Same value
                }
            }

            // Parse suggested players as JSON-compatible Map
            Map<String, Object> suggestedPlayers = parseSuggestedPlayersToMap(element);

            return Game.builder()
                    .bggId(bggId)
                    .name(name)
                    .yearPublished(parseInteger(yearPublished))
                    .minPlayers(parseInteger(minPlayers))
                    .maxPlayers(parseInteger(maxPlayers))
                    .playingTime(parseInteger(playingTime))
                    .minAge(parseInteger(minAge))
                    .description(description)
                    .imageUrl(imageUrl)
                    .thumbnailUrl(thumbnailUrl)
                    .bggRating(bggRating)
                    .averageRating(averageRating)
                    .complexity(complexity)
                    .averageWeight(averageWeight)
                    .suggestedNumPlayers(suggestedPlayers)
                    .build();
        } catch (Exception e) {
            log.warn("Error parsing game from detail element to entity: {}", e.getMessage());
            return null;
        }
    }

    private com.bgpack.entity.Game parseGameFromCollectionElementToEntity(Element element) {
        String id = element.getAttribute("objectid");
        String name = getElementValue(element, "name");
        String yearPublished = getElementValue(element, "yearpublished");
        String imageUrl = getElementValue(element, "image");
        String thumbnailUrl = getElementValue(element, "thumbnail");

        BigDecimal bggRating = null;
        BigDecimal averageRating = null;
        BigDecimal complexity = null;
        BigDecimal averageWeight = null;
        Integer rank = null;

        Element statsElement = getChildElement(element, "stats");
        Integer minPlayers = null;
        Integer maxPlayers = null;
        Integer playingTime = null;
        Integer minAge = null;

        if (statsElement != null) {
            minPlayers = parseInteger(statsElement.getAttribute("minplayers"));
            maxPlayers = parseInteger(statsElement.getAttribute("maxplayers"));
            playingTime = parseInteger(statsElement.getAttribute("playingtime"));
            minAge = parseInteger(statsElement.getAttribute("minage"));

            Element ratingElement = getChildElement(statsElement, "rating");
            if (ratingElement != null) {
                bggRating = getAttributeBigDecimalValue(ratingElement, "bayesaverage");
                averageRating = getAttributeBigDecimalValue(ratingElement, "average");
                complexity = getAttributeBigDecimalValue(ratingElement, "averageweight");
                averageWeight = complexity;

                rank = parseRankFromRanks(ratingElement);
            }
        }

        return Game.builder()
                .bggId(id)
                .name(name)
                .yearPublished(parseInteger(yearPublished))
                .minPlayers(minPlayers)
                .maxPlayers(maxPlayers)
                .playingTime(playingTime)
                .minAge(minAge)
                .imageUrl(imageUrl)
                .thumbnailUrl(thumbnailUrl)
                .bggRating(bggRating)
                .averageRating(averageRating)
                .complexity(complexity)
                .averageWeight(averageWeight)
                .rank(rank)
                .build();
    }

    private Map<String, Object> parseSuggestedPlayersToMap(Element element) {
        Map<String, Object> result = new HashMap<>();

        NodeList polls = element.getElementsByTagName("poll");
        for (int i = 0; i < polls.getLength(); i++) {
            Element poll = (Element) polls.item(i);
            if ("suggested_numplayers".equals(poll.getAttribute("name"))) {
                List<String> suggestedCounts = new ArrayList<>();

                NodeList results = poll.getElementsByTagName("result");
                for (int j = 0; j < results.getLength(); j++) {
                    Element pollResult = (Element) results.item(j);
                    String numPlayers = pollResult.getAttribute("numplayers");

                    int best = parseInteger(pollResult.getAttribute("best")) != null ?
                            parseInteger(pollResult.getAttribute("best")) : 0;
                    int recommended = parseInteger(pollResult.getAttribute("recommended")) != null ?
                            parseInteger(pollResult.getAttribute("recommended")) : 0;

                    if (best > recommended) {
                        suggestedCounts.add(numPlayers + " (best)");
                    } else if (recommended > 0) {
                        suggestedCounts.add(numPlayers + " (recommended)");
                    }
                }

                result.put("suggested", suggestedCounts);
                break;
            }
        }

        return result.isEmpty() ? null : result;
    }


    private GameStatsDto parseGameStatsFromElement(final Element element) {
        try {
            String id = getAttributeValue(element, "id");
            String name = getElementValue(element, "name");

            // Parse statistics
            Element statsElement = getChildElement(element, "statistics");
            BigDecimal bggRating = null;
            BigDecimal averageRating = null;
            BigDecimal averageWeight = null;
            String suggestedNumPlayers = null;

            if (statsElement != null) {
                log.info("Found statistics element for gameId: {}", id);
                Element ratingsElement = getChildElement(statsElement, "ratings");
                if (ratingsElement != null) {
                    log.info("Found ratings element for gameId: {}", id);
                    bggRating = parseDouble(getElementValue(ratingsElement, "bayesaverage"));
                    averageRating = parseDouble(getElementValue(ratingsElement, "average"));
                    averageWeight = parseDouble(getElementValue(ratingsElement, "averageweight"));
                    log.info("Parsed statistics for gameId {}: bggRating={}, averageRating={}, averageWeight={}",
                        id, bggRating, averageRating, averageWeight);
                } else {
                    log.warn("No ratings element found in statistics for gameId: {}", id);
                }
            } else {
                log.warn("No statistics element found for gameId: {}", id);
            }

            // Parse suggested number of players from poll-summary
            NodeList pollSummaryNodes = element.getElementsByTagName("poll-summary");
            for (int i = 0; i < pollSummaryNodes.getLength(); i++) {
                Element pollSummaryElement = (Element) pollSummaryNodes.item(i);
                String pollName = getAttributeValue(pollSummaryElement, "name");
                if ("suggested_numplayers".equals(pollName)) {
                    suggestedNumPlayers = getElementValue(pollSummaryElement, "value");
                    log.info("Found suggestedNumPlayers for gameId {}: {}", id, suggestedNumPlayers);
                    break;
                }
            }

            return new GameStatsDto(id, name, bggRating, averageRating,
                                    averageWeight, suggestedNumPlayers);
        } catch (Exception e) {
            log.warn("Error parsing game stats from element: {}", e.getMessage());
            return null;
        }
    }

    private String parseSuggestedNumPlayers(final Element pollElement) {
        try {
            NodeList resultNodes = pollElement.getElementsByTagName("result");
            StringBuilder suggestedPlayers = new StringBuilder();

            for (int i = 0; i < resultNodes.getLength(); i++) {
                Element resultElement = (Element) resultNodes.item(i);
                String numPlayers = getAttributeValue(resultElement, "numplayers");
                String best = getAttributeValue(resultElement, "best");
                String recommended = getAttributeValue(resultElement, "recommended");
                String notRecommended = getAttributeValue(resultElement, "notrecommended");

                if ("1".equals(best) || "1".equals(recommended)) {
                    if (suggestedPlayers.length() > 0) {
                        suggestedPlayers.append(", ");
                    }
                    suggestedPlayers.append(numPlayers);
                }
            }

            return suggestedPlayers.length() > 0 ? suggestedPlayers.toString() : null;
        } catch (Exception e) {
            log.warn("Error parsing suggested number of players: {}", e.getMessage());
            return null;
        }
    }

    private String getAttributeValue(final Element element, final String attributeName) {
        if (element.hasAttribute(attributeName)) {
            return element.getAttribute(attributeName);
        }
        return null;
    }

    private String getElementValue(final Element element, final String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            Node node = nodeList.item(0);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                return node.getTextContent();
            }
        }
        return null;
    }

    private Element getChildElement(final Element parent, final String tagName) {
        NodeList nodeList = parent.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            Node node = nodeList.item(0);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                return (Element) node;
            }
        }
        return null;
    }

    private Integer parseInteger(final String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            log.warn("Failed to parse integer: {}", value);
            return null;
        }
    }

    private BigDecimal parseDouble(final String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            log.warn("Failed to parse BigDecimal: {}", value);
            return null;
        }
    }
}
