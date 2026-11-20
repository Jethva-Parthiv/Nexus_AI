// User-Scoped Audit Log Store
// Captures live Playground requests and feeds the Dashboard and Request Log tables

function getActiveUsername() {
  return localStorage.getItem('nexusai_username') || 'nexususer'
}

function getStorageKey() {
  return 'nexusai_audit_logs_' + getActiveUsername()
}

function buildSampleDemoRows() {
  const PROVIDERS = ['Gemini', 'Groq', 'OpenRouter']
  const now = Date.now()
  return [
    {
      requestId: 'req_demo_01',
      provider: 'Gemini',
      model: 'gemini-1.5-flash',
      status: 'success',
      latencyMs: 142,
      tokens: 95,
      fallbackUsed: true,
      timestamp: new Date(now - 3 * 60 * 1000).toISOString(),
      prompt: 'Explain intra-provider key rotation vs cross-provider fallback',
      trace: [
        { provider: 'Groq', status: 429, outcome: 'failed' },
        { provider: 'Gemini', status: 200, outcome: 'success' },
      ],
    },
    {
      requestId: 'req_demo_02',
      provider: 'Groq',
      model: 'llama-3.3-70b-versatile',
      status: 'success',
      latencyMs: 88,
      tokens: 140,
      fallbackUsed: false,
      timestamp: new Date(now - 12 * 60 * 1000).toISOString(),
      prompt: 'Extract JSON entities from user session log',
      trace: [{ provider: 'Groq', status: 200, outcome: 'success' }],
    },
    {
      requestId: 'req_demo_03',
      provider: 'Mock',
      model: 'mock-model-v1',
      status: 'success',
      latencyMs: 50,
      tokens: 28,
      fallbackUsed: false,
      timestamp: new Date(now - 25 * 60 * 1000).toISOString(),
      prompt: 'Hello NexusAI Gateway!',
      trace: [{ provider: 'Mock', status: 200, outcome: 'success' }],
    },
  ]
}

export function _getAuditLogsRef() {
  const user = getActiveUsername()
  const key = getStorageKey()
  const saved = localStorage.getItem(key)

  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      // fallback
    }
  }

  // Demo user gets starter logs
  if (user && user.toLowerCase().includes('demo')) {
    const sample = buildSampleDemoRows()
    localStorage.setItem(key, JSON.stringify(sample))
    return sample
  }

  // Real user starts clean with empty log
  return []
}

export function _recordAuditLogRow(row) {
  const key = getStorageKey()
  const current = _getAuditLogsRef()
  const updated = [row, ...current].slice(0, 200) // retain latest 200
  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}

export function _clearAuditLogsRef() {
  const key = getStorageKey()
  localStorage.removeItem(key)
  return []
}
