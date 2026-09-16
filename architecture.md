# NexusAI Gateway – System Architecture Document

## 1. Executive Summary

**NexusAI Gateway** is a distributed, high-performance **Spring Boot Microservices Platform** that provides a unified, resilient API interface for interacting with multiple Large Language Model (LLM) providers. 

Instead of client applications connecting directly to heterogeneous AI vendor APIs (Google Gemini, Groq, OpenRouter, NVIDIA NIM, Cerebras), all requests are routed through the **NexusAI Gateway**. If a provider encounters rate limits (HTTP 429), timeouts, or service outages, the system automatically falls back to an alternate configured provider with zero manual intervention.

---

## 2. Core Problem & Solution

```
[ Traditional Approach ]
Client App ───> Google Gemini API ───> HTTP 429 (Rate Limit) ───> ❌ Application Crash / Downtime

[ NexusAI Gateway Approach ]
Client App ───> NexusAI Gateway ───> Google Gemini ───> 429 (Rate Limit Detected)
                                          │
                                          └───> Auto-Fallback to Groq ───> ✅ Success (Returned to Client)
```

---

## 3. High-Level System Architecture Diagram

```mermaid
flowchart TD
    Client["Client Applications\n(Web / Mobile / Backend)"]
    
    subgraph DiscoveryLayer ["Service Discovery"]
        Eureka["Service Registry\n(Netflix Eureka - Port 8761)"]
    end

    subgraph EdgeLayer ["Edge & Security"]
        Gateway["Gateway Service\n(Spring Cloud Gateway - Port 8080)"]
    end

    subgraph CoreServices ["Microservices Cluster"]
        AuthService["Auth Service\n(Port 8081)\nJWT & User Management"]
        RoutingService["Routing Service\n(Port 8082)\nSmart LLM Router & Fallback Brain"]
        ProviderService["Provider Service\n(Port 8083)\nLLM Translator & Adapter Layer"]
    end

    subgraph StorageLayer ["Persistence (PostgreSQL)"]
        AuthDB[(Auth DB)]
        ProviderDB[(nexusai_provider DB\n- provider_config\n- provider_log)]
    end

    subgraph ExternalLLMs ["External LLM Providers"]
        Gemini["Google Gemini API\n(gemini-1.5-flash)"]
        Groq["Groq Cloud API\n(llama-3.3-70b-versatile)"]
        OpenRouter["OpenRouter API\n(meta-llama-3.1-8b)"]
        Nvidia["NVIDIA NIM API\n(meta/llama-3.1-8b-instruct)"]
        Cerebras["Cerebras API\n(llama3.1-8b)"]
        Mock["Mock Provider\n(Local Simulated LLM)"]
    end

    %% Interactions
    Client -->|HTTP Request / Bearer Token| Gateway
    Gateway <-->|Service Discovery| Eureka
    AuthService <-->|Service Discovery| Eureka
    RoutingService <-->|Service Discovery| Eureka
    ProviderService <-->|Service Discovery| Eureka

    Gateway -->|/api/v1/auth/**| AuthService
    Gateway -->|/api/v1/chat/**| RoutingService

    AuthService --> AuthDB

    RoutingService -->|POST /internal/providers/generate| ProviderService
    ProviderService --> ProviderDB

    ProviderService -->|HTTPS / API Key| Gemini
    ProviderService -->|HTTPS / API Key| Groq
    ProviderService -->|HTTPS / API Key| OpenRouter
    ProviderService -->|HTTPS / API Key| Nvidia
    ProviderService -->|HTTPS / API Key| Cerebras
    ProviderService --> Mock
```

---

## 4. Microservices Breakdown

| Microservice | Technology Stack | Port | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **`service-registry`** | Spring Cloud Netflix Eureka | `8761` | Dynamic service registration, heartbeat discovery, and load balancing lookup. |
| **`gateway-service`** | Spring Cloud Gateway | `8080` | Public API entrypoint, edge routing, JWT validation, global CORS, and rate limiting. |
| **`auth-service`** | Spring Boot, Spring Security, JWT, PostgreSQL | `8081` | User registration, login, token issuance, and tenant access control. |
| **`routing-service`** | Spring Boot, WebClient | `8082` | **Orchestration Brain**: Decides which provider to call first based on priority/budget, catches normalized errors, and triggers sequential fallbacks. |
| **`provider-service`** | Spring Boot, WebFlux, JPA, PostgreSQL | `8083` | **Translator & Adapter**: Decrypts user API keys, calls external LLM APIs via WebClient, standardizes responses/errors, and logs audit metrics. |

---

## 5. Provider Service Deep Dive (Translator Architecture)

The **Provider Service** isolates all vendor-specific protocols and models from the rest of the application using the **Strategy Design Pattern**.

