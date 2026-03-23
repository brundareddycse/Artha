import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && !key.startsWith('#')) {
    env[key.trim()] = value?.trim() || ''
  }
})

// Test function
async function testClaudeAPI() {
  console.log('🧪 Testing Claude API...\n')
  
  const apiKey = env.VITE_CLAUDE_API_KEY
  
  // Test 1: Check if API key is loaded
  console.log('Test 1: Checking API key configuration')
  if (!apiKey) {
    console.error('❌ FAILED: API key not found in .env file')
    process.exit(1)
  }
  console.log('✅ PASSED: API key is configured\n')

  // Test 2: Try a simple API call
  console.log('Test 2: Making API call to Claude')
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'What is 2 + 2? Answer in one sentence.' }],
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData?.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text

    if (text) {
      console.log('✅ PASSED: API call successful')
      console.log(`Response: "${text}"\n`)
    } else {
      throw new Error('Empty response from API')
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message, '\n')
    process.exit(1)
  }

  // Test 3: Test with system context
  console.log('Test 3: Testing with system context')
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        system: 'You are a financial advisor from India.',
        messages: [{ role: 'user', content: 'What is SIP?' }],
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData?.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text

    if (text) {
      console.log('✅ PASSED: System context works')
      console.log(`Response: "${text.substring(0, 150)}..."\n`)
    } else {
      throw new Error('Empty response from API')
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message, '\n')
    process.exit(1)
  }

  console.log('🎉 All tests passed! Your Claude API is working correctly.')
}

testClaudeAPI().catch(error => {
  console.error('Test error:', error)
  process.exit(1)
})
