package com.nexusai.provider_service.dto;

import com.nexusai.provider_service.enums.ProviderStatus;
import com.nexusai.provider_service.enums.ProviderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateResponseDto {

    private String requestId;
    private ProviderType provider;
    private String model;
    private String content;
    private ProviderStatus status;
    private Long latencyMs;
    private Integer tokensUsed;
    private String errorMessage;
}
