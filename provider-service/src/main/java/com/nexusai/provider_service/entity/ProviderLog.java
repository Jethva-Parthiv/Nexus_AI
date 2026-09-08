package com.nexusai.provider_service.entity;

import com.nexusai.provider_service.enums.ProviderStatus;
import com.nexusai.provider_service.enums.ProviderType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "provider_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private String requestId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private ProviderType provider;

    @Column(name = "model")
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProviderStatus status;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
