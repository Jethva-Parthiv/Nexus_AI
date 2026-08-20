# NexusAI Gateway

> **Lightweight LLM API Fallback Gateway for AI Providers**

NexusAI Gateway is a Spring Boot microservices project that provides a **single unified API** for multiple LLM providers. Instead of integrating Google Gemini, Groq, OpenRouter, NVIDIA NIM, or Cerebras separately, developers integrate with **one endpoint** while NexusAI automatically switches providers when a rate limit or provider failure occurs.

This project is being developed as a **Semester 3 Spring Boot Microservices Project** and focuses on real-world backend architecture rather than building another chatbot.

---

## Team

| Member | Enrollment No. |
|--------|----------------|
| Jethva Parthiv | 250160450040 |
| Mohit Makwana | 250160450031 |
| Mitesh Kukadiya | 250160450029 |

---

## Problem Statement

Free-tier LLM APIs are useful for students and developers, but they come with request-per-minute and daily usage limits.

Typical flow without NexusAI:

```text
Application
     │
     ▼
 Gemini API
     │
 429 Rate Limit
     │
 Application Stops
```

With NexusAI:

```text
Application
     │
     ▼
 NexusAI Gateway
     │
 ┌───┼───────────────┐
 ▼   ▼               ▼
Gemini  Groq   OpenRouter
            ▼
      NVIDIA • Cerebras
```

If one provider fails, NexusAI automatically tries the next configured provider without requiring changes in the client application.

---

## Project Goals

- Build a real-world Spring Boot microservices project.
- Provide one unified API for multiple LLM providers.
- Automatically handle provider failures and rate limits.
- Learn API Gateway, service-to-service communication, JWT, Docker, and Eureka.
- Create a portfolio-ready backend infrastructure project.

---

## Key Features

- Unified AI API endpoint
- Automatic provider fallback
- Five free-tier LLM integrations
- JWT authentication
- Request logging
- Provider health monitoring
- Microservices architecture
- Docker-ready deployment

---

## Supported Providers (Version 1)

| Provider | Purpose |
|----------|---------|
| Google Gemini | Primary LLM |
| Groq | Fast inference |
| OpenRouter | Multi-model access |
| NVIDIA NIM | Free developer inference |
| Cerebras | Additional fallback provider |

---

## Architecture

```text
                  Client Application
                         │
                         ▼
                 Gateway Service
                         │
                         ▼
                 Routing Service
                         │
                         ▼
                 Provider Service
                         │
      ┌──────────┬──────────┬──────────┬──────────┬──────────┐
      ▼          ▼          ▼          ▼          ▼
   Gemini      Groq     OpenRouter   NVIDIA    Cerebras
```

### Microservices

| Service | Responsibility |
|---------|----------------|
| Gateway Service | Public entry point, routing, JWT validation |
| Auth Service | Login, registration, JWT generation |
| Routing Service | Provider selection, retry, fallback |
| Provider Service | External LLM integration and response normalization |
| Registry Service | Eureka service registry |

---

## Request Flow

1. User logs into NexusAI.
2. User configures provider API keys.
3. Client sends `POST /api/chat`.
4. Gateway validates JWT.
5. Routing Service selects the best provider.
6. Provider Service calls the selected LLM.
7. If the provider fails or is rate-limited, Routing Service automatically tries the next provider.
8. The client receives one standardized response.

---

## Public API

### Chat Endpoint

`POST /api/chat`

**Request**

```json
{
  "prompt": "Explain Spring Boot simply."
}
```

**Response**

```json
{
  "success": true,
  "provider": "GROQ",
  "model": "llama-3",
  "response": "Spring Boot is...",
  "latencyMs": 780
}
```

The client never needs to know which provider ultimately generated the response.

---

## Technology Stack

### Backend

- Java 17
- Spring Boot 3.5.x
- Spring Cloud Gateway
- Eureka
- Spring Security
- JWT
- Spring Data JPA

### Database

- MySQL

### Tools

- Maven
- Docker
- Postman
- VS Code

### External AI Providers

- Google Gemini
- Groq
- OpenRouter
- NVIDIA NIM
- Cerebras

---

## Project Structure

```text
NexusAI_Gateway/
│
├── gateway-service/
├── auth-service/
├── routing-service/
├── provider-service/
├── discovery-service/
├── docs/
├── docker-compose.yml
└── README.md
```

---


## Folder Ownership

| Folder | Owner |
|---------|-------|
| `gateway-service` | Member 1 |
| `auth-service` | Member 1 |
| `routing-service` | Member 2 |
| `provider-service` | Member 3 |
| `discovery-service` | Member 1 |
| `docs` | All Members |

---

## Future Improvements

- OpenAI-compatible API (`/v1/chat/completions`)
- Streaming responses
- Prompt caching
- Redis support
- Ollama integration
- Dashboard analytics
- Model selection policies

---

## Project Status

**Status:** In Development

Current focus is building a reliable microservices foundation before implementing automatic provider fallback across all five supported LLM providers.

---

## License

This project is developed for educational purposes as part of a **Semester 3 Spring Boot Microservices Project**.