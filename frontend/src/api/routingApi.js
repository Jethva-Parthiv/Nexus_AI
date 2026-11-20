import axios from 'axios'
import { mockSendChatCompletion } from '../mocks/chatResponses.mock.js'
import { _getAuditLogsRef, _recordAuditLogRow } from '../mocks/auditLogs.mock.js'
import { recordAuditLog } from './auditApi.js'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080'

/**
 * Sends chat prompt to the NexusAI Gateway routing service (/api/chat).
 * Automatically falls back to mock simulation if network or gateway is unavailable.
 * Persists the resulting request to the user's audit log.
 *
 * @param {string} prompt
 * @param {string} strategy routing strategy / model selector, e.g. 'auto', 'gemini', 'groq', 'mock'
 * @returns {Promise<{ reply: string, provider: string, model: string, latencyMs: number, tokens: number, trace: Array }>}
 */
export async function sendChatCompletion(prompt, strategy = 'auto') {
  const username = localStorage.getItem('nexusai_username') || 'nexususer'
  const token = localStorage.getItem('nexusai_token')

  // Map strategy dropdown selection to backend Provider enum
  let requestedProvider = null
  if (strategy && strategy !== 'auto' && strategy !== 'latency' && strategy !== 'cost') {
    requestedProvider = strategy.toUpperCase()
  }

  try {
    const startTime = Date.now()
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const { data } = await axios.post(
      `${GATEWAY_URL}/api/chat`,
      {
        prompt,
        provider: requestedProvider,
        userId: username,
      },
      {
        headers,
        timeout: 30000,
      }
    )

    const latency = data.latencyMs ?? (Date.now() - startTime)
    const tokens = data.tokensUsed ?? Math.max(18, Math.floor(prompt.length / 4) + 12)

    // Build the visual step trace for the RouteTrace component
    const trace = []
    if (requestedProvider) {
      trace.push({
        provider: data.provider || requestedProvider,
        status: data.success ? 200 : 500,
        outcome: data.success ? 'success' : 'failed',
      })
    } else {
      // Auto fallback chain: illustrate fallback progression when resolving to fallback provider
      if (data.provider === 'MOCK') {
        trace.push({ provider: 'Gemini', status: 429, outcome: 'failed' })
        trace.push({ provider: 'Groq', status: 503, outcome: 'failed' })
        trace.push({ provider: 'Mock', status: 200, outcome: 'success' })
      } else {
        trace.push({
          provider: data.provider || 'Gateway',
          status: 200,
          outcome: 'success',
        })
      }
    }

    // Record request into user's live audit log
    recordAuditLog({
      requestId: `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      prompt: prompt,
      provider: data.provider || requestedProvider || 'Gateway',
      model: data.model || `${(data.provider || 'gateway').toLowerCase()}-model`,
      status: data.success ? 'success' : 'failed',
      latencyMs: latency,
      tokens: tokens,
      fallbackUsed: trace.length > 1,
      trace: trace,
      timestamp: new Date().toISOString(),
    })

    return {
      reply: data.response || data.message || 'No response returned from provider',
      provider: data.provider || 'Gateway',
      model: data.model || `${(data.provider || 'gateway').toLowerCase()}-model`,
      latencyMs: latency,
      tokens: tokens,
      trace: trace,
      promptEcho: prompt,
    }
  } catch (err) {
    console.warn('Real gateway routing failed, falling back to local simulation:', err)
    const mockRes = await mockSendChatCompletion(prompt, strategy)

    // Record simulated response so audit log and dashboard remain synced
    recordAuditLog({
      requestId: `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      prompt: prompt,
      provider: mockRes.provider || 'Gateway',
      model: mockRes.model || 'mock-model',
      status: 'success',
      latencyMs: mockRes.latencyMs,
      tokens: mockRes.tokens,
      fallbackUsed: mockRes.trace?.length > 1,
      trace: mockRes.trace || [],
      timestamp: new Date().toISOString(),
    })

    return mockRes
  }
}

const RANGE_HOURS = {
  today: 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
}

/**
 * Derives dashboard summary stats from the user's audit log store.
 * @param {'today'|'7d'|'30d'} range
 * @returns {Promise<object>}
 */
export async function getDashboardSummary(range = '7d') {
  const cutoffHours = RANGE_HOURS[range] || RANGE_HOURS['7d']
  const cutoff = Date.now() - cutoffHours * 60 * 60 * 1000
  const logs = _getAuditLogsRef().filter((l) => new Date(l.timestamp).getTime() >= cutoff)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const total = logs.length
      const successful = logs.filter((l) => l.status === 'success').length
      const failed = total - successful
      const fallbackCount = logs.filter((l) => l.fallbackUsed).length
      const totalTokens = logs.reduce((sum, l) => sum + (l.tokens || 0), 0)
      const avgLatency = Math.round(
        logs.reduce((sum, l) => sum + (l.latencyMs || 0), 0) / (total || 1),
      )

      const usageByProvider = {}
      logs.forEach((l) => {
        const prov = l.provider || 'Gateway'
        usageByProvider[prov] = (usageByProvider[prov] || 0) + 1
      })
      const providerUsage = Object.entries(usageByProvider)
        .map(([provider, requests]) => ({ provider, requests }))
        .sort((a, b) => b.requests - a.requests)

      resolve({
        totalRequests: total,
        successfulRequests: successful,
        failedRequests: failed,
        fallbackCount,
        totalTokens,
        avgLatencyMs: avgLatency,
        providerUsage,
        recentLogs: logs.slice(0, 5),
      })
    }, 150)
  })
}
