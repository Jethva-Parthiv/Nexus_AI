package com.nexusai.routing_service.dto;

public record ChatResponse(
        boolean success,
        String provider,
        String model,
        String response,
        long latencyMs
) {}