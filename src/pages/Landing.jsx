import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArthaLogo } from '../components/Logo'
import { Btn } from '../components/UI'
import { useTheme } from '../context/ThemeContext'
import { ArrowRight, TrendingUp, Shield, Brain, Zap, Sun, Moon, Activity, Calculator } from 'lucide-react'

function ParticleCanvas({ theme }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 90)
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        opacity: Math.random() * 0.5 + 0.2,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current
      const dotColor = theme === 'dark' ? 'rgba(212,147,58,' : 'rgba(184,118,10,'
      const lineColor = theme === 'dark' ? 'rgba(212,147,58,' : 'rgba(184,118,10,'
      const mouseInfluence = 120

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const dx = p.x - mouseRef.current.x
        const dy = p.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < mouseInfluence && dist > 0) {
          const force = (mouseInfluence - dist) / mouseInfluence
          p.x += (dx / dist) * force * 1.5
          p.y += (dy / dist) * force * 1.5
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${dotColor}${p.opacity})`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 140) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `${lineColor}${0.15 * (1 - d / 140)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    const handleMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const handleMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [theme])

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-2)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function AnimatedStat({ value, label, source, delay = 0 }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ padding: '0 32px', textAlign: 'center', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.6s ${delay}s, transform 0.6s ${delay}s` }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: 700, color: 'var(--amber)', lineHeight: 1, marginBottom: '8px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-1)', marginBottom: '4px', lineHeight: 1.4 }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>{source}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, tag, color = 'var(--amber)', delay = 0 }) {
  const [ref, visible] = useScrollReveal()
  const [hovered, setHovered] = useState(false)
  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-1)', border: `1px solid ${hovered ? color + '50' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)', padding: '28px', transition: 'all 0.25s',
        transform: visible ? (hovered ? 'translateY(-4px)' : 'translateY(0)') : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transitionDelay: visible ? `${delay}s` : '0s',
        boxShadow: hovered ? `0 8px 32px ${color}18` : 'none',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ width: 44, height: 44, background: `${color}15`, border: `1px solid ${color}25`, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
          <Icon size={20} color={color} />
        </div>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-3)', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '99px', padding: '3px 10px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{tag}</span>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-0)' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>{description}</p>
    </div>
  )
}

const STATS = [
  { value: '27%', label: 'Financial literacy rate in India', source: 'RBI 2024' },
  { value: '90%', label: 'F&O traders lose money', source: 'SEBI 2024' },
  { value: '₹50k', label: 'NPS deduction missed by 73% of salaried', source: 'Income Tax Dept' },
  { value: '14Cr+', label: 'Demat accounts, 75% inactive', source: 'CDSL 2024' },
]

