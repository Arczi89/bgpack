package com.bgpack.service;

import com.bgpack.dto.GameDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class BggXmlParserService {

    public List<GameDto> parseSearchResults(String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes()));

            NodeList items = doc.getElementsByTagName("item");
            List<GameDto> games = new ArrayList<>();

            for (int i = 0; i < items.getLength(); i++) {
                Node item = items.item(i);
                if (item.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) item;
                    GameDto game = parseGameFromSearchElement(element);
                    if (game != null) {
                        games.add(game);
                    }
                }
            }

            log.info("Parsed {} games from search results", games.size());
            return games;
        } catch (Exception e) {
            log.error("Error parsing XML search response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse BGG API search response", e);
        }
    }

    public GameDto parseGameDetails(String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes()));

            NodeList items = doc.getElementsByTagName("item");
            if (items.getLength() > 0) {
                Element element = (Element) items.item(0);
                return parseGameFromDetailElement(element);
            }

            throw new RuntimeException("No game found in XML response");
        } catch (Exception e) {
            log.error("Error parsing XML game details response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse BGG API game details response", e);
        }
    }

    public List<GameDto> parseCollection(String xmlResponse) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes()));

            NodeList items = doc.getElementsByTagName("item");
            List<GameDto> games = new ArrayList<>();

            for (int i = 0; i < items.getLength(); i++) {
                Node item = items.item(i);
                if (item.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) item;
                    GameDto game = parseGameFromCollectionElement(element);
                    if (game != null) {
                        games.add(game);
                    }
                }
            }

            log.info("Parsed {} games from collection", games.size());
            return games;
        } catch (Exception e) {
            log.error("Error parsing XML collection response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse BGG API collection response", e);
        }
    }

    private GameDto parseGameFromSearchElement(Element element) {
        try {
            String id = getAttributeValue(element, "id");
            String name = getElementValue(element, "name");
            String yearPublished = getElementValue(element, "yearpublished");

            if (id == null || name == null) {
                return null;
            }

            return GameDto.builder()
                    .id(id)
                    .name(name)
                    .yearPublished(parseInteger(yearPublished))
                    .build();
        } catch (Exception e) {
            log.warn("Error parsing game from search element: {}", e.getMessage());
            return null;
        }
    }

    private GameDto parseGameFromDetailElement(Element element) {
        try {
            String id = getAttributeValue(element, "id");
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
            Double bggRating = null;
            Double averageRating = null;
            Double complexity = null;

            if (statsElement != null) {
                Element ratingsElement = getChildElement(statsElement, "ratings");
                if (ratingsElement != null) {
                    bggRating = parseDouble(getElementValue(ratingsElement, "bayesaverage"));
                    averageRating = parseDouble(getElementValue(ratingsElement, "average"));
                    complexity = parseDouble(getElementValue(ratingsElement, "averageweight"));
                }
            }

            return GameDto.builder()
                    .id(id)
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

    private GameDto parseGameFromCollectionElement(Element element) {
        try {
            String id = getAttributeValue(element, "objectid");
            String name = getElementValue(element, "name");
            String yearPublished = getElementValue(element, "yearpublished");
            String imageUrl = getElementValue(element, "image");
            String thumbnailUrl = getElementValue(element, "thumbnail");

            // Parse statistics from stats element
            Element statsElement = getChildElement(element, "stats");
            Integer minPlayers = null;
            Integer maxPlayers = null;
            Integer playingTime = null;
            Integer minAge = null;
            Double bggRating = null;
            Double averageRating = null;
            Double complexity = null;

            if (statsElement != null) {
                minPlayers = parseInteger(getAttributeValue(statsElement, "minplayers"));
                maxPlayers = parseInteger(getAttributeValue(statsElement, "maxplayers"));
                playingTime = parseInteger(getAttributeValue(statsElement, "playingtime"));
                minAge = parseInteger(getAttributeValue(statsElement, "minage"));
                bggRating = parseDouble(getAttributeValue(statsElement, "bayesaverage"));
                averageRating = parseDouble(getAttributeValue(statsElement, "average"));
                complexity = parseDouble(getAttributeValue(statsElement, "avgweight"));
            }

            return GameDto.builder()
                    .id(id)
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
                    .build();
        } catch (Exception e) {
            log.warn("Error parsing game from collection element: {}", e.getMessage());
            return null;
        }
    }

    private String getAttributeValue(Element element, String attributeName) {
        if (element.hasAttribute(attributeName)) {
            return element.getAttribute(attributeName);
        }
        return null;
    }

    private String getElementValue(Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            Node node = nodeList.item(0);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                return node.getTextContent();
            }
        }
        return null;
    }

    private Element getChildElement(Element parent, String tagName) {
        NodeList nodeList = parent.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            Node node = nodeList.item(0);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                return (Element) node;
            }
        }
        return null;
    }

    private Integer parseInteger(String value) {
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

    private Double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            log.warn("Failed to parse double: {}", value);
            return null;
        }
    }
}
