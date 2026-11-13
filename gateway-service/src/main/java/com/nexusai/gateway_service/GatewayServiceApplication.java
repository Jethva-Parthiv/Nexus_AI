package com.nexusai.gateway_service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.stripPrefix;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

@SpringBootApplication
public class GatewayServiceApplication {

    @Value("${services.auth-url:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${services.routing-url:http://localhost:8082}")
    private String routingServiceUrl;

    @Value("${services.provider-url:http://localhost:8083}")
    private String providerServiceUrl;

    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }

    /**
     * Route for Auth Service: /api/auth/** -> http://localhost:8081/auth/**
     */
    @Bean
    public RouterFunction<ServerResponse> authServiceRoute() {
        return route("auth-service")
                .route(
                        request -> request.path().startsWith("/api/auth"),
                        http()
                )
                .before(uri(authServiceUrl))
                .before(stripPrefix(1))
                .build();
    }

    /**
     * Route for Routing & Chat Service: /api/chat/** -> http://localhost:8082/api/chat/**
     */
    @Bean
    public RouterFunction<ServerResponse> routingServiceRoute() {
        return route("routing-service")
                .route(
                        request -> request.path().startsWith("/api/chat"),
                        http()
                )
                .before(uri(routingServiceUrl))
                .build();
    }

    /**
     * Route for Provider Config Service: /api/v1/provider-configs/** -> http://localhost:8083/api/v1/provider-configs/**
     */
    @Bean
    public RouterFunction<ServerResponse> providerServiceRoute() {
        return route("provider-service")
                .route(
                        request -> request.path().startsWith("/api/v1/provider-configs"),
                        http()
                )
                .before(uri(providerServiceUrl))
                .build();
    }
}