const FEATURES = [
  { icon: Shield, title: 'Financial Health Score', description: 'AI-powered 6-dimension assessment across emergency preparedness, insurance, investments, debt, tax efficiency, and retirement readiness.', tag: 'Assessment', color: 'var(--amber)' },
  { icon: Calculator, title: 'Tax Wizard', description: 'Real-time Old vs New regime comparison with every deduction — HRA, NPS 80CCD(1B), 80C, home loan. Find the regime that saves you most.', tag: 'FY 2025–26', color: 'var(--teal-light)' },
  { icon: TrendingUp, title: 'Goal-Based SIP Planner', description: 'Map life goals — home, retirement, education — to monthly SIP amounts with compounding projections and step-up recommendations.', tag: 'Planner', color: 'var(--amber)' },
  { icon: Brain, title: 'Investor Bias Detector', description: 'Scenario-based assessment profiling cognitive biases — herd mentality, loss aversion, overconfidence — with SEBI-backed data.', tag: 'Behavioural AI', color: '#8b5cf6' },
  { icon: Zap, title: 'Daily Financial Intelligence', description: 'A curated insight every day. Concepts, loopholes, and strategies specific to the Indian tax and investment landscape.', tag: 'Daily', color: 'var(--teal-light)' },
  { icon: Activity, title: 'AI Financial Advisor', description: 'Ask anything about your finances. Artha uses your profile to give advice grounded in Indian products, tax laws, and your specific numbers.', tag: 'AI Chat', color: 'var(--amber)' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [ctaRef, ctaVisible] = useScrollReveal()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', transition: 'background 0.3s' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-soft)' : '1px solid transparent',
        padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.3s',
      }}>
        <ArthaLogo size={30} textSize={20} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <Btn variant="ghost" size="sm" onClick={() => navigate('/auth?mode=login')}>Sign in</Btn>
          <Btn variant="primary" size="sm" onClick={() => navigate('/auth?mode=signup')}>Get started</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '120px 40px 80px' }}>
        <ParticleCanvas theme={theme} />

        {/* Floating orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 500, height: 500, background: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(212,147,58,0.07)' : 'rgba(184,118,10,0.06)'} 0%, transparent 70%)`, animation: 'float 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 400, height: 400, background: `radial-gradient(circle, ${theme === 'dark' ? 'rgba(42,144,128,0.06)' : 'rgba(30,122,106,0.05)'} 0%, transparent 70%)`, animation: 'float 10s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, background: `radial-gradient(ellipse, ${theme === 'dark' ? 'rgba(212,147,58,0.04)' : 'rgba(184,118,10,0.03)'} 0%, transparent 65%)` }} />
        </div>

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${theme === 'dark' ? 'rgba(212,147,58,0.03)' : 'rgba(184,118,10,0.04)'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? 'rgba(212,147,58,0.03)' : 'rgba(184,118,10,0.04)'} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 100%)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', maxWidth: '860px', textAlign: 'center', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--amber-dim)', border: '1px solid rgba(212,147,58,0.25)', borderRadius: '99px', padding: '6px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--amber)', letterSpacing: '1px', marginBottom: '36px', textTransform: 'uppercase', animation: 'fadeIn 0.6s ease forwards' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            India's Financial Intelligence Layer
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 7vw, 84px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '28px', color: 'var(--text-0)', animation: 'fadeIn 0.7s 0.1s ease both' }}>
            Your money deserves<br />
            <span style={{ background: 'linear-gradient(135deg, var(--amber) 0%, var(--amber-light) 50%, var(--amber) 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 3s linear infinite' }}>
              better decisions.
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-2)', maxWidth: '580px', margin: '0 auto 48px', lineHeight: 1.75, fontWeight: 300, animation: 'fadeIn 0.7s 0.2s ease both' }}>
            Artha is an AI-powered financial co-pilot built for India. Personalised health score, tax optimisation, goal planning, and bias detection — in one place.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeIn 0.7s 0.3s ease both' }}>
            <Btn variant="primary" size="xl" onClick={() => navigate('/auth?mode=signup')} style={{ gap: '10px', boxShadow: '0 0 32px rgba(212,147,58,0.25)' }}>
              Start for free <ArrowRight size={18} />
            </Btn>
            <Btn variant="ghost" size="xl" onClick={() => navigate('/auth?mode=login')}>Sign in</Btn>
          </div>

          <p style={{ marginTop: '22px', fontSize: '12px', color: 'var(--text-3)', animation: 'fadeIn 0.7s 0.4s ease both' }}>
            No credit card required &nbsp;·&nbsp; Your financial data stays in your browser
          </p>
        </div>

        {/* Scroll line */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', animation: 'float 2.5s ease-in-out infinite', opacity: 0.4 }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--amber), transparent)' }} />
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-1)', padding: '48px 40px', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ borderRight: i < 3 ? '1px solid var(--border-soft)' : 'none' }}>
              <AnimatedStat {...s} delay={i * 0.1} />
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <FeaturesHeader />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.07} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 40px', background: 'var(--bg-1)', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <HowItWorksHeader />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {[
              { step: '01', title: 'Answer 7 questions', body: 'A 5-minute conversation about your income, expenses, investments, insurance, and goals.' },
              { step: '02', title: 'Get your score', body: 'Artha analyses your profile across 6 dimensions and surfaces the gaps costing you money.' },
              { step: '03', title: 'Act on the plan', body: 'Receive a prioritised action plan with specific India-relevant steps — tax deductions, SIPs, insurance — in order of impact.' },
            ].map((s, i) => <StepCard key={i} {...s} delay={i * 0.12} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at 50% 50%, ${theme === 'dark' ? 'rgba(212,147,58,0.05)' : 'rgba(184,118,10,0.04)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div ref={ctaRef} style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', position: 'relative', opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? 'none' : 'translateY(28px)', transition: 'all 0.7s' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, marginBottom: '16px', lineHeight: 1.1, color: 'var(--text-0)' }}>
            Start building your<br />financial future today.
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-2)', marginBottom: '40px', lineHeight: 1.7 }}>
            Free to use. Powered by Gemini AI. Built specifically for India.
          </p>
          <Btn variant="primary" size="xl" onClick={() => navigate('/auth?mode=signup')} style={{ gap: '10px', boxShadow: '0 0 40px rgba(212,147,58,0.2)' }}>
            Create your account <ArrowRight size={18} />
          </Btn>
          <p style={{ marginTop: '18px', fontSize: '12px', color: 'var(--text-3)' }}>Artha means "wealth" in Sanskrit</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ArthaLogo size={24} textSize={16} />
        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Built for ET AI Hackathon 2026</span>
        <ThemeToggle />
      </footer>
    </div>
  )
}

function FeaturesHeader() {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ textAlign: 'center', marginBottom: '68px', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.6s' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '14px' }}>What Artha does</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, marginBottom: '16px', color: 'var(--text-0)' }}>Everything your finances need</h2>
      <p style={{ fontSize: '15px', color: 'var(--text-2)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>Built for the Indian financial system — the tax laws, the products, the loopholes nobody tells you about.</p>
    </div>
  )
}

function HowItWorksHeader() {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ textAlign: 'center', marginBottom: '52px', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.6s' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '14px' }}>How it works</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 700, color: 'var(--text-0)' }}>Three steps to financial clarity</h2>
    </div>
  )
}

function StepCard({ step, title, body, delay }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `all 0.6s ${delay}s` }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--amber)', letterSpacing: '2px', marginBottom: '14px' }}>{step}</div>
      <div style={{ width: 40, height: 2, background: 'var(--amber)', marginBottom: '20px', borderRadius: '1px' }} />
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-0)' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>{body}</p>
    </div>
  )
}