package com.nexusai.routing_service.client;

import com.nexusai.routing_service.dto.ProviderCandidate;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Component
public class ProviderConfigClient {

    private final WebClient webClient;

    private static final List<ProviderCandidate> DEFAULT_CANDIDATES = List.of(
            new ProviderCandidate("GEMINI", 1, true),
            new ProviderCandidate("GROQ", 2, true),
            new ProviderCandidate("OPENROUTER", 3, true)
    );

    public ProviderConfigClient(WebClient providerServiceWebClient) {
        this.webClient = providerServiceWebClient;
    }

    public List<ProviderCandidate> getEligibleProviders(Long userId) {
        try {
            List<ProviderCandidate> result = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/internal/providers/eligible")
                            .queryParam("userId", userId)
                            .build())
                    .retrieve()
                    .bodyToFlux(ProviderCandidate.class)
                    .collectList()
                    .block();

            return (result == null || result.isEmpty()) ? DEFAULT_CANDIDATES : result;

        } catch (Exception ex) {
            return DEFAULT_CANDIDATES;
        }
    }
}