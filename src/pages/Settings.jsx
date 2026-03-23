import React from 'react'
import { Card, SectionHeader, Badge, Btn } from '../components/UI'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, streak, xp } = useAuth()

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '680px' }}>
      <SectionHeader title="Settings" subtitle="Manage your account and preferences" />

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>Account</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email, mono: true },
            { label: 'Member since', value: user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Today' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{row.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: row.mono ? 'var(--font-mono)' : 'inherit', color: 'var(--text-1)' }}>{row.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Progress</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge variant="amber">{streak} day streak</Badge>
              <Badge variant="neutral">{xp} XP</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>Data & Privacy</div>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '16px' }}>
          All your data — financial profile, scores, and preferences — is stored locally in your browser. Nothing is sent to any external server.
        </p>
        <Btn variant="danger" size="sm" onClick={() => {
          if (window.confirm('This will delete all your scores, streaks, and saved data. Your login credentials will remain. Continue?')) {
            localStorage.removeItem('artha_score')
            localStorage.removeItem('artha_streak')
            localStorage.removeItem('artha_xp')
            window.location.reload()
          }
        }}>
          Clear Financial Data
        </Btn>
      </Card>
    </div>
  )
}
