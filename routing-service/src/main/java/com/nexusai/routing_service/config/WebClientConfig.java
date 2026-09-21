package com.nexusai.routing_service.config;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    @Value("${provider-service.base-url:http://localhost:8083}")
    private String providerServiceBaseUrl;

    @Value("${provider-service.timeout-ms:5000}")
    private int timeoutMs;

    @Value("${eureka.client.enabled:false}")
    private boolean eurekaEnabled;

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient providerServiceWebClient(WebClient.Builder loadBalancedWebClientBuilder) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, timeoutMs)
                .doOnConnected(conn -> conn.addHandlerLast(
                        new ReadTimeoutHandler(timeoutMs, TimeUnit.MILLISECONDS)));

        WebClient.Builder builder = eurekaEnabled
                ? loadBalancedWebClientBuilder
                : WebClient.builder();

        String baseUrl = eurekaEnabled ? "http://PROVIDER-SERVICE" : providerServiceBaseUrl;

        return builder
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}