import React, { useState, useEffect } from 'react'
import { Card, SectionHeader, Input, Select, Badge, Btn } from '../components/UI'
import { fmtINR } from '../utils/api'
import { Info } from 'lucide-react'

const DEDUCTIONS = [
  { key: 'epf', label: 'EPF (auto-calculated)', amount: 0, hint: '12% of Basic — included if provided' },
  { key: 'ppf', label: 'PPF', amount: 50000 },
  { key: 'elss', label: 'ELSS Mutual Funds', amount: 50000 },
  { key: 'lifeins', label: 'Life Insurance Premium', amount: 20000 },
  { key: 'nps_80c', label: 'NPS (within 80C)', amount: 50000 },
  { key: 'tuition', label: 'Tuition Fees (children)', amount: 50000 },
  { key: 'homeloan_p', label: 'Home Loan Principal', amount: 100000 },
  { key: 'nps_1b', label: 'NPS 80CCD(1B) — Extra ₹50k', amount: 50000, extra: true, hint: 'Above 80C limit. 73% miss this.' },
  { key: 'health_self', label: 'Health Insurance (self)', amount: 25000, section: '80D' },
  { key: 'health_parents', label: 'Health Insurance (parents)', amount: 25000, section: '80D' },
  { key: 'homeloan_i', label: 'Home Loan Interest', amount: 200000, section: '24B' },
  { key: 'eduloan', label: 'Education Loan Interest', amount: 50000, section: '80E' },
]

function calcOldTax(income) {
  if (income <= 250000) return 0
  let t = 0
  if (income > 1000000) { t += (income - 1000000) * 0.30; income = 1000000 }
  if (income > 500000) { t += (income - 500000) * 0.20; income = 500000 }
  if (income > 250000) t += (income - 250000) * 0.05
  return Math.round(t * 1.04)
}

function calcNewTax(income) {
  const slabs = [[400000, 0], [400000, 0.05], [400000, 0.10], [400000, 0.15], [400000, 0.20], [Infinity, 0.30]]
  let t = 0, rem = Math.max(0, income - 300000)
  for (const [limit, rate] of slabs) {
    const chunk = Math.min(rem, limit); t += chunk * rate; rem -= chunk
    if (rem <= 0) break
  }
  // Rebate 87A — new regime: up to ₹60,000 rebate if income ≤ ₹12L
  const taxBefore = t
  if (income <= 1200000) t = Math.max(0, t - 60000)
  return Math.round(t * 1.04)
}

