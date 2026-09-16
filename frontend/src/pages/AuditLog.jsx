import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import Modal from '../components/Modal.jsx'
import RouteTrace from '../components/RouteTrace.jsx'
import { getAuditLogs } from '../api/auditApi.js'
import {
  DownloadIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ClockIcon,
  CpuIcon,
  ZapIcon,
} from '../components/Icons.jsx'

const PROVIDERS = ['all', 'Gemini', 'Groq', 'OpenRouter', 'NVIDIA', 'Cerebras']
const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'success', label: 'Direct Success (200 OK)' },
  { value: 'fallback', label: 'Fallback Recovered (429/503)' },
  { value: 'failed', label: 'Failed (500 Error)' },
]

function formatTimestamp(iso) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function statusLabel(row) {
  if (row.status === 'failed') return { text: 'failed', cls: 'failed', icon: XCircleIcon }
  if (row.fallbackUsed) return { text: 'fallback', cls: 'fallback', icon: AlertTriangleIcon }
  return { text: 'success', cls: 'success', icon: CheckCircleIcon }
}

function toCsv(rows) {
  const header = ['request_id', 'provider', 'model', 'status', 'latency_ms', 'tokens', 'fallback_used', 'timestamp']
  const lines = [header.join(',')]
  rows.forEach((r) => {
    lines.push(
      [r.requestId, r.provider, r.model, r.status, r.latencyMs, r.tokens, r.fallbackUsed, r.timestamp]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    )
  })
  return lines.join('\n')
}

export default function AuditLog() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedRow, setSelectedRow] = useState(null)

  useEffect(() => {
    setLoading(true)
    getAuditLogs({ provider, status }).then((data) => {
      setRows(data)
      setLoading(false)
    })
  }, [provider, status])

  const filteredRows = rows.filter((r) => {
    if (!search.trim()) return true
    const query = search.toLowerCase()
    return (
      r.requestId.toLowerCase().includes(query) ||
      r.model.toLowerCase().includes(query) ||
      r.provider.toLowerCase().includes(query)
    )
  })

  function handleExportCsv() {
    const csv = toCsv(filteredRows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nexusai-requests-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleExportJson() {
    const json = JSON.stringify(filteredRows, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nexusai-requests-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout title="Request & Audit Log">
      <div className="page-header">
        <div className="page-header__content">
          <h1>Gateway Request Audit Log</h1>
          <p>
            Immutable audit record of all client requests, routing decisions, fallback chains,
            and execution metrics. Click any request row to inspect full telemetry.
          </p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--secondary btn--small"
            onClick={handleExportCsv}
            disabled={filteredRows.length === 0}
          >
            <DownloadIcon size={14} /> Export CSV
          </button>
          <button
            className="btn btn--secondary btn--small"
            onClick={handleExportJson}
            disabled={filteredRows.length === 0}
          >
            <DownloadIcon size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filters-bar">
        <div className="filters-group">
          <div className="search-input-wrapper">
            <SearchIcon size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Request ID, model, provider…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilterIcon size={15} color="var(--text-tertiary)" />
            <select
              className="select-input"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Providers' : p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="select-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredRows.length}</strong> requests
        </span>
      </div>

      {/* High Density Table */}
      <div className="table-responsive">
        {loading ? (
          <p className="empty-state">Loading audit logs…</p>
        ) : filteredRows.length === 0 ? (
          <p className="empty-state">No requests match these search or filter criteria.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Provider</th>
                <th>Model</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Tokens</th>
                <th>Fallback</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const s = statusLabel(row)
                const Icon = s.icon
                return (
                  <tr
                    key={row.requestId}
                    onClick={() => setSelectedRow(row)}
                    title="Click to inspect full request trace"
                  >
                    <td className="log-table__mono" style={{ fontWeight: 600, color: 'var(--accent)' }}>
                      {row.requestId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.provider}</td>
                    <td className="log-table__mono">{row.model}</td>
                    <td>
                      <span className={`status-pill status-pill--${s.cls}`}>
                        <Icon size={12} /> {s.text}
                      </span>
                    </td>
                    <td className="log-table__mono">{row.latencyMs} ms</td>
                    <td className="log-table__mono">{row.tokens}</td>
                    <td>
                      {row.fallbackUsed ? (
                        <span className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}>
                          Recovered
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>Direct Hit</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {formatTimestamp(row.timestamp)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Request Inspection Modal */}
      {selectedRow && (
        <Modal
          title={`Request Inspector: ${selectedRow.requestId}`}
          onClose={() => setSelectedRow(null)}
          footer={
            <button className="btn btn--secondary btn--small" onClick={() => setSelectedRow(null)}>
              Close Inspector
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Selected Engine
                </span>
                <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>
                  {selectedRow.provider} ({selectedRow.model})
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Round-trip Latency
                </span>
                <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  {selectedRow.latencyMs} ms
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Routing Execution Hop Sequence:
              </span>
              <RouteTrace
                trace={
                  selectedRow.fallbackUsed
                    ? [
                        { provider: 'Groq', status: 429, outcome: 'failed' },
                        { provider: selectedRow.provider, status: 200, outcome: 'success' },
                      ]
                    : [{ provider: selectedRow.provider, status: 200, outcome: 'success' }]
                }
              />
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Simulated Request Payload:
              </span>
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  background: '#ffffff',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  marginTop: '6px',
                  overflowX: 'auto',
                }}
              >
{`{
  "request_id": "${selectedRow.requestId}",
  "upstream_provider": "${selectedRow.provider}",
  "model": "${selectedRow.model}",
  "fallback_triggered": ${selectedRow.fallbackUsed},
  "tokens": ${selectedRow.tokens},
  "client_ip": "127.0.0.1",
  "status": "${selectedRow.status}"
}`}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
