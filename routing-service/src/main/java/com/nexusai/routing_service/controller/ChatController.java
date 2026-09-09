package com.nexusai.routing_service.controller;

import com.nexusai.routing_service.dto.ChatRequest;
import com.nexusai.routing_service.dto.ChatResponse;
import com.nexusai.routing_service.service.RoutingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final RoutingService routingService;

    public ChatController(RoutingService routingService) {
        this.routingService = routingService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(routingService.handleChat(request));
    }
}