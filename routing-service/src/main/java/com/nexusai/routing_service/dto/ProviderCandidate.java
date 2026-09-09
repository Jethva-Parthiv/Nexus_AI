package com.nexusai.routing_service.dto;

public record ProviderCandidate(
        String provider,
        int priority,
        boolean enabled
) {}