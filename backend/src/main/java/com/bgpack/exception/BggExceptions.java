package com.bgpack.exception;

public class BggExceptions {

    public static class QueuedException extends RuntimeException {
        public QueuedException() {
            super("BGG API returned 202 - Request is being processed.");
        }
    }

    public static class RateLimitException extends RuntimeException {
        public RateLimitException() {
            super("BGG API returned 429 - Rate limit exceeded.");
        }
    }
}