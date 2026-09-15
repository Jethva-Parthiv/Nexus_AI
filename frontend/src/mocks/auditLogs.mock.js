// MOCK — replace with real call to routing-service GET /api/v1/requests once implemented.
// Row shape mirrors Section 11: request_id, provider, model, status, latency_ms, tokens, fallback_used, timestamp.

const PROVIDERS = ['Gemini', 'Groq', 'OpenRouter', 'NVIDIA', 'Cerebras']
const STATUSES = ['success', 'success', 'success', 'failed']

function pad(n) {
  return String(n).padStart(2, '0')
}

function isoMinutesAgo(mins) {
  return new Date(Date.now() - mins * 60_000).toISOString()
}

function buildRow(i) {
  const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)]
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)]
  const fallbackUsed = Math.random() < 0.3
  return {
    requestId: `req_${(1000 + i).toString(36)}${pad(i)}`,
    provider,
    model: `${provider.toLowerCase()}-default`,
    status,
    latencyMs: Math.floor(150 + Math.random() * 1400),
    tokens: Math.floor(30 + Math.random() * 500),
    fallbackUsed,
    timestamp: isoMinutesAgo(i * 7 + Math.floor(Math.random() * 5)),
  }
}

const auditLogs = Array.from({ length: 42 }, (_, i) => buildRow(i)).sort(
  (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
)

export function _getAuditLogsRef() {
  return auditLogs
}
