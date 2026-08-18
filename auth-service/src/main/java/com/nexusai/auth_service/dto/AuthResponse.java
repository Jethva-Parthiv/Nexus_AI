package com.nexusai.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse{
    private String token;
    private String username;
    private String message;
}