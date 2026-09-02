package com.nexusai.provider_service.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.enums.ProviderStatus;
import com.nexusai.provider_service.enums.ProviderType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OpenRouterProvider implements LlmProvider {

    private static final String DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Override
    public ProviderType getProviderType() {
        return ProviderType.OPENROUTER;
    }

    @Override
    public GenerateResponseDto generate(GenerateRequestDto request, String apiKey) {
        long startTime = System.currentTimeMillis();
        String model = request.getModel() != null ? request.getModel() : DEFAULT_MODEL;

        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(Map.of("role", "user", "content", request.getPrompt()))
            );
            
            String responseJson = webClient.post()
                    .uri(OPENROUTER_API_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .header("HTTP-Referer", "http://localhost:8083")
                    .header("X-Title", "NexusAI Gateway")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Extract result content and tokens
            JsonNode root = objectMapper.readTree(responseJson);
            String outputText = root.path("choices").path(0).path("message").path("content").asText("");
            int tokenCount = root.path("usage").path("total_tokens").asInt(0);

            return GenerateResponseDto.builder()
                    .requestId(request.getRequestId())
                    .provider(ProviderType.OPENROUTER)
                    .model(model)
                    .content(outputText)
                    .status(ProviderStatus.SUCCESS)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .tokensUsed(tokenCount)
                    .build();

        } catch (WebClientResponseException e) {
            ProviderStatus status = switch (e.getStatusCode().value()) {
                case 429 -> ProviderStatus.RATE_LIMITED;
                case 400, 401, 403 -> ProviderStatus.INVALID_API_KEY;
                default -> ProviderStatus.PROVIDER_DOWN;
            };

            return GenerateResponseDto.builder()
                    .requestId(request.getRequestId())
                    .provider(ProviderType.OPENROUTER)
                    .model(model)
                    .status(status)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .errorMessage(e.getMessage())
                    .build();

        } catch (Exception e) {
            return GenerateResponseDto.builder()
                    .requestId(request.getRequestId())
                    .provider(ProviderType.OPENROUTER)
                    .model(model)
                    .status(ProviderStatus.UNKNOWN_ERROR)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }
}
