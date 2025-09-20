package com.bgpack.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;

import javax.net.ssl.SSLException;
import java.time.Duration;

@Component
@Slf4j
public class BggApiClient {

    private static final int MAX_MEMORY_SIZE = 1024 * 1024;
    private static final int TIMEOUT_MS = 60000;
    private static final int MAX_RETRIES = 3;

    private final WebClient webClient;
    private final String baseUrl;

    public BggApiClient(@Value("${bgg.api.base-url}") final String baseUrl,
                       @Value("${bgg.api.timeout:30000}") final int timeout) {
        this.baseUrl = baseUrl;

        HttpClient httpClient = HttpClient.create()
                .secure(sslSpec -> {
                    try {
                        sslSpec.sslContext(
                            io.netty.handler.ssl.SslContextBuilder
                                .forClient()
                                .trustManager(
                                    io.netty.handler.ssl.util.InsecureTrustManagerFactory.INSTANCE)
                                .build());
                    } catch (SSLException e) {
                        log.error("Failed to configure SSL context: {}", e.getMessage());
                        throw new RuntimeException("SSL configuration failed", e);
                    }
                })
                .followRedirect(true);

        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new org.springframework.http.client.reactive
                    .ReactorClientHttpConnector(httpClient))
                .defaultHeader("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .defaultHeader("Accept", "application/xml, text/xml, */*")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(MAX_MEMORY_SIZE))
                .build();
    }

    /**
     * Search for games on BGG.
     * @param query search term
     * @return XML response with search results
     */
    public Mono<String> searchGames(final String query) {
        return webClient.get()
                .uri("/search?search={query}&type=boardgame", query)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .doOnError(error -> log.error("Error searching games: {}", error.getMessage()));
    }

    public Mono<String> getGameDetails(final String gameId) {
        return webClient.get()
                .uri("/thing?id={id}&stats=1", gameId)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .doOnError(error -> log.error("Error getting game details: {}", error.getMessage()));
    }

    /**
     * Get user's game collection from BGG.
     * @param username BGG username
     * @return XML response with collection data
     */
    public Mono<String> getCollection(final String username) {
        log.info("Getting collection for username: {}", username);
        return webClient.get()
                .uri("/collection/{username}?own=1&stats=1", username)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .retryWhen(Retry.backoff(MAX_RETRIES, Duration.ofSeconds(2))
                        .filter(throwable -> {
                            if (throwable.getMessage() != null
                                && (throwable.getMessage().contains("timeout")
                                 || throwable.getMessage().contains("connection"))) {
                                return true;
                            }
                            return false;
                        }))
                .doOnError(error -> log.error("Error getting collection: {}", error.getMessage(), error));
    }

    public Mono<String> getMultipleGames(final String gameIds) {
        return webClient.get()
                .uri("/thing?id={ids}&stats=1", gameIds)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .doOnError(error -> log.error("Error getting multiple games: {}", error.getMessage()));
    }

    /**
     * Get user's game collection from BGG with subtype filter.
     * @param username BGG username
     * @param subtype game subtype (e.g., "boardgame", "boardgameexpansion")
     * @return XML response with collection data
     */
    public Mono<String> getCollection(final String username, final String subtype) {
        log.info("Getting collection for username: {} with subtype: {}", username, subtype);
        return webClient.get()
                .uri("/collection/{username}?own=1&stats=1&subtype={subtype}", username, subtype)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .retryWhen(Retry.backoff(MAX_RETRIES, Duration.ofSeconds(2))
                        .filter(throwable -> {
                            if (throwable.getMessage() != null
                                && (throwable.getMessage().contains("timeout")
                                 || throwable.getMessage().contains("connection"))) {
                                return true;
                            }
                            return false;
                        }))
                .doOnError(error -> log.error("Error getting collection: {}", error.getMessage(), error));
    }
}
