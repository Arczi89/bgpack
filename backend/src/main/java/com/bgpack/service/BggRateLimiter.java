package com.bgpack.service;

import com.google.common.util.concurrent.RateLimiter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class BggRateLimiter {

    private final RateLimiter rateLimiter;

    public BggRateLimiter(@Value("${bgg.api.rate-limit:0.2}") double rateLimit) {
        this.rateLimiter = RateLimiter.create(rateLimit);
        log.info("BGG Rate limiter initialized with rate: {} requests per second", rateLimit);
    }

    public void acquire() {
        double waitTime = rateLimiter.acquire();
        if (waitTime > 0) {
            log.debug("Rate limited, waited {} seconds", waitTime);
        }
    }

    public boolean tryAcquire() {
        return rateLimiter.tryAcquire();
    }

    public boolean tryAcquire(long timeout, java.util.concurrent.TimeUnit unit) {
        return rateLimiter.tryAcquire(timeout, unit);
    }
}
