import React, { useState, useRef, useEffect } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import RouteTrace from '../components/RouteTrace.jsx'
import {
  CopyIcon,
  CheckIcon,
  SendIcon,
  SlidersIcon,
  RotateCcwIcon,
  SparklesIcon,
  CornerDownLeftIcon,
  ZapIcon,
  ClockIcon,
  CpuIcon,
  DownloadIcon,
} from '../components/Icons.jsx'
import { sendChatCompletion } from '../api/routingApi.js'

const STRATEGIES = [
  { value: 'auto', label: 'Auto (Intelligent Priority Fallback)' },
  { value: 'latency', label: 'Lowest Latency (Fastest Responder)' },
  { value: 'cost', label: 'Cost Optimized (Economy First)' },
  { value: 'gemini', label: 'Direct: Google Gemini' },
  { value: 'groq', label: 'Direct: Groq LPU' },
  { value: 'openrouter', label: 'Direct: OpenRouter' },
]

const PROMPT_PRESETS = [
  {
    label: 'Test Fallback 429',
    prompt: 'Simulate high-throughput API batch processing and demonstrate automated fallback resilience.',
  },
  {
    label: 'System Architecture',
    prompt: 'Explain the difference between intra-provider key rotation and cross-provider fallback in an AI gateway.',
  },
  {
    label: 'Generate SQL',
    prompt: 'Write an optimized PostgreSQL query with window functions to aggregate request latencies by percentile.',
  },
  {
    label: 'JSON Extraction',
    prompt: 'Extract structured JSON entities from this log: User "parthiv" triggered Gemini fallback to Groq in 142ms.',
  },
]

export default function Playground() {
  const [prompt, setPrompt] = useState('')
  const [strategy, setStrategy] = useState('auto')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [systemPrompt, setSystemPrompt] = useState('You are NexusAI, an intelligent gateway routing engine.')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! Welcome to the NexusAI interactive routing console. Send any prompt to observe live fallback routing across your configured LLM providers.',
      id: 'welcome-01',
      provider: 'NexusAI Gateway',
      model: 'gateway-router-v1',
      latencyMs: 12,
      tokens: 28,
      trace: [{ provider: 'Gateway', status: 200, outcome: 'success' }],
    },
  ])
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e?.preventDefault()
    const text = prompt.trim()
    if (!text || sending) return

    const userMessage = { role: 'user', content: text, id: crypto.randomUUID() }
    setMessages((m) => [...m, userMessage])
    setPrompt('')
    setSending(true)

    const result = await sendChatCompletion(text, strategy)

    setMessages((m) => [
      ...m,
      {
        role: 'assistant',
        content: result.reply,
        id: crypto.randomUUID(),
        provider: result.provider,
        model: result.model,
        latencyMs: result.latencyMs,
        tokens: result.tokens,
        trace: result.trace,
      },
    ])
    setSending(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleClearChat() {
    setMessages([])
  }

  function handleExportChat() {
    const data = JSON.stringify(messages, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexusai-chat-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout title="AI Routing Playground">
      <div className="page-header">
        <div className="page-header__content">
          <h1>Interactive Routing Playground</h1>
          <p>
            Test prompts across your fallback pipeline. Inspect hop-by-hop execution traces,
            latencies, and token expenditures in real time.
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--secondary btn--small" onClick={handleExportChat} disabled={messages.length === 0}>
            <DownloadIcon size={14} /> Export JSON
          </button>
          <button className="btn btn--ghost btn--small" onClick={handleClearChat}>
            <RotateCcwIcon size={14} /> Clear Log
          </button>
        </div>
      </div>

      <div className="playground-container">
        {/* Main Conversation Window */}
        <div className="playground">
          <div className="playground__log" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="empty-state">
                <SparklesIcon size={32} color="var(--accent)" style={{ marginBottom: '10px' }} />
                <p>Chat session is empty. Type a prompt or choose a preset below to start routing.</p>
              </div>
            )}

            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div className="chat-bubble chat-bubble--user" key={msg.id}>
                  {msg.content}
                </div>
              ) : (
                <AssistantBubble key={msg.id} msg={msg} />
              ),
            )}

            {sending && (
              <div className="chat-bubble chat-bubble--assistant chat-bubble--pending">
                <ZapIcon size={16} color="var(--accent)" className="animate-spin" />
                <span>Evaluating fallback chain & querying upstream provider…</span>
              </div>
            )}
          </div>

          {/* Prompt Presets & Input Bar */}
          <div className="playground__input-bar">
            <div className="playground-presets">
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
                Presets:
              </span>
              {PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="preset-chip"
                  onClick={() => setPrompt(preset.prompt)}
                  disabled={sending}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <textarea
              className="playground__textarea"
              rows={2}
              placeholder="Send a message (Enter to send, Shift+Enter for new line)…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />

            <div className="playground__input-actions">
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CornerDownLeftIcon size={13} /> Enter to send
              </span>
              <button
                type="button"
                className="btn btn--primary btn--small"
                onClick={handleSend}
                disabled={sending || !prompt.trim()}
              >
                <SendIcon size={14} />
                <span>{sending ? 'Routing…' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Configuration Controls */}
        <div className="playground-sidebar">
          <div className="panel">
            <div className="panel__header" style={{ marginBottom: '14px', paddingBottom: '10px' }}>
              <h3 className="panel__title" style={{ fontSize: '14.5px' }}>
                <SlidersIcon size={16} color="var(--accent)" />
                Routing Configuration
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Routing Strategy</span>
                </label>
                <select
                  className="select-input"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                >
                  {STRATEGIES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {strategy === 'auto'
                    ? 'Tries providers in priority order, automatically catching 429/503 errors.'
                    : 'Dispatches request directly to this provider.'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Temperature</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{temperature}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>Max Tokens</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{maxTokens}</span>
                </label>
                <input
                  type="range"
                  min="128"
                  max="4096"
                  step="128"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>System Prompt</span>
                </label>
                <textarea
                  className="text-input"
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  style={{ resize: 'vertical', fontSize: '12.5px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function AssistantBubble({ msg }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="chat-bubble chat-bubble--assistant">
      <p className="chat-bubble__text">{msg.content}</p>

      {/* Visual Route Trace */}
      {msg.trace && <RouteTrace trace={msg.trace} />}

      <div className="chat-bubble__meta">
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{msg.model}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <ClockIcon size={11} /> {msg.latencyMs} ms
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <CpuIcon size={11} /> {msg.tokens} tokens
        </span>

        <button className={`copy-btn${copied ? ' copy-btn--copied' : ''}`} onClick={handleCopy}>
          {copied ? (
            <>
              <CheckIcon size={12} /> Copied!
            </>
          ) : (
            <>
              <CopyIcon size={12} /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  )
}
