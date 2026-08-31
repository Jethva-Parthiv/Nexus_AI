package com.nexusai.routing_service.client;

import com.nexusai.routing_service.dto.ProviderRequest;
import com.nexusai.routing_service.dto.ProviderResponse;
import org.springframework.stereotype.Component;

@Component
public class ProviderServiceClient {

    // TEMP MOCK — replaced with real WebClient call in Phase 4
    public ProviderResponse generate(ProviderRequest request) {
        return new ProviderResponse(
                true,
                request.provider(),
                "mock-model-v1",
                "This is a mock response for: " + request.prompt(),
                "SUCCESS",
                null,
                150L
        );
    }
}