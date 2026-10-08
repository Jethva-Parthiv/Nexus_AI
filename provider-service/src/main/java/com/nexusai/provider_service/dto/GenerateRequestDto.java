package com.nexusai.provider_service.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
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
public class GenerateRequestDto {

    @NotBlank(message = "requestId is required")
    private String requestId;

    private String userId;

    @NotNull(message = "provider is required")
    private ProviderType provider;

    private String model;

    @NotBlank(message = "prompt is required")
    private String prompt;

    private Integer maxTokens;

    private Double temperature;

    @JsonSetter("userId")
    public void setUserIdFromAny(Object value) {
        if (value != null) {
            this.userId = value.toString();
        } else {
            this.userId = "1";
        }
    }

    public String getUserId() {
        return (userId != null && !userId.isBlank()) ? userId : "1";
    }
}
