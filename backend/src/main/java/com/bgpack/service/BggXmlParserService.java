package com.bgpack.service;

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
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class BggXmlParserService {

    /**
     * Parses the XML from the user collection endpoint (/xmlapi2/collection)
     */
    public List<Game> parseCollection(final String xmlResponse) {
        if (xmlResponse == null || xmlResponse.isBlank()) return new ArrayList<>();
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

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
            return games;
        } catch (Exception e) {
            log.error("Error parsing BGG collection XML", e);
            return new ArrayList<>();
        }
    }

    private Game parseGameFromCollectionElement(Element element) {
        String bggId = element.getAttribute("objectid");
        String name = getElementValue(element, "name");
        String yearPublished = getElementValue(element, "yearpublished");
        String imageUrl = getElementValue(element, "image");
        String thumbnailUrl = getElementValue(element, "thumbnail");

        Element statsElement = getChildElement(element, "stats");

        Integer minPlayers = null;
        Integer maxPlayers = null;
        Integer playingTime = null;
        Integer minAge = null;
        BigDecimal geekRating = null;
        BigDecimal complexity = null;
        BigDecimal averageRating = null;
        Integer rank = null;

        if (statsElement != null) {
            minPlayers = parseInteger(statsElement.getAttribute("minplayers"));
            maxPlayers = parseInteger(statsElement.getAttribute("maxplayers"));
            playingTime = parseInteger(statsElement.getAttribute("playingtime"));
            minAge = parseInteger(statsElement.getAttribute("minage"));

            Element ratingElement = getChildElement(statsElement, "rating");
            if (ratingElement != null) {
                geekRating = getAttributeBigDecimalValue(ratingElement, "bayesaverage");
                averageRating = getAttributeBigDecimalValue(ratingElement, "average");
                complexity = getAttributeBigDecimalValue(ratingElement, "averageweight");

                Element ranksElement = getChildElement(ratingElement, "ranks");
                if (ranksElement != null) {
                    NodeList rankList = ranksElement.getElementsByTagName("rank");
                    for (int i = 0; i < rankList.getLength(); i++) {
                        Element rankEl = (Element) rankList.item(i);
                        if ("boardgame".equals(rankEl.getAttribute("name"))) {
                            rank = parseInteger(rankEl.getAttribute("value"));
                        }
                    }
                }
            }
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
                .bggRating(geekRating)
                .averageRating(averageRating)
                .complexity(complexity)
                .rank(rank)
                .build();
    }

    /**
     * Parsing XML endpoint /thing?id=...&stats=1
     */
    public List<Game> parseThings(final String xmlResponse) {
        if (xmlResponse == null || xmlResponse.isBlank()) return new ArrayList<>();
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));

            NodeList items = doc.getElementsByTagName("item");
            List<Game> games = new ArrayList<>();
            for (int i = 0; i < items.getLength(); i++) {
                Element element = (Element) items.item(i);
                games.add(parseGameFromThingElement(element));
            }
            return games;
        } catch (Exception e) {
            log.error("Error parsing BGG thing XML", e);
            return new ArrayList<>();
        }
    }

    private Game parseGameFromThingElement(Element element) {
        String bggId = element.getAttribute("id");
        String name = "";
        NodeList nameNodes = element.getElementsByTagName("name");
        for (int i = 0; i < nameNodes.getLength(); i++) {
            Element nameEl = (Element) nameNodes.item(i);
            if ("primary".equals(nameEl.getAttribute("type"))) {
                name = nameEl.getAttribute("value");
                break;
            }
        }

        String description = getElementValue(element, "description");
        String yearPublished = getAttributeValue(element);
        String imageUrl = getElementValue(element, "image");
        String thumbnailUrl = getElementValue(element, "thumbnail");

        BigDecimal bggRating = null;
        BigDecimal complexity = null;
        BigDecimal averageRating = null;
        Integer rank = null;

        Element statsElement = getChildElement(element, "statistics");
        if (statsElement != null) {
            Element ratingsElement = getChildElement(statsElement, "ratings");
            if (ratingsElement != null) {
                averageRating = getAttributeBigDecimalValue(ratingsElement, "average");
                bggRating = getAttributeBigDecimalValue(ratingsElement, "bayesaverage");
                complexity = getAttributeBigDecimalValue(ratingsElement, "averageweight");

                Element ranksElement = getChildElement(ratingsElement, "ranks");
                if (ranksElement != null) {
                    NodeList rankList = ranksElement.getElementsByTagName("rank");
                    for (int i = 0; i < rankList.getLength(); i++) {
                        Element rankEl = (Element) rankList.item(i);
                        if ("boardgame".equals(rankEl.getAttribute("name"))) {
                            rank = parseInteger(rankEl.getAttribute("value"));
                        }
                    }
                }
            }
        }

        return Game.builder()
                .bggId(bggId)
                .name(name)
                .description(description)
                .yearPublished(parseInteger(yearPublished))
                .imageUrl(imageUrl)
                .thumbnailUrl(thumbnailUrl)
                .bggRating(bggRating)
                .averageRating(averageRating)
                .complexity(complexity)
                .rank(rank)
                .build();
    }

    private String getAttributeValue(Element parent) {
        Element el = getChildElement(parent, "yearpublished");
        return el != null ? el.getAttribute("value") : null;
    }

    private BigDecimal getAttributeBigDecimalValue(Element parent, String tagName) {
        Element el = getChildElement(parent, tagName);
        if (el != null) {
            String val = el.getAttribute("value");
            return parseBigDecimal(val);
        }
        return null;
    }

    private String getElementValue(Element element, String tagName) {
        if (element == null) return null;
        NodeList nl = element.getElementsByTagName(tagName);
        return (nl.getLength() > 0) ? nl.item(0).getTextContent() : null;
    }

    private Element getChildElement(Element parent, String tagName) {
        if (parent == null) return null;
        NodeList nl = parent.getElementsByTagName(tagName);
        return (nl.getLength() > 0) ? (Element) nl.item(0) : null;
    }

    private Integer parseInteger(String val) {
        if (val == null || val.isBlank() || val.equalsIgnoreCase("N/A") || val.equalsIgnoreCase("Not Ranked")) {
            return null;
        }
        try {
            int parsed = Integer.parseInt(val.trim());
            if (parsed <= 0) {
                return null;
            }
            return parsed;
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal parseBigDecimal(String val) {
        if (val == null || val.isBlank() || val.equalsIgnoreCase("N/A")) {
            return null;
        }
        try {
            BigDecimal bd = new BigDecimal(val.trim());
            if (bd.compareTo(BigDecimal.ZERO) < 0) {
                return null;
            }
            return bd;
        } catch (Exception e) {
            return null;
        }
    }
}