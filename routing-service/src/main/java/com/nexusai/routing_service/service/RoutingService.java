package com.nexusai.routing_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.nexusai.routing_service.dto.ChatRequest;
import com.nexusai.routing_service.dto.ChatResponse;
import com.nexusai.routing_service.dto.ProviderCandidate;
import com.nexusai.routing_service.dto.ProviderResponse;

@Service
public class RoutingService {

    private final FallbackService fallbackService;

    public RoutingService(FallbackService fallbackService) {
        this.fallbackService = fallbackService;
    }

    public ChatResponse handleChat(ChatRequest request) {
        String requestId = "REQ-" + UUID.randomUUID();

        // TODO Phase 6: replace with GET /internal/providers/eligible?userId={userId}
        List<ProviderCandidate> candidates = List.of(
                new ProviderCandidate("GEMINI", 1, true),
                new ProviderCandidate("GROQ", 2, true),
                new ProviderCandidate("OPENROUTER", 3, true)
        );

        ProviderResponse result = fallbackService.executeWithFallback(
                requestId, null, request.prompt(), candidates);

        return new ChatResponse(
                result.success(),
                result.provider(),
                result.model(),
                result.response(),
                result.latencyMs()
        );
    }
}