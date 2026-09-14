package com.nexusai.routing_service.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;

import com.nexusai.routing_service.client.ProviderServiceClient;
import com.nexusai.routing_service.dto.ProviderCandidate;
import com.nexusai.routing_service.dto.ProviderRequest;
import com.nexusai.routing_service.dto.ProviderResponse;
import com.nexusai.routing_service.exception.AllProvidersFailedException;
import com.nexusai.routing_service.exception.NoProviderAvailableException;

class FallbackServiceTest {

    private final ProviderServiceClient client = Mockito.mock(ProviderServiceClient.class);
    private final FallbackService fallbackService = new FallbackService(client);

    @Test
    void stopsOnFirstSuccess() {
        List<ProviderCandidate> candidates = List.of(
                new ProviderCandidate("GEMINI", 1, true),
                new ProviderCandidate("GROQ", 2, true)
        );

        when(client.generate(any(ProviderRequest.class)))
                .thenReturn(new ProviderResponse(true, "GEMINI", "gemini-1", "hi", "SUCCESS", null, 100L));

        ProviderResponse result = fallbackService.executeWithFallback("REQ-1", 1L, "hello", candidates);

        assertTrue(result.success());
        assertEquals("GEMINI", result.provider());
        Mockito.verify(client, Mockito.times(1)).generate(any());
    }

    @Test
    void fallsBackOnRateLimit() {
        List<ProviderCandidate> candidates = List.of(
                new ProviderCandidate("GEMINI", 1, true),
                new ProviderCandidate("GROQ", 2, true)
        );

        ProviderResponse rateLimited = new ProviderResponse(false, "GEMINI", null, null, "RATE_LIMITED", "limit", 50L);
        ProviderResponse success = new ProviderResponse(true, "GROQ", "llama-3", "hi", "SUCCESS", null, 120L);

        when(client.generate(any(ProviderRequest.class)))
                .thenReturn(rateLimited)
                .thenReturn(success);

        ProviderResponse result = fallbackService.executeWithFallback("REQ-2", 1L, "hello", candidates);

        assertEquals("GROQ", result.provider());
        Mockito.verify(client, Mockito.times(2)).generate(any());
    }

    @Test
    void throwsWhenAllProvidersFail() {
        List<ProviderCandidate> candidates = List.of(
                new ProviderCandidate("GEMINI", 1, true)
        );

        when(client.generate(any(ProviderRequest.class)))
                .thenReturn(new ProviderResponse(false, "GEMINI", null, null, "PROVIDER_DOWN", "down", 0L));

        assertThrows(AllProvidersFailedException.class, () ->
                fallbackService.executeWithFallback("REQ-3", 1L, "hello", candidates));
    }

    @Test
    void throwsWhenNoCandidates() {
        assertThrows(NoProviderAvailableException.class, () ->
                fallbackService.executeWithFallback("REQ-4", 1L, "hello", List.of()));
    }

    @Test
    void skipsDuplicateProviderInSameChain() {
        List<ProviderCandidate> candidates = List.of(
                new ProviderCandidate("GEMINI", 1, true),
                new ProviderCandidate("GEMINI", 2, true) // duplicate on purpose
        );

        when(client.generate(any(ProviderRequest.class)))
                .thenReturn(new ProviderResponse(false, "GEMINI", null, null, "TIMEOUT", "timeout", 0L));

        assertThrows(AllProvidersFailedException.class, () ->
                fallbackService.executeWithFallback("REQ-5", 1L, "hello", candidates));

        Mockito.verify(client, Mockito.times(1)).generate(any()); // only called once, duplicate skipped
    }
}