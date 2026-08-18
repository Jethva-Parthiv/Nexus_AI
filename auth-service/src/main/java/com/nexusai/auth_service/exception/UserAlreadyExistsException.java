package com.nexusai.auth_service.eception;

public class UserAlreadyExistsException extends RuntimeException {
 public UserAlreadyExistsException(String message) {
        super(message);
    }
    
}
