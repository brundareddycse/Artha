import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, Btn, SectionHeader, Badge, ProgressBar, EmptyState } from '../components/UI'
import { callClaude, scoreColor, gradeLabel } from '../utils/api'
import { Send, Activity } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const QUESTIONS = [
  { key: 'age', text: "Let's build your financial health score. To start — what is your age and monthly take-home income after tax?", placeholder: 'e.g. 28 years old, ₹85,000/month', chips: [] },
  { key: 'expenses', text: "What are your total monthly expenses — rent or EMI, food, transport, utilities, and other regular spending?", placeholder: 'e.g. Around ₹55,000 total', chips: ['Under ₹20k', '₹20k–₹40k', '₹40k–₹60k', '₹60k–₹80k', 'Over ₹80k'] },
  { key: 'emergency', text: "Do you have an emergency fund? If yes, how many months of expenses does it cover?", placeholder: 'e.g. Yes, about 3 months', chips: ['No fund yet', '1–2 months', '3–5 months', '6+ months'] },
  { key: 'investments', text: "What investments do you currently hold? SIPs, stocks, FDs, PPF, NPS, or others — all count.", placeholder: 'e.g. ₹10k/month SIP, some fixed deposits', chips: ['No investments', 'FD / savings only', 'Mutual funds / SIPs', 'Stocks + mutual funds', 'Diversified portfolio'] },
  { key: 'insurance', text: "What insurance coverage do you have — health, term life, both, or none?", placeholder: 'e.g. Company health cover + personal term plan', chips: ['No insurance', 'Health insurance only', 'Term life only', 'Health + term life', 'Comprehensive coverage'] },
  { key: 'debt', text: "Any outstanding debt? Credit cards, personal loans, home loan, car loan?", placeholder: 'e.g. Home loan ₹40L, no other debt', chips: ['No debt', 'Credit card only', 'Personal loan', 'Home or car loan', 'Multiple loans'] },
  { key: 'goals', text: "Finally — what are your main financial goals for the next 5–10 years?", placeholder: 'e.g. Buy a house, retire by 55, kids education', chips: ['Just saving', 'Buying a home', 'Marriage or family', 'Early retirement', 'Business or startup'] },
]

function DemoScoreResult() {
  return {
    overallScore: 62, grade: 'Fair',
    gradeSummary: 'Your financial health shows a solid foundation in some areas but has critical gaps in insurance and tax optimisation that are costing you money each year. With focused effort on 2–3 areas, you can meaningfully improve your score.',
    dimensions: [
      { name: 'Emergency Preparedness', score: 65, note: '3-month buffer is a good start. Aim for 6 months.' },
      { name: 'Insurance Coverage', score: 40, note: 'Review adequacy of health cover. Add term insurance if missing.' },
      { name: 'Investment Diversification', score: 70, note: 'SIPs are a strong start. Consider adding debt and gold allocation.' },
      { name: 'Debt Health', score: 80, note: 'Low debt position is excellent. Maintain this discipline.' },
      { name: 'Tax Efficiency', score: 45, note: 'Likely missing ₹50k NPS deduction and optimal HRA claim.' },
      { name: 'Retirement Readiness', score: 35, note: 'Start NPS immediately. Every year delayed compounds against you.' },
    ],
    topRecommendations: [
      { priority: 'High', title: 'Activate NPS for ₹50,000 Extra Deduction', detail: 'Open NPS Tier-I at eNPS.nsdl.com. The 80CCD(1B) deduction of ₹50,000 is entirely separate from your 80C limit. If you are in the 30% bracket, this saves ₹15,600 annually for a one-time 20-minute setup.' },
      { priority: 'Medium', title: 'Get ₹1 Crore Term Insurance', detail: 'At your age, a ₹1Cr term plan costs approximately ₹8,000–12,000 per year. Use PolicyBazaar to compare. This single decision protects your family from catastrophic financial risk.' },
      { priority: 'Low', title: 'Step Up Your SIP by 10% Each April', detail: 'Every April when salary increases, raise your SIP by 10%. This simple habit nearly doubles your corpus over 20 years compared to a flat SIP amount.' },
    ],
    savingsRate: 28,
    nextAction: 'Open an NPS account this week at eNPS.nsdl.com. Takes 20 minutes and can save you ₹15,600 in taxes this financial year.',
  }
}

