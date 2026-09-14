package com.nexusai.routing_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.HashMap;
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

    @ExceptionHandler(NoProviderAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleNoProviderAvailable(NoProviderAvailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "success", false,
                        "error", "NO_PROVIDER_AVAILABLE",
                        "message", "No eligible providers configured for this user."
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", "VALIDATION_FAILED");
        body.put("message", ex.getBindingResult().getFieldErrors().isEmpty()
                ? "Invalid request"
                : ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "success", false,
                        "error", "MALFORMED_REQUEST",
                        "message", "Request body missing or malformed"
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "success", false,
                        "error", "INTERNAL_ERROR",
                        "message", "Unexpected error occurred"
                ));
    }
}