package com.nexusai.provider_service.provider;

import com.nexusai.provider_service.dto.GenerateRequestDto;
import com.nexusai.provider_service.dto.GenerateResponseDto;
import com.nexusai.provider_service.enums.ProviderStatus;
import com.nexusai.provider_service.enums.ProviderType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MockProviderTest {

    private MockProvider mockProvider;

    @BeforeEach
    void setUp() {
        mockProvider = new MockProvider();
    }

    @Test
    void testProviderTypeIsMock() {
        assertEquals(ProviderType.MOCK, mockProvider.getProviderType());
    }

    @Test
    void testSuccessfulGeneration() {
        GenerateRequestDto request = GenerateRequestDto.builder()
                .requestId("REQ-001")
                .userId("1")
                .provider(ProviderType.MOCK)
                .prompt("Hello NexusAI")
                .build();

        GenerateResponseDto response = mockProvider.generate(request, null);

        assertNotNull(response);
        assertEquals("REQ-001", response.getRequestId());
        assertEquals(ProviderStatus.SUCCESS, response.getStatus());
        assertTrue(response.getSuccess());
        assertNotNull(response.getContent());
        assertNotNull(response.getResponse());
        assertTrue(response.getContent().contains("Hello NexusAI"));
    }

    @Test
    void testRateLimitTrigger() {
        GenerateRequestDto request = GenerateRequestDto.builder()
                .requestId("REQ-002")
                .userId("1")
                .provider(ProviderType.MOCK)
                .prompt("Simulate RATE_LIMIT error")
                .build();

        GenerateResponseDto response = mockProvider.generate(request, null);

        assertNotNull(response);
        assertEquals(ProviderStatus.RATE_LIMITED, response.getStatus());
        assertFalse(response.getSuccess());
    }

    @Test
    void testTimeoutTrigger() {
        GenerateRequestDto request = GenerateRequestDto.builder()
                .requestId("REQ-003")
                .userId("1")
                .provider(ProviderType.MOCK)
                .prompt("Simulate TIMEOUT error")
                .build();

        GenerateResponseDto response = mockProvider.generate(request, null);

        assertNotNull(response);
        assertEquals(ProviderStatus.TIMEOUT, response.getStatus());
        assertFalse(response.getSuccess());
    }
}
