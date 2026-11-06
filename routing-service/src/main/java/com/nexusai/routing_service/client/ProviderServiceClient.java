package com.nexusai.routing_service.client;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.nexusai.routing_service.dto.ProviderRequest;
import com.nexusai.routing_service.dto.ProviderResponse;

@Component
public class ProviderServiceClient {

    private final WebClient webClient;
    private final int timeoutMs;

    public ProviderServiceClient(
            WebClient providerServiceWebClient,
            @Value("${provider-service.timeout-ms:15000}") int timeoutMs) {
        this.webClient = providerServiceWebClient;
        this.timeoutMs = timeoutMs;
    }

    public ProviderResponse generate(ProviderRequest request) {
        try {
            return webClient.post()
                    .uri("/internal/providers/generate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ProviderResponse.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

        } catch (WebClientResponseException ex) {
            return new ProviderResponse(
                    false, request.provider(), request.model(), null,
                    "UNKNOWN_ERROR", "Provider service returned " + ex.getStatusCode(), 0L, null
            );

        } catch (WebClientRequestException ex) {
            return new ProviderResponse(
                    false, request.provider(), request.model(), null,
                    "PROVIDER_DOWN", "Provider service unreachable: " + ex.getMessage(), 0L, null
            );

        } catch (RuntimeException ex) {
            if (ex.getCause() instanceof TimeoutException) {
                return new ProviderResponse(
                        false, request.provider(), request.model(), null,
                        "TIMEOUT", "Provider service call timed out after " + timeoutMs + "ms", 0L, null
                );
            }
            return new ProviderResponse(
                    false, request.provider(), request.model(), null,
                    "UNKNOWN_ERROR", ex.getMessage(), 0L, null
            );
        }
    }
}
