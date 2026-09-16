// MOCK — replace with real calls to provider-service /api/v1/providers/... once implemented.
// Each provider can hold multiple keys (intra-provider fallback). Raw keys are
// never stored or returned here — only maskedKey — mirroring the backend rule
// that provider-service never exposes raw keys once saved.

let providers = [
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'GEMINI',
    enabled: true,
    priority: 1,
    keys: [
      { id: 'gemini-1', label: 'Gemini Primary', maskedKey: '••••••••••••7Kq2', enabled: true, priority: 1 },
      { id: 'gemini-2', label: 'Gemini Backup', maskedKey: '••••••••••••41ax', enabled: true, priority: 2 },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    provider: 'GROQ',
    enabled: true,
    priority: 2,
    keys: [
      { id: 'groq-1', label: 'Groq Primary', maskedKey: '••••••••••••9mXa', enabled: true, priority: 1 },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    provider: 'OPENROUTER',
    enabled: true,
    priority: 3,
    keys: [
      { id: 'openrouter-1', label: 'OpenRouter Primary', maskedKey: '••••••••••••2Fpz', enabled: true, priority: 1 },
      { id: 'openrouter-2', label: 'OpenRouter Personal', maskedKey: '••••••••••••88qd', enabled: false, priority: 2 },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    provider: 'NVIDIA',
    enabled: false,
    priority: 4,
    keys: [],
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    provider: 'CEREBRAS',
    enabled: false,
    priority: 5,
    keys: [],
  },
]

let keyCounter = 100

// Simple mask helper — a real implementation would run server-side only.
function maskKey(rawKey) {
  const tail = rawKey.slice(-4)
  return '••••••••••••' + tail
}

export function _getProvidersRef() {
  return providers
}

export function _setProviderEnabled(id, enabled) {
  providers = providers.map((p) => (p.id === id ? { ...p, enabled } : p))
  return providers
}

export function _setProviderPriorities(orderedIds) {
  providers = providers.map((p) => ({
    ...p,
    priority: orderedIds.indexOf(p.id) + 1,
  }))
  return providers
}

export function _addKey(providerId, label, rawKey) {
  providers = providers.map((p) => {
    if (p.id !== providerId) return p
    const nextPriority = p.keys.length + 1
    const newKey = {
      id: `${providerId}-${++keyCounter}`,
      label: label?.trim() || `${p.name} key ${nextPriority}`,
      maskedKey: maskKey(rawKey),
      enabled: true,
      priority: nextPriority,
    }
    return { ...p, keys: [...p.keys, newKey] }
  })
  return providers
}

export function _removeKey(providerId, keyId) {
  providers = providers.map((p) => {
    if (p.id !== providerId) return p
    const keys = p.keys
      .filter((k) => k.id !== keyId)
      .map((k, i) => ({ ...k, priority: i + 1 }))
    return { ...p, keys, enabled: keys.length === 0 ? false : p.enabled }
  })
  return providers
}

export function _setKeyEnabled(providerId, keyId, enabled) {
  providers = providers.map((p) => {
    if (p.id !== providerId) return p
    return {
      ...p,
      keys: p.keys.map((k) => (k.id === keyId ? { ...k, enabled } : k)),
    }
  })
  return providers
}

export function _reorderKeys(providerId, orderedKeyIds) {
  providers = providers.map((p) => {
    if (p.id !== providerId) return p
    return {
      ...p,
      keys: p.keys
        .map((k) => ({ ...k, priority: orderedKeyIds.indexOf(k.id) + 1 }))
        .sort((a, b) => a.priority - b.priority),
    }
  })
  return providers
}
