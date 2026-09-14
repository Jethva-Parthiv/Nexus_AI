package com.nexusai.routing_service.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.nexusai.routing_service.client.ProviderServiceClient;
import com.nexusai.routing_service.dto.ChatRequest;
import com.nexusai.routing_service.dto.ChatResponse;
import com.nexusai.routing_service.dto.ProviderRequest;
import com.nexusai.routing_service.dto.ProviderResponse;

@Service
public class RoutingService {

    private final ProviderServiceClient providerServiceClient;

    public RoutingService(ProviderServiceClient providerServiceClient) {
        this.providerServiceClient = providerServiceClient;
    }

    public ChatResponse handleChat(ChatRequest request) {
        String requestId = "REQ-" + UUID.randomUUID();

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