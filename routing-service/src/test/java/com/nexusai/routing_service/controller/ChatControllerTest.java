package com.nexusai.routing_service.controller;

import com.nexusai.routing_service.dto.ChatRequest;
import com.nexusai.routing_service.dto.ChatResponse;
import com.nexusai.routing_service.service.RoutingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class ChatControllerTest {

    private RoutingService routingService;
    private ChatController chatController;

    @BeforeEach
    void setUp() {
        routingService = Mockito.mock(RoutingService.class);
        chatController = new ChatController(routingService);
    }

    @Test
    void testChatEndpointSuccess() {
        ChatRequest request = new ChatRequest("Hello NexusAI", "MOCK", "mock-model-v1");
        ChatResponse mockResponse = new ChatResponse(
                true, "MOCK", "mock-model-v1", "Test completion", "SUCCESS", 45L, 15
        );

        when(routingService.handleChat(eq(request), eq("REQ-001"), eq(1L)))
                .thenReturn(mockResponse);

        ResponseEntity<ChatResponse> responseEntity = chatController.chat(request, "REQ-001", 1L);

        assertNotNull(responseEntity);
        assertEquals(200, responseEntity.getStatusCode().value());
        assertNotNull(responseEntity.getBody());
        assertTrue(responseEntity.getBody().success());
        assertEquals("MOCK", responseEntity.getBody().provider());
        assertEquals("Test completion", responseEntity.getBody().response());
        assertEquals("SUCCESS", responseEntity.getBody().status());
    }
}
