// User-Scoped Provider Storage
// Synchronizes with backend provider-service via API Gateway

const BASE_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'GEMINI',
    enabled: true,
    priority: 1,
    keys: [],
  },
  {
    id: 'groq',
    name: 'Groq',
    provider: 'GROQ',
    enabled: true,
    priority: 2,
    keys: [],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    provider: 'OPENROUTER',
    enabled: true,
    priority: 3,
    keys: [],
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

const DEMO_KEYS = {
  gemini: [
    { id: 'gemini-1', label: 'Gemini Primary', maskedKey: '••••••••••••7Kq2', enabled: true, priority: 1 },
    { id: 'gemini-2', label: 'Gemini Backup', maskedKey: '••••••••••••41ax', enabled: true, priority: 2 },
  ],
  groq: [
    { id: 'groq-1', label: 'Groq Primary', maskedKey: '••••••••••••9mXa', enabled: true, priority: 1 },
  ],
  openrouter: [
    { id: 'openrouter-1', label: 'OpenRouter Primary', maskedKey: '••••••••••••2Fpz', enabled: true, priority: 1 },
  ],
}

let keyCounter = 200

function maskKey(rawKey) {
  if (!rawKey) return '••••••••••••0000'
  const tail = rawKey.slice(-4)
  return '••••••••••••' + tail
}

function getActiveUsername() {
  return localStorage.getItem('nexusai_username') || 'nexususer'
}

function getStorageKey() {
  return 'nexusai_providers_' + getActiveUsername()
}

export function _getProvidersRef() {
  const user = getActiveUsername()
  const saved = localStorage.getItem(getStorageKey())
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      // parse error, fallback
    }
  }

  // If Demo user, pre-fill sample keys for testing
  if (user && user.toLowerCase().includes('demo')) {
    const demoProviders = BASE_PROVIDERS.map((p) => ({
      ...p,
      keys: DEMO_KEYS[p.id] ? [...DEMO_KEYS[p.id]] : [],
    }))
    localStorage.setItem(getStorageKey(), JSON.stringify(demoProviders))
    return demoProviders
  }

  // Real users start with clean/fresh providers
  const freshProviders = BASE_PROVIDERS.map((p) => ({ ...p, keys: [] }))
  localStorage.setItem(getStorageKey(), JSON.stringify(freshProviders))
  return freshProviders
}

function saveProviders(list) {
  localStorage.setItem(getStorageKey(), JSON.stringify(list))
  return list
}

export function _setProviderEnabled(id, enabled) {
  const current = _getProvidersRef()
  const updated = current.map((p) => (p.id === id ? { ...p, enabled } : p))
  return saveProviders(updated)
}

export function _setProviderPriorities(orderedIds) {
  const current = _getProvidersRef()
  const updated = current.map((p) => ({
    ...p,
    priority: orderedIds.indexOf(p.id) + 1,
  }))
  return saveProviders(updated)
}

export function _addKey(providerId, label, rawKey) {
  const current = _getProvidersRef()
  const updated = current.map((p) => {
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
  return saveProviders(updated)
}

export function _removeKey(providerId, keyId) {
  const current = _getProvidersRef()
  const updated = current.map((p) => {
    if (p.id !== providerId) return p
    const filtered = p.keys.filter((k) => k.id !== keyId)
    const reindexed = filtered.map((k, i) => ({ ...k, priority: i + 1 }))
    return { ...p, keys: reindexed }
  })
  return saveProviders(updated)
}

export function _setKeyEnabled(providerId, keyId, enabled) {
  const current = _getProvidersRef()
  const updated = current.map((p) => {
    if (p.id !== providerId) return p
    return {
      ...p,
      keys: p.keys.map((k) => (k.id === keyId ? { ...k, enabled } : k)),
    }
  })
  return saveProviders(updated)
}

export function _reorderKeys(providerId, orderedKeyIds) {
  const current = _getProvidersRef()
  const updated = current.map((p) => {
    if (p.id !== providerId) return p
    const reordered = [...p.keys].sort(
      (a, b) => orderedKeyIds.indexOf(a.id) - orderedKeyIds.indexOf(b.id),
    )
    return {
      ...p,
      keys: reordered.map((k, i) => ({ ...k, priority: i + 1 })),
    }
  })
  return saveProviders(updated)
}
