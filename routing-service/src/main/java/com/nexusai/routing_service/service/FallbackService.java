package com.nexusai.routing_service.service;

import com.nexusai.routing_service.client.ProviderServiceClient;
import com.nexusai.routing_service.dto.ProviderCandidate;
import com.nexusai.routing_service.dto.ProviderRequest;
import com.nexusai.routing_service.dto.ProviderResponse;
import com.nexusai.routing_service.exception.AllProvidersFailedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class FallbackService {

    private static final Set<String> RETRYABLE_STATUSES = Set.of(
            "RATE_LIMITED", "TIMEOUT", "PROVIDER_DOWN", "INVALID_API_KEY", "UNKNOWN_ERROR"
    );

    private final ProviderServiceClient providerServiceClient;

    public FallbackService(ProviderServiceClient providerServiceClient) {
        this.providerServiceClient = providerServiceClient;
    }

    public ProviderResponse executeWithFallback(
            String requestId, Long userId, String prompt, List<ProviderCandidate> candidates) {

        StringBuilder attemptedLog = new StringBuilder();

        for (ProviderCandidate candidate : candidates) {
            if (!candidate.enabled()) {
                continue;
            }

            ProviderRequest providerRequest =
                    new ProviderRequest(requestId, userId, candidate.provider(), prompt);
            ProviderResponse response = providerServiceClient.generate(providerRequest);

            attemptedLog.append(candidate.provider()).append("=").append(response.status()).append("; ");

            if (response.success() && "SUCCESS".equals(response.status())) {
                return response; // stop immediately on success
            }

            if (!RETRYABLE_STATUSES.contains(response.status())) {
                return response; // non-retryable — controlled failure, no further attempts
            }
            // retryable — continue to next candidate
        }

        throw new AllProvidersFailedException("All providers failed. Attempts: " + attemptedLog);
    }
}