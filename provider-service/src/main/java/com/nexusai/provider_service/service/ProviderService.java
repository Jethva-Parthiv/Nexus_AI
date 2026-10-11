package com.nexusai.provider_service.service;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.dto.ProviderCandidateDto;

import java.util.List;

public interface ProviderService {

    GenerateResponseDto generate(GenerateRequestDto request);

    List<ProviderCandidateDto> getEligibleProviders(String userId);
}
