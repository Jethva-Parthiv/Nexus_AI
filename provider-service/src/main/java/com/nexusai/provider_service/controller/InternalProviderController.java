package com.nexusai.provider_service.controller;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.dto.ProviderCandidateDto;
import com.nexusai.provider_service.service.ProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/internal/providers")
@RequiredArgsConstructor
@Slf4j
public class InternalProviderController {

    private final ProviderService providerService;

    @PostMapping("/generate")
    public ResponseEntity<GenerateResponseDto> generate(@Valid @RequestBody GenerateRequestDto request) {
        log.info("Received internal generate request: requestId={}, provider={}",
                request.getRequestId(), request.getProvider());
        GenerateResponseDto response = providerService.generate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/eligible")
    public ResponseEntity<List<ProviderCandidateDto>> getEligibleProviders(
            @RequestParam(value = "userId", required = false) String userId) {
        log.info("Received internal eligible providers request for userId={}", userId);
        List<ProviderCandidateDto> candidates = providerService.getEligibleProviders(userId);
        return ResponseEntity.ok(candidates);
    }
}
