package com.nexusai.routing_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.nexusai.routing_service.dto.ChatRequest;
import com.nexusai.routing_service.dto.ChatResponse;
import com.nexusai.routing_service.dto.ProviderCandidate;
import com.nexusai.routing_service.dto.ProviderResponse;
import com.nexusai.routing_service.client.ProviderConfigClient;

@Service
public class RoutingService {

    private final FallbackService fallbackService;
    private final ProviderConfigClient providerConfigClient;

    public RoutingService(FallbackService fallbackService, ProviderConfigClient providerConfigClient) {
        this.fallbackService = fallbackService;
        this.providerConfigClient = providerConfigClient;
    }

    public ChatResponse handleChat(ChatRequest request, String requestId, Long userId) {
        String effectiveRequestId = (requestId != null && !requestId.isBlank())
                ? requestId
                : "REQ-" + UUID.randomUUID();

        List<ProviderCandidate> candidates = providerConfigClient.getEligibleProviders(userId);

        ProviderResponse result = fallbackService.executeWithFallback(
                effectiveRequestId, userId, request.prompt(), candidates);

        return new ChatResponse(
                result.success(),
                result.provider(),
                result.model(),
                result.response(),
                result.latencyMs()
        );
    }
}