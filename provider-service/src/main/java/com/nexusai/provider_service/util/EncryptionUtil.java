package com.nexusai.provider_service.util;

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

// Simple API Key Encryption Utility.

@Component
public class EncryptionUtil {

    public String encrypt(String rawApiKey) {
        if (rawApiKey == null || rawApiKey.isBlank()) {
            return rawApiKey;
        }
        return Base64.getEncoder().encodeToString(rawApiKey.getBytes(StandardCharsets.UTF_8));
    }

    public String decrypt(String encryptedApiKey) {
        if (encryptedApiKey == null || encryptedApiKey.isBlank()) {
            return encryptedApiKey;
        }
        byte[] decodedBytes = Base64.getDecoder().decode(encryptedApiKey);
        return new String(decodedBytes, StandardCharsets.UTF_8);
    }
}
