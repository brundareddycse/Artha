import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card, StatCard, SectionHeader, Badge, Btn, ProgressBar } from '../components/UI'
import { scoreColor, gradeLabel, fmtINR } from '../utils/api'
import { ArrowRight, AlertTriangle, TrendingUp, Shield, Calculator } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const LOOPHOLES = [
  { label: '73% of salaried Indians miss the NPS 80CCD(1B) deduction — ₹50,000 extra tax savings', severity: 'high' },
  { label: 'New regime: ₹12.75L income = zero tax. Most salaried earners still file under old regime at higher cost.', severity: 'med' },
  { label: 'Employer NPS up to 14% of Basic is deductible even in New Regime — ask your HR immediately.', severity: 'med' },
  { label: '90% of F&O traders lose money (SEBI 2024). Herd mentality + FOMO are the primary drivers.', severity: 'high' },
]

const DEADLINES = [
  { date: 'Mar 31', label: 'FY 2025–26 investment declarations due', urgency: 'high' },
  { date: 'Apr 01', label: 'New financial year — review and step up your SIPs', urgency: 'med' },
  { date: 'Jul 31', label: 'ITR filing deadline (AY 2026–27)', urgency: 'low' },
  { date: 'Dec 31', label: 'Advance tax 3rd instalment (75% of liability)', urgency: 'low' },
]

export default function Dashboard() {
  const { scoreData, user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <SectionHeader title="Dashboard" subtitle={`Financial overview · ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`} />

      {/* Score + quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Money Health Score" value={scoreData ? scoreData.overallScore : '—'} sub={scoreData ? gradeLabel(scoreData.overallScore) : 'Complete your assessment'} accentColor={scoreData ? scoreColor(scoreData.overallScore) : 'var(--border)'} />
        <StatCard label="Est. Savings Rate" value={scoreData ? `${scoreData.savingsRate || '—'}%` : '—'} sub="Target: 30%+ for wealth building" accentColor="var(--teal)" delta={scoreData?.savingsRate ? { up: scoreData.savingsRate >= 30, label: scoreData.savingsRate >= 30 ? 'On track' : 'Below target' } : undefined} />
        <StatCard label="Tax Optimisation" value={scoreData ? 'Review needed' : '—'} sub="Run the Tax Wizard to find savings" accentColor="var(--amber)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Score breakdown or CTA */}
        {scoreData ? (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Score Breakdown</h3>
              <Btn variant="ghost" size="sm" onClick={() => navigate('../health-score')}>Retake <ArrowRight size={13} /></Btn>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={scoreData.dimensions.map(d => ({ subject: d.name.split(' ')[0], value: d.score }))}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-2)' }} />
                  <Radar dataKey="value" stroke="var(--amber)" fill="var(--amber)" fillOpacity={0.12} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {scoreData.dimensions.map((d, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{d.name.split(' ')[0]}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: scoreColor(d.score) }}>{d.score}</span>
                    </div>
                    <ProgressBar value={d.score} color={scoreColor(d.score)} height={3} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, background: 'var(--amber-dim)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Shield size={24} color="var(--amber)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Get your Financial Health Score</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '20px', maxWidth: '280px' }}>5-minute assessment across 6 financial dimensions. AI-powered, India-specific.</p>
              <Btn variant="primary" onClick={() => navigate('../health-score')}>Start Assessment <ArrowRight size={14} /></Btn>
            </div>
          </Card>
        )}

        {/* Deadlines */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '18px' }}>Key Deadlines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DEADLINES.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: d.urgency === 'high' ? 'var(--red-dim)' : d.urgency === 'med' ? 'var(--amber-dim)' : 'var(--bg-3)', color: d.urgency === 'high' ? 'var(--red)' : d.urgency === 'med' ? 'var(--amber)' : 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{d.date}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Indian financial loopholes */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: 28, height: 28, background: 'var(--amber-dim)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={14} color="var(--amber)" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>India Financial Loophole Alerts</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {LOOPHOLES.map((l, i) => (
            <div key={i} style={{ padding: '12px 16px', background: l.severity === 'high' ? 'rgba(212,147,58,0.06)' : 'var(--bg-2)', border: `1px solid ${l.severity === 'high' ? 'rgba(212,147,58,0.2)' : 'var(--border-soft)'}`, borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, borderLeft: `3px solid ${l.severity === 'high' ? 'var(--amber)' : 'var(--border)'}` }}>
              {l.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
        {[
          { icon: Calculator, label: 'Compare tax regimes', sub: 'Find which saves more for FY26', page: 'tax-wizard', color: 'var(--teal)' },
          { icon: TrendingUp, label: 'Plan your first SIP', sub: 'Map a goal to a monthly amount', page: 'sip-planner', color: 'var(--amber)' },
          { icon: Shield, label: 'Check your biases', sub: 'SEBI-backed behavioural assessment', page: 'bias-detector', color: '#8b5cf6' },
        ].map((a, i) => (
          <Card key={i} hover onClick={() => navigate(`../${a.page}`)} style={{ cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: `${a.color}18`, border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <a.icon size={17} color={a.color} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '3px' }}>{a.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{a.sub}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
