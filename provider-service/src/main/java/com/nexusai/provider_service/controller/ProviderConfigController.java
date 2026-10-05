package com.nexusai.provider_service.controller;

import com.nexusai.provider_service.dto.ProviderConfigDto;
import com.nexusai.provider_service.entity.ProviderConfig;
import com.nexusai.provider_service.enums.ProviderType;
import com.nexusai.provider_service.repository.ProviderConfigRepository;
import com.nexusai.provider_service.util.EncryptionUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/provider-configs")
@RequiredArgsConstructor
public class ProviderConfigController {

    private final ProviderConfigRepository configRepository;
    private final EncryptionUtil encryptionUtil;

    // Save or update an encrypted provider API key for a user
    @PostMapping
    public ResponseEntity<String> saveConfig(@Valid @RequestBody ProviderConfigDto dto) {
        Optional<ProviderConfig> existingOpt = configRepository
                .findByUserIdAndProvider(dto.getUserId(), dto.getProvider());

        ProviderConfig config = existingOpt.orElseGet(ProviderConfig::new);
        config.setUserId(dto.getUserId());
        config.setProvider(dto.getProvider());
        config.setApiKeyEncrypted(encryptionUtil.encrypt(dto.getApiKey()));
        config.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : true);
        config.setPriority(dto.getPriority() != null ? dto.getPriority() : 1);

        configRepository.save(config);
        return ResponseEntity.ok("Provider configuration saved successfully for " + dto.getProvider());
    }

    // Get all configured providers for a user
    @GetMapping("/{userId}")
    public ResponseEntity<List<ProviderConfig>> getUserConfigs(@PathVariable String userId) {
        List<ProviderConfig> configs = configRepository.findByUserId(userId);
        return ResponseEntity.ok(configs);
    }

    // Delete a provider configuration
    @DeleteMapping("/{userId}/{provider}")
    public ResponseEntity<String> deleteConfig(@PathVariable String userId, @PathVariable ProviderType provider) {
        configRepository.findByUserIdAndProvider(userId, provider)
                .ifPresent(configRepository::delete);
        return ResponseEntity.ok("Provider configuration deleted successfully for " + provider);
    }
}
