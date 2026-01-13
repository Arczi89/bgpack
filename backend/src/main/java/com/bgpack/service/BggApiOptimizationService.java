package com.bgpack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class BggApiOptimizationService {

    private final ConcurrentHashMap<String, RequestStats> requestStats = new ConcurrentHashMap<>();
    private final AtomicInteger totalRequests = new AtomicInteger(0);
    private final AtomicInteger failedRequests = new AtomicInteger(0);

    @Value("${bgg.api.max-requests-per-hour:720}")
    private int maxRequestsPerHour;

    @Value("${bgg.api.circuit-breaker-threshold:5}")
    private int circuitBreakerThreshold;

    @Value("${bgg.api.circuit-breaker-timeout:300}")
    private int circuitBreakerTimeoutSeconds;

    public boolean shouldMakeRequest(String endpoint) {
        RequestStats stats = requestStats.computeIfAbsent(endpoint, k -> new RequestStats());

        if (stats.isCircuitOpen()) {
            log.warn("Circuit breaker is open for endpoint: {}", endpoint);
            return false;
        }

        if (totalRequests.get() >= maxRequestsPerHour) {
            log.warn("Hourly request limit reached: {}", maxRequestsPerHour);
            return false;
        }

        return true;
    }

    public void recordRequest(String endpoint, boolean success) {
        RequestStats stats = requestStats.computeIfAbsent(endpoint, k -> new RequestStats());
        stats.recordRequest(success);

        totalRequests.incrementAndGet();
        if (!success) {
            failedRequests.incrementAndGet();
        }

        if (stats.getConsecutiveFailures() >= circuitBreakerThreshold) {
            stats.openCircuit();
            log.warn("Circuit breaker opened for endpoint: {} due to {} consecutive failures",
                    endpoint, circuitBreakerThreshold);
        }
    }

    public void resetHourlyCounter() {
        totalRequests.set(0);
        failedRequests.set(0);
        requestStats.clear();
        log.info("Hourly request counters and circuit breakers reset");
    }

    public double getSuccessRate() {
        int total = totalRequests.get();
        if (total == 0) return 100.0;
        return ((double) (total - failedRequests.get()) / total) * 100.0;
    }

    public void resetCircuitBreaker(String endpoint) {
        RequestStats stats = requestStats.get(endpoint);
        if (stats != null) {
            stats.reset();
            log.info("Circuit breaker manually reset for endpoint: {}", endpoint);
        }
    }

    private static class RequestStats {
        private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
        private final AtomicInteger totalRequests = new AtomicInteger(0);
        private LocalDateTime circuitOpenTime;
        private boolean circuitOpen = false;

        public void recordRequest(boolean success) {
            totalRequests.incrementAndGet();
            if (success) {
                consecutiveFailures.set(0);
                circuitOpen = false;
                circuitOpenTime = null;
            } else {
                consecutiveFailures.incrementAndGet();
            }
        }

        public void reset() {
            consecutiveFailures.set(0);
            circuitOpen = false;
            circuitOpenTime = null;
        }

        public boolean isCircuitOpen() {
            if (!circuitOpen) return false;

            if (circuitOpenTime != null &&
                ChronoUnit.SECONDS.between(circuitOpenTime, LocalDateTime.now()) > 300) {
                circuitOpen = false;
                circuitOpenTime = null;
                consecutiveFailures.set(0);
                return false;
            }

            return true;
        }

        public void openCircuit() {
            circuitOpen = true;
            circuitOpenTime = LocalDateTime.now();
        }

        public int getConsecutiveFailures() {
            return consecutiveFailures.get();
        }
    }
}
