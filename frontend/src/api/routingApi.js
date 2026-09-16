// MOCK — replace with real calls to routing-service /api/v1/... once implemented.
import { mockSendChatCompletion } from '../mocks/chatResponses.mock.js'
import { _getAuditLogsRef } from '../mocks/auditLogs.mock.js'

/**
 * @param {string} prompt
 * @param {string} strategy routing strategy / model selector, e.g. 'auto', 'gemini', 'groq'
 * @returns {Promise<{ reply: string, provider: string, model: string, latencyMs: number, tokens: number, trace: Array }>}
 */
export async function sendChatCompletion(prompt, strategy = 'auto') {
  return mockSendChatCompletion(prompt, strategy)
}

const RANGE_HOURS = {
  today: 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
}

/**
 * Derives dashboard summary stats from the audit log mock, mirroring what
 * routing-service's /api/v1/stats/summary endpoint is expected to return (Section 11).
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
      const totalTokens = logs.reduce((sum, l) => sum + l.tokens, 0)
      const avgLatency = Math.round(
        logs.reduce((sum, l) => sum + l.latencyMs, 0) / (total || 1),
      )

      const usageByProvider = {}
      logs.forEach((l) => {
        usageByProvider[l.provider] = (usageByProvider[l.provider] || 0) + 1
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
      })
    }, 300)
  })
}
