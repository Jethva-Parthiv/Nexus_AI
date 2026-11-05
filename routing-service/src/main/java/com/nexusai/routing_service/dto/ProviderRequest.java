package com.nexusai.routing_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProviderRequest(
        String requestId,
        Long userId,
        String provider,
        String model,
        String prompt
) {
    public ProviderRequest(String requestId, Long userId, String provider, String prompt) {
        this(requestId, userId, provider, null, prompt);
    }
}
