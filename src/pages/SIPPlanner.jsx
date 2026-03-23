import React, { useState, useEffect } from 'react'
import { Card, SectionHeader, Input, Select, Btn, Badge } from '../components/UI'
import { fmtINR, fmtNum } from '../utils/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const GOALS = [
  { id: 'house', label: 'Buy a Home', amount: 7500000, years: 7, sub: 'Down payment for ₹1.5Cr metro flat' },
  { id: 'retire', label: 'Retire at 55', amount: 50000000, years: 25, sub: 'Comfortable retirement corpus' },
  { id: 'kids', label: "Children's Education", amount: 3000000, years: 15, sub: 'Premier college — India or abroad' },
  { id: 'car', label: 'Dream Car', amount: 1500000, years: 4, sub: 'Mid-segment with down payment' },
  { id: 'wedding', label: 'Wedding Fund', amount: 2500000, years: 5, sub: 'Indian wedding, mid-range' },
  { id: 'emergency', label: 'Emergency Fund', amount: 500000, years: 2, sub: '6-month expense buffer' },
  { id: 'custom', label: 'Custom Goal', amount: 0, years: 10, sub: 'Define your own target' },
]

function calcSIP(target, years, rate) {
  const r = rate / 100 / 12
  const n = years * 12
  return Math.round(target * r / (Math.pow(1 + r, n) - 1))
}

