package com.nexusai.routing_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatResponse(
        boolean success,
        String provider,
        String model,
        String response,
        String status,
        long latencyMs,
        Integer tokensUsed
) {
    public ChatResponse(boolean success, String provider, String model, String response, long latencyMs) {
        this(success, provider, model, response, success ? "SUCCESS" : "FAILED", latencyMs, null);
    }
}
