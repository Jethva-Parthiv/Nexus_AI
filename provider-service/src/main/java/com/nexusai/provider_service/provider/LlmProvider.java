package com.nexusai.provider_service.provider;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.enums.ProviderType;

// Common Strategy interface implemented by all LLM Provider 

public interface LlmProvider {

    ProviderType getProviderType();
    GenerateResponseDto generate(GenerateRequestDto request, String apiKey);
}
