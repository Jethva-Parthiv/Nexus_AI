package com.nexusai.routing_service.client;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.nexusai.routing_service.dto.ProviderRequest;
import com.nexusai.routing_service.dto.ProviderResponse;

@Component
public class ProviderServiceClient {

    private final WebClient webClient;

    public ProviderServiceClient(WebClient providerServiceWebClient) {
        this.webClient = providerServiceWebClient;
    }

    public ProviderResponse generate(ProviderRequest request) {
        try {
            return webClient.post()
                    .uri("/internal/providers/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ProviderResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

        } catch (WebClientResponseException ex) {
            return new ProviderResponse(
                    false, request.provider(), null, null,
                    "UNKNOWN_ERROR", "Provider service returned " + ex.getStatusCode(), 0L
            );

        } catch (WebClientRequestException ex) {
            return new ProviderResponse(
                    false, request.provider(), null, null,
                    "PROVIDER_DOWN", "Provider service unreachable", 0L
            );

        } catch (RuntimeException ex) {
            if (ex.getCause() instanceof TimeoutException) {
                return new ProviderResponse(
                        false, request.provider(), null, null,
                        "TIMEOUT", "Provider service call timed out", 0L
                );
            }
            return new ProviderResponse(
                    false, request.provider(), null, null,
                    "UNKNOWN_ERROR", ex.getMessage(), 0L
            );
        }
    }
}