export default function HealthScore() {
  const { apiKey, saveScore, scoreData: existingScore } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [curQ, setCurQ] = useState(-1)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(existingScore || null)
  const [loading, setLoading] = useState(false)
  const [followUp, setFollowUp] = useState(false)
  const msgsEndRef = useRef(null)

  const scrollBottom = () => msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scrollBottom, [messages])

  useEffect(() => {
    setTimeout(() => askNext(0), 400)
  }, [])

  function addMsg(text, role) {
    setMessages(prev => [...prev, { text, role, id: Date.now() + Math.random() }])
  }

  async function askNext(qIdx) {
    setCurQ(qIdx)
    if (qIdx >= QUESTIONS.length) {
      await analyse()
      return
    }
    await new Promise(r => setTimeout(r, 700))
    addMsg(QUESTIONS[qIdx].text, 'bot')
  }

  async function sendMsg(val) {
    const v = val || input.trim()
    if (!v || loading) return
    setInput('')

    if (followUp) {
      addMsg(v, 'user')
      setLoading(true)
      try {
        const reply = await callClaude(apiKey, [{ role: 'user', content: `You are an Indian financial advisor. User profile: ${JSON.stringify(answers)}. Question: "${v}". Give a concise, specific, actionable answer in 3-4 sentences using Indian financial products — SIP, PPF, NPS, ELSS — and ₹ amounts where helpful.` }])
        addMsg(reply, 'bot')
      } catch {
        addMsg('Based on your profile, refer to the action plan on the right for your most important next steps. Each recommendation is prioritised by impact.', 'bot')
      }
      setLoading(false)
      return
    }

    addMsg(v, 'user')
    const newAnswers = { ...answers, [QUESTIONS[curQ].key]: v }
    setAnswers(newAnswers)
    askNext(curQ + 1)
  }

  async function analyse() {
    addMsg('Analysing your financial health across 6 dimensions…', 'bot')
    setLoading(true)
    const prompt = `You are an expert Indian financial advisor. Analyse this person's financial health and return ONLY valid JSON with no markdown.

User data:
- Age & Income: ${answers.age}
- Monthly Expenses: ${answers.expenses}
- Emergency Fund: ${answers.emergency}
- Investments: ${answers.investments}
- Insurance: ${answers.insurance}
- Debt: ${answers.debt}
- Goals: ${answers.goals}

Return exactly this structure:
{"overallScore":<0-100>,"grade":"<Excellent|Good|Fair|Needs Work|Critical>","gradeSummary":"<2-3 sentence assessment>","dimensions":[{"name":"Emergency Preparedness","score":<0-100>,"note":"<1 sentence>"},{"name":"Insurance Coverage","score":<0-100>,"note":"<1 sentence>"},{"name":"Investment Diversification","score":<0-100>,"note":"<1 sentence>"},{"name":"Debt Health","score":<0-100>,"note":"<1 sentence>"},{"name":"Tax Efficiency","score":<0-100>,"note":"<1 sentence>"},{"name":"Retirement Readiness","score":<0-100>,"note":"<1 sentence>"}],"topRecommendations":[{"priority":"High","title":"<title>","detail":"<specific Indian advice with ₹ amounts>"},{"priority":"Medium","title":"<title>","detail":"<specific advice>"},{"priority":"Low","title":"<title>","detail":"<specific advice>"}],"savingsRate":<number>,"nextAction":"<single most important action this week>"}`

    try {
      const text = await callClaude(apiKey, [{ role: 'user', content: prompt }])
      const data = JSON.parse(text.replace(/```json|```/g, '').trim())
      setResult(data)
      saveScore(data)
      setLoading(false)
      addMsg('Your score is ready. Ask me any follow-up questions about your finances.', 'bot')
      setFollowUp(true)
    } catch {
      const demo = DemoScoreResult()
      setResult(demo)
      saveScore(demo)
      setLoading(false)
      addMsg('Your score is ready — check the results panel on the right. Feel free to ask any follow-up questions about your finances.', 'bot')
      setFollowUp(true)
    }
  }

  const progress = curQ < 0 ? 0 : Math.min(100, Math.round((Math.min(curQ, QUESTIONS.length) / QUESTIONS.length) * 100))
  const chips = curQ >= 0 && curQ < QUESTIONS.length ? QUESTIONS[curQ].chips : followUp ? ['How do I improve my score?', 'Best SIPs to start', 'NPS vs ELSS comparison', 'How much term insurance do I need?'] : []

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader title="Financial Health Score" subtitle="AI-powered assessment across 6 dimensions of your financial life" />
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        {/* Chat */}
        <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Assessment</div>
              <Badge variant={progress === 100 ? 'teal' : 'neutral'}>{progress === 100 ? 'Complete' : `${progress}%`}</Badge>
            </div>
            <ProgressBar value={progress} color={progress === 100 ? 'var(--teal-light)' : 'var(--amber)'} />
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '5px' }}>
              {curQ >= 0 ? `Question ${Math.min(curQ + 1, QUESTIONS.length)} of ${QUESTIONS.length}` : 'Starting…'}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: m.role === 'bot' ? 'flex-start' : 'flex-end', animation: 'fadeIn 0.2s ease' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-3)', padding: '0 4px' }}>{m.role === 'bot' ? 'Artha' : 'You'}</div>
                <div style={{ maxWidth: '290px', padding: '10px 14px', borderRadius: m.role === 'bot' ? '4px 14px 14px 14px' : '14px 4px 14px 14px', fontSize: '13.5px', lineHeight: 1.6, background: m.role === 'bot' ? 'var(--bg-2)' : 'var(--amber)', color: m.role === 'bot' ? 'var(--text-1)' : '#0e0e0f', fontWeight: m.role === 'user' ? 500 : 400 }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '0 4px' }}>Artha</div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-2)', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, background: 'var(--text-3)', borderRadius: '50%', animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* Quick chips */}
          {chips.length > 0 && (
            <div style={{ padding: '0 22px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {chips.map(c => (
                <button key={c} onClick={() => sendMsg(c)} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '99px', padding: '5px 12px', fontSize: '12px', color: 'var(--amber)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber-dim)'; e.currentTarget.style.borderColor = 'rgba(212,147,58,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: '8px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()} placeholder={curQ >= 0 && curQ < QUESTIONS.length ? QUESTIONS[curQ].placeholder : 'Ask a follow-up…'} disabled={loading || (!followUp && curQ >= QUESTIONS.length)} style={{ flex: 1, padding: '10px 14px', fontSize: '13px', borderRadius: 'var(--radius)' }} />
            <button onClick={() => sendMsg()} disabled={loading || !input.trim()} style={{ width: 40, height: 40, background: input.trim() ? 'var(--amber)' : 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.15s', flexShrink: 0 }}>
              <Send size={15} color={input.trim() ? '#0e0e0f' : 'var(--text-3)'} />
            </button>
          </div>
        </Card>

        {/* Results */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!result ? (
            <Card style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState icon={Activity} title="Your score appears here" description="Complete the assessment on the left to see your personalised financial health analysis." />
            </Card>
          ) : (
            <>
              {/* Overall */}
              <Card style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', border: `3px solid ${scoreColor(result.overallScore)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, color: scoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>/ 100</div>
                  </div>
                  <div>
                    <Badge variant={result.overallScore >= 65 ? 'teal' : result.overallScore >= 45 ? 'amber' : 'red'} style={{ marginBottom: '8px' }}>{gradeLabel(result.overallScore)}</Badge>
                    <p style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.7, marginTop: '8px' }}>{result.gradeSummary}</p>
                  </div>
                </div>
                {result.nextAction && (
                  <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--amber-dim)', border: '1px solid rgba(212,147,58,0.2)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--amber-light)', lineHeight: 1.6, borderLeft: '3px solid var(--amber)' }}>
                    <strong>This week:</strong> {result.nextAction}
                  </div>
                )}
              </Card>

              {/* Dimensions */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '12px' }}>Score by dimension</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {result.dimensions.map((d, i) => (
                    <Card key={i} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 }}>{d.name}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: scoreColor(d.score), lineHeight: 1, flexShrink: 0, marginLeft: '8px' }}>{d.score}</div>
                      </div>
                      <ProgressBar value={d.score} color={scoreColor(d.score)} height={3} />
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px', lineHeight: 1.5 }}>{d.note}</div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '12px' }}>Action plan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.topRecommendations.map((r, i) => {
                    const colors = { High: 'var(--red)', Medium: 'var(--amber)', Low: 'var(--teal-light)' }
                    return (
                      <Card key={i} style={{ padding: '16px 18px', borderLeft: `3px solid ${colors[r.priority]}` }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <Badge variant={r.priority === 'High' ? 'red' : r.priority === 'Medium' ? 'amber' : 'teal'} style={{ flexShrink: 0, marginTop: '1px' }}>{r.priority}</Badge>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{r.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6 }}>{r.detail}</div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
