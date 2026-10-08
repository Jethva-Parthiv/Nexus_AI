package com.nexusai.provider_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderCandidateDto {
    private String provider;
    private Integer priority;
    private Boolean enabled;
}
