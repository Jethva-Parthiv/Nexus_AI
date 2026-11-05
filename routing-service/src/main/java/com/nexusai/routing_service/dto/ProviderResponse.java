package com.nexusai.routing_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProviderResponse(
        boolean success,
        String provider,
        String model,
        String response,
        String status,
        String message,
        long latencyMs,
        Integer tokensUsed
) {
    public ProviderResponse(boolean success, String provider, String model, String response, String status, String message, long latencyMs) {
        this(success, provider, model, response, status, message, latencyMs, null);
    }
}
