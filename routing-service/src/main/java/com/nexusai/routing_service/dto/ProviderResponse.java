package com.nexusai.routing_service.dto;

public record ProviderResponse(
        boolean success,
        String provider,
        String model,
        String response,
        String status,
        String message,
        long latencyMs
) {}
