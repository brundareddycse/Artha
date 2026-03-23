import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArthaLogo } from '../components/Logo'
import { Btn, Input } from '../components/UI'
import { ArrowLeft, Eye, EyeOff, Mail, Check } from 'lucide-react'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false) // email confirmation sent
  const { login, signup, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/app/dashboard') }, [user])
  useEffect(() => { setError(''); setConfirmed(false) }, [mode])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)

    if (mode === 'signup') {
      const result = await signup(email, password, name)
      setLoading(false)
      if (!result.ok) { setError(result.message); return }
      setConfirmed(true) // show "check your email" screen
    } else {
      const result = await login(email, password)
      setLoading(false)
      if (!result.ok) {
        if (result.message?.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email first. Check your inbox for the confirmation link.')
        } else {
          setError('Invalid email or password.')
        }
        return
      }
      navigate('/app/dashboard')
    }
  }

  // Email confirmation sent screen
  if (confirmed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center', animation: 'scaleIn 0.3s ease forwards' }}>
          <div style={{ width: 64, height: 64, background: 'var(--teal-dim)', border: '1px solid rgba(42,144,128,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Mail size={28} color="var(--teal-light)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Check your email</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '8px' }}>
            We sent a confirmation link to
          </p>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--amber)', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>{email}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.7, marginBottom: '28px' }}>
            Click the link in the email to activate your account. Then come back and sign in.
          </p>
          <Btn variant="primary" size="lg" onClick={() => { setMode('login'); setConfirmed(false) }} style={{ width: '100%' }}>
            Go to Sign in
          </Btn>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '16px' }}>
            Didn't receive it? Check your spam folder.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 32px' }}>
        <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-0)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', animation: 'scaleIn 0.3s ease forwards' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <ArthaLogo size={40} textSize={28} />
            <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '12px' }}>
              {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Your financial intelligence starts here.'}
            </p>
          </div>

          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px' }}>
            {/* Tab switch */}
            <div style={{ display: 'flex', background: 'var(--bg-3)', borderRadius: 'var(--radius)', padding: '3px', marginBottom: '28px' }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: 'none', background: mode === m ? 'var(--bg-1)' : 'transparent', color: mode === m ? 'var(--text-0)' : 'var(--text-3)', fontSize: '14px', fontWeight: mode === m ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', boxShadow: mode === m ? 'var(--shadow)' : 'none' }}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {mode === 'signup' && (
                <Input label="Full name" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" />
              )}
              <Input label="Email address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"
                    style={{ width: '100%', padding: '10px 42px 10px 14px', fontSize: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-3)', color: 'var(--text-0)', outline: 'none' }} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ fontSize: '13px', color: 'var(--red)', background: 'var(--red-dim)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', lineHeight: 1.5 }}>
                  {error}
                </div>
              )}

              <Btn type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in to Artha' : 'Create account'}
              </Btn>
            </form>

            {mode === 'signup' && (
              <p style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
                A confirmation email will be sent to verify your address.
              </p>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-3)', marginTop: '20px' }}>
            Your financial data stays in your browser. Only authentication goes through Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}
