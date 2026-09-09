package com.nexusai.routing_service.service;

import com.nexusai.routing_service.client.ProviderServiceClient;
import com.nexusai.routing_service.dto.*;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RoutingService {

    private final ProviderServiceClient providerServiceClient;

    public RoutingService(ProviderServiceClient providerServiceClient) {
        this.providerServiceClient = providerServiceClient;
    }

    public ChatResponse handleChat(ChatRequest request) {
        String requestId = "REQ-" + UUID.randomUUID();

        // Phase 3: single hardcoded provider, no fallback yet
        ProviderRequest providerRequest = new ProviderRequest(
                requestId,
                null,
                "GEMINI",
                request.prompt()
        );

        ProviderResponse providerResponse = providerServiceClient.generate(providerRequest);

        return new ChatResponse(
                providerResponse.success(),
                providerResponse.provider(),
                providerResponse.model(),
                providerResponse.response(),
                providerResponse.latencyMs()
        );
    }
}