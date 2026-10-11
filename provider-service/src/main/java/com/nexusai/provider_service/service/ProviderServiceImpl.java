package com.nexusai.provider_service.service;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.dto.ProviderCandidateDto;
import com.nexusai.provider_service.entity.ProviderConfig;
import com.nexusai.provider_service.entity.ProviderLog;
import com.nexusai.provider_service.enums.ProviderStatus;
import com.nexusai.provider_service.enums.ProviderType;
import com.nexusai.provider_service.provider.LlmProvider;
import com.nexusai.provider_service.repository.ProviderConfigRepository;
import com.nexusai.provider_service.repository.ProviderLogRepository;
import com.nexusai.provider_service.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderServiceImpl implements ProviderService {

    private static final List<ProviderCandidateDto> DEFAULT_CANDIDATES = List.of(
            new ProviderCandidateDto("MOCK", 1, true),
            new ProviderCandidateDto("GEMINI", 2, true),
            new ProviderCandidateDto("GROQ", 3, true),
            new ProviderCandidateDto("OPENROUTER", 4, true)
    );

    private final List<LlmProvider> providers;
    private final ProviderConfigRepository configRepository;
    private final ProviderLogRepository logRepository;
    private final EncryptionUtil encryptionUtil;

    private Map<ProviderType, LlmProvider> providerMap;

    private Map<ProviderType, LlmProvider> getProviderMap() {
        if (providerMap == null) {
            providerMap = providers.stream()
                    .collect(Collectors.toMap(LlmProvider::getProviderType, Function.identity()));
        }
        return providerMap;
    }

    @Override
    public List<ProviderCandidateDto> getEligibleProviders(String userId) {
        log.info("Fetching eligible providers for userId={}", userId);

        if (userId == null || userId.isBlank()) {
            return DEFAULT_CANDIDATES;
        }

        List<ProviderConfig> configs = configRepository.findByUserId(userId);
        if (configs == null || configs.isEmpty()) {
            return DEFAULT_CANDIDATES;
        }

        List<ProviderCandidateDto> candidates = configs.stream()
                .filter(c -> Boolean.TRUE.equals(c.getEnabled()))
                .sorted(Comparator.comparingInt(c -> c.getPriority() != null ? c.getPriority() : 99))
                .map(c -> new ProviderCandidateDto(
                        c.getProvider().name(),
                        c.getPriority() != null ? c.getPriority() : 1,
                        c.getEnabled()
                ))
                .collect(Collectors.toList());

        return candidates.isEmpty() ? DEFAULT_CANDIDATES : candidates;
    }

    @Override
    public GenerateResponseDto generate(GenerateRequestDto request) {
        log.info("Processing generate request: requestId={}, userId={}, provider={}",
                request.getRequestId(), request.getUserId(), request.getProvider());

        LlmProvider targetProvider = getProviderMap().get(request.getProvider());

        if (targetProvider == null) {
            log.error("Unsupported provider requested: {}", request.getProvider());
            GenerateResponseDto errorResponse = GenerateResponseDto.builder()
                    .requestId(request.getRequestId())
                    .provider(request.getProvider())
                    .model(request.getModel())
                    .status(ProviderStatus.UNKNOWN_ERROR)
                    .success(false)
                    .errorMessage("Provider " + request.getProvider() + " is not implemented or supported.")
                    .build();
            saveLog(request, errorResponse);
            return errorResponse;
        }

        String apiKey = "";
        // MOCK provider does not require a database API key
        if (request.getProvider() != ProviderType.MOCK) {
            Optional<ProviderConfig> configOpt = configRepository
                    .findByUserIdAndProviderAndEnabledTrue(request.getUserId(), request.getProvider());

            if (configOpt.isEmpty()) {
                log.warn("No active API key found for userId={} and provider={}", request.getUserId(), request.getProvider());
                GenerateResponseDto noKeyResponse = GenerateResponseDto.builder()
                        .requestId(request.getRequestId())
                        .provider(request.getProvider())
                        .model(request.getModel())
                        .status(ProviderStatus.INVALID_API_KEY)
                        .success(false)
                        .errorMessage("API key is not configured or disabled for provider: " + request.getProvider())
                        .build();
                saveLog(request, noKeyResponse);
                return noKeyResponse;
            }

            apiKey = encryptionUtil.decrypt(configOpt.get().getApiKeyEncrypted());
        }

        // Execute generation via target provider strategy
        GenerateResponseDto response = targetProvider.generate(request, apiKey);

        // Normalize cross-service aliases
        if (response.getSuccess() == null) {
            response.setSuccess(response.getStatus() == ProviderStatus.SUCCESS);
        }
        if (response.getResponse() == null) {
            response.setResponse(response.getContent());
        }
        if (response.getMessage() == null) {
            response.setMessage(response.getErrorMessage());
        }

        // Record execution in PostgreSQL provider_log table
        saveLog(request, response);

        return response;
    }

    private void saveLog(GenerateRequestDto request, GenerateResponseDto response) {
        try {
            ProviderLog providerLog = ProviderLog.builder()
                    .requestId(request.getRequestId())
                    .userId(request.getUserId())
                    .provider(request.getProvider())
                    .model(response.getModel())
                    .status(response.getStatus())
                    .latencyMs(response.getLatencyMs())
                    .tokensUsed(response.getTokensUsed())
                    .errorMessage(response.getErrorMessage() != null ? response.getErrorMessage() : response.getMessage())
                    .build();

            logRepository.save(providerLog);
        } catch (Exception e) {
            log.error("Failed to save provider execution log: {}", e.getMessage());
        }
    }
}
