package com.bgpack.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;
import com.bgpack.exception.BggExceptions.QueuedException;
import com.bgpack.exception.BggExceptions.RateLimitException;

import javax.net.ssl.SSLException;
import java.time.Duration;
import java.util.concurrent.TimeoutException;

@Component
@Slf4j
public class BggApiClient {

    private static final int MAX_MEMORY_SIZE = 1024 * 1024;
    private static final int TIMEOUT_MS = 60000;
    private static final int MAX_RETRIES = 3;

    private final WebClient webClient;

    public BggApiClient(@Value("${bgg.api.base-url}") final String baseUrl,
                       @Value("${bgg.api.timeout:30000}") final int timeout,
                       @Value("${bgg.api.token:}") final String authToken) {

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
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .defaultHeader("Accept", "application/xml, text/xml, */*")
                .defaultHeader("Authorization", authToken != null && !authToken.isEmpty() ? "Bearer " + authToken : "")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(MAX_MEMORY_SIZE))
                .build();
    }

    public Mono<String> searchGames(final String query) {
        return webClient.get()
                .uri("/search?search={query}&type=boardgame", query)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .doOnError(error -> log.error("Error searching games: {}", error.getMessage()));
    }

    public Mono<String> getCollection(final String username, final String subtype) {
        log.info("Getting collection for username: {} with subtype: {}", username, subtype);
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/collection")
                        .queryParam("username", username)
                        .queryParam("own", 1)
                        .queryParam("stats", 1)
                        .queryParam("subtype", subtype)
                        .build())
                .retrieve()
                .onStatus((status -> status.value() == 202), response -> {
                    log.info("BGG API returned 202 - request queued for user '{}' with subtype '{}', retrying in 5 seconds", username, subtype);
                    return Mono.error(new QueuedException());
                })
                .onStatus(status -> status.value() == 429, response -> {
                            log.warn("BGG API: Rate limit exceeded (429).");
                            return Mono.error(new RateLimitException());
                        })
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new RuntimeException("BGG Server Error"))
                )
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .retryWhen(configureRetryStrategy());
    }

    public Mono<String> getThings(String ids) {
        log.info("Fetching detailed data from BGG for IDs: {}", ids);
        return this.webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/thing")
                        .queryParam("id", ids)
                        .queryParam("stats", 1)
                        .build())
                .retrieve()
                .onStatus((status -> status.value() == 202), response -> {
                    log.info("BGG API returned 202 - request queued for things with ids: '{}' retrying in 5 seconds", ids);
                    return Mono.error(new QueuedException());
                })
                .onStatus(status -> status.value() == 429, response -> {
                    log.warn("BGG API: Rate limit exceeded (429) - request for things with ids: '{}'.", ids);
                    return Mono.error(new RateLimitException());
                })
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new RuntimeException("BGG Server Error"))
                )
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .retryWhen(Retry.backoff(MAX_RETRIES, Duration.ofSeconds(2)));
    }

    private Retry configureRetryStrategy() {
        return Retry.backoff(MAX_RETRIES, Duration.ofSeconds(2))
                .jitter(0.8) // add some randomness to avoid 'thundering herd' problem (when many clients retry at the same time)
                .filter(throwable ->
            throwable instanceof QueuedException ||
                    throwable instanceof RateLimitException ||
                    throwable instanceof TimeoutException ||
                    (throwable.getMessage() != null && throwable.getMessage().contains("connection"))
        ).doBeforeRetry(retrySignal -> {
                Throwable failure = retrySignal.failure();
                log.info("Retry attempt #{} due to: {}",
                        retrySignal.totalRetries() + 1,
                        failure.getClass().getSimpleName());
            });
    }
}
