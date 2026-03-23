import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionHeader, Badge, Btn } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { callClaude } from '../utils/api'

const QUIZ_BANK = [
  { q: 'The Rule of 72 estimates how long it takes to double your money. At 12% annual return, that is approximately…', options: ['5 years', '6 years', '8 years', '10 years'], correct: 1, explanation: 'Divide 72 by the annual return rate. 72 ÷ 12 = 6 years. At 8%, it would take 9 years.' },
  { q: 'Under Section 80CCD(1B), an additional NPS deduction of ₹50,000 is available…', options: ['Within the ₹1.5L 80C limit', 'Over and above the ₹1.5L 80C limit', 'Only for government employees', 'Only in the Old Regime'], correct: 1, explanation: '80CCD(1B) is completely separate from 80C. This means total deductions of ₹2 lakh are possible — ₹1.5L under 80C and ₹50k extra under 80CCD(1B).' },
  { q: 'ELSS mutual funds have a lock-in period of…', options: ['1 year', '3 years', '5 years', '15 years'], correct: 1, explanation: 'ELSS (Equity Linked Savings Scheme) has the shortest lock-in of all 80C instruments at 3 years. PPF is 15 years, NSC is 5 years.' },
  { q: 'Employer NPS contribution under Section 80CCD(2) is deductible in…', options: ['Only the Old Regime', 'Only the New Regime', 'Both Old and New Regimes', 'Neither regime'], correct: 2, explanation: 'This is a critical loophole. 80CCD(2) deduction for employer NPS — up to 14% of Basic — is available in both regimes, making it one of the best tax tools for salaried employees.' },
  { q: 'India\'s new income tax rebate under Section 87A for FY 2025-26 (New Regime) means zero tax for income up to…', options: ['₹7 lakh', '₹10 lakh', '₹12 lakh', '₹15 lakh'], correct: 2, explanation: 'The 2025 Budget introduced a ₹60,000 rebate under 87A in the new regime, making income up to ₹12L effectively tax-free. With standard deduction, the effective limit is ₹12.75L.' },
]

const ARTICLES = [
  {
    category: 'TAX SAVING',
    title: 'The NPS Loophole 73% of Salaried Indians Miss',
    body: 'Section 80CCD(1B) allows an additional ₹50,000 deduction for NPS contributions — entirely separate from and above the ₹1.5 lakh 80C limit. For someone in the 30% bracket, this is ₹15,600 in annual savings for a one-time 20-minute account setup at eNPS.nsdl.com. Most employees are unaware because it requires a proactive action rather than a payroll deduction. The NPS Tier-I account additionally builds a retirement corpus invested in low-cost government and corporate bond funds.',
    tag: 'teal',
    readTime: '3 min',
    action: { label: 'Calculate my tax savings', page: 'tax-wizard' },
  },
  {
    category: 'BEHAVIOURAL FINANCE',
    title: 'Why 90% of F&O Traders Lose Money — The SEBI Evidence',
    body: 'SEBI\'s landmark 2024 study analysed 10 million individual F&O traders over three years. The findings were stark: 9 in 10 lost money, with an average net loss of ₹1.1 lakh per person per year. The losses were not random — they were concentrated among traders who overtrade, trade impulsively on market tips, and hold losing positions due to loss aversion. The study also found that trading frequency was negatively correlated with returns. The highest-frequency traders had the worst outcomes by a wide margin.',
    tag: 'red',
    readTime: '4 min',
    action: { label: 'Check my investor biases', page: 'bias-detector' },
  },
  {
    category: 'WEALTH BUILDING',
    title: 'The Power of the Annual SIP Step-Up',
    body: 'Consider two investors. Both start a ₹10,000 monthly SIP at age 28. Investor A keeps it flat for 25 years. Investor B increases it by 10% every April. At 12% expected annual return, Investor A ends up with ₹1.89 crore. Investor B ends up with ₹5.2 crore — 2.7 times more — simply by increasing the SIP in line with their salary. The step-up approach requires no additional financial discipline. It just routes a small fraction of each year\'s increment into the SIP instead of lifestyle inflation.',
    tag: 'amber',
    readTime: '3 min',
    action: { label: 'Plan my SIP', page: 'sip-planner' },
  },
  {
    category: 'RISK MANAGEMENT',
    title: 'Term Insurance: The One Financial Decision You Cannot Defer',
    body: 'A ₹1 crore term plan at age 28 costs approximately ₹8,000–10,000 per year. At 35, the same cover costs ₹14,000+. At 42, it costs ₹28,000+. The premium for every year you delay is a permanent cost — you cannot go back and buy at 28 once you are 40. Group insurance from employers covers you only while employed, at amounts far below adequate, and lapses the moment you change jobs. The single most impactful financial decision most young Indians can make is buying term insurance before they need it.',
    tag: 'red',
    readTime: '4 min',
    action: { label: 'Check my health score', page: 'health-score' },
  },
  {
    category: 'INVESTING',
    title: 'ELSS vs PPF: The Numbers Speak',
    body: 'Both ELSS mutual funds and PPF qualify for the ₹1.5 lakh Section 80C deduction. But the similarities end there. PPF: 7.1% tax-free return, 15-year lock-in, zero market risk. ELSS: 12–15% historical returns, 3-year lock-in, equity market risk. On ₹1.5 lakh invested annually for 15 years: PPF generates approximately ₹42 lakh. ELSS (at 12%) generates ₹75 lakh. The risk-adjusted case for ELSS is strong for anyone with a long horizon and stable income. PPF remains valuable for the risk-averse or as a debt component in asset allocation.',
    tag: 'amber',
    readTime: '5 min',
    action: { label: 'Plan my investments', page: 'sip-planner' },
  },
  {
    category: 'ECONOMICS',
    title: 'Why Renting Is Not "Throwing Money Away"',
    body: 'In most Indian metros, purchasing a home currently means paying 4–5 times the annual rental yield as EMI. A ₹1 crore apartment in Bengaluru rents for ₹25,000–30,000 per month but an 80% mortgage at 9% demands an EMI of ₹72,000+. The opportunity cost of the ₹20 lakh down payment invested in equity SIPs at 12% over 10 years is ₹62 lakh. The renting-vs-buying decision is a spreadsheet problem, not a cultural one. In many current market conditions, renting and investing the surplus creates more net worth than buying.',
    tag: 'neutral',
    readTime: '5 min',
  },
]

