package com.nexusai.provider_service.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.enums.ProviderStatus;
import com.nexusai.provider_service.enums.ProviderType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GeminiProvider implements LlmProvider {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Override
    public ProviderType getProviderType() {
        return ProviderType.GEMINI;
    }

    @Override
    public GenerateResponseDto generate(GenerateRequestDto request, String apiKey) {
        long startTime = System.currentTimeMillis();
        String model = request.getModel() != null ? request.getModel() : "gemini-1.5-flash";
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", request.getPrompt()))))
            );

            String responseJson = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseJson);
            String outputText = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            int tokenCount = root.path("usageMetadata").path("totalTokenCount").asInt(0);

            return GenerateResponseDto.builder()
                    .requestId(request.getRequestId())
                    .provider(ProviderType.GEMINI)
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
                    .provider(ProviderType.GEMINI)
                    .model(model)
                    .status(status)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .errorMessage(e.getMessage())
                    .build();

        } catch (Exception e) {
            return GenerateResponseDto.builder()
                    .requestId(request.getRequestId())
                    .provider(ProviderType.GEMINI)
                    .model(model)
                    .status(ProviderStatus.UNKNOWN_ERROR)
                    .latencyMs(System.currentTimeMillis() - startTime)
                    .errorMessage(e.getMessage())
                    .build();
        }
    }
}
