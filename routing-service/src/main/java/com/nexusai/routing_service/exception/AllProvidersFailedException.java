package com.nexusai.routing_service.exception;

public class AllProvidersFailedException extends RuntimeException {
    public AllProvidersFailedException(String message) {
        super(message);
    }
}