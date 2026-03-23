import React, { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArthaLogo } from '../components/Logo'
import Dashboard from './Dashboard'
import HealthScore from './HealthScore'
import TaxWizard from './TaxWizard'
import SIPPlanner from './SIPPlanner'
import BiasDetector from './BiasDetector'
import Insights from './Insights'
import Settings from './Settings'
import { LayoutDashboard, Activity, Calculator, TrendingUp, Brain, BookOpen, Settings as SettingsIcon, LogOut, Zap } from 'lucide-react'

const NAV = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'health-score', label: 'Health Score', icon: Activity },
  { to: 'tax-wizard', label: 'Tax Wizard', icon: Calculator },
  { to: 'sip-planner', label: 'SIP Planner', icon: TrendingUp },
  { to: 'bias-detector', label: 'Bias Detector', icon: Brain },
  { to: 'insights', label: 'Daily Insights', icon: BookOpen },
]

export default function AppShell() {
  const { user, streak, xp, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const sidebarW = collapsed ? 68 : 220

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarW, flexShrink: 0, background: 'var(--bg-1)', borderRight: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', transition: 'width 0.2s', overflow: 'hidden' }}>
        {/* Logo area */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: collapsed ? '0 18px' : '0 20px', borderBottom: '1px solid var(--border-soft)', flexShrink: 0 }}>
          {collapsed
            ? <ArthaLogo size={28} showText={false} />
            : <ArthaLogo size={28} textSize={19} />
          }
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '11px',
              padding: collapsed ? '10px 0' : '9px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius)',
              fontSize: '13.5px', fontWeight: 500,
              color: isActive ? 'var(--amber)' : 'var(--text-2)',
              background: isActive ? 'var(--amber-dim)' : 'transparent',
              border: isActive ? '1px solid rgba(212,147,58,0.15)' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            })}>
              <Icon size={17} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Streak */}
          {!collapsed && (
            <div style={{ padding: '10px 12px', background: 'var(--amber-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(212,147,58,0.15)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--amber)', letterSpacing: '0.5px' }}>STREAK</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} color="var(--amber)" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>{streak}</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>{xp} XP earned</div>
            </div>
          )}
          <NavLink to="settings" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '11px',
            padding: collapsed ? '10px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius)', fontSize: '13.5px', fontWeight: 500,
            color: isActive ? 'var(--amber)' : 'var(--text-2)',
            background: isActive ? 'var(--amber-dim)' : 'transparent',
            border: isActive ? '1px solid rgba(212,147,58,0.15)' : '1px solid transparent',
            textDecoration: 'none', transition: 'all 0.15s',
          })}>
            <SettingsIcon size={17} />
            {!collapsed && 'Settings'}
          </NavLink>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: collapsed ? '10px 0' : '9px 12px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 'var(--radius)', fontSize: '13.5px', fontWeight: 500, color: 'var(--text-3)', background: 'transparent', border: '1px solid transparent', width: '100%', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' }}>
            <LogOut size={17} />
            {!collapsed && 'Sign out'}
          </button>
          {/* Collapse toggle */}
          <button onClick={() => setCollapsed(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: 'var(--radius)', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', marginTop: '4px', width: '100%', cursor: 'pointer', transition: 'all 0.15s', fontSize: '11px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}>
            {collapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ height: 64, borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'var(--bg-1)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: '13px', color: 'var(--text-3)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{user?.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--amber-dim)', border: '1px solid rgba(212,147,58,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--amber)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="health-score" element={<HealthScore />} />
            <Route path="tax-wizard" element={<TaxWizard />} />
            <Route path="sip-planner" element={<SIPPlanner />} />
            <Route path="bias-detector" element={<BiasDetector />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
