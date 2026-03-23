import React, { useState } from 'react'
import { Card, SectionHeader, Badge, Btn, ProgressBar } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { callClaude } from '../utils/api'

const SCENARIOS = [
  {
    id: 1,
    title: 'Market Crash',
    question: 'The Sensex drops 8% in a single week. Your ₹2 lakh portfolio is now worth ₹1.84 lakh. What do you do?',
    options: [
      { text: 'Sell everything — preserve what remains', biases: ['herd', 'lossAversion'] },
      { text: 'Hold. Long-term investors stay the course.', biases: [] },
      { text: 'Invest more — this is a buying opportunity', biases: [] },
      { text: 'Check prices twice daily and react to every move', biases: ['overconfidence'] },
    ],
    correctIndex: 1,
    explanation: 'Markets have recovered from every crash in history. Selling at the bottom locks in losses. The correct move is to hold — or invest more if you have the capacity. Checking prices obsessively induces panic-driven decisions.',
  },
  {
    id: 2,
    title: 'Hot Tip',
    question: 'A colleague made 300% returns on a small-cap stock in 6 months. They mention another "sure shot" pick. What do you do?',
    options: [
      { text: 'Invest immediately — they clearly know the market', biases: ['herd'] },
      { text: 'Research the company thoroughly before deciding', biases: [] },
      { text: 'Invest a small amount to test the waters', biases: ['herd'] },
      { text: 'Decline — past returns do not predict future performance', biases: [] },
    ],
    correctIndex: 3,
    explanation: 'Acting on tips is the number one cause of retail investor losses in India (SEBI 2024). One person\'s outsized gain is often the result of timing, luck, or insider information — none of which transfers to you.',
  },
  {
    id: 3,
    title: 'Sunk Cost',
    question: 'You bought a stock at ₹500. It is now at ₹280. The company has reported three consecutive quarters of declining revenue. What do you do?',
    options: [
      { text: 'Hold until it returns to ₹500 — I need to break even', biases: ['anchoring', 'lossAversion'] },
      { text: 'Cut losses and redeploy capital into a better opportunity', biases: [] },
      { text: 'Average down — buy more at ₹280', biases: ['overconfidence'] },
      { text: 'Ignore the quarterly results and check back in a year', biases: ['anchoring'] },
    ],
    correctIndex: 1,
    explanation: 'The ₹500 purchase price is irrelevant to the current decision. That money is gone whether you hold or sell. What matters is: does this company have better future prospects than alternative investments? If not, sell.',
  },
  {
    id: 4,
    title: 'FOMO',
    question: 'A sector ETF has delivered 45% returns this year. Everyone in your office is talking about it. What do you do?',
    options: [
      { text: 'Invest a large amount — this sector is clearly the future', biases: ['herd', 'recencyBias'] },
      { text: 'Wait — peak media coverage often signals peak prices', biases: [] },
      { text: 'Invest 5% of portfolio as a speculative allocation', biases: [] },
      { text: 'Sell your existing diversified funds to invest in this', biases: ['herd', 'overconfidence'] },
    ],
    correctIndex: 1,
    explanation: 'By the time a sector is widely discussed and has delivered large recent returns, the easy gains are typically priced in. Chasing returns is the classic retail investor trap. Systematic investing beats timing every time.',
  },
  {
    id: 5,
    title: 'Insurance',
    question: 'You are 30 years old with a family. A ₹1 crore term insurance plan costs ₹11,000 per year. Your reasoning?',
    options: [
      { text: 'I am healthy and young — I do not need insurance yet', biases: ['overconfidence'] },
      { text: 'I will buy when I am older and have more to protect', biases: ['overconfidence'] },
      { text: 'Buy it now — premiums rise with age and a missed year cannot be recovered', biases: [] },
      { text: 'My employer provides group cover — that is sufficient', biases: ['anchoring'] },
    ],
    correctIndex: 2,
    explanation: 'Term insurance at 30 costs ₹11,000/year. At 40, the same cover costs ₹22,000+. Group insurance from employers does not cover you after you leave. The optimal time to buy term insurance is always now.',
  },
]

const BIAS_LABELS = {
  herd: 'Herd Mentality',
  lossAversion: 'Loss Aversion',
  overconfidence: 'Overconfidence',
  anchoring: 'Anchoring',
  recencyBias: 'Recency Bias',
}

