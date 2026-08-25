package com.nexusai.provider_service.dto;

import com.nexusai.provider_service.enums.ProviderType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderConfigDto {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotNull(message = "provider is required")
    private ProviderType provider;

    @NotBlank(message = "apiKey is required")
    private String apiKey;

    private Boolean enabled;

    private Integer priority;
}
