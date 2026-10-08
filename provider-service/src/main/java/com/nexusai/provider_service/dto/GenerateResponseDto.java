package com.nexusai.provider_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GenerateResponseDto {

    private String requestId;
    private ProviderType provider;
    private String model;

    // Both content and response fields supported for cross-service compatibility
    private String content;
    private String response;

    private ProviderStatus status;

    // Boolean success flag required by routing-service FallbackService
    private Boolean success;

    // Both message and errorMessage fields supported for cross-service compatibility
    private String message;
    private String errorMessage;

    private Long latencyMs;
    private Integer tokensUsed;

    public static class GenerateResponseDtoBuilder {
        public GenerateResponseDtoBuilder content(String content) {
            this.content = content;
            this.response = content;
            return this;
        }

        public GenerateResponseDtoBuilder response(String response) {
            this.response = response;
            this.content = response;
            return this;
        }

        public GenerateResponseDtoBuilder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            this.message = errorMessage;
            return this;
        }

        public GenerateResponseDtoBuilder message(String message) {
            this.message = message;
            this.errorMessage = message;
            return this;
        }

        public GenerateResponseDtoBuilder status(ProviderStatus status) {
            this.status = status;
            if (this.success == null) {
                this.success = (status == ProviderStatus.SUCCESS);
            }
            return this;
        }
    }
}
