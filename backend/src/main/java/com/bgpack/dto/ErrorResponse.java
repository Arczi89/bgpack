package com.bgpack.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> validationErrors
) {
    public static ErrorResponse of(LocalDateTime timestamp, int status, String error,
                                   String message, String path) {
        return new ErrorResponse(timestamp, status, error, message, path, null);
    }

    public static ErrorResponse withValidation(LocalDateTime timestamp, int status, String error,
                                               String message, String path,
                                               Map<String, String> validationErrors) {
        return new ErrorResponse(timestamp, status, error, message, path, validationErrors);
    }
}
