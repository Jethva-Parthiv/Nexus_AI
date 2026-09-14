package com.nexusai.routing_service.exception;

public class NoProviderAvailableException extends RuntimeException {
    public NoProviderAvailableException(String message) {
        super(message);
    }
}