import React, { useState } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import {
  NetworkIcon,
  ServerIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  RefreshIcon,
  ArrowRightIcon,
  CpuIcon,
  DatabaseIcon,
  ActivityIcon,
} from '../components/Icons.jsx'

const SERVICES = [
  {
    id: 'service-registry',
    name: 'Eureka Service Registry',
    port: 8761,
    desc: 'Central service discovery server for microservice registration & heartbeat',
    tech: 'Spring Cloud Netflix Eureka',
    circuitBreaker: 'N/A',
    status: 'Operational',
    pingMs: 14,
    uptime: '99.98%',
  },
  {
    id: 'gateway-service',
    name: 'Spring Cloud API Gateway',
    port: 8080,
    desc: 'Single entry point for all external client requests with rate limiting & CORS',
    tech: 'Spring Cloud Gateway (Reactive Netty)',
    circuitBreaker: 'Active (Closed)',
    status: 'Operational',
    pingMs: 8,
    uptime: '99.99%',
  },
  {
    id: 'auth-service',
    name: 'Authentication & IAM Service',
    port: 8081,
    desc: 'JWT issuance, user registration, role validation, and token authentication',
    tech: 'Spring Boot 3 + Spring Security + JWT',
    circuitBreaker: 'Closed',
    status: 'Operational',
    pingMs: 19,
    uptime: '99.95%',
  },
  {
    id: 'provider-service',
    name: 'Provider & Key Store Service',
    port: 8082,
    desc: 'Secure encrypted API key vault and provider health check manager',
    tech: 'Spring Boot 3 + Vault Encryption',
    circuitBreaker: 'Closed',
    status: 'Operational',
    pingMs: 22,
    uptime: '99.97%',
  },
  {
    id: 'routing-service',
    name: 'Intelligent Routing & Fallback Service',
    port: 8083,
    desc: 'Resilience4j fallback circuit breaker, priority router, and token tracker',
    tech: 'Spring Boot 3 + Resilience4j + WebClient',
    circuitBreaker: 'Closed',
    status: 'Operational',
    pingMs: 25,
    uptime: '99.99%',
  },
]

export default function SystemHealth() {
  const [refreshing, setRefreshing] = useState(false)
  const [pings, setPings] = useState({
    'service-registry': 14,
    'gateway-service': 8,
    'auth-service': 19,
    'provider-service': 22,
    'routing-service': 25,
  })

  function handlePingAll() {
    setRefreshing(true)
    setTimeout(() => {
      setPings({
        'service-registry': Math.floor(10 + Math.random() * 8),
        'gateway-service': Math.floor(6 + Math.random() * 6),
        'auth-service': Math.floor(15 + Math.random() * 10),
        'provider-service': Math.floor(18 + Math.random() * 12),
        'routing-service': Math.floor(20 + Math.random() * 14),
      })
      setRefreshing(false)
    }, 600)
  }

  return (
    <DashboardLayout title="System Topology & Health">
      <div className="page-header">
        <div className="page-header__content">
          <h1>NexusAI Microservice Topology</h1>
          <p>
            Live architectural status across the NexusAI distributed cluster. Monitor service
            registration, circuit breaker states, and internal latency pings.
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--secondary" onClick={handlePingAll} disabled={refreshing}>
            <RefreshIcon size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Pinging Services…' : 'Ping All Services'}</span>
          </button>
        </div>
      </div>

      {/* Architecture Flow Banner */}
      <div className="panel" style={{ marginBottom: '24px', background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <NetworkIcon size={18} color="var(--accent)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Request Processing Pipeline Flow</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>1. Client</span>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>AI Application</div>
          </div>
          <ArrowRightIcon size={16} color="var(--text-tertiary)" />

          <div style={{ padding: '10px 16px', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 700 }}>2. Gateway :8080</span>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>CORS & RateLimit</div>
          </div>
          <ArrowRightIcon size={16} color="var(--text-tertiary)" />

          <div style={{ padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>3. Auth :8081</span>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>JWT Verification</div>
          </div>
          <ArrowRightIcon size={16} color="var(--text-tertiary)" />

          <div style={{ padding: '10px 16px', background: 'var(--success-light)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '11px', color: 'var(--success-text)', textTransform: 'uppercase', fontWeight: 700 }}>4. Routing :8083</span>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--success-text)' }}>Fallback Engine</div>
          </div>
          <ArrowRightIcon size={16} color="var(--text-tertiary)" />

          <div style={{ padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', flex: 1, minWidth: '130px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>5. Provider :8082</span>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Key Rotation</div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="topology-grid">
        {SERVICES.map((s) => {
          const ping = pings[s.id] || s.pingMs
          return (
            <div className="service-card" key={s.id}>
              <div className="service-card__top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="status-dot" />
                  <span className="service-card__port">:{s.port}</span>
                </div>
                <span className="status-pill status-pill--success" style={{ fontSize: '11px' }}>
                  <CheckCircleIcon size={11} /> {s.status}
                </span>
              </div>

              <div>
                <h3 className="service-card__name">{s.name}</h3>
                <p className="service-card__desc" style={{ marginTop: '4px' }}>
                  {s.desc}
                </p>
              </div>

              <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Framework:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.tech}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Circuit Breaker:</span>
                  <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{s.circuitBreaker}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Ping Response:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                    {ping} ms
                  </span>
                </div>
              </div>

              <div className="service-card__meta">
                <span>Uptime: <strong>{s.uptime}</strong></span>
                <span style={{ color: 'var(--text-tertiary)' }}>Spring Boot 3</span>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
