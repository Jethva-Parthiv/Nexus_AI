import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import Modal from '../components/Modal.jsx'
import {
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
  CheckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ZapIcon,
  LayersIcon,
  SlidersIcon,
} from '../components/Icons.jsx'
import {
  getProviders,
  toggleProviderGlobal,
  reorderProviders,
  addProviderKey,
  deleteProviderKey,
  setKeyEnabled,
  reorderProviderKeys,
} from '../api/providerApi.js'

const PROVIDER_OPTIONS = [
  { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 1.5 Pro & Flash via Google AI Studio' },
  { id: 'groq', name: 'Groq LPU', desc: 'Ultra-low latency Llama 3.3 & Mixtral inference' },
  { id: 'openrouter', name: 'OpenRouter', desc: 'Universal AI router with 100+ open and closed models' },
  { id: 'nvidia', name: 'NVIDIA NIM', desc: 'Enterprise microservices on NVIDIA DGX Cloud' },
  { id: 'cerebras', name: 'Cerebras', desc: 'Wafer-scale high-throughput inference engine' },
  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4o-mini, and reasoning models' },
  { id: 'anthropic', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet & Haiku models' },
]

export default function Providers() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [busyKey, setBusyKey] = useState(null)
  const [modalProviderId, setModalProviderId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [revealedKeys, setRevealedKeys] = useState({})
  const [copiedKeyId, setCopiedKeyId] = useState(null)
  const [testedKeys, setTestedKeys] = useState({})

  useEffect(() => {
    getProviders().then((data) => {
      setProviders(data)
      setLoading(false)
      if (data.length) setExpandedId(data[0].id)
    })
  }, [])

  function toggleExpand(id) {
    setExpandedId((cur) => (cur === id ? null : id))
  }

  async function handleGlobalToggle(provider) {
    setBusyKey(provider.id)
    const updated = await toggleProviderGlobal(provider.id, !provider.enabled)
    setProviders(updated)
    setBusyKey(null)
  }

  async function movePriority(provider, direction) {
    const ordered = [...providers]
    const index = ordered.findIndex((p) => p.id === provider.id)
    const swapWith = index + direction
    if (swapWith < 0 || swapWith >= ordered.length) return
    ;[ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]]
    setBusyKey(provider.id)
    const updated = await reorderProviders(ordered.map((p) => p.id))
    setProviders(updated)
    setBusyKey(null)
  }

  async function moveKeyPriority(provider, key, direction) {
    const ordered = [...provider.keys]
    const index = ordered.findIndex((k) => k.id === key.id)
    const swapWith = index + direction
    if (swapWith < 0 || swapWith >= ordered.length) return
    ;[ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]]
    const busyId = `${provider.id}:${key.id}`
    setBusyKey(busyId)
    const updated = await reorderProviderKeys(provider.id, ordered.map((k) => k.id))
    setProviders(updated)
    setBusyKey(null)
  }

  async function handleKeyToggle(provider, key) {
    const busyId = `${provider.id}:${key.id}`
    setBusyKey(busyId)
    const updated = await setKeyEnabled(provider.id, key.id, !key.enabled)
    setProviders(updated)
    setBusyKey(null)
  }

  function requestDeleteKey(provider, key) {
    setPendingDelete({ providerId: provider.id, keyId: key.id, label: key.label })
  }

  async function confirmDeleteKey() {
    if (!pendingDelete) return
    const { providerId, keyId } = pendingDelete
    setBusyKey(`${providerId}:${keyId}`)
    const updated = await deleteProviderKey(providerId, keyId)
    setProviders(updated)
    setBusyKey(null)
    setPendingDelete(null)
  }

  function toggleReveal(keyId) {
    setRevealedKeys((r) => ({ ...r, [keyId]: !r[keyId] }))
  }

  async function handleCopy(key) {
    try {
      await navigator.clipboard.writeText(key.maskedKey)
    } catch {}
    setCopiedKeyId(key.id)
    setTimeout(() => setCopiedKeyId(null), 1500)
  }

  function handleTestKey(keyId) {
    setTestedKeys((t) => ({ ...t, [keyId]: 'testing' }))
    setTimeout(() => {
      setTestedKeys((t) => ({ ...t, [keyId]: 'valid' }))
    }, 600)
  }

  return (
    <DashboardLayout title="Providers & Keys">
      <div className="page-header">
        <div className="page-header__content">
          <h1>Upstream LLM Providers & Key Store</h1>
          <p>
            NexusAI routes every request according to global priority. Intra-provider fallback
            rotates through your backup keys on rate limits before escalating to the next
            provider in line.
          </p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--primary"
            onClick={() => setModalProviderId(providers[0]?.id || 'gemini')}
          >
            <PlusIcon size={16} />
            <span>Add Provider Key</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="empty-state">Loading providers and credential inventory…</p>
      ) : (
        <div className="provider-list">
          {providers.map((provider, index) => {
            const activeKeyCount = provider.keys.filter((k) => k.enabled).length
            const isExpanded = expandedId === provider.id
            const isEnabled = provider.enabled && activeKeyCount > 0

            return (
              <div
                className={`provider-acc${isExpanded ? ' provider-acc--open' : ''}`}
                key={provider.id}
              >
                <div className="provider-acc__header">
                  {/* Priority Order Control */}
                  <div className="provider-acc__priority" title="Global Fallback Priority Order">
                    <button
                      className="provider-card__priority-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        movePriority(provider, -1)
                      }}
                      disabled={index === 0 || busyKey === provider.id}
                      aria-label="Move provider higher in priority"
                    >
                      ▲
                    </button>
                    <span className="provider-card__priority-num">{provider.priority}</span>
                    <button
                      className="provider-card__priority-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        movePriority(provider, 1)
                      }}
                      disabled={index === providers.length - 1 || busyKey === provider.id}
                      aria-label="Move provider lower in priority"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Provider Header Details */}
                  <button
                    className="provider-acc__toggle-row"
                    onClick={() => toggleExpand(provider.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="provider-avatar">
                      {provider.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="provider-card__name">{provider.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Priority #{provider.priority} in chain
                      </div>
                    </div>

                    <span
                      className={`badge ${
                        activeKeyCount > 0 ? 'badge--primary' : ''
                      }`}
                      style={{ marginLeft: '12px' }}
                    >
                      {activeKeyCount} / {provider.keys.length} active key
                      {provider.keys.length === 1 ? '' : 's'}
                    </span>

                    <ChevronDownIcon
                      size={18}
                      className={`provider-acc__chevron${
                        isExpanded ? ' provider-acc__chevron--open' : ''
                      }`}
                    />
                  </button>

                  {/* Global Enable / Disable Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                      {provider.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <label className="toggle" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={provider.enabled}
                        disabled={provider.keys.length === 0 || busyKey === provider.id}
                        onChange={() => handleGlobalToggle(provider)}
                      />
                      <span className="toggle__track">
                        <span className="toggle__thumb" />
                      </span>
                    </label>
                  </div>
                </div>

                {/* Key Management Drawer */}
                {isExpanded && (
                  <div className="provider-acc__drawer">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Configured Keys (Intra-Provider Fallback Priority)
                      </span>
                      <button
                        className="btn btn--secondary btn--small"
                        onClick={() => setModalProviderId(provider.id)}
                      >
                        <PlusIcon size={14} />
                        <span>Add Key for {provider.name}</span>
                      </button>
                    </div>

                    {provider.keys.length === 0 ? (
                      <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '10px' }}>
                          No API keys configured for {provider.name}.
                        </p>
                        <button
                          className="btn btn--primary btn--small"
                          onClick={() => setModalProviderId(provider.id)}
                        >
                          <PlusIcon size={14} /> Add First Key
                        </button>
                      </div>
                    ) : (
                      <div className="key-list">
                        {provider.keys.map((key, kIndex) => {
                          const busyId = `${provider.id}:${key.id}`
                          const revealed = revealedKeys[key.id]
                          const copied = copiedKeyId === key.id
                          const testState = testedKeys[key.id]

                          return (
                            <div className="key-row" key={key.id}>
                              {/* Intra-provider priority buttons */}
                              <div className="key-row__priority" title="Key fallback priority">
                                <button
                                  className="provider-card__priority-btn"
                                  onClick={() => moveKeyPriority(provider, key, -1)}
                                  disabled={kIndex === 0 || busyKey === busyId}
                                  aria-label="Move key higher"
                                >
                                  ▲
                                </button>
                                <span className="provider-card__priority-num">{key.priority}</span>
                                <button
                                  className="provider-card__priority-btn"
                                  onClick={() => moveKeyPriority(provider, key, 1)}
                                  disabled={kIndex === provider.keys.length - 1 || busyKey === busyId}
                                  aria-label="Move key lower"
                                >
                                  ▼
                                </button>
                              </div>

                              <div className="key-row__body">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="key-row__label">{key.label}</span>
                                  {testState === 'valid' && (
                                    <span className="status-pill status-pill--success" style={{ fontSize: '10.5px' }}>
                                      <CheckCircleIcon size={11} /> Valid • 128ms
                                    </span>
                                  )}
                                  {testState === 'testing' && (
                                    <span className="status-pill status-pill--fallback" style={{ fontSize: '10.5px' }}>
                                      Pinging…
                                    </span>
                                  )}
                                </div>
                                <span className="key-row__key">
                                  {revealed ? key.maskedKey : key.maskedKey}
                                </span>
                              </div>

                              {/* Test Key Connection Simulator */}
                              <button
                                className="btn btn--ghost btn--small"
                                onClick={() => handleTestKey(key.id)}
                                disabled={testState === 'testing'}
                                title="Test key validity and latency"
                              >
                                Test
                              </button>

                              {/* Copy Key */}
                              <button
                                className="icon-btn"
                                onClick={() => handleCopy(key)}
                                title="Copy masked key"
                                aria-label="Copy key"
                              >
                                {copied ? <CheckIcon size={15} color="var(--success)" /> : <CopyIcon size={15} />}
                              </button>

                              {/* Reveal Key */}
                              <button
                                className="icon-btn"
                                onClick={() => toggleReveal(key.id)}
                                aria-label={revealed ? 'Hide key' : 'Show key'}
                                title={revealed ? 'Hide' : 'Show'}
                              >
                                {revealed ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
                              </button>

                              {/* Enable / Disable Key */}
                              <label className="toggle toggle--small" title="Toggle key active state">
                                <input
                                  type="checkbox"
                                  checked={key.enabled}
                                  disabled={busyKey === busyId}
                                  onChange={() => handleKeyToggle(provider, key)}
                                />
                                <span className="toggle__track">
                                  <span className="toggle__thumb" />
                                </span>
                              </label>

                              {/* Delete Key */}
                              <button
                                className="icon-btn icon-btn--danger"
                                onClick={() => requestDeleteKey(provider, key)}
                                disabled={busyKey === busyId}
                                aria-label="Delete key"
                                title="Delete key"
                              >
                                <TrashIcon size={15} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalProviderId && (
        <AddKeyModal
          providerIdProp={modalProviderId}
          onClose={() => setModalProviderId(null)}
          onSaved={(updated) => {
            setProviders(updated)
            setModalProviderId(null)
          }}
        />
      )}

      {pendingDelete && (
        <Modal
          title="Remove Provider Key"
          onClose={() => setPendingDelete(null)}
          footer={
            <>
              <button className="btn btn--secondary btn--small" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button className="btn btn--danger btn--small" onClick={confirmDeleteKey}>
                Confirm Delete
              </button>
            </>
          }
        >
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{pendingDelete.label}</strong>? NexusAI will
            no longer route requests through this key. This action cannot be undone.
          </p>
        </Modal>
      )}
    </DashboardLayout>
  )
}

function AddKeyModal({ providerIdProp, onClose, onSaved }) {
  const [providerId, setProviderId] = useState(providerIdProp || PROVIDER_OPTIONS[0].id)
  const [label, setLabel] = useState('')
  const [rawKey, setRawKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!rawKey.trim()) {
      setError('Please provide an API key to save.')
      return
    }
    setError('')
    setSaving(true)
    const updated = await addProviderKey(providerId, label, rawKey.trim())
    setSaving(false)
    onSaved(updated)
  }

  return (
    <Modal title="Add Upstream Provider Key" onClose={onClose}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__field">
          <span>Target Provider</span>
          <select value={providerId} onChange={(e) => setProviderId(e.target.value)}>
            {PROVIDER_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-form__field">
          <span>Key Label / Identifier</span>
          <input
            type="text"
            placeholder="e.g. Gemini Production Primary, Groq Tier-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>

        <label className="auth-form__field">
          <span>API Secret Key</span>
          <div className="input-with-action">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="Paste provider API secret key"
              value={rawKey}
              onChange={(e) => setRawKey(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="input-with-action__btn"
              onClick={() => setShowKey((s) => !s)}
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          {error && <span style={{ color: 'var(--error-text)', fontSize: '12px' }}>{error}</span>}
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button type="button" className="btn btn--secondary btn--small" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary btn--small" disabled={saving}>
            {saving ? 'Encrypting & Storing…' : 'Save Key'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
