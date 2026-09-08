package com.nexusai.provider_service.service;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;

public interface ProviderService {

    GenerateResponseDto generate(GenerateRequestDto request);
}