export default function TaxWizard() {
  const [income, setIncome] = useState('')
  const [basic, setBasic] = useState('')
  const [rent, setRent] = useState('')
  const [hra, setHra] = useState('')
  const [city, setCity] = useState('metro')
  const [custom80c, setCustom80c] = useState('')
  const [active, setActive] = useState(new Set())
  const [result, setResult] = useState(null)

  useEffect(() => { if (income) compute() }, [income, basic, rent, hra, city, custom80c, active])

  function toggleDed(key) {
    setActive(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function compute() {
    const inc = parseFloat(income) || 0
    if (!inc) { setResult(null); return }
    const bas = parseFloat(basic) || inc * 0.5
    const rentAmt = parseFloat(rent) || 0
    const hraAmt = parseFloat(hra) || 0

    // HRA exemption
    const hraExempt = rentAmt > 0 ? Math.min(hraAmt, city === 'metro' ? bas * 0.5 : bas * 0.4, Math.max(0, rentAmt - bas * 0.1)) : 0

    // 80C
    let deduct80c = Math.min(parseFloat(custom80c) || 0, 150000)
    ;['ppf', 'elss', 'lifeins', 'nps_80c', 'tuition', 'homeloan_p'].forEach(k => {
      if (active.has(k)) deduct80c = Math.min(deduct80c + (DEDUCTIONS.find(d => d.key === k)?.amount || 0), 150000)
    })
    // EPF
    const epf = active.has('epf') ? Math.min(bas * 0.12, 150000) : 0
    deduct80c = Math.min(deduct80c + epf, 150000)

    const nps1b = active.has('nps_1b') ? 50000 : 0
    const health = (active.has('health_self') ? 25000 : 0) + (active.has('health_parents') ? 25000 : 0)
    const homeloanI = active.has('homeloan_i') ? 200000 : 0
    const eduloan = active.has('eduloan') ? 50000 : 0

    const oldTaxable = Math.max(0, inc - 50000 - hraExempt - deduct80c - nps1b - health - homeloanI - eduloan)
    const newTaxable = Math.max(0, inc - 75000)
    const oldTax = calcOldTax(oldTaxable)
    const newTax = calcNewTax(newTaxable)
    const winner = newTax <= oldTax ? 'new' : 'old'
    const saving = Math.abs(oldTax - newTax)

    // Missed deductions in old regime
    const missed = []
    if (!active.has('nps_1b')) missed.push({ label: 'NPS 80CCD(1B)', amount: 50000, saving: calcOldTax(oldTaxable) - calcOldTax(Math.max(0, oldTaxable - 50000)) })
    if (!active.has('health_self')) missed.push({ label: 'Health Insurance (self)', amount: 25000, saving: calcOldTax(oldTaxable) - calcOldTax(Math.max(0, oldTaxable - 25000)) })

    setResult({ inc, oldTax, newTax, winner, saving, oldTaxable, newTaxable, hraExempt, deduct80c, nps1b, missed })
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader title="Tax Wizard" subtitle="Old regime vs New regime comparison with every deduction counted — FY 2025–26" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '18px' }}>Income Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input label="Annual Gross Income (₹)" id="inc" type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g. 1200000" />
              <Input label="Annual Basic Salary (₹) — for HRA & EPF" id="basic" type="number" value={basic} onChange={e => setBasic(e.target.value)} placeholder="e.g. 600000" />
              <Select label="City Type" id="city" value={city} onChange={e => setCity(e.target.value)} options={[{ value: 'metro', label: 'Metro — Mumbai, Delhi, Kolkata, Chennai' }, { value: 'nonmetro', label: 'Non-Metro' }]} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="Annual Rent Paid (₹)" id="rent" type="number" value={rent} onChange={e => setRent(e.target.value)} placeholder="0 if own house" />
                <Input label="HRA Received (₹/yr)" id="hra" type="number" value={hra} onChange={e => setHra(e.target.value)} placeholder="from salary slip" />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px' }}>Deductions</div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '14px' }}>Select what applies to you (Old Regime only, except NPS)</div>
            <Input label="Custom 80C Investments (₹)" id="c80c" type="number" value={custom80c} onChange={e => setCustom80c(e.target.value)} placeholder="Max ₹1,50,000" style={{ marginBottom: '14px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DEDUCTIONS.map(d => (
                <button key={d.key} onClick={() => toggleDed(d.key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius)', background: active.has(d.key) ? 'var(--amber-dim)' : 'var(--bg-3)', border: `1px solid ${active.has(d.key) ? 'rgba(212,147,58,0.3)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: active.has(d.key) ? 'var(--amber-light)' : 'var(--text-1)', fontWeight: active.has(d.key) ? 500 : 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {d.label}
                      {d.extra && <Badge variant="amber" style={{ fontSize: '10px', padding: '1px 6px' }}>Missed by 73%</Badge>}
                      {d.section && <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{d.section}</span>}
                    </div>
                    {d.hint && <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{d.hint}</div>}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)', flexShrink: 0, marginLeft: '12px' }}>
                    {d.amount > 0 ? `₹${(d.amount / 1000).toFixed(0)}k` : 'Auto'}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!result ? (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>₹</div>
                <div style={{ fontSize: '14px' }}>Enter your income to see the comparison</div>
              </div>
            </Card>
          ) : (
            <>
              {/* Winner banner */}
              <div style={{ padding: '18px 22px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${result.winner === 'new' ? 'var(--teal-light)' : 'var(--amber)'}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Recommended regime</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: result.winner === 'new' ? 'var(--teal-light)' : 'var(--amber)' }}>
                      {result.winner === 'new' ? 'New Regime' : 'Old Regime'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '2px' }}>You save {fmtINR(result.saving)} annually</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: result.winner === 'new' ? 'var(--teal-light)' : 'var(--amber)' }}>{fmtINR(result.saving)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>saved vs other regime</div>
                  </div>
                </div>
              </div>

              {/* Side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Old Regime', tax: result.oldTax, taxable: result.oldTaxable, color: 'var(--amber)', isWinner: result.winner === 'old' },
                  { label: 'New Regime', tax: result.newTax, taxable: result.newTaxable, color: 'var(--teal-light)', isWinner: result.winner === 'new' },
                ].map(r => (
                  <Card key={r.label} style={{ border: r.isWinner ? `1px solid ${r.color}40` : '1px solid var(--border)', background: r.isWinner ? `${r.color}08` : 'var(--bg-1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{r.label}</div>
                      {r.isWinner && <Badge variant={r.color === 'var(--teal-light)' ? 'teal' : 'amber'}>Best</Badge>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, color: r.color, lineHeight: 1, marginBottom: '6px' }}>{fmtINR(r.tax)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>Taxable income: {fmtINR(r.taxable)}</div>
                  </Card>
                ))}
              </div>

              {/* Breakdown */}
              <Card>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>Deduction Summary (Old Regime)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Gross Income', val: result.inc, color: 'var(--text-1)' },
                    { label: 'Standard Deduction', val: -50000, color: 'var(--teal-light)' },
                    { label: 'HRA Exemption', val: -result.hraExempt, color: 'var(--teal-light)' },
                    { label: '80C Deductions', val: -result.deduct80c, color: 'var(--teal-light)' },
                    { label: 'NPS 80CCD(1B)', val: -result.nps1b, color: 'var(--teal-light)' },
                    { label: 'Taxable Income', val: result.oldTaxable, color: 'var(--amber)', bold: true },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: row.bold ? 'none' : '1px solid var(--border-soft)', borderTop: row.bold ? '1px solid var(--border)' : 'none', marginTop: row.bold ? '4px' : 0 }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{row.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: row.bold ? 700 : 500, color: row.color, fontFamily: 'var(--font-mono)' }}>{row.val < 0 ? `(${fmtINR(-row.val)})` : fmtINR(row.val)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Missed deductions */}
              {result.missed.length > 0 && (
                <Card style={{ border: '1px solid rgba(212,147,58,0.25)', background: 'var(--amber-glow)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)', marginBottom: '12px' }}>Deductions you may be missing</div>
                  {result.missed.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < result.missed.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Deduction: {fmtINR(m.amount)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>Save {fmtINR(m.saving)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>per year</div>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </>
          )}

          {/* Loopholes */}
          <Card>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>Indian Tax Loopholes — FY 2025–26</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { title: '₹12.75L = Zero Tax in New Regime', body: 'Standard deduction ₹75k + ₹12L rebate. Most salaried earners at this income still pay tax under old regime.' },
                { title: 'NPS 80CCD(2) in New Regime', body: 'Employer NPS up to 14% of Basic is deductible even in the New Regime. Ask HR to route more through NPS.' },
                { title: 'HRA + Home Loan — Both Claimable', body: 'If you pay rent AND have a home loan on a different property, you can claim both HRA exemption and 24B deduction.' },
                { title: 'ELSS vs PPF', body: 'ELSS gives same 80C benefit with 3-year lock-in vs PPF\'s 15 years. Historical ELSS returns of 12\u201315% vs PPF\'s 7.1%.' },
              ].map((l, i) => (
                <div key={i} style={{ padding: '11px 14px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', borderLeft: '2px solid var(--amber)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber-light)', marginBottom: '3px' }}>{l.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.5 }}>{l.body}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
