package com.nexusai.provider_service.controller;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.service.ProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/providers")
@RequiredArgsConstructor
@Slf4j
public class InternalProviderController {

    private final ProviderService providerService;

    @PostMapping("/generate")
    public ResponseEntity<GenerateResponseDto> generate(@Valid @RequestBody GenerateRequestDto request) {
        log.info("Received internal generate request: requestId={}", request.getRequestId());
        GenerateResponseDto response = providerService.generate(request);
        return ResponseEntity.ok(response);
    }
}
