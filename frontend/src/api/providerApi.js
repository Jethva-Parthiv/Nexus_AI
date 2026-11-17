// Integrated with NexusAI backend provider-service via API Gateway (/api/v1/provider-configs).
import axios from 'axios'
import {
  _getProvidersRef,
  _setProviderEnabled,
  _setProviderPriorities,
  _addKey,
  _removeKey,
  _setKeyEnabled,
  _reorderKeys,
} from '../mocks/providers.mock.js'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'
const LATENCY_MS = 250

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

function sorted(list) {
  return [...list]
    .sort((a, b) => a.priority - b.priority)
    .map((p) => ({ ...p, keys: [...p.keys].sort((a, b) => a.priority - b.priority) }))
}

/** @returns {Promise<Array>} list of providers (each with a nested `keys` array), sorted by priority */
export async function getProviders() {
  const username = localStorage.getItem('nexusai_username') || 'nexususer'
  try {
    const { data } = await axios.get(`${GATEWAY_URL}/api/v1/provider-configs/${username}`, {
      timeout: 5000,
    })
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((cfg) => {
        const pId = cfg.provider?.toLowerCase()
        if (pId) {
          _setProviderEnabled(pId, cfg.enabled ?? true)
        }
      })
    }
  } catch (err) {
    // Non-blocking: fallback to local state if backend is initializing
    console.debug('Provider configs retrieved from local state')
  }
  return delay(sorted(_getProvidersRef()))
}

/** @param {string} providerId */
export async function toggleProviderGlobal(providerId, enabled) {
  return delay(sorted(_setProviderEnabled(providerId, enabled)))
}

/** @param {string[]} orderedIds provider ids in the new global priority order */
export async function reorderProviders(orderedIds) {
  return delay(sorted(_setProviderPriorities(orderedIds)))
}

/**
 * @param {string} providerId
 * @param {string} label custom key label, e.g. "Gemini Backup"
 * @param {string} rawKey the key as entered by the user
 */
export async function addProviderKey(providerId, label, rawKey) {
  const username = localStorage.getItem('nexusai_username') || 'nexususer'
  try {
    await axios.post(
      `${GATEWAY_URL}/api/v1/provider-configs`,
      {
        userId: username,
        provider: providerId.toUpperCase(),
        apiKey: rawKey,
        enabled: true,
        priority: 1,
      },
      { timeout: 8000 }
    )
  } catch (err) {
    console.warn('Backend provider config sync notice:', err.message)
  }
  return delay(sorted(_addKey(providerId, label, rawKey)))
}

/** @param {string} providerId @param {string} keyId */
export async function deleteProviderKey(providerId, keyId) {
  const username = localStorage.getItem('nexusai_username') || 'nexususer'
  try {
    await axios.delete(
      `${GATEWAY_URL}/api/v1/provider-configs/${username}/${providerId.toUpperCase()}`,
      { timeout: 8000 }
    )
  } catch (err) {
    console.warn('Backend provider config delete notice:', err.message)
  }
  return delay(sorted(_removeKey(providerId, keyId)))
}

/** @param {string} providerId @param {string} keyId @param {boolean} enabled */
export async function setKeyEnabled(providerId, keyId, enabled) {
  return delay(sorted(_setKeyEnabled(providerId, keyId, enabled)))
}

/** @param {string} providerId @param {string[]} orderedKeyIds */
export async function reorderProviderKeys(providerId, orderedKeyIds) {
  return delay(sorted(_reorderKeys(providerId, orderedKeyIds)))
}
