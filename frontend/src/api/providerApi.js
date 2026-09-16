// MOCK — replace with real calls to provider-service /api/v1/providers/... once implemented.
// Every export here returns a Promise, matching what a real axios call would return,
// so components never need to change when the mock is swapped for a real request.
import {
  _getProvidersRef,
  _setProviderEnabled,
  _setProviderPriorities,
  _addKey,
  _removeKey,
  _setKeyEnabled,
  _reorderKeys,
} from '../mocks/providers.mock.js'

const LATENCY_MS = 350

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
  return delay(sorted(_addKey(providerId, label, rawKey)))
}

/** @param {string} providerId @param {string} keyId */
export async function deleteProviderKey(providerId, keyId) {
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
