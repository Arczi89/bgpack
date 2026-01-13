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
                       @Value("${bgg.api.timeout:30000}") final int timeout,
                       @Value("${bgg.api.token:}") final String authToken) {
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
                .uri("/collection?username={username}&own=1&stats=1&subtype={subtype}", username, subtype)
                .exchangeToMono(response -> {
                    if (response.statusCode().value() == 202) {
                        log.info("BGG API returned 202 - request queued for user '{}' with subtype '{}', retrying in 5 seconds", username, subtype);
                        return Mono.delay(Duration.ofSeconds(5))
                                .then(getCollection(username, subtype));
                    } else if (response.statusCode().is2xxSuccessful()) {
                        return response.bodyToMono(String.class);
                    } else {
                        return Mono.error(new RuntimeException("HTTP " + response.statusCode().value()));
                    }
                })
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .retryWhen(Retry.backoff(MAX_RETRIES, Duration.ofSeconds(5))
                        .filter(throwable -> {
                            if (throwable instanceof RuntimeException && throwable.getMessage().contains("429")) {
                                log.warn("BGG API returned 429 (Rate Limit). Retrying with backoff...");
                                return true;
                            }
                            return throwable.getMessage() != null &&
                                    (throwable.getMessage().contains("timeout") ||
                                            throwable.getMessage().contains("connection"));
                        })
                        .doBeforeRetry(retrySignal -> log.info("Retry attempt #{}", retrySignal.totalRetries() + 1)));
    }

    public Mono<String> getThings(String ids) {
        log.info("Fetching detailed data from BGG for IDs: {}", ids);
        return this.webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/xmlapi2/thing")
                        .queryParam("id", ids)
                        .queryParam("stats", 1)
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .retryWhen(Retry.backoff(MAX_RETRIES, Duration.ofSeconds(2)));
    }
}