export default function BiasDetector() {
  const { apiKey, addXp } = useAuth()
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState({})
  const [scores, setScores] = useState({ herd: 0, lossAversion: 0, overconfidence: 0, anchoring: 0, recencyBias: 0 })
  const [aiReport, setAiReport] = useState('')
  const [loadingReport, setLoadingReport] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const done = Object.keys(answered).length === SCENARIOS.length

  function answer(scenarioIdx, optionIdx) {
    if (answered[scenarioIdx] !== undefined) return
    const scenario = SCENARIOS[scenarioIdx]
    const option = scenario.options[optionIdx]
    const isCorrect = optionIdx === scenario.correctIndex
    if (isCorrect) addXp(20)

    const newScores = { ...scores }
    option.biases.forEach(b => { newScores[b] = Math.min(100, (newScores[b] || 0) + 25) })
    setScores(newScores)
    setAnswered(prev => ({ ...prev, [scenarioIdx]: optionIdx }))
    setTimeout(() => { if (scenarioIdx < SCENARIOS.length - 1) setCurrent(scenarioIdx + 1) }, 1200)
  }

  async function getAiReport() {
    setLoadingReport(true)
    setShowReport(true)
    const biasCount = Object.values(scores).filter(v => v > 0).length
    try {
      const text = await callClaude(apiKey, [{
        role: 'user',
        content: `You are a behavioural finance expert. A retail Indian investor's bias assessment: ${JSON.stringify(scores)} (scores out of 100, higher = more biased). Write a concise 3-paragraph personalised report: 1) their dominant bias and why it costs Indian investors money, 2) a specific real scenario where this bias caused losses in Indian markets, 3) three concrete strategies to overcome it. Keep it under 220 words. No bullet points. No markdown.`
      }])
      setAiReport(text)
    } catch {
      setAiReport(`Your assessment reveals a ${scores.lossAversion > 50 ? 'significant loss aversion tendency' : 'herd mentality pattern'} — one of the most common and costly biases among Indian retail investors. SEBI's 2024 study found that 90% of F&O traders lost money over three years, with loss aversion and herd behaviour as the primary drivers.\n\nIn practical terms, this manifests as holding losing positions far too long while waiting to "break even," and selling winning positions too quickly to lock in gains. This asymmetry compounds into significant underperformance over time.\n\nTo counteract this: first, set a predefined exit rule before you enter any position — for example, exit if the stock falls 15% from your cost, regardless of emotion. Second, journal your investment decisions and review them quarterly. Third, automate your investments through SIPs so that emotions are removed from the equation entirely.`)
    }
    setLoadingReport(false)
  }

  const totalBiasScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length)
  const biasRisk = totalBiasScore > 50 ? 'High' : totalBiasScore > 25 ? 'Moderate' : 'Low'

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader
        title="Investor Bias Detector"
        subtitle="SEBI data shows 90% of retail F&O traders lose money — mostly due to cognitive biases"
        action={done && <Badge variant={biasRisk === 'High' ? 'red' : biasRisk === 'Moderate' ? 'amber' : 'teal'}>{biasRisk} Bias Risk</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Scenarios */}
        <div>
          {/* Progress */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--text-3)' }}>
              <span>Scenario {Math.min(current + 1, SCENARIOS.length)} of {SCENARIOS.length}</span>
              <span>{Object.keys(answered).length} answered</span>
            </div>
            <ProgressBar value={Object.keys(answered).length} max={SCENARIOS.length} color="var(--amber)" />
          </div>

          {/* Scenario tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {SCENARIOS.map((s, i) => {
              const isAnswered = answered[i] !== undefined
              const isCorrect = isAnswered && answered[i] === s.correctIndex
              return (
                <button key={i} onClick={() => setCurrent(i)} style={{ padding: '6px 14px', borderRadius: 'var(--radius)', border: `1px solid ${current === i ? 'var(--amber)' : isAnswered ? (isCorrect ? 'rgba(39,174,96,0.3)' : 'rgba(192,57,43,0.3)') : 'var(--border)'}`, background: current === i ? 'var(--amber-dim)' : 'transparent', color: current === i ? 'var(--amber)' : isAnswered ? (isCorrect ? 'var(--green)' : 'var(--red)') : 'var(--text-3)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)' }}>
                  {s.title}
                </button>
              )
            })}
          </div>

          {/* Current scenario */}
          {SCENARIOS.map((s, si) => si === current && (
            <Card key={s.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '12px' }}>
                Scenario {si + 1} — {s.title}
              </div>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--text-0)', marginBottom: '24px', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{s.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {s.options.map((opt, oi) => {
                  const isAnsweredHere = answered[si] !== undefined
                  const isSelected = answered[si] === oi
                  const isCorrectOpt = oi === s.correctIndex
                  let bg = 'var(--bg-3)', border = 'var(--border)', color = 'var(--text-1)'
                  if (isAnsweredHere && isSelected && isCorrectOpt) { bg = 'rgba(39,174,96,0.12)'; border = 'rgba(39,174,96,0.4)'; color = 'var(--green)' }
                  else if (isAnsweredHere && isSelected && !isCorrectOpt) { bg = 'var(--red-dim)'; border = 'rgba(192,57,43,0.4)'; color = 'var(--red)' }
                  else if (isAnsweredHere && isCorrectOpt) { bg = 'rgba(39,174,96,0.08)'; border = 'rgba(39,174,96,0.3)'; color = 'var(--green)' }
                  return (
                    <button key={oi} onClick={() => answer(si, oi)} disabled={isAnsweredHere} style={{ padding: '13px 16px', borderRadius: 'var(--radius)', background: bg, border: `1px solid ${border}`, color, fontSize: '14px', textAlign: 'left', cursor: isAnsweredHere ? 'default' : 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)', lineHeight: 1.5, width: '100%' }}
                      onMouseEnter={e => { if (!isAnsweredHere) e.currentTarget.style.borderColor = 'rgba(212,147,58,0.4)' }}
                      onMouseLeave={e => { if (!isAnsweredHere) e.currentTarget.style.borderColor = 'var(--border)' }}>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
              {answered[si] !== undefined && (
                <div style={{ marginTop: '16px', padding: '14px 16px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', borderLeft: `3px solid ${answered[si] === s.correctIndex ? 'var(--green)' : 'var(--amber)'}`, fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text-1)' }}>Explanation: </strong>{s.explanation}
                </div>
              )}
            </Card>
          ))}

          {/* AI Report */}
          {done && (
            <Card style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showReport ? '16px' : '0' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>AI Bias Analysis Report</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>Personalised analysis powered by Claude</div>
                </div>
                <Btn variant="primary" size="sm" onClick={getAiReport} disabled={loadingReport}>
                  {loadingReport ? 'Analysing…' : 'Generate Report'}
                </Btn>
              </div>
              {showReport && (
                <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.8, whiteSpace: 'pre-line', borderTop: '1px solid var(--border-soft)', paddingTop: '16px' }}>
                  {loadingReport ? (
                    <div style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>Generating your personalised bias analysis…</div>
                  ) : aiReport}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Bias meters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>Your Bias Profile</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(BIAS_LABELS).map(([key, label]) => {
                const v = scores[key] || 0
                const color = v > 50 ? 'var(--red)' : v > 25 ? 'var(--amber)' : 'var(--teal-light)'
                const risk = v > 50 ? 'High' : v > 25 ? 'Moderate' : 'Low'
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>{label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color }}>{risk}</span>
                    </div>
                    <ProgressBar value={v} color={color} height={5} />
                  </div>
                )
              })}
            </div>
          </Card>

          <Card style={{ background: 'var(--bg-2)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>India Market Reality</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { stat: '90%', label: 'of F&O traders lose money', source: 'SEBI 2024', color: 'var(--red)' },
                { stat: '75%', label: 'of demat accounts inactive', source: 'CDSL 2024', color: 'var(--amber)' },
                { stat: '₹1.1L', label: 'avg annual loss per F&O trader', source: 'SEBI 2024', color: 'var(--red)' },
                { stat: '27%', label: 'financial literacy rate in India', source: 'RBI 2024', color: 'var(--amber)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '12px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: '4px' }}>{s.stat}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{s.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>{s.source}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Antidotes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Automate investments via SIPs — remove emotion from decisions',
                'Set entry and exit rules before investing, not after',
                'Review your portfolio quarterly, not daily',
                'Never invest in anything you cannot explain simply',
                'Diversify across asset classes — no single bet',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-soft)' : 'none' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--amber)', marginTop: '8px', flexShrink: 0 }} />
                  <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6 }}>{tip}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
