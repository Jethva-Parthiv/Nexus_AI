package com.nexusai.provider_service.provider;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.enums.ProviderStatus;
import com.nexusai.provider_service.enums.ProviderType;
import org.springframework.stereotype.Component;

@Component
public class MockProvider implements LlmProvider {

    @Override
    public ProviderType getProviderType() {
        return ProviderType.MOCK;
    }

    @Override
    public GenerateResponseDto generate(GenerateRequestDto request, String apiKey) {
        long startTime = System.currentTimeMillis();
        String prompt = request.getPrompt() != null ? request.getPrompt().toUpperCase() : "";

        // Simulated error triggers for testing routing & fallbacks
        if (prompt.contains("RATE_LIMIT")) {
            return buildResponse(request, null, ProviderStatus.RATE_LIMITED, System.currentTimeMillis() - startTime, 0, "Mock Provider Rate Limit Exceeded");
        }
        if (prompt.contains("INVALID_KEY")) {
            return buildResponse(request, null, ProviderStatus.INVALID_API_KEY, System.currentTimeMillis() - startTime, 0, "Mock Provider Invalid API Key");
        }
        if (prompt.contains("TIMEOUT")) {
            return buildResponse(request, null, ProviderStatus.TIMEOUT, System.currentTimeMillis() - startTime, 0, "Mock Provider Request Timed Out");
        }
        if (prompt.contains("DOWN")) {
            return buildResponse(request, null, ProviderStatus.PROVIDER_DOWN, System.currentTimeMillis() - startTime, 0, "Mock Provider Service Unavailable");
        }

        // Successful mock response
        String generatedContent = "[MOCK RESPONSE] Successfully processed prompt: " + request.getPrompt();
        long latency = System.currentTimeMillis() - startTime + 50; // simulated latency
        int tokensUsed = request.getPrompt() != null ? request.getPrompt().length() / 4 + 20 : 20;

        return buildResponse(request, generatedContent, ProviderStatus.SUCCESS, latency, tokensUsed, null);
    }

    private GenerateResponseDto buildResponse(GenerateRequestDto request, String content, ProviderStatus status, long latency, int tokens, String errorMsg) {
        return GenerateResponseDto.builder()
                .requestId(request.getRequestId())
                .provider(ProviderType.MOCK)
                .model(request.getModel() != null ? request.getModel() : "mock-model-v1")
                .content(content)
                .status(status)
                .latencyMs(latency)
                .tokensUsed(tokens)
                .errorMessage(errorMsg)
                .build();
    }
}
