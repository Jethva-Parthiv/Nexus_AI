package com.nexusai.routing_service.dto;

public record ProviderRequest(
        String requestId,
        Long userId,
        String provider,
        String prompt
) {}