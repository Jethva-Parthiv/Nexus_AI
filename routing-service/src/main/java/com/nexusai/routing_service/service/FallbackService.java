package com.nexusai.routing_service.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.nexusai.routing_service.client.ProviderServiceClient;
import com.nexusai.routing_service.dto.ProviderCandidate;
import com.nexusai.routing_service.dto.ProviderRequest;
import com.nexusai.routing_service.dto.ProviderResponse;
import com.nexusai.routing_service.exception.AllProvidersFailedException;
import com.nexusai.routing_service.exception.NoProviderAvailableException;

@Service
public class FallbackService {

    private static final Logger log = LoggerFactory.getLogger(FallbackService.class);

    private static final Set<String> RETRYABLE_STATUSES = Set.of(
            "RATE_LIMITED", "TIMEOUT", "PROVIDER_DOWN", "INVALID_API_KEY", "UNKNOWN_ERROR"
    );

    private final ProviderServiceClient providerServiceClient;

    public FallbackService(ProviderServiceClient providerServiceClient) {
        this.providerServiceClient = providerServiceClient;
    }

    public ProviderResponse executeWithFallback(
            String requestId, Long userId, String prompt, List<ProviderCandidate> candidates) {

        if (candidates == null || candidates.isEmpty()) {
            log.warn("requestId={} no eligible providers configured for userId={}", requestId, userId);
            throw new NoProviderAvailableException("No eligible providers for userId=" + userId);
        }

        Set<String> attempted = new HashSet<>();

        for (ProviderCandidate candidate : candidates) {
            if (!candidate.enabled()) {
                log.debug("requestId={} skipping disabled provider={}", requestId, candidate.provider());
                continue;
            }
            if (!attempted.add(candidate.provider())) {
                log.debug("requestId={} skipping duplicate provider={}", requestId, candidate.provider());
                continue;
            }

            long startedAt = System.currentTimeMillis();
            ProviderRequest providerRequest =
                    new ProviderRequest(requestId, userId, candidate.provider(), prompt);
            ProviderResponse response = providerServiceClient.generate(providerRequest);
            long elapsed = System.currentTimeMillis() - startedAt;

            log.info("requestId={} provider={} status={} elapsedMs={}",
                    requestId, candidate.provider(), response.status(), elapsed);

            if (response.success() && "SUCCESS".equals(response.status())) {
                log.info("requestId={} succeeded on provider={}", requestId, candidate.provider());
                return response;
            }

            if (!RETRYABLE_STATUSES.contains(response.status())) {
                log.warn("requestId={} non-retryable failure provider={} status={}",
                        requestId, candidate.provider(), response.status());
                return response;
            }
        }

        log.error("requestId={} all providers failed, attempted={}", requestId, attempted);
        throw new AllProvidersFailedException("All providers failed for requestId=" + requestId);
    }
}