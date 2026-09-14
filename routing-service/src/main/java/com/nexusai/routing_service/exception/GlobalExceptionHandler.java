package com.nexusai.routing_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AllProvidersFailedException.class)
    public ResponseEntity<Map<String, Object>> handleAllProvidersFailed(AllProvidersFailedException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "success", false,
                        "error", "ALL_PROVIDERS_FAILED",
                        "message", "All configured providers failed to respond. Please try again later."
                ));
    }
}