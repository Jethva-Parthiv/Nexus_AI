package com.nexusai.routing_service.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank(message = "prompt is required")
        String prompt
) {}