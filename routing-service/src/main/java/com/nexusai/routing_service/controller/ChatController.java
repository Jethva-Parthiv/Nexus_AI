package com.nexusai.routing_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nexusai.routing_service.dto.ChatRequest;
import com.nexusai.routing_service.dto.ChatResponse;
import com.nexusai.routing_service.service.RoutingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final RoutingService routingService;

    public ChatController(RoutingService routingService) {
        this.routingService = routingService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        return ResponseEntity.ok(routingService.handleChat(request, requestId, userId));
    }
}