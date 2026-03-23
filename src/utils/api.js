const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || ''

/**
 * Calls the Claude API with the provided messages and system prompt
 * @param {string} apiKey - Optional API key (uses env var if not provided)
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {string} system - Optional system prompt
 * @returns {Promise<string>} - Generated response
 */
export async function callClaude(apiKey, messages, system = '') {
  // Validate inputs
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and cannot be empty')
  }

  const key = apiKey || CLAUDE_API_KEY
  if (!key) {
    throw new Error('Claude API key is not configured. Set VITE_CLAUDE_API_KEY in .env')
  }

  // Validate message format
  messages.forEach(m => {
    if (!m.role || !m.content) {
      throw new Error('Each message must have role and content properties')
    }
  })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: system || undefined,
        messages: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      }),
    })

    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}`
      try {
        const err = await res.json()
        errorMessage = err?.error?.message || err?.message || errorMessage
      } catch (e) {
        // Failed to parse error response
      }
      throw new Error(`Claude API Error: ${errorMessage}`)
    }

    const data = await res.json()

    if (data.error) {
      throw new Error(`Claude API Error: ${data.error.message}`)
    }

    if (!data.content?.[0]?.text) {
      throw new Error('Claude returned an empty response')
    }

    return data.content[0].text
  } catch (error) {
    if (error.message.includes('API Error')) throw error
    throw new Error(`Failed to call Claude API: ${error.message}`)
  }
}

export function fmtINR(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}k`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function fmtNum(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000)     return `${(n / 1000).toFixed(0)}k`
  return Math.round(n).toLocaleString('en-IN')
}

export function scoreColor(s) {
  if (s >= 80) return 'var(--teal-light)'
  if (s >= 60) return 'var(--amber)'
  if (s >= 40) return '#e8a030'
  return 'var(--red)'
}

export function gradeLabel(s) {
  if (s >= 80) return 'Excellent'
  if (s >= 65) return 'Good'
  if (s >= 50) return 'Fair'
  if (s >= 35) return 'Needs Work'
  return 'Critical'
}