### 5.1 Provider Strategy Pattern
```
                       ┌───────────────────────────────┐
                       │     «interface» LlmProvider   │
                       ├───────────────────────────────┤
                       │ + getProviderType()           │
                       │ + generate(request, apiKey)   │
                       └───────────────▲───────────────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┬──────────────┐
        │              │               │               │              │              │
┌───────┴──────┐┌──────┴──────┐┌───────┴──────┐┌───────┴──────┐┌──────┴──────┐┌──────┴──────┐
│GeminiProvider││ GroqProvider││OpenRouterProv││NvidiaProvider││CerebrasProv ││ MockProvider │
└──────────────┘└─────────────┘└──────────────┘└──────────────┘└─────────────┘└─────────────┘
```

### 5.2 Internal REST Contract (`POST /internal/providers/generate`)

#### Request Contract (`GenerateRequestDto`):
```json
{
  "requestId": "req-987654",
  "userId": "user-101",
  "provider": "GEMINI",
  "model": "gemini-1.5-flash",
  "prompt": "Explain Quantum Computing in 2 sentences.",
  "maxTokens": 500,
  "temperature": 0.7
}
```

#### Standardized Response Contract (`GenerateResponseDto`):
```json
{
  "requestId": "req-987654",
  "provider": "GEMINI",
  "model": "gemini-1.5-flash",
  "content": "Quantum computing uses qubits...",
  "status": "SUCCESS",
  "latencyMs": 342,
  "tokensUsed": 38,
  "errorMessage": null
}
```

### 5.3 Normalized Status Values (`ProviderStatus`)
Every provider response (success or failure) is mapped into standard status codes so the **Routing Service** never parses raw vendor JSON or error strings:
- **`SUCCESS`**: Prompt executed successfully.
- **`RATE_LIMITED`**: Vendor returned HTTP 429 (triggers immediate automatic failover).
- **`INVALID_API_KEY`**: Vendor returned HTTP 400 / 401 / 403.
- **`TIMEOUT`**: Socket or connection read timeout (> 30 seconds).
- **`PROVIDER_DOWN`**: Vendor returned HTTP 5xx server error.
- **`UNKNOWN_ERROR`**: Unhandled edge case or parsing issue.

---

## 6. End-to-End Request & Fallback Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant GW as Gateway Service (8080)
    participant RS as Routing Service (8082)
    participant PS as Provider Service (8083)
    participant DB as PostgreSQL (nexusai_provider)
    participant Gemini as Google Gemini API
    participant Groq as Groq API

    Client->>GW: POST /api/v1/chat/completions (Prompt)
    GW->>GW: Validate JWT Token
    GW->>RS: Forward Request
    
    RS->>RS: Determine Provider Order (1. GEMINI, 2. GROQ)
    
    %% First Attempt: Gemini
    RS->>PS: POST /internal/providers/generate (provider: GEMINI)
    PS->>DB: Query & Decrypt user's Gemini API Key
    DB-->>PS: Decrypted Key
    PS->>Gemini: POST /models/gemini-1.5-flash:generateContent
    Gemini-->>PS: HTTP 429 (Quota Exceeded / Rate Limit)
    PS->>DB: INSERT INTO provider_log (status: RATE_LIMITED)
    PS-->>RS: Response { status: "RATE_LIMITED" }

    %% Failover Attempt: Groq
    Note over RS: Trigger Automatic Fallback!
    RS->>PS: POST /internal/providers/generate (provider: GROQ)
    PS->>DB: Query & Decrypt user's Groq API Key
    DB-->>PS: Decrypted Key
    PS->>Groq: POST /openai/v1/chat/completions
    Groq-->>PS: HTTP 200 OK (Generated Content)
    PS->>DB: INSERT INTO provider_log (status: SUCCESS, latencyMs: 180)
    PS-->>RS: Response { status: "SUCCESS", content: "..." }

    RS-->>GW: Return Final Normalized Result
    GW-->>Client: HTTP 200 OK (Content)
```

---

## 7. Database Schema (PostgreSQL `nexusai_provider`)

### 7.1 `provider_config` Table (User API Key Storage)
```sql
CREATE TABLE provider_config (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    api_key_encrypted VARCHAR(1000) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
);
```

### 7.2 `provider_log` Table (Audit & Observability)
```sql
CREATE TABLE provider_log (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    latency_ms BIGINT,
    tokens_used INTEGER,
    error_message VARCHAR(2000),
    created_at TIMESTAMP NOT NULL
);
```

---

## 8. Technology Stack & Design Highlights

* **Language**: Java 17
* **Framework**: Spring Boot 3.x / 4.x
* **Reactive HTTP Client**: Spring WebFlux (`WebClient`) for non-blocking HTTP external communication.
* **Security**: Base64 / AES encryption on user API keys at rest in PostgreSQL.
* **Boilerplate Reduction**: Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`).
* **Resilience**: Client never changes API keys or providers manually; the microservices layer handles fallback orchestration dynamically.