const tagVariants = { teal: 'teal', red: 'red', amber: 'amber', neutral: 'neutral' }

export default function Insights() {
  const { addXp, xp, streak } = useAuth()
  const navigate = useNavigate()
  const [quizIdx] = useState(new Date().getDate() % QUIZ_BANK.length)
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const { apiKey } = useAuth()

  const quiz = QUIZ_BANK[quizIdx]

  function answerQuiz(idx) {
    if (selected !== null) return
    setSelected(idx)
    if (idx === quiz.correct) addXp(15)
  }

  async function askAi(e) {
    e.preventDefault()
    if (!aiQuestion.trim() || aiLoading) return
    setAiLoading(true)
    setAiAnswer('')
    try {
      const ans = await callClaude(apiKey, [{
        role: 'user',
        content: `You are a financial educator focused on Indian personal finance. Answer this question concisely in 3–4 sentences, referencing Indian products, tax laws, and regulations where applicable: "${aiQuestion}"`
      }])
      setAiAnswer(ans)
    } catch {
      setAiAnswer('Unable to reach AI right now. Make sure your Gemini API key is set in src/utils/api.js and try again.')
    }
    setAiLoading(false)
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader
        title="Daily Insights"
        subtitle="One concept per day. Build your financial intelligence systematically."
        action={<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Badge variant="amber">{streak} day streak</Badge>
          <Badge variant="neutral">{xp} XP total</Badge>
        </div>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* Main feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Daily quiz */}
          <Card style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '4px' }}>Daily Quiz</div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>Answer correctly to earn +15 XP</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>+15</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>XP</div>
              </div>
            </div>
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-0)', marginBottom: '16px' }}>{quiz.q}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {quiz.options.map((opt, i) => {
                const isSelected = selected === i
                const isCorrect = i === quiz.correct
                let bg = 'var(--bg-3)', border = 'var(--border)', color = 'var(--text-1)'
                if (selected !== null) {
                  if (isCorrect) { bg = 'rgba(39,174,96,0.1)'; border = 'rgba(39,174,96,0.4)'; color = 'var(--green)' }
                  else if (isSelected) { bg = 'var(--red-dim)'; border = 'rgba(192,57,43,0.4)'; color = 'var(--red)' }
                }
                return (
                  <button key={i} onClick={() => answerQuiz(i)} disabled={selected !== null} style={{ padding: '11px 15px', borderRadius: 'var(--radius)', background: bg, border: `1px solid ${border}`, color, fontSize: '14px', textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s', width: '100%' }}
                    onMouseEnter={e => { if (selected === null) e.currentTarget.style.borderColor = 'rgba(212,147,58,0.4)' }}
                    onMouseLeave={e => { if (selected === null) e.currentTarget.style.borderColor = 'var(--border)' }}>
                    {opt}
                  </button>
                )
              })}
            </div>
            {selected !== null && (
              <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', borderLeft: `3px solid ${selected === quiz.correct ? 'var(--green)' : 'var(--amber)'}`, fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text-1)' }}>{selected === quiz.correct ? 'Correct. ' : 'Not quite. '}</strong>{quiz.explanation}
              </div>
            )}
          </Card>

          {/* Article feed */}
          {ARTICLES.map((a, i) => (
            <Card key={i} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant={tagVariants[a.tag] || 'neutral'}>{a.category}</Badge>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{a.readTime} read</span>
                </div>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: expanded === i ? '14px' : '0', lineHeight: 1.3, color: 'var(--text-0)' }}>{a.title}</h3>
              {expanded === i && (
                <>
                  <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.8, marginBottom: a.action ? '16px' : '0' }}>{a.body}</p>
                  {a.action && (
                    <button onClick={e => { e.stopPropagation(); navigate('/app/' + a.action.page) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--amber)', background: 'var(--amber-dim)', border: '1px solid rgba(212,147,58,0.2)', borderRadius: 'var(--radius)', padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,147,58,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--amber-dim)'}>
                      {a.action.label} →
                    </button>
                  )}
                </>
              )}
              {expanded !== i && (
                <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '8px', lineHeight: 1.6 }}>{a.body.slice(0, 120)}…</p>
              )}
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Ask AI */}
          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Ask Artha</div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '14px' }}>Any personal finance question, answered with Indian context</div>
            <form onSubmit={askAi} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} placeholder="e.g. Should I choose NPS or PPF for tax saving?" rows={3} style={{ padding: '10px 14px', fontSize: '13px', borderRadius: 'var(--radius)', resize: 'vertical', width: '100%' }} />
              <Btn type="submit" variant="primary" size="sm" disabled={aiLoading || !aiQuestion.trim()} style={{ width: '100%' }}>
                {aiLoading ? 'Thinking…' : 'Get Answer'}
              </Btn>
            </form>
            {aiAnswer && (
              <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.8, borderLeft: '3px solid var(--amber)' }}>
                {aiAnswer}
              </div>
            )}
          </Card>

          {/* XP Progress */}
          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Your Progress</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Total XP</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>{xp} XP</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (xp % 100))}%`, background: 'var(--amber)', borderRadius: '99px', transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Daily quiz answered', xp: 15 },
                { label: 'Health Score completed', xp: 50 },
                { label: 'Bias scenario correct', xp: 20 },
                { label: 'Tax Wizard run', xp: 10 },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border-soft)' : 'none' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{a.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>+{a.xp}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Concepts */}
          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>Financial Terms Glossary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { term: 'XIRR', def: 'Extended Internal Rate of Return. Accounts for irregular cash flows in SIP returns — more accurate than simple returns.' },
                { term: 'CAGR', def: 'Compounded Annual Growth Rate. The rate at which an investment would have grown if it grew at a steady rate.' },
                { term: 'Expense Ratio', def: 'Annual fee charged by a mutual fund as a % of AUM. 0.5% on ₹10L = ₹5,000/year silently deducted.' },
                { term: 'NAV', def: 'Net Asset Value. The per-unit price of a mutual fund. Buying at lower NAV is irrelevant — what matters is percentage return.' },
                { term: 'AUM', def: 'Assets Under Management. Total market value of assets a fund or manager handles. Larger AUM is not better for small-cap funds.' },
              ].map((g, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-soft)' : 'none' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>{g.term}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6 }}>{g.def}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