function buildChart(sip, years, rate) {
  const r = rate / 100 / 12
  return Array.from({ length: years }, (_, i) => {
    const n = (i + 1) * 12
    return { year: `Yr ${i + 1}`, corpus: Math.round(sip * (Math.pow(1 + r, n) - 1) / r), invested: sip * n }
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px' }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ fontSize: '13px', color: p.color, fontWeight: 500 }}>{p.name}: {fmtINR(p.value)}</div>)}
    </div>
  )
}

export default function SIPPlanner() {
  const [selectedGoal, setSelectedGoal] = useState('house')
  const [customAmount, setCustomAmount] = useState('')
  const [customYears, setCustomYears] = useState('10')
  const [returnRate, setReturnRate] = useState('12')
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')
  const [result, setResult] = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => { compute() }, [selectedGoal, customAmount, customYears, returnRate])

  function compute() {
    const goal = GOALS.find(g => g.id === selectedGoal)
    if (!goal) return
    const target = goal.id === 'custom' ? parseFloat(customAmount) || 0 : goal.amount
    const years = goal.id === 'custom' ? parseInt(customYears) || 10 : goal.years
    const rate = parseFloat(returnRate) || 12
    if (!target || !years) { setResult(null); return }
    const sip = calcSIP(target, years, rate)
    const totalInvested = sip * years * 12
    setResult({ sip, totalInvested, totalReturns: target - totalInvested, target, years, rate, goalLabel: goal.label })
    setChartData(buildChart(sip, years, rate))
  }

  const surplus = income && expenses ? parseFloat(income) - parseFloat(expenses) : null

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader title="SIP Planner" subtitle="Map your life goals to precise monthly investment amounts" />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '12px' }}>Select a Goal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setSelectedGoal(g.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 13px', borderRadius: 'var(--radius)', border: `1px solid ${selectedGoal === g.id ? 'rgba(212,147,58,0.4)' : 'var(--border)'}`, background: selectedGoal === g.id ? 'var(--amber-dim)' : 'var(--bg-3)', cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: selectedGoal === g.id ? 600 : 400, color: selectedGoal === g.id ? 'var(--amber-light)' : 'var(--text-1)' }}>{g.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>{g.sub}</div>
                  </div>
                  {g.id !== 'custom' && <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: selectedGoal === g.id ? 'var(--amber)' : 'var(--text-3)', flexShrink: 0, marginLeft: '8px' }}>{fmtINR(g.amount)}</div>}
                </button>
              ))}
            </div>
          </Card>

          {selectedGoal === 'custom' && (
            <Card>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Custom Goal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Input label="Target Amount (₹)" id="ca" type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)} placeholder="e.g. 5000000" />
                <Input label="Years to achieve" id="cy" type="number" value={customYears} onChange={e => setCustomYears(e.target.value)} placeholder="e.g. 10" />
              </div>
            </Card>
          )}

          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Select label="Expected Annual Return" id="ret" value={returnRate} onChange={e => setReturnRate(e.target.value)} options={[
                { value: '8', label: 'Conservative — 8%' },
                { value: '10', label: 'Moderate — 10%' },
                { value: '12', label: 'Growth — 12%' },
                { value: '15', label: 'Aggressive — 15%' },
              ]} />
              <Input label="Monthly Income (₹)" id="inc" type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="for affordability check" />
              <Input label="Monthly Expenses (₹)" id="exp" type="number" value={expenses} onChange={e => setExpenses(e.target.value)} placeholder="optional" />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {result ? (
            <>
              <Card style={{ background: 'var(--bg-2)' }}>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Monthly SIP needed</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>{fmtINR(result.sip)}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '6px' }}>for {result.years} years at {result.rate}% p.a.</div>
                    {surplus !== null && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', background: result.sip <= surplus ? 'var(--green-dim)' : 'var(--red-dim)', border: `1px solid ${result.sip <= surplus ? 'rgba(39,174,96,0.25)' : 'rgba(192,57,43,0.25)'}`, borderRadius: 'var(--radius-sm)', fontSize: '12px', color: result.sip <= surplus ? 'var(--green)' : 'var(--red)' }}>
                        {result.sip <= surplus ? `Affordable — ${fmtINR(surplus - result.sip)} surplus remaining` : `Exceeds surplus of ${fmtINR(surplus)} — adjust goal or timeline`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1, minWidth: '240px' }}>
                    {[
                      { label: 'Target corpus', value: fmtINR(result.target), color: 'var(--amber)' },
                      { label: 'Total invested', value: fmtINR(result.totalInvested), color: 'var(--text-1)' },
                      { label: 'Returns earned', value: fmtINR(Math.max(0, result.totalReturns)), color: 'var(--green)' },
                      { label: 'Return multiple', value: `${(result.target / result.totalInvested).toFixed(1)}x`, color: 'var(--teal-light)' },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        <div style={{ fontSize: '17px', fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>Corpus Growth Projection</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--amber)" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="var(--amber)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--teal-light)" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="var(--teal-light)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(result.years / 5) - 1)} />
                    <YAxis tickFormatter={v => fmtINR(v)} tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={58} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-2)', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="corpus" name="Corpus" stroke="var(--amber)" strokeWidth={2} fill="url(#cg)" />
                    <Area type="monotone" dataKey="invested" name="Invested" stroke="var(--teal-light)" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#ig)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card style={{ border: '1px solid rgba(212,147,58,0.2)', background: 'var(--amber-glow)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)', marginBottom: '10px' }}>Step-Up SIP — The Power Move</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '4px' }}>Flat SIP ({fmtINR(result.sip)}/mo)</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-1)' }}>{fmtINR(result.target)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>final corpus</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--amber-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(212,147,58,0.25)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--amber)', marginBottom: '4px' }}>10% Step-Up / year</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--amber)' }}>{fmtINR(result.target * 1.85)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--amber)' }}>estimated corpus</div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6 }}>
                  Increasing your SIP by 10% every April — matching your salary hike — nearly doubles your final corpus. Start this habit from day one.
                </div>
              </Card>
            </>
          ) : (
            <Card style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 700, marginBottom: '12px' }}>SIP</div>
                <div>Select a goal on the left to calculate your monthly investment</div>
              </div>
            </Card>
          )}

          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>India SIP Strategy</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[
                ['Start with ₹500/month', 'Compounding rewards consistency, not size. Starting small beats waiting to invest big.'],
                ['ELSS for 80C benefit', 'ELSS SIPs deliver equity returns with 3-year lock-in and full Section 80C benefit — superior to PPF.'],
                ['One SIP per goal', 'Separate folios per goal prevents premature redemption and keeps tracking clean.'],
                ['Never pause in a crash', 'Downturns are when SIPs accumulate more units cheaply. Stopping is the worst decision.'],
              ].map(([t, b], i) => (
                <div key={i} style={{ padding: '10px 13px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', borderLeft: '2px solid var(--teal-light)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--teal-light)', marginBottom: '2px' }}>{t}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.5 }}>{b}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
