// MOCK — replace with real call to routing-service POST /api/v1/chat/completions once implemented.

const ENABLED_CHAIN = ['Gemini', 'Groq', 'OpenRouter']

const SAMPLE_REPLIES = [
  "Here's a summary of what you asked — in a real deployment this reply would come from whichever provider succeeded in the fallback chain.",
  'I can help with that. This response is simulated locally so the playground works before routing-service exposes a real completions endpoint.',
  "That's a reasonable approach. Once routing-service is live, this exact UI will render the provider's real streamed tokens instead of this mock text.",
  'Good question. This is placeholder output — the fallback trace below shows how NexusAI would have routed the real request across providers.',
]

function randomLatency() {
  return Math.floor(180 + Math.random() * 900)
}

function randomTokens() {
  return Math.floor(40 + Math.random() * 260)
}

// Builds a randomized fallback trace: some providers fail with a realistic
// status (429 rate limit, 503 unavailable) before one succeeds. When a
// specific provider strategy is chosen (not 'auto'), that provider is tried
// directly with no chain.
function buildTrace(chain) {
  const trace = []
  let successIndex = 0
  const roll = Math.random()

  if (chain.length === 1) {
    trace.push({ provider: chain[0], status: 200, outcome: 'success' })
    return trace
  }

  if (roll < 0.55) {
    successIndex = 0
  } else if (roll < 0.85) {
    successIndex = 1
  } else {
    successIndex = Math.min(2, chain.length - 1)
  }

  for (let i = 0; i <= successIndex; i++) {
    const provider = chain[i]
    if (i < successIndex) {
      const status = Math.random() < 0.6 ? 429 : 503
      trace.push({ provider, status, outcome: 'failed' })
    } else {
      trace.push({ provider, status: 200, outcome: 'success' })
    }
  }
  return trace
}

/**
 * @param {string} prompt
 * @param {string} strategy 'auto' routes through the full fallback chain; anything
 *   else is treated as a specific provider id and routed directly.
 * @returns {Promise<{ reply: string, provider: string, model: string, latencyMs: number, tokens: number, trace: Array }>}
 */
export function mockSendChatCompletion(prompt, strategy = 'auto') {
  return new Promise((resolve) => {
    const delay = 500 + Math.random() * 900
    setTimeout(() => {
      const chain =
        strategy === 'auto'
          ? ENABLED_CHAIN
          : [ENABLED_CHAIN.find((p) => p.toLowerCase() === strategy) || strategy]
      const trace = buildTrace(chain)
      const finalHop = trace[trace.length - 1]
      const reply = SAMPLE_REPLIES[Math.floor(Math.random() * SAMPLE_REPLIES.length)]
      resolve({
        reply,
        provider: finalHop.provider,
        model: `${finalHop.provider.toLowerCase()}-default`,
        latencyMs: randomLatency(),
        tokens: randomTokens(),
        trace,
        promptEcho: prompt,
      })
    }, delay)
  })
}
