import React, { useState } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  UserIcon,
  KeyIcon,
  SlidersIcon,
  ServerIcon,
  ShieldCheckIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from '../components/Icons.jsx'

export default function Settings() {
  const { username } = useAuth()
  const [copiedKey, setCopiedKey] = useState(false)
  const [clientKeys, setClientKeys] = useState([
    {
      id: 'key_live_01',
      name: 'Production Gateway Key',
      prefix: 'nx_live_••••••••••••9A7e',
      created: 'Sep 10, 2026',
      lastUsed: '2 minutes ago',
    },
    {
      id: 'key_test_02',
      name: 'Development & Test Key',
      prefix: 'nx_test_••••••••••••4B2d',
      created: 'Sep 12, 2026',
      lastUsed: '1 hour ago',
    },
  ])

  const [maxRetries, setMaxRetries] = useState(3)
  const [timeoutMs, setTimeoutMs] = useState(4500)
  const [autoFallback, setAutoFallback] = useState(true)

  function handleCreateClientKey() {
    const newKey = {
      id: `key_${Date.now()}`,
      name: `API Key ${clientKeys.length + 1}`,
      prefix: `nx_live_••••••••••••${Math.random().toString(36).substring(2, 6)}`,
      created: 'Just now',
      lastUsed: 'Never',
    }
    setClientKeys([...clientKeys, newKey])
  }

  function handleRevokeKey(id) {
    setClientKeys(clientKeys.filter((k) => k.id !== id))
  }

  function handleCopyEndpoint() {
    navigator.clipboard.writeText('http://localhost:8080/v1/chat/completions')
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 1500)
  }

  return (
    <DashboardLayout title="Settings & Developer API">
      <div className="page-header">
        <div className="page-header__content">
          <h1>Platform Settings & API Keys</h1>
          <p>
            Manage organization credentials, client API gateway access keys, and circuit
            breaker fallback parameters.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* User Profile Card */}
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">
              <UserIcon size={18} color="var(--accent)" />
              Organization & Profile
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              {(username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{username || 'Administrator'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Role: <strong>Organization Owner</strong> • NexusAI Enterprise Tenant
              </div>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-row__label">Auth Service URL</span>
            <span className="settings-row__value log-table__mono">
              {import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081'}
            </span>
          </div>
          <div className="settings-row">
            <span className="settings-row__label">Gateway Base URL</span>
            <span className="settings-row__value log-table__mono">http://localhost:8080</span>
          </div>
        </div>

        {/* Client API Gateway Keys */}
        <div className="panel">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">
                <KeyIcon size={18} color="var(--accent)" />
                Client Gateway API Keys
              </h3>
              <p className="panel__subtitle">
                Use these secret keys to authenticate downstream applications querying the NexusAI gateway
              </p>
            </div>
            <button className="btn btn--primary btn--small" onClick={handleCreateClientKey}>
              <PlusIcon size={14} /> Generate New Key
            </button>
          </div>

          {/* Quick Endpoint Helper */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                OPENAI-COMPATIBLE ENDPOINT
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                POST http://localhost:8080/v1/chat/completions
              </div>
            </div>
            <button className="btn btn--secondary btn--small" onClick={handleCopyEndpoint}>
              {copiedKey ? <CheckIcon size={13} color="var(--success)" /> : <CopyIcon size={13} />}
              <span>{copiedKey ? 'Copied URL!' : 'Copy URL'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {clientKeys.map((key) => (
              <div
                key={key.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{key.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '2px' }}>
                    {key.prefix}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Created: {key.created} • Last used: {key.lastUsed}
                  </div>
                </div>

                <button
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleRevokeKey(key.id)}
                  title="Revoke client API key"
                >
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Fallback & Resilience Rules */}
        <div className="panel">
          <div className="panel__header">
            <div>
              <h3 className="panel__title">
                <SlidersIcon size={18} color="var(--accent)" />
                Fallback & Resilience Policies
              </h3>
              <p className="panel__subtitle">Configure circuit breaker thresholds and retry behavior</p>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row__label">Automatic Provider Fallback</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Automatically route to next priority provider when a 429 or 503 is returned
              </div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={autoFallback}
                onChange={(e) => setAutoFallback(e.target.checked)}
              />
              <span className="toggle__track">
                <span className="toggle__thumb" />
              </span>
            </label>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row__label">Max Fallback Retry Attempts</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Maximum number of fallback hops before aborting request
              </div>
            </div>
            <select
              className="select-input"
              value={maxRetries}
              onChange={(e) => setMaxRetries(parseInt(e.target.value, 10))}
              style={{ width: '120px' }}
            >
              <option value={1}>1 Attempt</option>
              <option value={2}>2 Attempts</option>
              <option value={3}>3 Attempts (Default)</option>
              <option value={5}>5 Attempts</option>
            </select>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row__label">Upstream Timeout Limit</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Milliseconds before declaring upstream provider unresponsive
              </div>
            </div>
            <select
              className="select-input"
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(parseInt(e.target.value, 10))}
              style={{ width: '140px' }}
            >
              <option value={3000}>3,000 ms (Fast)</option>
              <option value={4500}>4,500 ms (Balanced)</option>
              <option value={8000}>8,000 ms (Extended)</option>
              <option value={15000}>15,000 ms (Long)</option>
            </select>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
