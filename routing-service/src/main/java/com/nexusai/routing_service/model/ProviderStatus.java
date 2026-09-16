package com.nexusai.routing_service.model;

public enum ProviderStatus {
    SUCCESS,
    RATE_LIMITED,
    TIMEOUT,
    PROVIDER_DOWN,
    INVALID_API_KEY,
    UNKNOWN_ERROR
}