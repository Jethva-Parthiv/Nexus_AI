package com.nexusai.provider_service.exception;

import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.enums.ProviderStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles validation errors (e.g. @NotBlank, @NotNull missing fields)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");

        return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
    }

    // Handles general uncaught exceptions and returns normalized JSON error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<GenerateResponseDto> handleGeneralException(Exception ex) {
        GenerateResponseDto errorResponse = GenerateResponseDto.builder()
                .status(ProviderStatus.UNKNOWN_ERROR)
                .errorMessage("Internal server error: " + ex.getMessage())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
