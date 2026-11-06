package com.nexusai.routing_service.service;

import java.util.ArrayList;
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

        // If caller explicitly requested a specific provider, prioritize it first
        if (request.provider() != null && !request.provider().isBlank()) {
            candidates = prioritizeProvider(candidates, request.provider().trim().toUpperCase());
        }

        ProviderResponse result = fallbackService.executeWithFallback(
                effectiveRequestId, userId, request.prompt(), request.model(), candidates);

        return new ChatResponse(
                result.success(),
                result.provider(),
                result.model(),
                result.response(),
                result.status(),
                result.latencyMs(),
                result.tokensUsed()
        );
    }

    private List<ProviderCandidate> prioritizeProvider(List<ProviderCandidate> candidates, String preferredProvider) {
        List<ProviderCandidate> prioritized = new ArrayList<>();
        prioritized.add(new ProviderCandidate(preferredProvider, 0, true));

        if (candidates != null) {
            for (ProviderCandidate candidate : candidates) {
                if (!candidate.provider().equalsIgnoreCase(preferredProvider)) {
                    prioritized.add(candidate);
                }
            }
        }
        return prioritized;
    }
}
