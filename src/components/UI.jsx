import React from 'react'
import { Loader2 } from 'lucide-react'

/* ── Button ── */
export function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', style, className = '' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    fontFamily: 'var(--font-body)', fontWeight: 500, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', borderRadius: 'var(--radius)', whiteSpace: 'nowrap',
    opacity: disabled ? 0.45 : 1,
  }
  const sizes = { sm: { padding: '6px 14px', fontSize: '13px' }, md: { padding: '10px 20px', fontSize: '14px' }, lg: { padding: '13px 28px', fontSize: '15px' }, xl: { padding: '16px 36px', fontSize: '16px' } }
  const variants = {
    primary: { background: 'var(--amber)', color: '#0e0e0f' },
    secondary: { background: 'var(--bg-3)', color: 'var(--text-1)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-1)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(192,57,43,0.3)' },
    teal: { background: 'var(--teal)', color: '#fff' },
    dark: { background: 'var(--bg-4)', color: 'var(--text-0)', border: '1px solid var(--border)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? '0.45' : '1' }}
    >{children}</button>
  )
}

/* ── Card ── */
export function Card({ children, style, className = '', onClick, hover = false }) {
  return (
    <div className={className} onClick={onClick}
      style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '24px',
        transition: hover ? 'border-color 0.15s, box-shadow 0.15s' : 'none',
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}
      onMouseEnter={e => { if (hover) { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--amber)' } }}
      onMouseLeave={e => { if (hover) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' } }}
    >{children}</div>
  )
}

/* ── Input ── */
export function Input({ label, id, type = 'text', value, onChange, placeholder, hint, error, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>}
      <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ padding: '10px 14px', fontSize: '14px', width: '100%', ...style }} />
      {hint && !error && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{hint}</span>}
      {error && <span style={{ fontSize: '11px', color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

/* ── Select ── */
export function Select({ label, id, value, onChange, options, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label htmlFor={id} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>}
      <select id={id} value={value} onChange={onChange}
        style={{ padding: '10px 14px', fontSize: '14px', width: '100%', cursor: 'pointer', ...style }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/* ── Badge ── */
export function Badge({ children, variant = 'amber' }) {
  const variants = {
    amber: { background: 'var(--amber-dim)', color: 'var(--amber-light)', border: '1px solid rgba(212,147,58,0.2)' },
    teal: { background: 'var(--teal-dim)', color: 'var(--teal-light)', border: '1px solid rgba(42,144,128,0.2)' },
    red: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(192,57,43,0.2)' },
    green: { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(39,174,96,0.2)' },
    neutral: { background: 'var(--bg-3)', color: 'var(--text-2)', border: '1px solid var(--border)' },
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.3px', ...variants[variant] }}>
      {children}
    </span>
  )
}

/* ── Spinner ── */
export function Spinner({ size = 20, color = 'var(--amber)' }) {
  return <Loader2 size={size} color={color} style={{ animation: 'spin 0.8s linear infinite' }} />
}

/* ── Progress Bar ── */
export function ProgressBar({ value, max = 100, color = 'var(--amber)', height = 4 }) {
  return (
    <div style={{ background: 'var(--bg-3)', borderRadius: '99px', height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: '99px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  )
}

/* ── Section Header ── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-soft)' }}>
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '4px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ── Stat Card ── */
export function StatCard({ label, value, sub, delta, accentColor = 'var(--amber)', style }) {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: accentColor }} />
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '12px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, color: 'var(--text-0)', lineHeight: 1, marginBottom: '6px' }}>{value}</div>
      {sub && <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>{sub}</div>}
      {delta && <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '6px', color: delta.up ? 'var(--green)' : 'var(--red)' }}>{delta.label}</div>}
    </Card>
  )
}

/* ── Divider ── */
export function Divider({ style }) {
  return <div style={{ height: '1px', background: 'var(--border-soft)', ...style }} />
}

/* ── Empty State ── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', textAlign: 'center', gap: '16px' }}>
      {Icon && <div style={{ width: 56, height: 56, background: 'var(--bg-3)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color="var(--text-3)" /></div>}
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', maxWidth: '280px', lineHeight: 1.6 }}>{description}</p>
      </div>
      {action}
    </div>
  )
}

/* ── Tooltip wrapper ── */
export function Tip({ content, children }) {
  const [show, setShow] = React.useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '6px', background: 'var(--bg-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '12px', color: 'var(--text-1)', whiteSpace: 'nowrap', zIndex: 1000, boxShadow: 'var(--shadow)' }}>
          {content}
        </span>
      )}
    </span>
  )
}
