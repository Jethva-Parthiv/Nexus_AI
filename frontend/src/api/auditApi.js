// MOCK — replace with real call to routing-service GET /api/v1/requests once implemented.
import { _getAuditLogsRef } from '../mocks/auditLogs.mock.js'

/**
 * @param {{ provider?: string, status?: string }} filters
 * @returns {Promise<Array>}
 */
export async function getAuditLogs(filters = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let rows = _getAuditLogsRef()
      if (filters.provider && filters.provider !== 'all') {
        rows = rows.filter((r) => r.provider === filters.provider)
      }
      if (filters.status === 'success') {
        rows = rows.filter((r) => r.status === 'success' && !r.fallbackUsed)
      } else if (filters.status === 'fallback') {
        rows = rows.filter((r) => r.status === 'success' && r.fallbackUsed)
      } else if (filters.status === 'failed') {
        rows = rows.filter((r) => r.status === 'failed')
      }
      resolve(rows)
    }, 300)
  })
}
