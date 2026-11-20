import { _getAuditLogsRef, _recordAuditLogRow, _clearAuditLogsRef } from '../mocks/auditLogs.mock.js'

/**
 * Retrieves audit logs for the current user with optional filters.
 * @param {{ provider?: string, status?: string }} filters
 * @returns {Promise<Array>}
 */
export async function getAuditLogs(filters = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let rows = _getAuditLogsRef()
      if (filters.provider && filters.provider !== 'all') {
        rows = rows.filter((r) => r.provider?.toLowerCase() === filters.provider.toLowerCase())
      }
      if (filters.status === 'success') {
        rows = rows.filter((r) => r.status === 'success' && !r.fallbackUsed)
      } else if (filters.status === 'fallback') {
        rows = rows.filter((r) => r.status === 'success' && r.fallbackUsed)
      } else if (filters.status === 'failed') {
        rows = rows.filter((r) => r.status === 'failed')
      }
      resolve(rows)
    }, 150)
  })
}

/**
 * Records a real request event into the current user's audit log store.
 * @param {object} logEntry
 */
export function recordAuditLog(logEntry) {
  return _recordAuditLogRow(logEntry)
}

/**
 * Clears the audit logs for the active user.
 */
export function clearAuditLogs() {
  return _clearAuditLogsRef()
}
