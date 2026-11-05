package com.nexusai.routing_service.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank(message = "prompt is required")
        String prompt,
        String provider,
        String model
) {
    public ChatRequest(String prompt) {
        this(prompt, null, null);
    }
}
